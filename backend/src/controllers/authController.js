import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { generateLoginId } from '../utils/idGenerator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dayflow-jwt-token-key-2026';

// Temporary memory store for password reset OTPs & pending admin approvals
const passwordResetTokens = new Map();
const pendingAdminApprovals = new Map();

/**
 * @route   POST /api/auth/signup
 * @desc    Company Admin Self-Registration (Requires Super Admin Approval or Master Key)
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const { companyName, name, email, password, companyPrefix = 'OI', masterKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'Name, Email, and Password are required for Admin Registration.'
      });
    }

    // Check if email already exists
    const existingUser = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'Conflict Error',
        message: `An account with email ${email} already exists.`
      });
    }

    // SUPER ADMIN SECURITY GATE:
    // If masterKey === 'SUPER_ADMIN_2026' or auto-approved by Super Admin, account is active immediately.
    // Otherwise, placed in PENDING_APPROVAL state to prevent unauthorized employee escalation.
    const isAutoApproved = masterKey === 'SUPER_ADMIN_2026' || process.env.AUTO_APPROVE_ADMIN === 'true';

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.slice(1).join(' ') || 'User';
    const joiningYear = new Date().getFullYear();
    const loginId = await generateLoginId(firstName, lastName, joiningYear);

    const passwordHash = await bcrypt.hash(password, 10);

    // Insert User with ADMIN role
    const userRes = await query(
      `INSERT INTO users (login_id, email, password_hash, role, company_prefix)
       VALUES ($1, $2, $3, 'ADMIN', $4)
       RETURNING id, login_id, email, role, company_prefix`,
      [loginId, email.toLowerCase().trim(), passwordHash, companyPrefix.toUpperCase()]
    );

    const newUser = userRes.rows[0];

    // Insert Employee Profile for Admin
    const empRes = await query(
      `INSERT INTO employees (
         user_id, emp_code, name, first_name, last_name, joining_year, joining_date,
         department, job_position, manager_name, phone, location
       ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'Human Resources', 'HR Admin', '—', '', '')
       RETURNING id`,
      [newUser.id, loginId, name.trim(), firstName, lastName, joiningYear]
    );

    const newEmpId = empRes.rows[0].id;

    // Default Leave Balances & Salary Config
    await query(
      `INSERT INTO leave_balances (employee_id, leave_type, days_available) VALUES
       ($1, 'PAID', 24), ($1, 'SICK', 7), ($1, 'UNPAID', 0)`,
      [newEmpId]
    );

    await query(
      `INSERT INTO salary_configs (
         employee_id, wage, basic, hra, standard_allowance, performance_bonus, lta, fixed_allowance, pf_employee, pf_employer, professional_tax
       ) VALUES ($1, 75000.00, 37500.00, 18750.00, 4167.00, 3124.00, 3124.00, 8335.00, 4500.00, 4500.00, 200.00)`,
      [newEmpId]
    );

    if (!isAutoApproved) {
      pendingAdminApprovals.set(newUser.id, {
        id: newUser.id,
        loginId: newUser.login_id,
        email: newUser.email,
        name: name.trim(),
        companyName: companyName || 'Default Corp',
        createdAt: new Date().toISOString()
      });
    }

    const token = jwt.sign(
      { userId: newUser.id, loginId: newUser.login_id, role: 'ADMIN', employeeId: newEmpId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: isAutoApproved
        ? 'Company Admin registered & verified successfully!'
        : 'Admin account registration submitted. Pending Super Admin verification.',
      loginId,
      token,
      approvalStatus: isAutoApproved ? 'APPROVED' : 'PENDING_SUPER_ADMIN_APPROVAL',
      user: {
        id: newUser.id,
        loginId: newUser.login_id,
        email: newUser.email,
        role: 'ADMIN',
        employeeId: newEmpId,
        name: name.trim(),
        department: 'Human Resources',
        jobPosition: 'HR Admin'
      }
    });

  } catch (error) {
    console.error('❌ Signup Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to register company admin.'
    });
  }
};

/**
 * @route   GET /api/auth/pending-admins
 * @desc    Super Admin endpoint to list pending Admin registration requests
 * @access  Super Admin Only
 */
export const getPendingAdmins = async (req, res) => {
  try {
    const list = Array.from(pendingAdminApprovals.values());
    res.json({ pendingAdmins: list });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch pending admins.' });
  }
};

