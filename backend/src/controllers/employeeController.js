import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateLoginId, generateInitialPassword } from '../utils/idGenerator.js';

/**
 * @route   POST /api/employees
 * @desc    Onboard New Employee (Auto Login ID & Password Generation)
 * @access  Admin Only
 */
export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      department,
      jobPosition,
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

    // Check if email already exists
    const existingEmail = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        error: 'Conflict Error',
        message: `An account with email ${email} already exists.`
      });
    }

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
      [loginId, email.toLowerCase().trim(), passwordHash, 'EMPLOYEE', 'OI']
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
    await query(
      `INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)`,
      [req.user.userId, `Created new employee ${fullName} with Login ID ${loginId}`]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      loginId,
      initialPassword,
      employee: {
        id: newEmp.id,
        empCode: loginId,
        name: fullName,
        firstName: newEmp.first_name,
        lastName: newEmp.last_name,
        department: newEmp.department,
        jobPosition: newEmp.job_position,
        joiningDate: newEmp.joining_date,
        avatarUrl: newEmp.avatar_url
      }
    });

  } catch (error) {
    console.error('❌ Create Employee Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to onboarding new employee.'
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
              lr.id as active_leave_id
       FROM employees e
       LEFT JOIN attendance a ON a.employee_id = e.id AND a.date = $1
       LEFT JOIN leave_requests lr ON lr.employee_id = e.id AND lr.status = 'APPROVED' AND $1 BETWEEN lr.start_date AND lr.end_date
       ORDER BY e.created_at DESC`,
      [todayStr]
    );

    const employees = employeesResult.rows.map(emp => {
      // Status Dot Logic: PRESENT (🟢 Boarding), ON_LEAVE (✈️ In Transit), ABSENT (🟡 Delayed)
      let status = 'ABSENT'; // Default Yellow / Delayed
      if (emp.active_leave_id) {
        status = 'ON_LEAVE'; // Airplane icon / In Transit
      } else if (emp.check_in) {
        status = 'PRESENT';  // Green dot / Boarding
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
        status // PRESENT | ON_LEAVE | ABSENT
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
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Employee record not found.'
      });
    }

    const emp = result.rows[0];

    // RBAC Field Masking Rule:
    // Private Info & Bank Details visible ONLY if user is ADMIN or viewing their OWN profile
    const isSelfOrAdmin = req.user.role === 'ADMIN' || req.user.employeeId === emp.id;

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

      // Resume Info (Public within company)
      resumeInfo: {
        aboutText: emp.about_text,
        skills: emp.skills || [],
        certifications: emp.certifications || []
      },

      // Private & Financial Details (Masked if not Admin / Self)
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
 * @desc    Update Employee Profile Details
 * @access  Private (Self or Admin)
 */
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // RBAC Check: Must be Self or Admin
    if (req.user.role !== 'ADMIN' && req.user.employeeId !== id) {
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
        id
      ]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Employee record not found.' });
    }

    res.json({
      message: 'Profile updated successfully',
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
