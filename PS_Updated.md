# Dayflow — Human Resource Management System (HRMS)
**"Every workday, perfectly aligned."**

> This document is the single source of truth for the problem statement. It merges the
> written spec (PDF), the wireframe (Excalidraw/PNG), and details that only existed in the
> annotation layer of the wireframe (not in the PDF). Any agent or teammate should be able
> to read this file alone and understand exactly what to build, what data model to use, and
> how modules connect — without needing the original files.

---

## 1. One-line pitch

A role-based HRMS where **employee onboarding → attendance → leave → payroll** are one
connected pipeline instead of four disconnected CRUD screens. The demo-winning idea is
showing data *flow* end-to-end: a check-in changes a dashboard dot, a leave approval
changes payable days, and a wage edit auto-recalculates every salary component live.

## 2. User roles

| Role | Description |
|---|---|
| **Admin** | Full system control: employee management, HR management, attendance, leave, **salary configuration (exclusive)**, security/audit |
| **HR Officer** | Creates/manages employees, views attendance, approves/rejects leave. No salary config access. |
| **Employee** | Views own profile/attendance/leave/salary (read-only), checks in/out, applies for leave |

> ⚠️ Rule found only in the wireframe: **"Salary Info" tab is visible to Admin only** — not
> even HR Officer. Treat this as a strict RBAC check, not just a UI hide.

---

## 3. Authentication & Registration

### Sign Up (self-registration path — company/first admin only)
Fields: Company Name, Name, Email, Phone, Password, Confirm Password.

### Sign In
Fields: Login ID / Email, Password.

### 🔑 Critical business rule (from wireframe note, not in PDF)
> **A normal employee cannot self-register.** Only Admin/HR Officer can create a new
> employee record. When they do, the system must:
> 1. Auto-generate the employee's Login ID.
> 2. Auto-generate an initial password.
> 3. Employee logs in with that password and can change it afterward.

### Login ID generation algorithm (exact spec from wireframe)
```
[Company Prefix][first 2 letters of first name][first 2 letters of last name][year of joining][serial number for that year]

Example: OIJODO20220001
  OI    -> Company prefix (e.g. "OI" for Odoo India in the original example — use your own company prefix)
  JODO  -> first 2 letters of first name + first 2 letters of last name
  2022  -> year of joining
  0001  -> serial number of joining, reset per year
```
This must be deterministic and collision-safe (increment serial per year even if names repeat).

### Password security
Per PDF: passwords must follow security rules; email verification required for the
self-registering Admin/company account (not required for HR-created employees, who get
a system-generated password instead).

---

## 4. Navigation & Dashboard

Top nav (all roles): **Company Logo | Employees | Attendance | Time Off | [Avatar]**

Clicking the avatar opens a dropdown: **My Profile**, **Log Out**.

### Employee list / dashboard
- Grid of **employee cards**, each showing profile picture + basic info.
- Each card has a **status indicator in the top-right corner**:
  - 🟢 Green dot — present in office
  - ✈️ Airplane icon — on approved leave
  - 🟡 Yellow dot — absent (no approved time-off, no check-in)
- Cards are **clickable** → opens the Employee Information page in **view-only /
  non-editable mode** (this is distinct from "My Profile", which is editable for self).
- A search bar exists on Employees/Attendance/Time Off list views.

### "NEW" button
Appears in Employees, Time Off list views — used to create a new employee / leave
request respectively.

---

## 5. Employee Profile

### Sections (from wireframe "My Profile" screen)
- **Header**: Avatar, Name, Login ID, Company, Department, Manager, Job Position, Mobile,
  Email, Location, Emp Code, Date of Joining.
- **Tabs**: Resume | Private Info | Salary Info (Admin-only) | Security
- **Resume tab**: About (free text), What I love about my job (free text), My interests and
  hobbies (free text), Skills (tag list, "+ Add Skills"), Certifications (list, "+ Add").
- **Private Info tab** (fields found only in wireframe, missing from PDF spec):
  - Date of Birth, Residing Address, Personal Email, Gender, Nationality, Marital Status
  - PAN No, UAN No
  - **Bank Details**: Account Number, Bank Name, IFSC Code
- **Salary Info tab**: see §6. Admin-only — hide the tab entirely for HR/Employee, and
  enforce it server-side too.
- **Security tab**: present in the wireframe as a tab alongside Resume/Private
  Info/Salary Info but not detailed further — treat as an opportunity (see §9 unique
  features: password change, login history/audit log).

