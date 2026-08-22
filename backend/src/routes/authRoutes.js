import express from 'express';
import { login, signup, forgotPassword, resetPassword, getPendingAdmins, approveAdmin, getMe } from '../controllers/authController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public auth routes
router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Super Admin Approval Gate routes
router.get('/pending-admins', authenticateToken, requireAdmin, getPendingAdmins);
router.put('/approve-admin/:id', authenticateToken, requireAdmin, approveAdmin);

// Protected auth routes
router.get('/me', authenticateToken, getMe);

export default router;
