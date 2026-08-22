import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-dayflow-jwt-token-key-2026';

/**
 * Middleware: Verify Bearer JWT Token
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required. Please sign in.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid or expired access token. Please sign in again.'
      });
    }

    req.user = user; // { userId, loginId, role, employeeId }
    next();
  });
};

/**
 * Middleware: Require ADMIN Role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Strict RBAC Violation: Admin privileges are required to perform this action.'
    });
  }
  next();
};
