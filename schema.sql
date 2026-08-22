-- Dayflow HRMS - PostgreSQL Schema for Supabase
-- Copy and paste this script directly into Supabase SQL Editor to create all tables and types.

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables & types (if re-running)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS salary_configs CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS leave_type CASCADE;
DROP TYPE IF EXISTS leave_status CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;

-- 3. Create Custom ENUM Types
CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE leave_type AS ENUM ('PAID', 'SICK', 'UNPAID');
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'ON_LEAVE');

-- 4. Create Tables

-- Table: Users (Custom Auth - Login with login_id + password)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    login_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., OIJODO20240001
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'EMPLOYEE',
    company_prefix VARCHAR(10) NOT NULL DEFAULT 'OI',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: Employees
CREATE TABLE employees (
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

    -- Private Information
    dob DATE,
    residing_address TEXT,
    personal_email VARCHAR(255),
    gender VARCHAR(20),
    nationality VARCHAR(50),
    marital_status VARCHAR(20),
    pan_no VARCHAR(20),
    uan_no VARCHAR(20),

    -- Bank Details
    account_number VARCHAR(50),
    bank_name VARCHAR(100),
    ifsc_code VARCHAR(20),

    -- Resume Information
    about_text TEXT,
    skills TEXT[],
    certifications TEXT[],

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: Attendance
CREATE TABLE attendance (
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

-- Table: Leave Requests
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    attachment_url TEXT,
    reason TEXT,
    status leave_status NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: Leave Balances
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type leave_type NOT NULL,
    days_available INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_employee_leavetype UNIQUE (employee_id, leave_type)
);

-- Table: Salary Configs (Admin-Only)
CREATE TABLE salary_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    wage NUMERIC(12,2) NOT NULL, -- Monthly Base Wage
    wage_type VARCHAR(50) NOT NULL DEFAULT 'Fixed',
    working_days_per_week INT NOT NULL DEFAULT 5,
    break_time_minutes INT NOT NULL DEFAULT 60,

    -- Auto-calculated salary components
    basic NUMERIC(12,2) NOT NULL,
    hra NUMERIC(12,2) NOT NULL,
    standard_allowance NUMERIC(12,2) NOT NULL DEFAULT 4167.00,
    performance_bonus NUMERIC(12,2) NOT NULL,
    lta NUMERIC(12,2) NOT NULL,
    fixed_allowance NUMERIC(12,2) NOT NULL,

    -- Deductions
    pf_employee NUMERIC(12,2) NOT NULL,
    pf_employer NUMERIC(12,2) NOT NULL,
    professional_tax NUMERIC(12,2) NOT NULL DEFAULT 200.00,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for Query Performance
CREATE INDEX idx_users_login_id ON users(login_id);
CREATE INDEX idx_employees_emp_code ON employees(emp_code);
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

-- 6. Trigger for Automatic updated_at Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_employees_modtime BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leave_requests_modtime BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leave_balances_modtime BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_salary_configs_modtime BEFORE UPDATE ON salary_configs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
