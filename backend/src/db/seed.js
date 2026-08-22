import { pool } from "./index.js";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("🌱 Starting PostgreSQL database seeding for Dayflow HRMS on Supabase...");

  try {
    const passwordHash = await bcrypt.hash("Dayflow@2026", 10);

    // Run schema setup SQL
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('ADMIN', 'HR_OFFICER', 'EMPLOYEE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE leave_type AS ENUM ('PAID', 'SICK', 'UNPAID');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      DO $$ BEGIN
        CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'ON_LEAVE');
      EXCEPTION WHEN duplicate_object THEN null; END $$;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        login_id VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role user_role NOT NULL DEFAULT 'EMPLOYEE',
        company_prefix VARCHAR(10) NOT NULL DEFAULT 'OI',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        emp_code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        joining_year INT NOT NULL,
        joining_date DATE NOT NULL,
        department VARCHAR(100) NOT NULL,
        job_position VARCHAR(100) NOT NULL,
        manager_name VARCHAR(255),
        phone VARCHAR(50),
        location VARCHAR(100),
        avatar_url TEXT,
        dob DATE,
        residing_address TEXT,
        personal_email VARCHAR(255),
        gender VARCHAR(20),
        nationality VARCHAR(50),
        marital_status VARCHAR(20),
        pan_no VARCHAR(20),
        uan_no VARCHAR(20),
        account_number VARCHAR(50),
        bank_name VARCHAR(100),
        ifsc_code VARCHAR(20),
        about_text TEXT,
        skills TEXT[],
        certifications TEXT[],
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        check_in TIMESTAMPTZ,
        check_out TIMESTAMPTZ,
        work_hours NUMERIC(5,2) NOT NULL DEFAULT 0.0,
        extra_hours NUMERIC(5,2) NOT NULL DEFAULT 0.0,
        status attendance_status NOT NULL DEFAULT 'ABSENT',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
      );

      CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        leave_type leave_type NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days INT NOT NULL,
        attachment_url TEXT,
        reason TEXT,
        status leave_status NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS salary_configs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        wage NUMERIC(12,2) NOT NULL,
        wage_type VARCHAR(50) NOT NULL DEFAULT 'Fixed',
        working_days_per_week INT NOT NULL DEFAULT 5,
        break_time_minutes INT NOT NULL DEFAULT 60,
        basic NUMERIC(12,2) NOT NULL,
        hra NUMERIC(12,2) NOT NULL,
        standard_allowance NUMERIC(12,2) NOT NULL DEFAULT 4167.00,
        performance_bonus NUMERIC(12,2) NOT NULL,
        lta NUMERIC(12,2) NOT NULL,
        fixed_allowance NUMERIC(12,2) NOT NULL,
        pf_employee NUMERIC(12,2) NOT NULL,
        pf_employer NUMERIC(12,2) NOT NULL,
        professional_tax NUMERIC(12,2) NOT NULL DEFAULT 200.00,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Insert Admin User
    await pool.query(
      `INSERT INTO users (login_id, email, password_hash, role)
       VALUES ('admin', 'admin@dayflow.io', $1, 'ADMIN')
       ON CONFLICT (login_id) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [passwordHash]
    );

    // Insert Employee User (Meera Nair)
    const empUserRes = await pool.query(
      `INSERT INTO users (login_id, email, password_hash, role)
       VALUES ('OIMENA20240012', 'meera.nair@dayflow.io', $1, 'EMPLOYEE')
       ON CONFLICT (login_id) DO UPDATE SET password_hash = EXCLUDED.password_hash
       RETURNING id`,
      [passwordHash]
    );

    const empUserId = empUserRes.rows[0].id;

    // Insert Employee Profile
    const empProfileRes = await pool.query(
      `INSERT INTO employees (user_id, emp_code, name, first_name, last_name, joining_year, joining_date, department, job_position, phone, location)
       VALUES ($1, 'OIMENA20240012', 'Meera Nair', 'Meera', 'Nair', 2024, '2024-03-11', 'Engineering', 'Frontend Engineer', '+91 9876543210', 'Bengaluru')
       ON CONFLICT (emp_code) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [empUserId]
    );

    const employeeId = empProfileRes.rows[0].id;

    // Insert Salary Config
    await pool.query(
      `INSERT INTO salary_configs (employee_id, wage, basic, hra, standard_allowance, performance_bonus, lta, fixed_allowance, pf_employee, pf_employer, professional_tax)
       VALUES ($1, 50000.00, 25000.00, 12500.00, 4167.00, 2083.00, 2083.00, 4167.00, 3000.00, 3000.00, 200.00)
       ON CONFLICT (employee_id) DO UPDATE SET wage = EXCLUDED.wage`,
      [employeeId]
    );

    console.log("✅ Supabase Database seeding completed successfully!");
  } catch (err) {
    console.error("⚠️ Seeding error:", err.message);
  } finally {
    pool.end();
  }
}

// Always run when invoked
seedDatabase();
