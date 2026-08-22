const money = (n) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const RAMP_BAR_CLASSES = {
  teal: "bg-teal-400",
  slate: "bg-slate-300",
};
const RAMP_TEXT_CLASSES = {
  teal: "text-teal-800",
  slate: "text-slate-800",
};

// UI-DESIGN.md §5.4 — one stacked bar = total wage. Segments resize live as wage
// changes (the "live salary simulator" from PS.md §9). Deductions are NOT part of the
// bar — they come out of it, shown as a separate list below.
export default function SalaryManifestBar({ salary }) {
  const { wage, components, deductions } = salary;

  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="flex h-5 w-full rounded-md overflow-hidden mb-4">
        {components.map((c) => (
          <div
            key={c.label}
            className={RAMP_BAR_CLASSES[c.ramp]}
            style={{ width: `${(c.value / wage) * 100}%` }}
            title={`${c.label}: ${money(c.value)}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
        {components.map((c) => (
          <div key={c.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-700">
              <span className={`w-2 h-2 rounded-full ${RAMP_BAR_CLASSES[c.ramp]}`} />
              {c.label}
            </span>
            <span className={`font-mono ${RAMP_TEXT_CLASSES[c.ramp]}`}>{money(c.value)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-3">
        <p className="text-xs text-slate-500 mb-2">Deductions</p>
        <div className="space-y-1.5">
          {deductions.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{d.label}</span>
              <span className="font-mono text-slate-800">− {money(d.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
