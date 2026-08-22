import express from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (All authenticated users)
router.get('/', authenticateToken, getAllEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.put('/:id', authenticateToken, updateEmployee);

// Admin-only routes for onboarding & deleting employee
router.post('/', authenticateToken, requireAdmin, createEmployee);
router.delete('/:id', authenticateToken, requireAdmin, deleteEmployee);

export default router;
