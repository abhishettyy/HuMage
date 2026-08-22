import { query } from '../config/db.js';

/**
 * Custom Login ID Generator Engine
 * Algorithm: [Prefix][First 2 of First Name][First 2 of Last Name][Joining Year][4-Digit Serial]
 * Example: OIJODO20240001
 * 
 * @param {string} firstName 
 * @param {string} lastName 
 * @param {number} joiningYear 
 * @param {string} companyPrefix 
 * @returns {Promise<string>} Generated unique Login ID
 */
export async function generateLoginId(firstName, lastName, joiningYear, companyPrefix = 'OI') {
  const prefix = (companyPrefix || 'OI').trim().toUpperCase();
  
  // Clean & extract first 2 letters of first name and last name
  const cleanFn = (firstName || 'XX').replace(/[^a-zA-Z]/g, '').padEnd(2, 'X').substring(0, 2).toUpperCase();
  const cleanLn = (lastName || 'XX').replace(/[^a-zA-Z]/g, '').padEnd(2, 'X').substring(0, 2).toUpperCase();
  const year = (joiningYear || new Date().getFullYear()).toString();

  // Query count of employees joined in that year to determine serial number
  const countResult = await query(
    `SELECT COUNT(*) as total FROM employees WHERE joining_year = $1`,
    [parseInt(year, 10)]
  );

  let serialNumber = parseInt(countResult.rows[0].total, 10) + 1;
  let candidateId = `${prefix}${cleanFn}${cleanLn}${year}${String(serialNumber).padStart(4, '0')}`;

  // Collision safety check (loop increment if ID exists)
  let isUnique = false;
  while (!isUnique) {
    const existing = await query(`SELECT id FROM users WHERE login_id = $1`, [candidateId]);
    if (existing.rows.length === 0) {
      isUnique = true;
    } else {
      serialNumber++;
      candidateId = `${prefix}${cleanFn}${cleanLn}${year}${String(serialNumber).padStart(4, '0')}`;
    }
  }

  return candidateId;
}

/**
 * Helper to generate random initial password for new employees
 */
export function generateInitialPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let randStr = '';
  for (let i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Dayflow@${randStr}`;
}