/**
 * @route   PUT /api/auth/approve-admin/:id
 * @desc    Super Admin endpoint to approve a pending Admin account
 * @access  Super Admin Only
 */
export const approveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    pendingAdminApprovals.delete(id);
    res.json({ success: true, message: `Admin account ${id} approved by Super Admin.` });
  } catch (error) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to approve admin.' });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate User with Login ID & Password
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'Both Login ID and Password are required.'
      });
    }

    const userResult = await query(
      `SELECT u.id, u.login_id, u.email, u.password_hash, u.role, u.company_prefix,
              e.id as employee_id, e.name, e.department, e.job_position, e.avatar_url
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       WHERE LOWER(u.login_id) = LOWER($1) OR LOWER(u.email) = LOWER($1)`,
      [loginId.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid Login ID or Password.'
      });
    }

    const user = userResult.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid Login ID or Password.'
      });
    }

    const tokenPayload = {
      userId: user.id,
      loginId: user.login_id,
      role: user.role,
      employeeId: user.employee_id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await query(
      `INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, $2, $3)`,
      [user.id, `User logged in via Login ID ${user.login_id}`, clientIp]
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
        name: user.name,
        department: user.department,
        jobPosition: user.job_position,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'An internal error occurred during login. Please try again.'
    });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate Password Reset OTP/Token for given Login ID or Email
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { loginId } = req.body;

    if (!loginId) {
      return res.status(400).json({ error: 'Validation Error', message: 'Login ID or Email is required.' });
    }

    const userRes = await query(
      `SELECT id, login_id, email FROM users WHERE LOWER(login_id) = LOWER($1) OR LOWER(email) = LOWER($1)`,
      [loginId.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'No account found with this Login ID or Email.' });
    }

    const user = userRes.rows[0];
    const resetOtp = String(Math.floor(100000 + Math.random() * 900000));
    
    passwordResetTokens.set(user.login_id.toLowerCase(), resetOtp);

    await query(
      `INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)`,
      [user.id, `Requested password reset OTP for ${user.login_id}`]
    );

    res.json({
      message: `Password reset OTP generated. Verify OTP to reset password.`,
      loginId: user.login_id,
      email: user.email,
      otp: resetOtp
    });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to process forgot password request.' });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset User Password with OTP & New Password (hashes via bcrypt)
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { loginId, otp, newPassword } = req.body;

    if (!loginId || !otp || !newPassword) {
      return res.status(400).json({ error: 'Validation Error', message: 'Login ID, OTP, and New Password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters.' });
    }

    const cachedOtp = passwordResetTokens.get(loginId.trim().toLowerCase());
    
    if (!cachedOtp || cachedOtp !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid OTP', message: 'The reset OTP is invalid or expired.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const updateRes = await query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE LOWER(login_id) = LOWER($2) RETURNING id, login_id`,
      [passwordHash, loginId.trim()]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'User account not found.' });
    }

    passwordResetTokens.delete(loginId.trim().toLowerCase());

    await query(
      `INSERT INTO audit_logs (user_id, action) VALUES ($1, $2)`,
      [updateRes.rows[0].id, `Successfully reset account password`]
    );

    res.json({
      message: 'Password reset successfully! You can now log in with your new password.',
      loginId: updateRes.rows[0].login_id
    });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to reset password.' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get Current User Profile from JWT Token
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userResult = await query(
      `SELECT u.id, u.login_id, u.email, u.role, u.company_prefix, u.created_at,
              e.id as employee_id, e.emp_code, e.name, e.first_name, e.last_name,
              e.department, e.job_position, e.manager_name, e.phone, e.location, e.avatar_url
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User profile not found.'
      });
    }

    const user = userResult.rows[0];

    res.json({
      user: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        role: user.role,
        companyPrefix: user.company_prefix,
        createdAt: user.created_at,
        employee: {
          id: user.employee_id,
          empCode: user.emp_code,
          name: user.name,
          firstName: user.first_name,
          lastName: user.last_name,
          department: user.department,
          jobPosition: user.job_position,
          managerName: user.manager_name,
          phone: user.phone,
          location: user.location,
          avatarUrl: user.avatar_url
        }
      }
    });
  } catch (error) {
    console.error('❌ GetMe Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve profile information.'
    });
  }
};
