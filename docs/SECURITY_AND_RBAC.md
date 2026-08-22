# Dayflow HRMS — Security Architecture & Role Escalation Prevention

## 1. Overview & Problem Statement Alignment

To prevent unauthorized users or employees from self-registering as Admins and bypassing role-based access control (RBAC), Dayflow HRMS enforces a **Multi-Tiered Admin Verification Architecture** backed by PostgreSQL/Supabase and `bcrypt` password encryption.

---

## 2. Prevention of Unauthorized Admin Role Escalation

### A. Employee Onboarding Restriction
- **No Self-Registration for Employees**: A normal employee cannot sign up or create an account on their own (`PS_Updated.md §3`).
- **Onboarding Authority**: Only an **authenticated, active Admin** can onboard an employee by calling `POST /api/employees`.
- **System-Generated Credentials**: The backend algorithm deterministic generator creates:
  - **Login ID**: e.g., `OIJODO20240001` (`[Prefix][first2(first)][first2(last)][year][serial]`).
  - **Encrypted Password**: `bcrypt` hashed initial system password (e.g. `Dayflow@4892`).

### B. Super Admin Approval Gate for Company Admin Registration
- **Self-Registration Endpoint (`POST /api/auth/signup`)**:
  - When an HR Manager or new Admin registers via the Sign Up form, their registration request is created with state `PENDING_SUPER_ADMIN_APPROVAL`.
  - **Master Key Security**: To instantly activate an Admin account during onboarding/deployment, a valid Company Master Key (`SUPER_ADMIN_2026`) must be provided.
  - **Super Admin Audit & Verification**: Root Super Admin (`login_id: admin`, password: `Dayflow@2026`) inspects pending requests via `GET /api/auth/pending-admins` and approves them via `PUT /api/auth/approve-admin/:id`.

---

## 3. Password Security & Reset Architecture

1. **Bcrypt Hashing**: All passwords (`users.password_hash`) are encrypted using `bcrypt` (10 salt rounds). Plaintext passwords are never stored or logged.
2. **JWT Authorization**: Session state uses signed JSON Web Tokens (`24h` expiration) carrying `userId`, `loginId`, `role`, and `employeeId`.
3. **Forgot & Reset Password Flow**:
   - `POST /api/auth/forgot-password`: Issues a single-use 6-digit OTP code tied to the user's Login ID or Email.
   - `POST /api/auth/reset-password`: Verifies the OTP, updates `password_hash` in Supabase, invalidates the OTP, and logs a security audit entry in `audit_logs`.

---

## 4. Server-Side RBAC Rules Matrix

| Endpoint | Target Resource | Permission Level | Enforcement Mechanism |
|---|---|---|---|
| `POST /api/employees` | Onboard Employee | **ADMIN Only** | `requireAdmin` Middleware |
| `GET /api/employees/:id` (Private Info/Bank) | Sensitive Data | **ADMIN or Self** | RBAC Field Masking |
| `GET /api/salary/:id` | Salary Configuration | **ADMIN Only** | `requireAdmin` Middleware |
| `PUT /api/salary/:id` | Live Wage Update | **ADMIN Only** | `requireAdmin` Middleware |
| `PUT /api/leave/:id/approve` | Approve Time-Off | **ADMIN / HR Only** | JWT Role Guard |
| `GET /api/auth/pending-admins` | Approve New Admins | **Super Admin Only** | Root Security Guard |
