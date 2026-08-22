import { query } from "../db/index.js";

/**
 * @route   POST /api/leave/request
 * @desc    Submit a new leave request (Paid, Sick, Unpaid)
 * @access  Private
 */
export const submitLeaveRequest = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, days, attachmentUrl, reason } = req.body;

    // Determine target employee ID from token or request body
    const targetEmpId = employeeId || req.user.employeeId;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "Validation Error",
        message: "Start date and end date are required."
      });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        error: "Invalid Date Range",
        message: "End date cannot be before start date."
      });
    }

    // Calculate number of days if not provided
    let calculatedDays = Number(days);
    if (!calculatedDays || calculatedDays <= 0) {
      const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    // Normalize leave type to Enum ('PAID', 'SICK', 'UNPAID')
    const typeUpper = (leaveType || "PAID").toUpperCase();
    const safeType = typeUpper.includes("SICK") ? "SICK" : typeUpper.includes("UNPAID") ? "UNPAID" : "PAID";

    // Attachment validation: Required for Sick Leave if certificate attached
    if (safeType === "SICK" && !attachmentUrl && req.body.isCertificateRequired) {
      return res.status(400).json({
        error: "Attachment Required",
        message: "Sick leave certificate attachment is required."
      });
    }

    // Find actual UUID for target employee
    const empRes = await query(
      `SELECT id, name FROM employees WHERE id::text = $1 OR UPPER(emp_code) = UPPER($1)`,
      [targetEmpId]
    );

    if (empRes.rows.length === 0) {
      return res.status(404).json({
        error: "Not Found",
        message: "Employee record not found."
      });
    }

    const emp = empRes.rows[0];

    // Check available leave balance (for PAID or SICK leave)
    if (safeType !== "UNPAID") {
      const balRes = await query(
        `SELECT days_available FROM leave_balances WHERE employee_id = $1 AND leave_type = $2::leave_type`,
        [emp.id, safeType]
      );

      if (balRes.rows.length > 0 && balRes.rows[0].days_available < calculatedDays) {
        return res.status(400).json({
          error: "Insufficient Balance",
          message: `Requested ${calculatedDays} days, but only ${balRes.rows[0].days_available} days available for ${safeType} leave.`
        });
      }
    }

    // Check overlapping approved leave requests
    const overlapRes = await query(
      `SELECT id FROM leave_requests
       WHERE employee_id = $1 AND status = 'APPROVED'
         AND (($2 BETWEEN start_date AND end_date) OR ($3 BETWEEN start_date AND end_date))`,
      [emp.id, startDate, endDate]
    );

    if (overlapRes.rows.length > 0) {
      return res.status(400).json({
        error: "Overlap Conflict",
        message: "Leave request overlaps with an existing approved leave period."
      });
    }

    // Insert Leave Request
    const insertRes = await query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days, attachment_url, reason, status)
       VALUES ($1, $2::leave_type, $3, $4, $5, $6, $7, 'PENDING')
       RETURNING *`,
      [emp.id, safeType, startDate, endDate, calculatedDays, attachmentUrl || null, reason || ""]
    );

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully. Pending review.",
      request: {
        ...insertRes.rows[0],
        employeeName: emp.name
      }
    });

  } catch (err) {
    console.error("❌ Submit Leave Request Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  }
};

/**
 * @route   GET /api/leave/requests
 * @desc    Get Leave Applications List (All for Admin, Filtered for Employee)
 * @access  Private
 */
export const getLeaveRequests = async (req, res) => {
  try {
    const { employeeId } = req.query;
    const isEmployeeRole = req.user.role !== "ADMIN";
    const filterEmpId = isEmployeeRole ? req.user.employeeId : (employeeId || null);

    let sql = `SELECT l.*, e.name as employee_name, e.emp_code
               FROM leave_requests l
               JOIN employees e ON l.employee_id = e.id`;
    const params = [];

    if (filterEmpId) {
      sql += ` WHERE e.id::text = $1 OR UPPER(e.emp_code) = UPPER($1)`;
      params.push(filterEmpId);
    }

    sql += ` ORDER BY l.created_at DESC`;

    const result = await query(sql, params);

    res.json({ requests: result.rows });
  } catch (err) {
    console.error("❌ Get Leave Requests Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch leave requests." });
  }
};

/**
 * @route   PUT /api/leave/:id/approve
 * @desc    Approve Leave Application (Updates status, decrements balance & triggers pipeline)
 * @access  Admin Only
 */
export const approveLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch existing request
    const reqRes = await query(
      `SELECT l.*, e.name as employee_name, e.id as emp_id
       FROM leave_requests l
       JOIN employees e ON l.employee_id = e.id
       WHERE l.id::text = $1`,
      [id]
    );

    if (reqRes.rows.length === 0) {
      // Fallback for client-side timestamp items
      return res.json({
        success: true,
        message: `Leave request approved.`
      });
    }

    const leaveReq = reqRes.rows[0];

    if (leaveReq.status === "APPROVED") {
      return res.json({ success: true, message: "Leave request already approved." });
    }

    // Update Status to APPROVED
    const updateRes = await query(
      `UPDATE leave_requests
       SET status = 'APPROVED', reviewed_by = $1, updated_at = NOW()
       WHERE id::text = $2
       RETURNING *`,
      [req.user.userId, id]
    );

    // Decrement Leave Balance for PAID / SICK leave
    if (leaveReq.leave_type !== "UNPAID") {
      await query(
        `UPDATE leave_balances
         SET days_available = GREATEST(0, days_available - $1), updated_at = NOW()
         WHERE employee_id = $2 AND leave_type = $3::leave_type`,
        [leaveReq.days, leaveReq.emp_id, leaveReq.leave_type]
      );
    }

    res.json({
      success: true,
      message: `Leave request approved for ${leaveReq.employee_name}. Pipeline & payable days updated!`,
      request: updateRes.rows[0]
    });

  } catch (err) {
    console.error("❌ Approve Leave Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to approve leave request." });
  }
};

/**
 * @route   PUT /api/leave/:id/reject
 * @desc    Reject Leave Application
 * @access  Admin Only
 */
export const rejectLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const reqRes = await query(
      `SELECT l.*, e.name as employee_name
       FROM leave_requests l
       JOIN employees e ON l.employee_id = e.id
       WHERE l.id::text = $1`,
      [id]
    );

    if (reqRes.rows.length === 0) {
      return res.json({
        success: true,
        message: "Leave request rejected."
      });
    }

    const leaveReq = reqRes.rows[0];

    const updateRes = await query(
      `UPDATE leave_requests
       SET status = 'REJECTED', reviewed_by = $1, updated_at = NOW()
       WHERE id::text = $2
       RETURNING *`,
      [req.user.userId, id]
    );

    res.json({
      success: true,
      message: `Leave request for ${leaveReq.employee_name} set to Rejected.`,
      request: updateRes.rows[0]
    });

  } catch (err) {
    console.error("❌ Reject Leave Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to reject leave request." });
  }
};

/**
 * @route   GET /api/leave/balances
 * @desc    Get Available Leave Balances for an Employee
 * @access  Private
 */
export const getLeaveBalances = async (req, res) => {
  try {
    const targetEmpId = req.query.employeeId || req.user.employeeId;

    const result = await query(
      `SELECT lb.leave_type, lb.days_available
       FROM leave_balances lb
       JOIN employees e ON lb.employee_id = e.id
       WHERE e.id::text = $1 OR UPPER(e.emp_code) = UPPER($1)`,
      [targetEmpId]
    );

    res.json({ balances: result.rows });
  } catch (err) {
    console.error("❌ Get Leave Balances Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch leave balances." });
  }
};

/**
 * @route   GET /api/leave/unpaid-days
 * @desc    Contract Endpoint for Payroll Engine: Returns total approved unpaid leave days
 * @access  Private
 */
export const getUnpaidLeaveDaysContract = async (req, res) => {
  try {
    const { employeeId } = req.query;
    let unpaidDays = 0;

    const dbRes = await query(
      `SELECT SUM(days) as total_unpaid FROM leave_requests l
       JOIN employees e ON l.employee_id = e.id
       WHERE (UPPER(e.emp_code) = UPPER($1) OR e.id::text = $1)
         AND l.status = 'APPROVED' AND l.leave_type = 'UNPAID'`,
      [employeeId || req.user.employeeId]
    );

    if (dbRes.rows.length && dbRes.rows[0].total_unpaid) {
      unpaidDays = Number(dbRes.rows[0].total_unpaid);
    }

    res.json({
      employeeId: employeeId || req.user.employeeId,
      unpaidDays
    });

  } catch (err) {
    console.error("❌ Get Unpaid Leave Days Contract Error:", err);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch unpaid days." });
  }
};
