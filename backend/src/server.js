import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import attendanceRoutes from "./routes/attendance.js";
import salaryRoutes from "./routes/salary.js";

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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Dayflow HRMS Backend",
    modules: ["P2: Attendance", "P4: Salary & Payroll Engine"],
    timestamp: new Date().toISOString(),
  });
});

// Mount P2 & P4 Routes
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);

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
  console.log(`📌 P4 Payroll Engine Endpoints: http://localhost:${PORT}/api/salary`);
});
