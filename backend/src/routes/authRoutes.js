import express from 'express';
import { login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public auth routes
router.post('/login', login);

// Protected auth routes
router.get('/me', authenticateToken, getMe);

export default router;
