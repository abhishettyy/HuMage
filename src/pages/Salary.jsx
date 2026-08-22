import { useState } from "react";
import SalaryManifestBar from "../components/SalaryManifestBar";
import { employees, computeSalary } from "../data/mockData";

// Admin-only per PS.md §6 — enforce this server-side too, not just by hiding the nav
// tab (see UI-DESIGN.md §5.4 note and NavBar.jsx adminOnly flag).
export default function Salary() {
  const [selectedId, setSelectedId] = useState(employees[0].id);
  const [wage, setWage] = useState(employees[0].wage);

  const employee = employees.find((e) => e.id === selectedId);
  const salary = computeSalary(wage);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-lg font-medium text-slate-900 mb-1">Salary info</h1>
      <p className="text-sm text-slate-600 mb-5">
        Visible to admin only. Components recalculate live as wage changes.
      </p>

      <div className="flex items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm text-slate-700 block mb-1">Employee</label>
          <select
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setWage(employees.find((emp) => emp.id === e.target.value).wage);
            }}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-40">
          <label className="text-sm text-slate-700 block mb-1">Monthly wage</label>
          <input
            type="number"
            value={wage}
            onChange={(e) => setWage(Number(e.target.value) || 0)}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <SalaryManifestBar salary={salary} />

      <p className="text-xs text-slate-400 mt-4">
        Fixed allowance is always the balancing figure — components never exceed the
        defined wage, per PS.md §6.
      </p>
    </div>
  );
}
