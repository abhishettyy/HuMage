import { useState } from "react";
import StatusBadge from "../components/StatusBadge";

const TABS = ["Resume", "Private info", "Security"];

// View-only per PS.md §5 — clicking a card never opens an editable form, unlike
// "My Profile" (self-view, editable — build as a fork of this with inputs if needed).
export default function EmployeeInfo({ employee, onBack }) {
  const [tab, setTab] = useState("Resume");

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 mb-5 flex items-center gap-1">
        <i className="ti ti-arrow-left" aria-hidden="true"></i> Back to employees
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-base font-medium text-slate-800">
          {employee.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-slate-900">{employee.name}</h1>
            <StatusBadge status={employee.status} />
          </div>
          <p className="text-sm text-slate-600 mt-0.5">
            {employee.jobPosition} · {employee.department}
          </p>
          <p className="font-mono text-xs text-slate-400 mt-1">{employee.id}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-100 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-sm px-3 py-2 border-b-2 -mb-px ${
              tab === t ? "border-teal-600 text-teal-800 font-medium" : "border-transparent text-slate-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Resume" && (
        <div className="space-y-4 text-sm">
          <Field label="Email" value={employee.email} />
          <Field label="Mobile" value={employee.mobile} />
          <Field label="Manager" value={employee.manager} />
          <Field label="Location" value={employee.location} />
          <Field label="Date of joining" value={employee.joiningDate} />
        </div>
      )}

      {tab === "Private info" && (
        <div className="space-y-4 text-sm text-slate-500 italic">
          Personal fields (DOB, address, PAN, UAN, bank details) — keep this tab plain
          and neutral, not flight-deck themed, per UI-DESIGN.md §8.
        </div>
      )}

      {tab === "Security" && (
        <div className="space-y-4 text-sm text-slate-500 italic">
          Password change + login history go here. Trust-sensitive screen — keep it
          calm and conventional, not playful, per UI-DESIGN.md §8.
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-50 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900">{value}</span>
    </div>
  );
}
