import { STATUS_META } from "../data/mockData";

const RAMP_BADGE_CLASSES = {
  teal: "bg-teal-50 text-teal-800",
  amber: "bg-amber-50 text-amber-800",
  slate: "bg-slate-50 text-slate-800",
};

// Renders one of the four canonical states (UI-DESIGN.md §2). Always pass a STATUS
// value, never a raw string, so the label/color stay consistent everywhere it's used.
export default function StatusBadge({ status, className = "" }) {
  const meta = STATUS_META[status];
  if (!meta) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${RAMP_BADGE_CLASSES[meta.ramp]} ${className}`}
    >
      {meta.label}
    </span>
  );
}