### Editability rule
- "My Profile" (self view) → editable form.
- Employee card → employee info page → **view-only**, even for the viewer's own role
  unless they're viewing their own profile via "My Profile."

---

## 6. Salary / Payroll (Admin-only)

### Wage setup
- Wage Type: **Fixed wage** (only type in MVP scope)
- Monthly Wage, Yearly Wage (auto-derived: Yearly = Monthly × 12)
- No. of working days/week, Break time (config fields — affect work-hour calc, not payroll math directly in MVP)

### Salary Components (must auto-recalculate whenever Wage changes)

| Component | Formula | Example (Wage = ₹50,000) |
|---|---|---|
| Basic Salary | 50% of Wage | ₹25,000 |
| House Rent Allowance (HRA) | 50% of Basic | ₹12,500 |
| Standard Allowance | Fixed amount (not a %) | ₹4,167 |
| Performance Bonus | 8.33% of Basic | ₹2,082.50 |
| Leave Travel Allowance (LTA) | 8.33% of Basic | ₹2,082.50 |
| Fixed Allowance | Wage − sum(all other components) | ₹2,918.00 |

**Hard constraint:** sum of all components must never exceed the defined Wage. Fixed
Allowance is the balancing figure, always computed last.

### Deductions
| Deduction | Formula | Example |
|---|---|---|
| Provident Fund (PF) — Employee | 12% of Basic | ₹3,000 |
| Provident Fund (PF) — Employer | 12% of Basic | ₹3,000 |
| Professional Tax | Flat ₹200/month, deducted from gross | ₹200 |

> Note: the wireframe shows **both an Employee-side and an Employer-side PF
> contribution at 12% each** — a detail the PDF omits entirely and the first-pass analysis
> missed. Model both, even if only the employee-side nets out of take-home pay.

### Display
Admin sees full breakdown (wage → basic → HRA → standard allowance → bonus → LTA →
fixed allowance → gross → PF → prof. tax → net). Employee sees their own Salary Info
read-only (per PDF §3.6.1); but remember the wireframe explicitly restricts the Salary
Info **tab** to Admin only — reconcile this by giving Employees a simpler read-only
"payslip" view instead of the full config tab (see §9 for how to differentiate this).

---

## 7. Attendance

- **Check In / Check Out** via a systray-style widget. On successful check-in, the
  employee's status dot flips 🔴 → 🟢 (wireframe uses red→green; dashboard cards use
  yellow for absent — treat "red" and "yellow" as the same "not checked in" state, unify
  in implementation).
- **Employee view**: day-wise attendance for the current/ongoing month by default, with
  Check In, Check Out, Work Hours, Extra Hours columns, and prev/next month navigation.
- **Admin/HR view**: attendance **list view**, searchable, with per-employee row and
  extra summary columns not present in the employee view:
  - Count of days present
  - Leaves count
  - Total working days
  - Date filter with prev/next arrows

### Attendance → Payroll pipeline (this is the standout backend requirement)
```
Total Working Days → Present Days → Leave Days → Unpaid Leave → Payable Days → Salary/Payslip
```
Any unpaid leave or missing attendance day **automatically reduces payable days**, which
should feed into payslip computation. This is the #1 "wow" flow for demo — attendance
isn't cosmetic, it's the payroll input.

---

## 8. Time Off / Leave Management

### Leave types
- Paid Time Off (e.g., 24 days available)
- Sick Leave (e.g., 7 days available) — supports an **attachment** (sick leave
  certificate)
- Unpaid Leave

### Employee view
- Tabs: **Time Off | Allocation**
- Calendar-style balance view showing days available per type
- "NEW" → opens **Time Off Type Request** modal:
  - Employee (self, locked)
  - Time Off Type (dropdown)
  - Validity Period: Start Date, End Date
  - Allocation (auto or manual number of days)
  - Attachment (conditionally required for Sick Leave)
  - Submit / Discard

### Admin/HR view
- List view: Name, Start Date, End Date, Time Off Type, **Status**, **Reject & Approve
  buttons**
- Search bar
- Approve/Reject updates status immediately and reflects in employee's own records and
  dashboard status icon (✈️ airplane when approved & active).

---

## 9. Unique differentiators (go beyond the wireframe clone)

The wireframe alone is "build the same Odoo HR screens." To stand out to judges, layer
these on top of the same data model — each is scoped to be buildable in the remaining
hackathon time, not a moonshot:

