import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ CRITICAL ERROR: DATABASE_URL is not defined in backend/.env');
}

// Supabase PostgreSQL Connection Pool
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Supabase SSL connections
  max: 20,                            // Maximum connections in pool
  idleTimeoutMillis: 30000,           // Close idle clients after 30s
  connectionTimeoutMillis: 10000,     // Return an error after 10s if connection unavailable
});

pool.on('connect', () => {
  // Connected client instance
});

pool.on('error', (err) => {
  console.error('⚠️ Unexpected PostgreSQL Pool Error:', err);
});

/**
 * Execute SQL Query helper with parameters
 * @param {string} text - SQL Query String
 * @param {Array} params - Parameterized Query Values
 */
export const query = (text, params) => pool.query(text, params);

export default pool;
