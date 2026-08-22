import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import attendanceRoutes from "./routes/attendance.js";
import salaryRoutes from "./routes/salary.js";
import leaveRoutes from "./routes/leave.js";
import { query } from "./db/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & JSON Body Parsing
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint (Tests DB Connection Live)
app.get("/api/health", async (req, res) => {
  try {
    const dbRes = await query("SELECT NOW() as current_time, current_database() as database_name");
    res.json({
      status: "online",
      service: "Dayflow HRMS Backend",
      modules: ["P2: Attendance", "P3: Leave / Time-Off", "P4: Salary & Payroll Engine"],
      database: dbRes.rows[0].database_name,
      dbTime: dbRes.rows[0].current_time,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({
      status: "online (DB disconnected)",
      service: "Dayflow HRMS Backend",
      modules: ["P2: Attendance", "P3: Leave / Time-Off", "P4: Salary & Payroll Engine"],
      dbError: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Mount P2, P3 & P4 Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/leave", leaveRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Dayflow HRMS Backend running on http://localhost:${PORT}`);
  console.log(`📌 P2 Attendance Endpoints: http://localhost:${PORT}/api/attendance`);
  console.log(`📌 P3 Leave Endpoints: http://localhost:${PORT}/api/leave`);
  console.log(`📌 P4 Payroll Engine Endpoints: http://localhost:${PORT}/api/salary`);
});
