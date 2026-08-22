// UI-DESIGN.md §5.5 — dense table, not cards; a leave list is scanned, not browsed.
// Rejected reads as plain/neutral, not red — it's a normal business outcome, not an error.
const STATUS_CLASSES = {
  Pending: "bg-amber-50 text-amber-800 border border-amber-200",
  Approved: "bg-teal-50 text-teal-800 border border-teal-200",
  Rejected: "bg-slate-100 text-slate-700 border border-slate-200",
};

export default function DeparturesBoard({ role, requests, showActions = false, onApprove, onReject }) {
  const canManage = role === "admin" || showActions;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-200">
            <th className="px-4 py-3 font-semibold">Employee</th>
            <th className="px-4 py-3 font-semibold">Start date</th>
            <th className="px-4 py-3 font-semibold">End date</th>
            <th className="px-4 py-3 font-semibold">Days</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            {canManage && <th className="px-4 py-3 font-semibold text-right">Admin Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((r) => {
            const isPending = (r.status || "").toLowerCase() === "pending";
            const startDate = r.startDate || r.start;
            const endDate = r.endDate || r.end;
            const leaveType = r.leaveType || r.type;

            return (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-slate-900">{r.name}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{startDate}</td>
                <td className="px-4 py-3 font-mono text-slate-600">{endDate}</td>
                <td className="px-4 py-3 font-mono font-semibold text-slate-800">{r.days || 1} d</td>
                <td className="px-4 py-3 text-slate-700">{leaveType}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${STATUS_CLASSES[r.status] || STATUS_CLASSES.Pending}`}>
                    {r.status}
                  </span>
                </td>
                {canManage && (
                  <td className="px-4 py-3 text-right space-x-2">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => onApprove?.(r.id)}
                          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onReject?.(r.id)}
                          className="text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 font-mono">—</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
