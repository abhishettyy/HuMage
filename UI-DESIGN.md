# Dayflow HRMS — UI Design Spec: "Flight Deck"

> Companion to `PS.md` (requirements) and `TASKS.md` (build plan). This file is the
> single visual reference — anyone building a screen should match this before
> inventing their own styling, so the four modules don't end up looking like four
> different apps stitched together.

---

## 1. Concept

**"Every workday, perfectly aligned."** The wireframe already uses an airplane icon for
"on leave" — this spec extends that into a full metaphor instead of a generic
admin-panel look:

- Employees are **passengers**, checking in and out like boarding/landing.
- Attendance is a **runway** — gate (check-in) to takeoff to landing (check-out).
- Leave is **flight status**: boarding / in flight / delayed / in transit.
- Salary is a **manifest** — one wage "weight" distributed across components.
- The admin dashboard is a **control tower** — an overview strip + a board of
  passengers below it.

This is a skin over the exact data model in `PS.md §10` — no functional change, purely
how it's presented. If a screen doesn't obviously fit the metaphor, don't force it —
fall back to the plain component patterns in §5.

---

## 2. Status vocabulary (use these exact labels everywhere)

| Data state (from PS.md) | Old wireframe icon | Flight-deck label | Badge color |
|---|---|---|---|
| Checked in / present | 🟢 green dot | **Boarding** | Teal |
| Absent, no approved leave | 🟡 yellow dot | **Delayed** | Amber |
| Approved leave, active today | ✈️ airplane | **In transit** | Gray/neutral |
| Not yet checked in, day not started | — | **Grounded** | Gray/neutral |

Keep this table consistent across employee cards, dashboard summary, and attendance
lists — a status must read the same word everywhere it appears.

---

## 3. Color system

Flat, two-accent rule — do **not** invent extra colors per screen.

| Role | Use for | Ramp |
|---|---|---|
| Primary accent | Boarding/present state, primary actions (Check In, Submit, Approve) | Teal |
| Warning accent | Delayed/absent state, "at risk" flags, Reject action | Amber |
| Neutral | Everything else — in-transit/leave state, structural UI, default cards | Gray |
| Danger (rare) | Destructive-only actions (delete employee) — not for "Reject leave," which is a normal business action, not destructive | Red |

Never use more than teal + amber + gray on one screen. Red is reserved for actual
destructive/error states, not for "delayed" or "rejected," which are normal business
outcomes, not errors.

Text-on-color: always the 800/900 stop of the same ramp (per design-system rule), never
plain black on a colored badge.

---

## 4. Typography

- **Sans-serif** (system default) for all labels, names, nav, body copy.
- **Monospace** for anything that is an *identifier or a number meant to be scanned*:
  Login ID, timestamps (check-in/out), currency amounts, percentages in the salary
  breakdown. This is what gives the salary/attendance screens a "flight computer"
  feel and makes numbers easy to eyeball at a glance.
- Sentence case everywhere. No ALL CAPS except the literal "NEW" button carried over
  from the wireframe (keep it — it reads like a boarding-pass stamp).

---

## 5. Core components (shared across all 4 modules — build these once, reuse everywhere)

### 5.1 Boarding-pass employee card
Replaces the plain wireframe employee card.
- Top section: avatar, name, department, a leading status icon (`ti-plane-departure`
  boarding / `ti-alert-circle` delayed / `ti-plane` in transit / `ti-clock` grounded).
- A **dashed divider** (perforation effect) separating the top from a footer strip.
- Footer strip: Login ID in monospace + the status word as a badge (see §2 table).
- Clicking the card → view-only Employee Info page (per `PS.md §5`).
- Card background tint = the ramp for that status (teal/amber/gray at the 50-stop),
  never a filled solid color — keep cards light, badges carry the saturation.

### 5.2 Control-tower summary strip (Admin/HR dashboard only)
Three metric cards at the top of the Employees page, before the card grid:
**In flight** (present count) / **In transit** (on leave count) / **Grounded**
(absent/not checked in count). Plain metric-card pattern — muted label, large number
below, no icon needed here (icons live on the passenger cards themselves).

### 5.3 Check-in/out runway
A single horizontal track:
- A thin base line (the runway).
- A filled accent segment showing progress from check-in toward check-out.
- A small plane icon marker sitting at the current progress point.
- Two small labels under the ends: "Gate (check-in)" / "Runway (check-out)".
- Replaces the plain Check In / Check Out buttons *visually* — the buttons still exist
  functionally (tap to check in/out), the runway is the feedback/progress display next
  to them, not a replacement for the actual controls.

