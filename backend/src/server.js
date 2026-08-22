import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/attendance.js";
import leaveRoutes from "./routes/leave.js";
import salaryRoutes from "./routes/salary.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

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

// Mount Module Routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/salary", salaryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found", message: `API endpoint ${req.method} ${req.url} does not exist.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Dayflow HRMS Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👥 Employee Endpoints: http://localhost:${PORT}/api/employees`);
  console.log(`⏱️ Attendance Endpoints: http://localhost:${PORT}/api/attendance`);
  console.log(`✈️ Leave Endpoints: http://localhost:${PORT}/api/leave`);
  console.log(`💰 Payroll Engine Endpoints: http://localhost:${PORT}/api/salary`);
});
