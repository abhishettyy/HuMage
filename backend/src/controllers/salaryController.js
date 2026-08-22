import { query } from "../db/index.js";
import { calculateSalaryComponents, calculatePayableDays } from "../services/payrollEngine.js";

/**
 * @route   GET /api/salary/:employeeId
 * @desc    Get Salary Breakdown & Allowances (Admin Only / Self View)
 * @access  Private (Admin Only or Self)
 */
export const getSalaryConfig = async (req, res) => {
  try {
    const { employeeId } = req.params;
    let wage = 50000;
    let totalWorkingDays = 22;

    const dbRes = await query(
      `SELECT wage, working_days_per_week FROM salary_configs s
       JOIN employees e ON s.employee_id = e.id
       WHERE e.emp_code = $1 OR e.id::text = $1`,
      [employeeId]
    );

    if (dbRes.rows.length) {
      wage = Number(dbRes.rows[0].wage);
    }

    const salary = calculateSalaryComponents(wage, 22, totalWorkingDays);

    res.json({
      employeeId,
      salary
    });
  } catch (err) {
    console.error("❌ Get Salary Config Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch salary configuration." });
  }
};

/**
 * @route   PUT /api/salary/:employeeId
 * @desc    Update Base Wage & Auto-Recalculate Components (Admin Only)
 * @access  Admin Only
 */
export const updateSalaryConfig = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { wage, totalWorkingDays = 22 } = req.body;

    const newWage = Number(wage);
    if (!newWage || newWage <= 0) {
      return res.status(400).json({ error: "Validation Error", message: "A valid positive monthly wage is required." });
    }

    const salary = calculateSalaryComponents(newWage, 22, totalWorkingDays);

    // Update or insert into Supabase database
    const empRes = await query(`SELECT id FROM employees WHERE id::text = $1 OR emp_code = $1`, [employeeId]);
    if (empRes.rows.length) {
      const empUuid = empRes.rows[0].id;
      await query(
        `INSERT INTO salary_configs (employee_id, wage, basic, hra, standard_allowance, performance_bonus, lta, fixed_allowance, pf_employee, pf_employer, professional_tax)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (employee_id) DO UPDATE SET
           wage = EXCLUDED.wage,
           basic = EXCLUDED.basic,
           hra = EXCLUDED.hra,
           fixed_allowance = EXCLUDED.fixed_allowance,
           updated_at = NOW()`,
        [empUuid, newWage, salary.components.basic, salary.components.hra, salary.components.standardAllowance, salary.components.performanceBonus, salary.components.lta, salary.components.fixedAllowance, salary.deductions.pfEmployee, salary.deductions.pfEmployer, salary.deductions.professionalTax]
      );
    }

    res.json({
      success: true,
      message: `Wage updated to ₹${newWage.toLocaleString("en-IN")}. Component breakdown auto-recalculated!`,
      salary
    });
  } catch (err) {
    console.error("❌ Update Salary Config Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to update wage configuration." });
  }
};

/**
 * @route   GET /api/salary/:employeeId/payslip
 * @desc    Generate Live Pro-Rated Payslip (Attendance + Unpaid Leave -> Payable Days -> Net Pay)
 * @access  Private
 */
export const getPayslip = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const totalWorkingDays = Number(req.query.totalWorkingDays) || 22;

    let wage = 50000;
    let unpaidLeaveDays = 0;
    let presentDays = 0;

    // Fetch DB wage, unpaid leave days, and present days
    try {
      const empRes = await query(`SELECT id, name, emp_code, job_position, department FROM employees WHERE emp_code = $1 OR id::text = $1`, [employeeId]);
      if (empRes.rows.length) {
        const emp = empRes.rows[0];

        const wageRes = await query(`SELECT wage FROM salary_configs WHERE employee_id = $1`, [emp.id]);
        if (wageRes.rows.length) wage = Number(wageRes.rows[0].wage);

        const leaveRes = await query(
          `SELECT SUM(days) as total_unpaid FROM leave_requests WHERE employee_id = $1 AND status = 'APPROVED' AND leave_type = 'UNPAID'`,
          [emp.id]
        );
        if (leaveRes.rows.length && leaveRes.rows[0].total_unpaid) unpaidLeaveDays = Number(leaveRes.rows[0].total_unpaid);

        const attRes = await query(
          `SELECT COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_cnt FROM attendance WHERE employee_id = $1`,
          [emp.id]
        );
        if (attRes.rows.length) presentDays = Number(attRes.rows[0].present_cnt);
      }
    } catch (dbErr) {
      console.warn("⚠️ DB query failed for payslip, using fallback math:", dbErr.message);
    }

    const missingAttendanceDays = Math.max(0, totalWorkingDays - presentDays - unpaidLeaveDays);
    const pipelineDays = calculatePayableDays({ totalWorkingDays, unpaidLeaveDays, missingAttendanceDays });
    const salary = calculateSalaryComponents(wage, pipelineDays.payableDays, totalWorkingDays);

    res.json({
      success: true,
      employeeId,
      month: new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }),
      pipelineInput: {
        totalWorkingDays,
        unpaidLeaveDays,
        missingAttendanceDays,
        payableDays: pipelineDays.payableDays
      },
      salary
    });

  } catch (err) {
    console.error("❌ Get Payslip Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to generate payslip." });
  }
};
