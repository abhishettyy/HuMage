import { useState } from "react";
import DeparturesBoard from "../components/DeparturesBoard";
import { leaveBalances, leaveRequests as initialRequests } from "../data/mockData";

export default function TimeOff({ role }) {
  const [requests, setRequests] = useState(initialRequests);
  const [showNew, setShowNew] = useState(false);

  const setStatus = (id, status) =>
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-medium text-slate-900">Time off</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {role === "admin" ? "All employees' requests." : "Your balances and requests."}
          </p>
        </div>
        {role !== "admin" && (
          <button
            onClick={() => setShowNew(true)}
            className="text-sm font-medium px-3 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-800"
          >
            + New request
          </button>
        )}
      </div>

      {role !== "admin" && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {leaveBalances.map((b) => (
            <div key={b.type} className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-600">{b.type}</p>
              <p className="text-xl font-medium text-slate-900 mt-1">
                {b.available} <span className="text-sm font-normal text-slate-500">days available</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <DeparturesBoard
        requests={role === "admin" ? requests : requests.filter((r) => r.name === "Meera Nair")}
        showActions={role === "admin"}
        onApprove={(id) => setStatus(id, "Approved")}
        onReject={(id) => setStatus(id, "Rejected")}
      />

      {showNew && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center px-4 z-10">
          <div className="w-full max-w-sm bg-white rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium text-slate-900">Request time off</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600">
                <i className="ti ti-x text-lg" aria-hidden="true"></i>
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-700 block mb-1">Time off type</label>
                <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm">
                  <option>Paid time off</option>
                  <option>Sick leave</option>
                  <option>Unpaid leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-700 block mb-1">Start date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-sm text-slate-700 block mb-1">End date</label>
                  <input type="date" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-700 block mb-1">
                  Attachment <span className="text-slate-400">(sick leave certificate, if applicable)</span>
                </label>
                <input type="file" className="w-full text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 text-sm font-medium py-2 rounded-md bg-teal-600 text-white hover:bg-teal-800"
              >
                Submit
              </button>
              <button
                onClick={() => setShowNew(false)}
                className="flex-1 text-sm font-medium py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
