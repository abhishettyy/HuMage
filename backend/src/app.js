import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Health Check Endpoint (Tests DB Connection Live)
app.get('/api/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time, current_database() as database_name');
    res.json({
      status: 'OK',
      message: 'Dayflow HRMS Backend & Supabase Database connected!',
      database: result.rows[0].database_name,
      timestamp: result.rows[0].current_time
    });
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    res.status(500).json({
      error: 'Database Connection Error',
      message: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Global 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.url} does not exist.`
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Dayflow HRMS Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Auth Endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`👥 Employee Endpoint: http://localhost:${PORT}/api/employees`);
});
