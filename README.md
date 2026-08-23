#  Dayflow — Human Resource Management System (HRMS)

> **"Every workday, perfectly aligned."**  
> *A role-based, multi-tenant SaaS HRMS built around an interconnected operational pipeline.*

> [!NOTE]
> 📽️ **Official Demo Video**: [Watch Demo Video on YouTube](https://youtu.be/uETRaHfmxHU) | 📁 [Google Drive Mirror](https://drive.google.com/file/d/13TPvggYmIqfp8vyqW_DxN-eVISvfLbQ4/view?usp=sharing)

---

## 🌟 Overview

**Dayflow** is a modern Human Resource Management System built for high-efficiency workforce administration. Unlike traditional HR software with disconnected CRUD screens, Dayflow operates on a single connected data pipeline:

$$\text{Employee Onboarding} \longrightarrow \text{Attendance} \longrightarrow \text{Leave Management} \longrightarrow \text{Dynamic Payroll Computation}$$

Every check-in updates employee status dots live, every approved leave recalculates payable days, and every wage adjustment instantly computes salary components without full page reloads.

---

## 🎨 Design Concept: "Flight Deck" UX

Dayflow transforms administrative HR workflows into an intuitive aviation metaphor:

- **Passports / Boarding Passes**: Employee cards displaying live status badges (🟢 **Boarding**, ✈️ **In Transit**, 🟡 **Delayed**).
- **Control Tower**: Real-time admin dashboard metric strip summarizing active organization status.
- **Runway**: Interactive check-in/check-out progress tracker.
- **Departures Board**: Leave & time-off management table with real-time approval actions.
- **Salary Manifest Bar**: Interactive stacked bar visualizing base wage distribution across allowances and deductions.

---

## 🚀 Core Features

### 🔐 1. Custom JWT Authentication & RBAC
- **Strict Login ID Authentication**: Log in using custom system-generated IDs (e.g., `OIPRSH20240001`), not emails.
- **Role-Based Access Control**:
  - 👑 **Admin**: Full system authority, employee onboarding, attendance overview, leave approvals, exclusive salary configuration & simulation.
  - 👤 **Employee**: Read-only profile/salary access, self check-in/out, time-off application.
- **Field Masking**: Sensitive private info (DOB, PAN, UAN) and bank details (Account No, IFSC) are strictly restricted to the user and Admins.

### 🆔 2. Automated Login ID Generation Algorithm
When an Admin creates an employee, the system deterministically auto-generates a collision-safe ID:

$$\text{Login ID} = [\text{Company Prefix}] + [\text{First 2 of First Name}] + [\text{First 2 of Last Name}] + [\text{Joining Year}] + [\text{4-Digit Serial}]$$

*Example:* `OI` + `ME` + `NA` + `2024` + `0001` $\rightarrow$ `OIMENA20240001`

### ⏱️ 3. Attendance Tracking
- Real-time Check-in / Check-out with automatic work hour & extra hour computation.
- Dynamic status indicator updating dashboard dots instantly:
  - 🟢 **Boarding / Present**: Checked-in today.
  - ✈️ **In Transit / On Leave**: Approved active leave.
  - 🟡 **Delayed / Absent**: No check-in & no approved leave.

### ✈️ 4. Leave & Time-Off Management
- Supports **Paid Time Off (24 days)**, **Sick Leave (7 days)** with attachment upload, and **Unpaid Leave**.
- Overlap detection and available balance checks before submission.
- Real-time Admin Approval/Rejection updating leave balances and pipeline data.

### 💰 5. Dynamic Payroll Calculation Engine
The heart of Dayflow's backend engine:

$$\text{Payable Days} = \text{Total Working Days} - \text{Unpaid Leave Days} - \text{Missing Attendance Days}$$

$$\text{Pro-Rated Net Pay} = \left( \frac{\text{Base Wage}}{\text{Total Working Days}} \times \text{Payable Days} \right) - \text{Deductions}$$

#### Salary Component Breakdown:
| Component | Formula | Example (Wage = ₹50,000) |
|---|---|---|
| **Basic Salary** | $50\%$ of Base Wage | ₹25,000 |
| **HRA** | $50\%$ of Basic | ₹12,500 |
| **Standard Allowance** | Fixed | ₹4,167 |
| **Performance Bonus** | $8.33\%$ of Basic | ₹2,083 |
| **Leave Travel Allowance (LTA)** | $8.33\%$ of Basic | ₹2,083 |
| **Fixed Allowance** | $\text{Wage} - \sum(\text{Other Components})$ | ₹4,167 |
| **PF (Employee & Employer)** | $12\%$ of Basic each | ₹3,000 |
| **Professional Tax** | Flat rate | ₹200 |

*Hard Constraint:* The sum of all component allowances never exceeds the defined Base Wage.

---

## 🛠️ Tech Stack & Infrastructure

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons. *(Strictly single-page application, no SSR/Next.js)*.
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (`jsonwebtoken`), Password Hashing (`bcryptjs`).
- **Database**: Supabase PostgreSQL database, `pg` Connection Pool, Pure DDL SQL (`schema.sql`).

---

## 📂 Repository Structure

```text
d:\HuMage\
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection pool (db.js)
│   │   ├── controllers/     # Modular controllers (auth, employee, attendance, leave, salary, health)
│   │   ├── middleware/      # JWT verification & requireAdmin RBAC middleware
│   │   ├── routes/          # Express API route modules
│   │   ├── services/        # Payroll engine & calculation services
│   │   ├── utils/           # Login ID & password generator engine
│   │   └── server.js        # Main Express application entry point
│   ├── scripts/             # DB setup & seed runner scripts
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema.sql           # PostgreSQL DDL table definitions & triggers
│   └── seed.sql             # Initial demo users & seed data
├── frontend/
│   ├── src/
│   │   ├── components/      # Flight Deck UI components (BoardingPassCard, Runway, ManifestBar)
│   │   ├── pages/           # Application views (SignIn, Dashboard, EmployeeInfo, Attendance, TimeOff, Salary)
│   │   ├── services/        # Frontend API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
