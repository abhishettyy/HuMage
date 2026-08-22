import { query } from "../db/index.js";

/**
 * @route   POST /api/attendance/check-in
 * @desc    Record Employee Check-In Time (Flips status to PRESENT 🟢 Boarding)
 * @access  Private
 */
export const checkIn = async (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.user.employeeId;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    // Fetch actual UUID for target employee
    const empRes = await query(
      `SELECT id, name FROM employees WHERE id::text = $1 OR emp_code = $1`,
      [employeeId]
    );

    if (empRes.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Employee record not found." });
    }

    const emp = empRes.rows[0];

    const result = await query(
      `INSERT INTO attendance (employee_id, date, check_in, status)
       VALUES ($1, $2, $3, 'PRESENT')
       ON CONFLICT (employee_id, date) DO UPDATE SET check_in = EXCLUDED.check_in, status = 'PRESENT'
       RETURNING *`,
      [emp.id, dateStr, now]
    );

    res.json({
      success: true,
      message: `Checked in successfully at ${timeStr}. Status updated to Present.`,
      attendance: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Check-In Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};

/**
 * @route   POST /api/attendance/check-out
 * @desc    Record Employee Check-Out Time (Calculates work hours & extra hours)
 * @access  Private
 */
export const checkOut = async (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.user.employeeId;
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const empRes = await query(
      `SELECT id, name FROM employees WHERE id::text = $1 OR emp_code = $1`,
      [employeeId]
    );

    if (empRes.rows.length === 0) {
      return res.status(404).json({ error: "Not Found", message: "Employee record not found." });
    }

    const emp = empRes.rows[0];

    // Fetch today's check-in
    const existing = await query(
      `SELECT * FROM attendance WHERE employee_id = $1 AND date = $2`,
      [emp.id, dateStr]
    );

    let checkInTime = existing.rows.length && existing.rows[0].check_in ? new Date(existing.rows[0].check_in) : new Date(now.getTime() - 8 * 3600 * 1000);
    const diffHours = parseFloat(((now - checkInTime) / (1000 * 3600)).toFixed(2));
    const extraHours = parseFloat(Math.max(0, diffHours - 8.0).toFixed(2));

    const result = await query(
      `INSERT INTO attendance (employee_id, date, check_out, work_hours, extra_hours, status)
       VALUES ($1, $2, $3, $4, $5, 'PRESENT')
       ON CONFLICT (employee_id, date) DO UPDATE SET
         check_out = EXCLUDED.check_out,
         work_hours = $4,
         extra_hours = $5,
         status = 'PRESENT'
       RETURNING *`,
      [emp.id, dateStr, now, diffHours, extraHours]
    );

    res.json({
      success: true,
      message: `Checked out successfully at ${timeStr}. Work hours: ${diffHours}h.`,
      attendance: result.rows[0],
    });

  } catch (err) {
    console.error("❌ Check-Out Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};

/**
 * @route   GET /api/attendance/mine
 * @desc    Get Employee Day-Wise Attendance History for Current Month
 * @access  Private
 */
export const getMyAttendance = async (req, res) => {
  try {
    const employeeId = req.query.employeeId || req.user.employeeId;

    const result = await query(
      `SELECT a.*, e.name FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE e.id::text = $1 OR e.emp_code = $1
       ORDER BY a.date DESC`,
      [employeeId]
    );

    res.json({ attendance: result.rows });
  } catch (err) {
    console.error("❌ Get My Attendance Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch attendance history." });
  }
};

/**
 * @route   GET /api/attendance/summary
 * @desc    Get All Employees Attendance Summary (Admin View)
 * @access  Private
 */
export const getAttendanceSummary = async (req, res) => {
  try {
    const totalWorkingDays = 22;

    const result = await query(
      `SELECT e.id as employee_id, e.emp_code, e.name, e.department,
              COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as present_days,
              COUNT(CASE WHEN a.status = 'ON_LEAVE' THEN 1 END) as leave_days,
              $1::int as total_working_days
       FROM employees e
       LEFT JOIN attendance a ON a.employee_id = e.id
       GROUP BY e.id, e.emp_code, e.name, e.department`,
      [totalWorkingDays]
    );

    res.json({
      summary: result.rows.map(r => ({
        ...r,
        present_days: Number(r.present_days),
        leave_days: Number(r.leave_days),
        total_working_days: totalWorkingDays
      }))
    });
  } catch (err) {
    console.error("❌ Get Attendance Summary Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch attendance summary." });
  }
};

/**
 * @route   GET /api/attendance/at-risk
 * @desc    PS_Updated.md §9 Differentiator #4: Rule-based "At Risk" attendance flag (>= 3 unexplained absent days)
 * @access  Private
 */
export const getAtRiskEmployees = async (req, res) => {
  try {
    const totalWorkingDays = 22;

    const result = await query(
      `SELECT e.id as employee_id, e.emp_code, e.name, e.department, e.job_position,
              COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absent_days
       FROM employees e
       LEFT JOIN attendance a ON a.employee_id = e.id
       GROUP BY e.id, e.emp_code, e.name, e.department, e.job_position
       HAVING COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) >= 3`
    );

    res.json({
      atRiskEmployees: result.rows.map(r => ({
        ...r,
        absent_days: Number(r.absent_days),
        riskLevel: Number(r.absent_days) >= 5 ? "HIGH" : "MEDIUM"
      }))
    });
  } catch (err) {
    console.error("❌ Get At-Risk Employees Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch at-risk flags." });
  }
};

/**
 * @route   GET /api/attendance/payable-input
 * @desc    Internal Contract Endpoint for Payroll Engine
 * @access  Private
 */
export const getPayableDaysInput = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const totalWorkingDays = 22;

    const result = await query(
      `SELECT COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) as present_days
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE e.id::text = $1 OR e.emp_code = $1`,
      [employeeId || req.user.employeeId]
    );

    const presentDays = result.rows.length ? Number(result.rows[0].present_days) : 0;

    res.json({
      employeeId: employeeId || req.user.employeeId,
      totalWorkingDays,
      presentDays,
      missingDays: Math.max(0, totalWorkingDays - presentDays)
    });
  } catch (err) {
    console.error("❌ Get Payable Days Input Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch payable input." });
  }
};
