import { STATUS_META, STATUS } from "../data/mockData";
import StatusBadge from "./StatusBadge";

const RAMP_TINT_CLASSES = {
  teal: "bg-teal-50/50 hover:bg-teal-50/80 border-teal-100",
  amber: "bg-amber-50/50 hover:bg-amber-50/80 border-amber-100",
  slate: "bg-slate-50/50 hover:bg-slate-50/80 border-slate-200",
};

// UI-DESIGN.md §5.1 — Boarding-Pass Employee Card
export default function BoardingPassCard({ employee, onClick }) {
  const meta = STATUS_META[employee.status] || STATUS_META[STATUS.GROUNDED];
  const isAtRisk = employee.status === STATUS.DELAYED;

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-xl border overflow-hidden transition-all duration-200 shadow-sm hover:shadow ${RAMP_TINT_CLASSES[meta.ramp]}`}
    >
      {/* Corner Status Dot */}
      <div className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ${meta.ramp === "teal" ? "bg-teal-500" : (meta.ramp === "amber" ? "bg-amber-500" : "bg-slate-400")}`}></div>

      <div className="flex items-start justify-between p-4">
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
          <i className={`ti ${meta.icon} text-lg text-slate-700`} aria-hidden="true"></i>
          {isAtRisk && (
            <span
              className="text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded flex items-center gap-1"
              title="At Risk: Absent without approved time-off"
            >
              <i className="ti ti-alert-triangle text-amber-700" aria-hidden="true"></i> At Risk
            </span>
          )}
        </div>
      </div>

      <div className="perforation flex items-center justify-between px-4 py-2.5 bg-white/80">
        <span className="font-mono text-[11px] text-slate-500 tracking-wide">{employee.id}</span>
        <StatusBadge status={employee.status} />
      </div>
    </button>
  );
}
