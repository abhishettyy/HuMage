import { useState } from "react";
import DeparturesBoard from "../components/DeparturesBoard";
import { initialLeaveBalances } from "../data/mockData";

export default function TimeOff({ role, requests, onApproveLeave, onRejectLeave, onSubmitLeave }) {
  const [showNew, setShowNew] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState("Paid time off");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [hasAttachment, setHasAttachment] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const startFormatted = new Date(startDate).toLocaleDateString("en-GB");
    const endFormatted = new Date(endDate).toLocaleDateString("en-GB");

    const newReq = {
      id: Date.now(),
      employeeId: "OIMENA20240012",
      name: "Meera Nair",
      start: startFormatted,
      end: endFormatted,
      days: 2,
      type: leaveType,
      status: "Pending",
    };

    onSubmitLeave(newReq);
    setShowNew(false);
    setStartDate("");
    setEndDate("");
  };

  const balances = initialLeaveBalances["OIMENA20240012"] || { paid: 24, sick: 7 };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Time off</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {role === "admin"
              ? "Departures Board — Review & approve employee leave requests."
              : "Flight status — Track your balances and submit time off."}
          </p>
        </div>
        {role !== "admin" && (
          <button
            onClick={() => setShowNew(true)}
            className="text-xs font-medium px-3.5 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-1.5"
          >
            <i className="ti ti-plane-arrival text-sm" aria-hidden="true"></i>
            + New request
          </button>
        )}
      </div>

      {role !== "admin" && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg bg-teal-50/50 border border-teal-100 p-4">
            <p className="text-xs font-medium text-teal-800">Paid Time Off</p>
            <p className="text-2xl font-bold font-mono text-teal-900 mt-1">
              {balances.paid} <span className="text-xs font-normal text-teal-700 font-sans">days available</span>
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-600">Sick Leave</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
              {balances.sick} <span className="text-xs font-normal text-slate-500 font-sans">days available</span>
            </p>
          </div>
        </div>
      )}

      <DeparturesBoard
        requests={role === "admin" ? requests : requests.filter((r) => r.name === "Meera Nair")}
        showActions={role === "admin"}
        onApprove={onApproveLeave}
        onReject={onRejectLeave}
      />

      {showNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Request Time Off</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-600">
                <i className="ti ti-x text-lg" aria-hidden="true"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Time Off Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs"
                >
                  <option>Paid time off</option>
                  <option>Sick leave</option>
                  <option>Unpaid leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              {leaveType === "Sick leave" && (
                <div>
                  <label className="text-slate-700 font-medium block mb-1">
                    Medical Attachment <span className="text-amber-600 font-normal">(Required for Sick Leave)</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setHasAttachment(!!e.target.files.length)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-slate-100 file:text-slate-700"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 text-xs font-medium py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="flex-1 text-xs font-medium py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
