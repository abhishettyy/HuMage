import { STATUS } from "../data/mockData";

// UI-DESIGN.md §5.2 — Admin/HR dashboard metric strip, above the card grid.
// Plain metric-card pattern: muted label, large number. No icons here — icons live on
// the boarding-pass cards, not the summary.
export default function ControlTowerStrip({ employees }) {
  const counts = {
    inFlight: employees.filter((e) => e.status === STATUS.BOARDING).length,
    inTransit: employees.filter((e) => e.status === STATUS.IN_TRANSIT).length,
    grounded: employees.filter(
      (e) => e.status === STATUS.DELAYED || e.status === STATUS.GROUNDED
    ).length,
  };

  const metrics = [
    { label: "In flight", value: counts.inFlight },
    { label: "In transit (leave)", value: counts.inTransit },
    { label: "Grounded / delayed", value: counts.grounded },
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