### 5.4 Salary manifest bar
Replaces a plain form of number inputs for the Admin Salary Info tab.
- One horizontal stacked bar = total Wage.
- Segments in order: Basic, HRA, Standard Allowance, Performance Bonus, LTA, Fixed
  Allowance — each segment width proportional to its ₹ value.
- Wage input above the bar; changing it recomputes every segment width live (this is
  the "live salary simulator" unique feature from `PS.md §9`).
- Below the bar: a plain list of each component with its ₹ value in monospace, plus PF
  (employee/employer) and Professional Tax as a separate "deductions" list underneath
  (deductions are not part of the manifest bar — they come out of it, don't show them
  as bar segments or the total will look wrong).

### 5.5 Departures-board leave list
For the Admin/HR Time Off list view and the Employee's own leave history:
- Table-style rows (not cards) — Name, Start Date, End Date, Type, Status.
- Status shown as the same badge vocabulary as employee cards where it maps (Approved
  ≈ neutral "in transit" tone, Pending ≈ amber, Rejected ≈ plain gray, not red — a
  rejection isn't an error state).
- Approve/Reject buttons only on the Admin/HR view, inline at the row's end.
- Keep this a dense table, not cards — a leave list is scanned, not browsed.

---

## 6. Screen-by-screen notes

### Sign In / Sign Up
Plain, centered card, no flight-deck theming — this is the one screen where a generic,
trustworthy "business software" look is correct (it's the first impression, don't
gimmick it). Company logo, fields, single primary button.

### Employee dashboard (Admin/HR)
Control-tower summary strip (§5.2) → search bar → grid of boarding-pass cards (§5.1).

### Employee dashboard (Employee)
Same card grid but scoped to teammates/department only if you have time; otherwise
same view as Admin minus the salary-related affordances.

### Employee Info page (view-only, from clicking a card)
Header mirrors the boarding-pass card (avatar, name, status) but expanded, then tabs:
Resume / Private Info / Salary Info (Admin-only) / Security. Plain form-field layout
inside tabs — no theming needed for personal data fields (DOB, PAN, bank details,
etc.), that content should read as neutral and calm, not gamified.

### My Profile (editable, self)
Same tab layout as Employee Info, but fields are editable inputs instead of static
text.

### Attendance — Employee view
Runway component (§5.3) at the top for today, then a plain day-wise table below for
the current month (Date / Check In / Check Out / Work Hours / Extra Hours).

### Attendance — Admin/HR view
Search bar + date navigation, then a table with the extra summary columns (Count of
days present, Leaves count, Total working days) per `PS.md §7`. No runway here — the
runway is a personal, first-person widget; the admin view is a data table.

### Time Off — Employee view
Two balance cards at top (Paid Time Off, Sick Leave — days available, plain metric
cards), "NEW" button, then the departures-board list (§5.5) scoped to their own
requests.

### Time Off — Admin/HR view
Same departures-board list (§5.5), all employees, with Approve/Reject actions.

### Salary Info (Admin only)
Manifest bar (§5.4). This is the screen worth spending the most polish time on — it's
the most visually distinctive and most demo-worthy.

---

## 7. Ownership (maps to `TASKS.md` split — build these alongside your module, don't wait for a separate "UI person")

| Component | Owner | Notes |
|---|---|---|
| Boarding-pass card (§5.1) + control-tower strip (§5.2) | **P1** | Needed early since P1 owns the employee list/dashboard |
| Check-in/out runway (§5.3) | **P2** | Attach to the attendance check-in flow |
| Departures-board list (§5.5) | **P3** | Attach to the leave apply/approve flow |
| Salary manifest bar (§5.4) | **P4** | Attach to the salary calc engine once it's returning live numbers |

Build the boarding-pass card and status badges as a shared component/partial as early
as possible (ideally by hour 1:30) — P2, P3, and P4 all need to reference the same
status vocabulary (§2) on their own screens, so it shouldn't be forked four times.

---

## 8. What NOT to theme

To keep this from becoming a costume instead of a design system:
- Sign In / Sign Up
- Private Info tab (personal data — DOB, PAN, bank details) — keep neutral and plain
- Security tab (password change, login history) — this is a trust-sensitive screen,
  keep it calm and conventional, not playful
- Any error/validation messaging — errors should read as plain, direct text, not
  themed copy (no "this flight has been delayed" for a failed API call — say what
  happened, per standard UX copy conventions: state the problem, then the fix)
