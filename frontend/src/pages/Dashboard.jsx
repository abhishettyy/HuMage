import { useState } from "react";
import ControlTowerStrip from "../components/ControlTowerStrip";
import BoardingPassCard from "../components/BoardingPassCard";
import NewEmployeeModal from "../components/NewEmployeeModal";

export default function Dashboard({ role, isSuperAdmin, employees, onSelectEmployee, onAddEmployee, onDeleteEmployee }) {
  const [query, setQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase()) ||
      e.id.toLowerCase().includes(query.toLowerCase())
  );

  const confirmDelete = () => {
    if (deletingEmployee && onDeleteEmployee) {
      onDeleteEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
    }
  };

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
            className="text-xs font-medium px-3.5 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <BoardingPassCard
            key={e.id}
            employee={e}
            isAdmin={role === "admin"}
            onClick={() => onSelectEmployee(e)}
            onDelete={(emp) => setDeletingEmployee(emp)}
          />
        ))}
      </div>

      {/* Flight Status Definitions & Legend Box */}
      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
        <h3 className="font-semibold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-[11px]">
          <i className="ti ti-info-circle text-teal-600 text-sm" aria-hidden="true"></i>
          Flight Status Guide & Meanings:
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-slate-600">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shrink-0 mt-1"></span>
            <div>
              <strong className="text-slate-900 block">Boarding (Present)</strong>
              <span className="text-[11px]">Checked in & working on site/remote today.</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0 mt-1"></span>
            <div>
              <strong className="text-slate-900 block">In Transit (On Leave)</strong>
              <span className="text-[11px]">On approved paid, sick, or unpaid leave.</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 mt-1"></span>
            <div>
              <strong className="text-slate-900 block">Delayed (At Risk)</strong>
              <span className="text-[11px]">Not checked in yet today by shift time.</span>
            </div>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1"></span>
            <div>
              <strong className="text-slate-900 block">Grounded (Off-Duty)</strong>
              <span className="text-[11px]">Off shift, weekend rest, or inactive.</span>
            </div>
          </div>
        </div>
      </div>

      {showNewModal && (
        <NewEmployeeModal
          currentEmployeeCount={employees.length}
          isSuperAdmin={isSuperAdmin}
          onSubmit={(newEmp) => {
            onAddEmployee(newEmp);
          }}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingEmployee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 border border-slate-200 text-slate-900 animate-pop-in">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <i className="ti ti-alert-triangle text-2xl" aria-hidden="true"></i>
              <h2 className="text-base font-semibold text-slate-900">Delete Employee Record?</h2>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{deletingEmployee.name}</strong> ({deletingEmployee.id})? This will permanently remove their profile, attendance history, leave balances, and salary record from Supabase PostgreSQL.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 text-xs font-semibold py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
              >
                Delete Record
              </button>
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="flex-1 text-xs font-medium py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
