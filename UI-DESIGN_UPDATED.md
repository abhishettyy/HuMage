# Dayflow HRMS — UI Design Spec: "Flight Deck"

> Companion to `PS.md` (requirements) and `TASKS.md` (build plan). This file is the
> single visual reference — anyone building a screen should match this before
> inventing their own styling, so the four modules don't end up looking like four
> different apps stitched together.

> **v2 changelog:** benchmarked against current HR/HRMS dashboard UI kits and
> patterns (Figma HR dashboard kits, Dribbble HRMS/attendance/leave-management
> shots, Horilla HRMS component breakdowns, 2026 dashboard-design pattern
> writeups). None of it changes the metaphor or scope — it's concrete sizing/
> layout tokens the v1 spec was missing, plus three small reuses of patterns that
> real HR products converge on: a corner status dot for fast scanning, a trend
> delta on the summary strip, and a mini usage bar on leave balances (which
> conveniently reuses the manifest-bar component you're already building for
> salary). Additions are called out inline with **[v2]**.

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

### 4.1 Layout & spacing tokens **[v2]**

The v1 spec never nailed down concrete sizes, which is exactly where four people
building in parallel drift apart. Use these everywhere instead of eyeballing:

- **Spacing scale:** 4 / 8 / 16 / 24 / 32px. Card internal padding = 16px. Grid
  gutter between cards = 16–20px.
- **Corner radius:** 12px on cards (boarding-pass card, metric cards, manifest bar
  container), 6px on badges/pills, 8px on buttons and inputs. Pick one radius per
  element type and don't mix.
- **Card grids** (employee grid, metric strip): `grid-template-columns:
  repeat(auto-fill, minmax(240px, 1fr))`. This is what keeps the boarding-pass
  grid from looking cramped on a laptop and stretched on a wide monitor without
  per-breakpoint tuning.
- **Summary strip height:** ~96–120px per metric card. That's the highest-value
  real estate on the screen (top of the page, no scroll) — per current dashboard
  design convention, don't spend it on a welcome banner or logo repeat; go
  straight from top nav into the control-tower strip (§5.2).
- **Density over whitespace:** this is a data tool for admins/HR reviewing many
  rows, not a marketing page — prefer compact rows/cards over generous padding,
  especially on the departures-board (§5.5) and attendance tables.

---

## 5. Core components (shared across all 4 modules — build these once, reuse everywhere)

### 5.1 Boarding-pass employee card
Replaces the plain wireframe employee card.
- Top section: avatar, name, department, a leading status icon (`ti-plane-departure`
  boarding / `ti-alert-circle` delayed / `ti-plane` in transit / `ti-clock` grounded).
- **[v2] Corner status dot:** in addition to the leading icon, put a small (8px)
  solid dot in the card's top-right corner in the same ramp color as the status.
  This is the one piece of the original wireframe worth keeping verbatim — HR
  dashboards converge on a corner indicator because it's readable at a glance
  across a full grid of cards, before you've read a single label. It's redundant
  with the icon and footer badge on purpose (glanceable → confirm → detail), not
  a fourth new signal.
- A **dashed divider** (perforation effect) separating the top from a footer strip.
- Footer strip: Login ID in monospace + the status word as a badge (see §2 table).
- Clicking the card → view-only Employee Info page (per `PS.md §5`).
- Card background tint = the ramp for that status (teal/amber/gray at the 50-stop),
  never a filled solid color — keep cards light, badges carry the saturation.
- **[v2] Hover state:** slight shadow lift + border in the status ramp's 200-stop.
  Cheap, makes the grid feel responsive without adding new colors or motion work.

### 5.2 Control-tower summary strip (Admin/HR dashboard only)
Three metric cards at the top of the Employees page, before the card grid:
**In flight** (present count) / **In transit** (on leave count) / **Grounded**
(absent/not checked in count). Plain metric-card pattern — muted label, large number
below, no icon needed here (icons live on the passenger cards themselves).
- **[v2] Optional trend delta:** small muted text under the number, e.g. "+2 vs
  yesterday" / "same as yesterday". This is the one enhancement worth the time if
  P1 has spare hours — it's just yesterday's stored counts, no chart or sparkline
  needed (skip sparklines entirely, they're not worth the build time for an
  8-hour scope). Treat as stretch, not P0 — the three plain numbers are
  demo-sufficient on their own.

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

