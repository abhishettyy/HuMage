import { Router } from "express";
import {
  submitLeaveRequest,
  getLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  getLeaveBalances,
  getUnpaidLeaveDaysContract
} from "../controllers/leaveController.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// P3 Leave Routes
router.post("/request", authenticateToken, submitLeaveRequest);
router.get("/requests", authenticateToken, getLeaveRequests);
router.get("/balances", authenticateToken, getLeaveBalances);
router.get("/unpaid-days", authenticateToken, getUnpaidLeaveDaysContract);

// Admin-only Approval / Rejection routes
router.put("/:id/approve", authenticateToken, requireAdmin, approveLeaveRequest);
router.put("/:id/reject", authenticateToken, requireAdmin, rejectLeaveRequest);

export default router;
