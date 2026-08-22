import { Router } from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendanceSummary,
  getAtRiskEmployees,
  getPayableDaysInput,
} from "../controllers/attendanceController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/check-in", authenticateToken, checkIn);
router.post("/check-out", authenticateToken, checkOut);
router.get("/mine", authenticateToken, getMyAttendance);
router.get("/my-records", authenticateToken, getMyAttendance);
router.get("/summary", authenticateToken, getAttendanceSummary);
router.get("/admin-summary", authenticateToken, getAttendanceSummary);
router.get("/at-risk", authenticateToken, getAtRiskEmployees);
router.get("/payable-input", authenticateToken, getPayableDaysInput);
router.get("/payable-days-input", authenticateToken, getPayableDaysInput);

export default router;