### 5.6 Leave balance usage bar **[v2]**
For the Employee Time Off view's balance cards (Paid Time Off, Sick Leave):
- Keep the plain metric-card shell (label + "X of Y days available"), but add a
  thin horizontal usage bar underneath — days used filled in the neutral gray
  ramp, remaining shown as the track. This is literally the manifest bar (§5.4)
  at 1/6th the height with one segment instead of six, so it costs almost
  nothing extra to build and it quietly reinforces that "a wage is a bar of
  segments" and "a leave balance is a bar of used/remaining" are the same design
  idea — which is the kind of consistency judges are scoring on.
- Don't add color-coding beyond gray here — this bar is informational, not a
  status signal, so it shouldn't compete with the teal/amber ramp used for
  flight status.

---

## 6. Screen-by-screen notes

### Sign In / Sign Up
Plain, centered card, no flight-deck theming — this is the one screen where a generic,
trustworthy "business software" look is correct (it's the first impression, don't
gimmick it). Company logo, fields, single primary button.

### Employee dashboard (Admin/HR)
Control-tower summary strip (§5.2) → search bar → grid of boarding-pass cards (§5.1).
**[v2]** Go straight from the top nav into the summary strip — no welcome-message
banner above it; that band is the highest-attention real estate on the page.

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
**[v2]** Give each row a thin (3px) left-edge accent in the day's status color
(teal/amber/gray, same ramp as §2) so a month of rows is scannable at a glance
without adding a new icon or column — the table stays plain, this is just a border.

### Attendance — Admin/HR view
Search bar + date navigation, then a table with the extra summary columns (Count of
days present, Leaves count, Total working days) per `PS.md §7`. No runway here — the
runway is a personal, first-person widget; the admin view is a data table.

### Time Off — Employee view
Two balance cards at top (Paid Time Off, Sick Leave — days available), using the
**[v2]** usage-bar variant from §5.6, "NEW" button, then the departures-board list
(§5.5) scoped to their own requests.

### Time Off — Admin/HR view
Same departures-board list (§5.5), all employees, with Approve/Reject actions.

### Salary Info (Admin only)
Manifest bar (§5.4). This is the screen worth spending the most polish time on — it's
the most visually distinctive and most demo-worthy.

---

## 7. Loading & empty states **[v2]**

Worth 20 minutes since judges are explicitly scoring "clean and consistent" UI, and
an un-styled blank screen or spinner reads as unfinished:

- **Loading:** a plain skeleton (gray 100-stop blocks in the shape of the
  boarding-pass card / table row) rather than a spinner where a grid or table is
  about to render — cheap to fake with a CSS shimmer if there's no time for real
  skeleton components.
- **Empty:** plain, calm copy — "No employees yet" / "No leave requests yet" —
  with the primary action button (NEW) still visible. Keep this copy factual like
  the error-message rule in §8; a *little* metaphor warmth is fine here (unlike
  errors) since nothing has gone wrong, but don't force a pun if one doesn't fit.

---

## 8. Ownership (maps to `TASKS.md` split — build these alongside your module, don't wait for a separate "UI person")

| Component | Owner | Notes |
|---|---|---|
| Boarding-pass card (§5.1) + control-tower strip (§5.2) | **P1** | Needed early since P1 owns the employee list/dashboard |
| Check-in/out runway (§5.3) | **P2** | Attach to the attendance check-in flow |
| Departures-board list (§5.5) + leave usage bar (§5.6) | **P3** | Attach to the leave apply/approve flow |
| Salary manifest bar (§5.4) | **P4** | Attach to the salary calc engine once it's returning live numbers |

Build the boarding-pass card and status badges as a shared component/partial as early
as possible (ideally by hour 1:30) — P2, P3, and P4 all need to reference the same
status vocabulary (§2) on their own screens, so it shouldn't be forked four times.
**[v2]** Since §5.6 is a stripped-down §5.4, P3 can copy P4's manifest-bar component
once it exists instead of building its own — worth a 30-second sync between them
around hour 2 so P3 isn't reinventing it.

---

## 9. What NOT to theme

To keep this from becoming a costume instead of a design system:
- Sign In / Sign Up
- Private Info tab (personal data — DOB, PAN, bank details) — keep neutral and plain
- Security tab (password change, login history) — this is a trust-sensitive screen,
  keep it calm and conventional, not playful
- Any error/validation messaging — errors should read as plain, direct text, not
  themed copy (no "this flight has been delayed" for a failed API call — say what
  happened, per standard UX copy conventions: state the problem, then the fix)
