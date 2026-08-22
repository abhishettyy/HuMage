import { Router } from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendanceSummary,
  getPayableDaysInput
} from "../controllers/attendanceController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// P2 Attendance Routes
router.post("/check-in", authenticateToken, checkIn);
router.post("/check-out", authenticateToken, checkOut);
router.get("/mine", authenticateToken, getMyAttendance);
router.get("/summary", authenticateToken, getAttendanceSummary);
router.get("/payable-input", authenticateToken, getPayableDaysInput);

export default router;
