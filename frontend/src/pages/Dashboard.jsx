import { useState } from "react";
import ControlTowerStrip from "../components/ControlTowerStrip";
import BoardingPassCard from "../components/BoardingPassCard";
import NewEmployeeModal from "../components/NewEmployeeModal";

export default function Dashboard({ role, employees, onSelectEmployee, onAddEmployee }) {
  const [query, setQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase()) ||
      e.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Employees</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {role === "admin"
              ? "Control Tower — Real-time workforce status and onboarding."
              : "Passenger Board — Team alignment overview."}
          </p>
        </div>
        {role === "admin" && (
          <button
            onClick={() => setShowNewModal(true)}
            className="text-xs font-medium px-3.5 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="ti ti-user-plus text-sm" aria-hidden="true"></i>
            + New employee
          </button>
        )}
      </div>

      {role === "admin" && <ControlTowerStrip employees={employees} />}

      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="relative w-full sm:w-80">
          <i className="ti ti-search absolute left-3 top-2.5 text-slate-400 text-sm" aria-hidden="true"></i>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, department, or Login ID..."
            className="w-full border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-200 bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          Showing {filtered.length} of {employees.length} employees
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e) => (
          <BoardingPassCard key={e.id} employee={e} onClick={() => onSelectEmployee(e)} />
        ))}
      </div>

      {showNewModal && (
        <NewEmployeeModal
          currentEmployeeCount={employees.length}
          onSubmit={(newEmp) => {
            onAddEmployee(newEmp);
          }}
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
}
