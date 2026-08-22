import { useState } from "react";
import DeparturesBoard from "../components/DeparturesBoard";

export default function TimeOff({
  role,
  currentEmployee,
  employees,
  requests,
  onApproveLeave,
  onRejectLeave,
  onSubmitLeave,
}) {
  const [showNewModal, setShowNewModal] = useState(false);
  const [leaveType, setLeaveType] = useState("Paid time off");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");
  const [hasAttachment, setHasAttachment] = useState(false);

  const currentUser = currentEmployee || employees[0];

  const calcDays = (sDate, eDate) => {
    if (!sDate || !eDate) return 1;
    const start = new Date(sDate);
    const end = new Date(eDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const calculatedDays = calcDays(startDate, endDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const typeCode = leaveType.includes("Sick")
      ? "SICK"
      : leaveType.includes("Unpaid")
      ? "UNPAID"
      : "PAID";

    const newReq = {
      id: Date.now().toString(),
      employeeId: currentUser.id,
      name: currentUser.name,
      leaveType: typeCode,
      startDate,
      endDate,
      days: calculatedDays,
      reason: reason || "Time off request",
      status: "Pending",
      attachmentUrl: hasAttachment ? "https://example.com/cert.pdf" : null,
    };

    onSubmitLeave(newReq);
    setShowNewModal(false);
    setReason("");
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Time Off</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {role === "admin"
              ? "Leave approval pipeline & workforce scheduling."
              : `Submit time-off requests and track balance (${currentUser.name}).`}
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="text-xs font-medium px-3.5 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <i className="ti ti-plane-departure text-sm" aria-hidden="true"></i>
          + Request Time Off
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg bg-teal-50/70 border border-teal-200 px-4 py-3">
          <p className="text-xs font-semibold text-teal-900">Paid Leave Balance</p>
          <p className="text-xl font-bold font-mono text-teal-950 mt-1">24 Days</p>
        </div>
        <div className="rounded-lg bg-amber-50/70 border border-amber-200 px-4 py-3">
          <p className="text-xs font-semibold text-amber-900">Sick Leave Balance</p>
          <p className="text-xl font-bold font-mono text-amber-950 mt-1">07 Days</p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
          <p className="text-xs font-semibold text-slate-700">Unpaid Leave</p>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">00 Days</p>
        </div>
      </div>

      <DeparturesBoard
        role={role}
        showActions={role === "admin"}
        requests={requests}
        onApprove={onApproveLeave}
        onReject={onRejectLeave}
      />

      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-slate-200 animate-pop-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Request Time Off</h2>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <i className="ti ti-x text-lg" aria-hidden="true"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Time Off Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 cursor-pointer"
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
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>

              {/* Dynamic Allocation Counter */}
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-md flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Calculated Leave Duration:</span>
                <span className="font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {calculatedDays} {calculatedDays === 1 ? "Day" : "Days"}
                </span>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Family vacation"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
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
                  className="flex-1 text-xs font-medium py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 text-xs font-medium py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
