# Dayflow HRMS — 8-Hour Build Plan (4 people)

> Read `PS.md` first — it has the full problem statement, formulas, and data model this
> plan assumes. This file only assigns *who builds what, in what order*.

## Team split (by ownership, not strict silo — help each other at integration points)

| Person | Module | Why this split |
|---|---|---|
| **P1** | Auth, RBAC, Employee core + Login ID generator | Everything else depends on user/employee records existing first |
| **P2** | Attendance (check-in/out, list views, work-hours calc) | Feeds payroll pipeline (P4) and dashboard status (P1's cards) |
| **P3** | Leave / Time-Off (apply, approve/reject, balances) | Feeds payable-days pipeline (P4) and dashboard status icon |
| **P4** | Salary/Payroll engine + Admin Salary tab + payable-days integration | Depends on P2 + P3 data, so front-loads the calc engine with mock data first |

Shared responsibility (all 4): agree on the data model in `PS.md §10` in the first 20
minutes before writing code, and don't change field names without a 30-second Slack
ping to the group.

---

## Hour 0:00–0:30 — Everyone together
- [ ] Lock the DB schema from `PS.md §10` (add fields if needed, but freeze names)
- [ ] Agree on API contract / route prefixes per module (`/api/auth`, `/api/employees`,
      `/api/attendance`, `/api/leave`, `/api/salary`)
- [ ] Set up repo, base project skeleton, shared auth middleware stub
- [ ] Decide on P0 scope cut vs stretch goals from `PS.md §11`

---

## P1 — Auth, RBAC, Employee Core (owns login ID + password generation)

**Hour 0:30–2:00**
- [ ] Sign Up (company/first Admin) + Sign In screens & endpoints
- [ ] Role model: admin / hr / employee, with middleware to gate routes by role
- [ ] Employee "Add" flow (Admin/HR only) — this is the entry point for the whole demo
- [ ] **Login ID generator**: `[Prefix][first2(firstname)][first2(lastname)][joinYear][serial]`
      — must increment serial per year, be collision-safe
- [ ] Auto-generate initial password, force "must change on first login" flag

**Hour 2:00–3:30**
- [ ] Employee list page → clickable cards → view-only Employee Info page
- [ ] Status dot logic on cards (🟢 present / 🟡 absent / ✈️ on leave) — this reads from
      P2 (attendance) + P3 (leave) data, so stub with mock data until they're ready, then
      wire real endpoints
- [ ] My Profile (editable, self) vs Employee Info (view-only, others) distinction
- [ ] Profile tabs: Resume (About/skills/certs), Private Info (DOB, address, PAN, UAN,
      bank details)

**Hour 3:30–5:00**
- [ ] Wire real status-dot data from P2/P3 once their endpoints exist
- [ ] Nav bar + avatar dropdown (My Profile / Log Out) across all pages
- [ ] Search bar on Employees list

**Hour 5:00–7:00** — Integration support + stretch
- [ ] Help P4 wire Admin-only visibility for Salary tab (server-side enforced, not just
      hidden in UI)
- [ ] Stretch: Security tab (password change, last login timestamp) — unique feature #3
      from `PS.md §9`

**Hour 7:00–8:00** — Freeze + demo script rehearsal (see bottom of this file)

---

## P2 — Attendance

**Hour 0:30–2:00**
- [x] Check In / Check Out endpoint + button (simulate systray as an in-app widget)
- [x] On check-in: flip status to present, record timestamp; on check-out: compute
      work_hours, extra_hours
- [x] Employee attendance view: day-wise, current month default, prev/next month nav

**Hour 2:00–3:30**
- [x] Admin/HR attendance list view: search bar, date filter (prev/next arrows), columns
      = Check In, Check Out, Work Hours, Extra Hours **plus** Count of days present,
      Leaves count, Total working days (these last three are admin-view-only extras)
- [x] Publish a clean internal function/endpoint: `getPayableDaysInput(employeeId, month)`
      → { totalWorkingDays, presentDays } — **this is the contract P4 needs**, agree on
      its shape with P4 by hour 2:30 at the latest

**Hour 3:30–5:00**
- [x] Wire attendance status into P1's dashboard cards (🟢/🟡)
- [x] Edge cases: missing check-out, multiple check-ins same day, timezone handling

**Hour 5:00–7:00** — Integration support + stretch
- [x] Help P4 test the attendance→payroll pipeline end-to-end
- [x] Stretch: unique feature #4 ("at risk" badge — ≥3 unexplained absences this month)

**Hour 7:00–8:00** — Freeze + demo script rehearsal

---

## P3 — Leave / Time-Off

**Hour 0:30–2:00**
- [x] Leave types: Paid / Sick / Unpaid, seed default balances (24 / 7 / — days)
- [x] Employee "NEW" leave request modal: type, start/end date, allocation days,
      attachment (required only for Sick Leave)
- [x] Employee Time Off view: balances by type + own request history

**Hour 2:00–3:30**
- [x] Admin/HR Time Off list view: search bar, Name/Start/End/Type/Status columns,
      **Approve** and **Reject** buttons
- [x] Approve/Reject updates status immediately, decrements/restores balance
      accordingly
- [x] Publish a clean internal function/endpoint: `getUnpaidLeaveDays(employeeId, month)`
      → number — **this is the contract P4 needs**, agree shape with P4 by hour 2:30

**Hour 3:30–5:00**
- [x] Wire leave status into P1's dashboard cards (✈️ when on approved leave today)
- [x] Validation: date ranges can't overlap existing approved leave, can't exceed balance

**Hour 5:00–7:00** — Integration support + stretch
- [x] Help P4 test approve → payable-days recompute flow
- [x] Stretch: unique feature #5 (live "payable days updated" banner/toast on approval)

**Hour 7:00–8:00** — Freeze + demo script rehearsal

---

## P4 — Salary / Payroll Engine (the core "wow" logic)

**Hour 0:30–2:00**
- [x] Build the pure calc engine first, with **mock wage input**, no UI yet:
  - Basic = 50% × Wage
  - HRA = 50% × Basic
  - Standard Allowance = fixed ₹4,167
  - Performance Bonus = 8.33% × Basic
  - LTA = 8.33% × Basic
  - Fixed Allowance = Wage − sum(all above)
  - PF (Employee) = 12% × Basic, PF (Employer) = 12% × Basic
  - Professional Tax = flat ₹200/month
  - Assert: sum(components) never exceeds Wage
- [x] Unit-test the engine against the worked example in `PS.md §6` (Wage ₹50,000 →
      Basic ₹25,000, HRA ₹12,500, etc.) before touching UI

**Hour 2:00–3:30**
- [x] Admin Salary Info tab UI: Wage input → live recompute of every component
      (unique feature #1, "live salary simulator" — cheap since engine already exists)
- [x] Server-side RBAC: Salary tab/endpoints return 403 for non-Admin, not just hidden
      in UI (coordinate with P1)
- [x] Employee-facing read-only "My Payslip" summary (simpler view, per PS.md §6 note
      on reconciling PDF vs wireframe visibility rule)

**Hour 3:30–5:00**
- [x] Payable-days pipeline: `payableDays = totalWorkingDays − unpaidLeaveDays
      (from P3) − missingAttendanceDays (from P2)`
- [x] Net pay adjustment: scale gross proportionally by `payableDays / totalWorkingDays`
      (or your team's simpler agreed formula — document whichever you pick in PS.md's
      companion notes)
- [x] Wire real data from P2 (`getPayableDaysInput`) and P3 (`getUnpaidLeaveDays`)
      instead of mocks

**Hour 5:00–7:00** — Integration + stretch
- [x] End-to-end test: check-in/out data + leave approval → correct payable days →
      correct adjusted salary shown on Admin + Employee views
- [x] Stretch: unique feature #2 — "Generate Payslip" PDF button (wage, components,
      deductions, payable-days-adjusted net pay)

**Hour 7:00–8:00** — Freeze + demo script rehearsal

---

## Hour 7:00–8:00 — Everyone: demo rehearsal (per `PS.md §9`)

Run this exact sequence twice before presenting:

1. Admin logs in → creates new employee (wage ₹50,000) → system shows auto-generated
   Login ID + password
2. Employee logs in with generated credentials → checks in → dashboard dot turns 🟢
3. Employee applies for Paid Time Off (2 days)
4. Admin opens Time Off list → Approves → employee's dashboard icon becomes ✈️
5. Admin opens the employee's Salary Info tab → payable days visibly reduced by the
   approved leave
6. Admin tweaks Wage live → watch every component recompute
7. (Stretch) Admin clicks "Generate Payslip" → PDF reflects payable-days-adjusted net pay

If any step breaks, cut it from the live demo and fall back to the last working step —
don't debug live in front of judges.

---

## Definition of done (P0, must all be true before hour 7:00)

- [ ] Only Admin/HR can create employees; Login ID + password are auto-generated
- [ ] Employee cards show correct status dot (present/absent/on-leave)
- [ ] Check-in/out works and updates attendance records + work hours
- [ ] Leave apply → approve/reject flow works and updates balances
- [ ] Salary components auto-calculate from Wage and never exceed Wage
- [ ] Salary Info tab is genuinely inaccessible (not just hidden) to non-Admins
- [ ] Attendance + leave data visibly affects payable days somewhere in the UI

---

## Judge/Evaluator Expectations (from expectations video)

- [ ] Database design & setup is a scored criterion — treat schema design as a deliverable, not just plumbing
- [ ] Use a local database (MySQL or Postgres) — do NOT rely on hosted/online services like Firebase, Supabase, or MongoDB Atlas
- [ ] Minimize use of 3rd-party APIs — keep the stack self-contained wherever possible
- [ ] Negative/invalid input must be handled with proper custom error messages, not generic or default errors
- [ ] UI must be clean and consistent with intuitive navigation
- [ ] Solution should be built with performance and scalability in mind
