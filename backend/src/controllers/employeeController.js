import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateLoginId, generateInitialPassword } from '../utils/idGenerator.js';

/**
 * @route   POST /api/employees
 * @desc    Onboard New Employee or Admin Account (Auto Login ID & Password Generation)
 * @access  Admin Only (Super Admin can create ADMINs, Normal Admin can ONLY create EMPLOYEEs)
 */
export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      department,
      jobPosition,
      role: requestedRoleInput = 'EMPLOYEE',
      joiningYear = new Date().getFullYear(),
      joiningDate = new Date().toISOString().split('T')[0],
      managerName = 'Priya Shah',
      phone = '',
      location = '',
      avatarUrl = '',
      wage = 50000.00
    } = req.body;

    // 1. Validation
    if (!firstName || !lastName || !email || !department || !jobPosition) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'First Name, Last Name, Email, Department, and Job Position are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already exists in users database table
    const existingUserRes = await query(
      `SELECT u.id, e.id as emp_id FROM users u LEFT JOIN employees e ON e.user_id = u.id WHERE LOWER(u.email) = $1`,
      [cleanEmail]
    );

    if (existingUserRes.rows.length > 0) {
      // Clean up previous user record so re-onboarding with clean credentials succeeds seamlessly
      const oldUserId = existingUserRes.rows[0].id;
      await query(`DELETE FROM users WHERE id = $1`, [oldUserId]);
    }

    // RBAC: Only Super Admin (loginId === 'admin') can create ADMIN accounts! Normal admins can ONLY create EMPLOYEE accounts.
    const requestedRole = requestedRoleInput.toUpperCase();
    const isSuperAdmin = req.user && (req.user.loginId === 'admin' || req.user.loginId?.toLowerCase() === 'admin');

    if (requestedRole === 'ADMIN' && !isSuperAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only the Super Admin (admin) account is authorized to create new Company Admin accounts.'
      });
    }

    const targetRole = (requestedRole === 'ADMIN' && isSuperAdmin) ? 'ADMIN' : 'EMPLOYEE';

    // 2. Auto-Generate Login ID & Initial Password
    const loginId = await generateLoginId(firstName, lastName, parseInt(joiningYear, 10));
    const initialPassword = generateInitialPassword();
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // 3. Database Inserts
    // Create User Record
    const userRes = await query(
      `INSERT INTO users (login_id, email, password_hash, role, company_prefix)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, login_id, email, role`,
      [loginId, cleanEmail, passwordHash, targetRole, 'OI']
    );

    const newUser = userRes.rows[0];

    // Create Employee Record
    const empRes = await query(
      `INSERT INTO employees (
         user_id, emp_code, name, first_name, last_name, joining_year, joining_date,
         department, job_position, manager_name, phone, location, avatar_url
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        newUser.id,
        loginId,
        fullName,
        firstName.trim(),
        lastName.trim(),
        parseInt(joiningYear, 10),
        joiningDate,
        department.trim(),
        jobPosition.trim(),
        managerName,
        phone,
        location,
        avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`
      ]
    );

    const newEmp = empRes.rows[0];

    // Create Default Leave Balances (24 Paid, 7 Sick, 0 Unpaid)
    await query(
      `INSERT INTO leave_balances (employee_id, leave_type, days_available) VALUES
       ($1, 'PAID', 24),
       ($1, 'SICK', 7),
       ($1, 'UNPAID', 0)`,
      [newEmp.id]
    );

    // Create Default Salary Config (Wage components)
    const baseWage = parseFloat(wage) || 50000.00;
    const basic = baseWage * 0.50;
    const hra = basic * 0.50;
    const standardAllowance = 4167.00;
    const performanceBonus = basic * 0.0833;
    const lta = basic * 0.0833;
    const fixedAllowance = baseWage - (basic + hra + standardAllowance + performanceBonus + lta);
    const pfEmployee = basic * 0.12;
    const pfEmployer = basic * 0.12;
    const professionalTax = 200.00;

    await query(
      `INSERT INTO salary_configs (
         employee_id, wage, basic, hra, standard_allowance, performance_bonus, lta, fixed_allowance,
         pf_employee, pf_employer, professional_tax
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [newEmp.id, baseWage, basic, hra, standardAllowance, performanceBonus, lta, fixedAllowance, pfEmployee, pfEmployer, professionalTax]
    );

    // Audit log
    if (req.user) {
      await query(
        `INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)`,
        [req.user.userId, `Created new ${targetRole} account ${fullName} (${loginId})`]
      );
    }

    res.status(201).json({
      message: `${targetRole === 'ADMIN' ? 'Company Admin' : 'Employee'} created successfully`,
      loginId,
      initialPassword,
      assignedRole: targetRole,
      employee: {
        id: newEmp.id,
        empCode: loginId,
        name: fullName,
        firstName: newEmp.first_name,
        lastName: newEmp.last_name,
        department: newEmp.department,
        jobPosition: newEmp.job_position,
        joiningDate: newEmp.joining_date,
        avatarUrl: newEmp.avatar_url,
        role: targetRole
      }
    });

  } catch (error) {
    console.error('❌ Create Employee Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to onboard new account.'
    });
  }
};

/**
 * @route   GET /api/employees
 * @desc    Get All Employee Cards with Dynamic Today's Status Dot
 * @access  Private
 */
export const getAllEmployees = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const employeesResult = await query(
      `SELECT e.id, e.emp_code, e.name, e.department, e.job_position, e.location, e.avatar_url,
              a.check_in, a.check_out, a.status as attendance_status,
              lr.id as active_leave_id,
              u.role
       FROM employees e
       JOIN users u ON u.id = e.user_id
       LEFT JOIN attendance a ON a.employee_id = e.id AND a.date = $1::date
       LEFT JOIN leave_requests lr ON lr.employee_id = e.id AND lr.status = 'APPROVED' AND $1::date BETWEEN lr.start_date AND lr.end_date
       ORDER BY e.created_at DESC`,
      [todayStr]
    );

    const employees = employeesResult.rows.map(emp => {
      let status = 'ABSENT';
      if (emp.active_leave_id) {
        status = 'ON_LEAVE';
      } else if (emp.check_in) {
        status = 'PRESENT';
      }

      return {
        id: emp.id,
        empCode: emp.emp_code,
        name: emp.name,
        department: emp.department,
        jobPosition: emp.job_position,
        location: emp.location,
        avatarUrl: emp.avatar_url,
        checkIn: emp.check_in ? new Date(emp.check_in).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
        checkOut: emp.check_out ? new Date(emp.check_out).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
        status,
        role: emp.role
      };
    });

    res.json({ employees });
  } catch (error) {
    console.error('❌ Get All Employees Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve employee directory.'
    });
  }
};

/**
 * @route   GET /api/employees/:id
 * @desc    Get Employee Details by ID (With RBAC Field Masking for Private Info)
 * @access  Private
 */
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT e.*, u.email as work_email, u.role
       FROM employees e
       JOIN users u ON u.id = e.user_id
       WHERE e.id::text = $1 OR UPPER(e.emp_code) = UPPER($1) OR e.user_id::text = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Employee record not found.'
      });
    }

    const emp = result.rows[0];

    const isSelfOrAdmin = req.user.role === 'ADMIN' || req.user.employeeId === emp.id || req.user.userId === emp.user_id;

    const profileData = {
      id: emp.id,
      userId: emp.user_id,
      empCode: emp.emp_code,
      name: emp.name,
      firstName: emp.first_name,
      lastName: emp.last_name,
      joiningYear: emp.joining_year,
      joiningDate: emp.joining_date,
      department: emp.department,
      jobPosition: emp.job_position,
      managerName: emp.manager_name,
      phone: emp.phone,
      location: emp.location,
      avatarUrl: emp.avatar_url,
      workEmail: emp.work_email,
      role: emp.role,

      resumeInfo: {
        aboutText: emp.about_text,
        skills: emp.skills || [],
        certifications: emp.certifications || []
      },

      privateInfo: isSelfOrAdmin ? {
        dob: emp.dob,
        residingAddress: emp.residing_address,
        personalEmail: emp.personal_email,
        gender: emp.gender,
        nationality: emp.nationality,
        maritalStatus: emp.marital_status,
        panNo: emp.pan_no,
        uanNo: emp.uan_no
      } : null,

      bankDetails: isSelfOrAdmin ? {
        accountNumber: emp.account_number,
        bankName: emp.bank_name,
        ifscCode: emp.ifsc_code
      } : null
    };

    res.json({ employee: profileData });

  } catch (error) {
    console.error('❌ Get Employee By ID Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve employee details.'
    });
  }
};

/**
 * @route   PUT /api/employees/:id
 * @desc    Update Employee Profile Details (About, Skills, Certifications, Private Info & Bank Details)
 * @access  Private (Self or Admin)
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Look up target employee by UUID, empCode, or user_id
    const targetRes = await query(
      `SELECT id, user_id, emp_code FROM employees WHERE id::text = $1 OR UPPER(emp_code) = UPPER($1) OR user_id::text = $1`,
      [id]
    );

    if (targetRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Employee record not found.' });
    }

    const targetEmp = targetRes.rows[0];
    const isSelf = req.user.userId === targetEmp.user_id || req.user.employeeId === targetEmp.id || (req.user.loginId && req.user.loginId.toUpperCase() === targetEmp.emp_code.toUpperCase());
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are only authorized to edit your own profile.'
      });
    }

    const {
      phone, location, aboutText, skills, certifications,
      dob, residingAddress, personalEmail, gender, nationality, maritalStatus, panNo, uanNo,
      accountNumber, bankName, ifscCode
    } = req.body;

    const updateRes = await query(
      `UPDATE employees SET
         phone = COALESCE($1, phone),
         location = COALESCE($2, location),
         about_text = COALESCE($3, about_text),
         skills = COALESCE($4, skills),
         certifications = COALESCE($5, certifications),
         dob = COALESCE($6, dob),
         residing_address = COALESCE($7, residing_address),
         personal_email = COALESCE($8, personal_email),
         gender = COALESCE($9, gender),
         nationality = COALESCE($10, nationality),
         marital_status = COALESCE($11, marital_status),
         pan_no = COALESCE($12, pan_no),
         uan_no = COALESCE($13, uan_no),
         account_number = COALESCE($14, account_number),
         bank_name = COALESCE($15, bank_name),
         ifsc_code = COALESCE($16, ifsc_code),
         updated_at = NOW()
       WHERE id = $17
       RETURNING *`,
      [
        phone, location, aboutText, skills, certifications,
        dob, residingAddress, personalEmail, gender, nationality, maritalStatus, panNo, uanNo,
        accountNumber, bankName, ifscCode,
        targetEmp.id
      ]
    );

    res.json({
      message: 'Profile updated successfully in Supabase PostgreSQL',
      employee: updateRes.rows[0]
    });

  } catch (error) {
    console.error('❌ Update Employee Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to update employee profile.'
    });
  }
};

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete Employee Record (Admin Only, Cascades to User, Attendance, Leave & Salary)
 * @access  Admin Only
 */
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const empRes = await query(
      `SELECT e.id, e.user_id, e.name, e.emp_code FROM employees e WHERE e.id::text = $1 OR UPPER(e.emp_code) = UPPER($1)`,
      [id]
    );

    if (empRes.rows.length > 0) {
      const emp = empRes.rows[0];
      await query(`DELETE FROM users WHERE id = $1`, [emp.user_id]);
    } else {
      await query(`DELETE FROM users WHERE LOWER(email) = LOWER($1) OR id::text = $1 OR UPPER(login_id) = UPPER($1)`, [id]);
    }

    if (req.user) {
      await query(
        `INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)`,
        [req.user.userId, `Deleted employee record (${id})`]
      );
    }

    res.json({
      success: true,
      message: `Employee record ${id} deleted successfully from database.`,
      deletedId: id
    });

  } catch (error) {
    console.error("❌ Delete Employee Error:", error);
    res.status(500).json({ error: "Server Error", message: "Failed to delete employee record." });
  }
};
