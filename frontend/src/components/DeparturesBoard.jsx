// UI-DESIGN.md §5.5 — dense table, not cards; a leave list is scanned, not browsed.
// Rejected reads as plain/neutral, not red — it's a normal business outcome, not an error.
const STATUS_CLASSES = {
  Pending: "bg-amber-50 text-amber-800",
  Approved: "bg-teal-50 text-teal-800",
  Rejected: "bg-slate-100 text-slate-700",
};

export default function DeparturesBoard({ requests, showActions = false, onApprove, onReject }) {
  return (
    <div className="rounded-lg border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-xs text-slate-600">
            <th className="px-4 py-2.5 font-medium">Name</th>
            <th className="px-4 py-2.5 font-medium">Start date</th>
            <th className="px-4 py-2.5 font-medium">End date</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            {showActions && <th className="px-4 py-2.5 font-medium text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="px-4 py-2.5 text-slate-900">{r.name}</td>
              <td className="px-4 py-2.5 font-mono text-slate-600">{r.start}</td>
              <td className="px-4 py-2.5 font-mono text-slate-600">{r.end}</td>
              <td className="px-4 py-2.5 text-slate-700">{r.type}</td>
              <td className="px-4 py-2.5">
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[r.status]}`}>
                  {r.status}
                </span>
              </td>
              {showActions && (
                <td className="px-4 py-2.5 text-right space-x-2">
                  {r.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => onApprove?.(r.id)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md bg-teal-600 text-white hover:bg-teal-800"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onReject?.(r.id)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