1. **Live salary simulator** — an Admin-only slider/input on the Wage field that
   recalculates every component in real time (no save needed) before committing. Turns a
   static form into an interactive "what-if" tool — visually impressive, cheap to build
   since the calc engine is already needed for §6.
2. **Attendance → Payslip PDF, generated on demand** — a single "Generate Payslip"
   button on an employee's Salary tab that renders a real PDF (wage, components,
   deductions, payable-days-adjusted net pay) using the attendance pipeline from §7.
   This is the most demo-worthy artifact you can hand a judge.
3. **Security tab as a real audit log** — since the wireframe reserves a "Security" tab
   but never defines it, implement: password change, last login timestamp/IP, and a
   simple login-attempt history. This turns an unspecified wireframe tab into a genuine
   security feature — good fit for a cybersecurity-flavored team.
4. **"At risk" attendance flag** — simple rule-based (not ML) flag on the Admin
   dashboard: e.g., employee has ≥3 yellow (unexplained absent) days in the current
   month → small warning badge on their card. Cheap, rule-based, but reads as "smart."
5. **Auto payable-days recompute banner** — whenever a leave request is approved, show a
   live toast/banner: "Payable days for [Employee] updated: 22 → 20" to make the
   attendance→leave→payroll pipeline visible during the demo instead of implicit.
6. **Role-aware navigation** — instead of just hiding the Salary tab, show a clearly
   different Employee-facing "My Payslip" read-only summary card vs the Admin's full
   configurable Salary Info tab — reinforces the RBAC story visually.

Recommended demo order for judges: **Admin creates employee → auto Login ID/password
generated → employee logs in, checks in (dot turns green) → employee applies leave →
Admin approves → payable days auto-adjust → Admin opens Salary tab, tweaks Wage live →
generates payslip PDF reflecting the adjusted payable days.**

---

## 10. Core data model (starting point, extend as needed)

```
User
 ├── id, login_id, email, password_hash, role (admin | hr | employee)

Employee
 ├── employee_id, user_id, name, phone, department, manager_id, job_position,
 │   location, joining_date, profile_picture, emp_code
 ├── PrivateInfo: dob, residing_address, personal_email, gender, nationality,
 │   marital_status, pan_no, uan_no
 └── BankDetails: account_number, bank_name, ifsc_code

Attendance
 ├── id, employee_id, date, check_in, check_out, work_hours, extra_hours, status

LeaveRequest
 ├── id, employee_id, leave_type (paid|sick|unpaid), start_date, end_date, days,
 │   attachment_url, status (pending|approved|rejected), reviewed_by

LeaveBalance
 ├── employee_id, leave_type, days_available

Salary
 ├── employee_id, wage, wage_type, working_days_per_week, break_time
 ├── basic, hra, standard_allowance, performance_bonus, lta, fixed_allowance
 ├── pf_employee, pf_employer, professional_tax
 └── computed_at (recompute whenever wage changes)

AuditLog (supports unique feature #3)
 ├── id, user_id, action, timestamp, ip_address
```

---

## 11. Explicit scope cut for an 8-hour build

**In scope (P0):** Auth + RBAC, employee CRUD + auto Login ID/password, employee
cards + dashboard status dots, check-in/out + attendance list (both views), leave
apply/approve/reject + balances, salary wage→components→deductions calc engine +
Admin Salary tab, payable-days pipeline connecting attendance+leave→payroll.

**Stretch (P1, only if time remains):** Payslip PDF export, Security/audit tab,
at-risk attendance flag, live salary simulator polish, resume/skills/certifications
editing, advanced search/filtering.

**Explicitly out of scope:** multi-company support, real payroll compliance/statutory
filing, email/SMS notifications, full org-chart hierarchy, systray OS-level widget
(simulate with an in-app button instead).

---

## 12. Judge/Evaluator Expectations (from expectations video)

- [ ] Database design & setup is a scored criterion — treat schema design as a deliverable, not just plumbing
- [ ] Use a local database (MySQL or Postgres) — do NOT rely on hosted/online services like Firebase, Supabase, or MongoDB Atlas
- [ ] Minimize use of 3rd-party APIs — keep the stack self-contained wherever possible
- [ ] Negative/invalid input must be handled with proper custom error messages, not generic or default errors
- [ ] UI must be clean and consistent with intuitive navigation
- [ ] Solution should be built with performance and scalability in mind
