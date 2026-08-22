import express from 'express';
import { login, signup, forgotPassword, resetPassword, changePassword, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public auth routes
router.post('/login', login);
router.post('/signup', signup);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected auth routes
router.put('/change-password', authenticateToken, changePassword);
router.get('/me', authenticateToken, getMe);

export default router;
