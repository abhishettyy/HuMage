import { STATUS_META, STATUS } from "../data/mockData";
import StatusBadge from "./StatusBadge";

const RAMP_TINT_CLASSES = {
  teal: "bg-teal-50/50 hover:bg-teal-50/80 border-teal-100",
  amber: "bg-amber-50/50 hover:bg-amber-50/80 border-amber-100",
  slate: "bg-slate-50/50 hover:bg-slate-50/80 border-slate-200",
};

// UI-DESIGN.md §5.1 — Boarding-Pass Employee Card
export default function BoardingPassCard({ employee, onClick, onDelete, isAdmin }) {
  const meta = STATUS_META[employee.status] || STATUS_META[STATUS.ABSENT];
  const isAtRisk = employee.status === STATUS.DELAYED;

  return (
    <div className={`relative group w-full text-left rounded-xl border overflow-hidden transition-all duration-200 shadow-sm hover:shadow ${RAMP_TINT_CLASSES[meta.ramp]}`}>
      {/* Delete Icon Button (Admin Only) */}
      {isAdmin && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(employee);
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 p-1.5 rounded-md shadow-xs cursor-pointer z-10"
          title="Delete Employee Record"
        >
          <i className="ti ti-trash text-xs" aria-hidden="true"></i>
        </button>
      )}

      <button onClick={onClick} className="w-full text-left p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-semibold text-slate-800 border border-slate-200 shadow-2xs">
              {employee.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">{employee.name}</p>
              <p className="text-xs text-slate-600 mt-0.5">{employee.jobPosition}</p>
              <p className="text-[11px] text-slate-500">{employee.department}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {employee.status === STATUS.PRESENT && (
              <img src="/assets/status-dot-green.svg" alt="Present" className="w-5 h-5 drop-shadow-sm mt-1 mr-1" />
            )}
            {employee.status === STATUS.ABSENT && (
              <img src="/assets/status-dot-yellow.svg" alt="Absent" className="w-5 h-5 drop-shadow-sm mt-1 mr-1" />
            )}
            {employee.status === STATUS.ON_LEAVE && (
              <img src="/assets/plane.svg" alt="On Leave" className="w-5 h-5 drop-shadow-sm mt-1 mr-1" />
            )}
          </div>
        </div>
      </button>

      <div onClick={onClick} className="perforation flex items-center justify-between px-4 py-2.5 bg-white/80 cursor-pointer">
        <span className="font-mono text-[11px] text-slate-500 tracking-wide">{employee.id}</span>
        <StatusBadge status={employee.status} />
      </div>
    </div>
  );
}
