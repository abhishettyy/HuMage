import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dayflow-jwt-token-key-2026';

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate User with Login ID & Password
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // 1. Input Validation
    if (!loginId || !password) {
      return res.status(400).json({
        error: 'Invalid Input',
        message: 'Both Login ID and Password are required.'
      });
    }

    // 2. Fetch User from Database (Case-Insensitive Login ID Match)
    const userResult = await query(
      `SELECT u.id, u.login_id, u.email, u.password_hash, u.role, u.company_prefix,
              e.id as employee_id, e.name, e.department, e.job_position, e.avatar_url
       FROM users u
       LEFT JOIN employees e ON e.user_id = u.id
       WHERE LOWER(u.login_id) = LOWER($1)`,
      [loginId.trim()]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid Login ID or Password.'
      });
    }

    const user = userResult.rows[0];

    // 3. Verify Password via bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid Login ID or Password.'
      });
    }

    // 4. Generate JWT Token (Expires in 24h)
    const tokenPayload = {
      userId: user.id,
      loginId: user.login_id,
      role: user.role,
      employeeId: user.employee_id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // 5. Log Security Audit
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    await query(
      `INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, $2, $3)`,
      [user.id, `User logged in via Login ID ${user.login_id}`, clientIp]
    );

    // 6. Return Response
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
