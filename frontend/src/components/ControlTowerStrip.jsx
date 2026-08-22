import { STATUS } from "../data/mockData";

// UI-DESIGN.md §5.2 — Admin/HR dashboard metric strip, above the card grid.
// Plain metric-card pattern: muted label, large number. No icons here — icons live on
// the boarding-pass cards, not the summary.
export default function ControlTowerStrip({ employees }) {
  const counts = {
    present: employees.filter((e) => e.status === STATUS.PRESENT).length,
    onLeave: employees.filter((e) => e.status === STATUS.ON_LEAVE).length,
    absent: employees.filter((e) => e.status === STATUS.ABSENT).length,
  };

  const metrics = [
    { label: "Present", value: counts.present },
    { label: "On leave", value: counts.onLeave },
    { label: "Absent", value: counts.absent },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-600">{m.label}</p>
          <p className="text-2xl font-medium text-slate-900 mt-1">{m.value}</p>
        </div>
      ))}
    </div>
  );
}
