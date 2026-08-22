import express from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee
} from '../controllers/employeeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (All authenticated users)
router.get('/', authenticateToken, getAllEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.put('/:id', authenticateToken, updateEmployee);

// Admin-only route for onboarding new employee
router.post('/', authenticateToken, requireAdmin, createEmployee);

export default router;
