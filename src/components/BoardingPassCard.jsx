import { STATUS_META } from "../data/mockData";
import StatusBadge from "./StatusBadge";

const RAMP_TINT_CLASSES = {
  teal: "bg-teal-50/60",
  amber: "bg-amber-50/60",
  slate: "bg-slate-50/60",
};

// UI-DESIGN.md §5.1 — replaces the plain wireframe employee card. Cards stay light
// (50-stop tint only); the status badge carries the saturation, not the card body.
export default function BoardingPassCard({ employee, onClick }) {
  const meta = STATUS_META[employee.status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-slate-100 overflow-hidden hover:border-slate-200 transition-colors ${RAMP_TINT_CLASSES[meta.ramp]}`}
    >
      <div className="flex items-center justify-between p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-medium text-slate-800 border border-slate-100">
            {employee.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">{employee.name}</p>
            <p className="text-xs text-slate-600 mt-0.5">{employee.department}</p>
          </div>
        </div>
        <i className={`ti ${meta.icon} text-lg text-slate-700`} aria-hidden="true"></i>
      </div>

      <div className="perforation flex items-center justify-between px-3.5 py-2.5 bg-white/70">
        <span className="font-mono text-[11px] text-slate-500">{employee.id}</span>
        <StatusBadge status={employee.status} />
      </div>
    </button>
  );
}
