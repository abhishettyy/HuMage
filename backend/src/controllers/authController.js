import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { generateLoginId } from '../utils/idGenerator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dayflow-jwt-token-key-2026';

// Temporary memory store for 6-digit password reset OTPs
const passwordResetTokens = new Map();

/**
 * @route   POST /api/auth/signup
 * @desc    Company Admin Self-Registration (Creates active Admin account directly)
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const { companyName, name, email, password, companyPrefix = 'OI' } = req.body;

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

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.slice(1).join(' ') || 'User';
    const joiningYear = new Date().getFullYear();
    const loginId = await generateLoginId(firstName, lastName, joiningYear);

    const passwordHash = await bcrypt.hash(password, 10);

    // Insert User with ADMIN role directly
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

    const token = jwt.sign(
      { userId: newUser.id, loginId: newUser.login_id, role: 'ADMIN', employeeId: newEmpId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Company Admin registered & created successfully!',
      loginId,
      token,
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
        name: user.name || 'User',
        department: user.department || 'General',
        jobPosition: user.job_position || 'Employee',
        avatarUrl: user.avatar_url || ''
      }
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to process login.'
    });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate 6-Digit Password Reset OTP
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { loginId } = req.body;
    if (!loginId) {
      return res.status(400).json({ error: 'Invalid Input', message: 'Login ID or Email is required.' });
    }

    const userRes = await query(
      `SELECT u.id, u.login_id, u.email FROM users u WHERE LOWER(u.login_id) = LOWER($1) OR LOWER(u.email) = LOWER($1)`,
      [loginId.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'No account found with provided credentials.' });
    }

    const user = userRes.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins expiry

    passwordResetTokens.set(user.id, { otp, expiresAt, loginId: user.login_id });

    res.json({
      message: 'Password reset OTP generated successfully.',
      otpDemo: otp,
      loginId: user.login_id
    });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to generate reset OTP.' });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Verify OTP and Update User Password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { loginId, otp, newPassword } = req.body;

    if (!loginId || !otp || !newPassword) {
      return res.status(400).json({ error: 'Invalid Input', message: 'Login ID, OTP, and new password required.' });
    }

    const userRes = await query(
      `SELECT u.id FROM users u WHERE LOWER(u.login_id) = LOWER($1) OR LOWER(u.email) = LOWER($1)`,
      [loginId.trim()]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Account not found.' });
    }

    const userId = userRes.rows[0].id;
    const resetData = passwordResetTokens.get(userId);

    if (!resetData || resetData.otp !== otp || Date.now() > resetData.expiresAt) {
      return res.status(400).json({ error: 'Invalid OTP', message: 'Expired or invalid 6-digit OTP code.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]);
    passwordResetTokens.delete(userId);

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to reset password.' });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change Password for Authenticated User
 * @access  Private
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Invalid Input', message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'New password must be at least 6 characters long.' });
    }

    const userRes = await query(`SELECT password_hash FROM users WHERE id = $1`, [req.user.userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
    }

    const user = userRes.rows[0];
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Authentication Error', message: 'Incorrect current password.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, req.user.userId]);

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to change password.' });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get Currently Authenticated User Session Info
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.login_id, u.email, u.role, u.company_prefix,
              e.id as employee_id, e.name, e.department, e.job_position, e.avatar_url
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'User session not found.' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id,
        name: user.name || 'User',
        department: user.department || 'General',
        jobPosition: user.job_position || 'Employee',
        avatarUrl: user.avatar_url || ''
      }
    });

  } catch (error) {
    console.error('❌ GetMe Error:', error);
    res.status(500).json({ error: 'Server Error', message: 'Failed to fetch user session.' });
  }
};
