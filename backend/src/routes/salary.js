import { Router } from "express";
import {
  getSalaryConfig,
  updateSalaryConfig,
  getPayslip
} from "../controllers/salaryController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// P4 Salary Routes
router.get("/:employeeId/payslip", authenticateToken, getPayslip);

// Admin-Only Salary Config & Live Simulation Routes
router.get("/:employeeId", authenticateToken, requireAdmin, getSalaryConfig);
router.put("/:employeeId", authenticateToken, requireAdmin, updateSalaryConfig);

export default router;
