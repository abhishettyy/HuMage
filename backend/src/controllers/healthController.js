import { query } from '../db/index.js';

/**
 * @route   GET /api/health
 * @desc    Health Check Endpoint (Tests DB Connection & Service Availability)
 * @access  Public
 */
export const getHealthStatus = async (req, res) => {
  try {
    const dbRes = await query('SELECT NOW() as current_time, current_database() as database_name');
    res.json({
      status: 'online',
      service: 'Dayflow HRMS Backend',
      modules: [
        'P1: Auth & Employees',
        'P2: Attendance',
        'P3: Leave / Time-Off',
        'P4: Salary & Payroll Engine'
      ],
      database: dbRes.rows[0].database_name,
      dbTime: dbRes.rows[0].current_time,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({
      status: 'online (DB disconnected)',
      service: 'Dayflow HRMS Backend',
      modules: [
        'P1: Auth & Employees',
        'P2: Attendance',
        'P3: Leave / Time-Off',
        'P4: Salary & Payroll Engine'
      ],
      dbError: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};
