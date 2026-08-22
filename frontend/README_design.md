# Dayflow HRMS — UI scaffold ("flight deck")

Implements the visual spec in `UI-DESIGN.md` on top of the requirements in `PS.md`.
Everything runs on mock data in `src/data/mockData.js` — swap that for real API calls
as each module's backend comes online; the components don't need to change shape.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. Sign in with any login ID containing "admin" to see
the Admin view (Salary tab, control-tower strip, approve/reject actions); anything
else signs in as an Employee.

> Tailwind is loaded via CDN (`index.html`) for hackathon speed — no build step to
> fight with. If this ships past the demo, swap it for a proper `tailwind.config.js` +
> PostCSS setup.

## File map → TASKS.md ownership

| File | Owns | Person |
|---|---|---|
| `src/components/BoardingPassCard.jsx`, `ControlTowerStrip.jsx`, `StatusBadge.jsx` | Employee cards + dashboard | **P1** |
| `src/pages/EmployeeInfo.jsx`, `SignIn.jsx` | Auth + view-only profile | **P1** |
| `src/components/CheckInRunway.jsx`, `src/pages/Attendance.jsx` | Attendance | **P2** |
| `src/components/DeparturesBoard.jsx`, `src/pages/TimeOff.jsx` | Leave / time-off | **P3** |
| `src/components/SalaryManifestBar.jsx`, `src/pages/Salary.jsx`, `computeSalary()` in `mockData.js` | Salary engine | **P4** |
| `src/data/mockData.js` | Shared status vocabulary + mock data — **don't fork this per module**, everyone reads from here | All |
| `src/layout/NavBar.jsx`, `src/App.jsx` | Shell / routing | Whoever finishes first, or split at hour 0 |

## Wiring in real data

Each page currently imports static arrays from `mockData.js`. To connect a real
backend:

1. Replace the imported constant with a `useEffect` + `fetch`/API-client call that
   returns the same shape (e.g. `employees` array with the same fields).
2. Keep `STATUS` values (`boarding` / `delayed` / `in_transit` / `grounded`) as the
   contract between backend and `StatusBadge`/`BoardingPassCard` — don't invent new
   status strings, map your backend's real states onto these four.
3. `computeSalary(wage)` in `mockData.js` is pure and stateless — it's fine to keep
   using it client-side for the "live simulator" recompute-on-type behavior, but the
   saved/committed value should come from (and be persisted by) the backend.

## What's stubbed / not wired yet

- "New employee" and "New request" buttons don't submit anywhere yet — hook up to
  your create-employee / create-leave-request endpoints.
- Check-in/out is local state only (resets on refresh) — wire to the attendance API.
- No auth/session persistence — `SignIn` just sets a role in memory.
- Payslip PDF export, Security tab content, and the "at-risk" attendance badge are
  P1 stretch goals per `PS.md §9` / `TASKS.md` — not built here yet.
