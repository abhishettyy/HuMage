const money = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const RAMP_BAR_CLASSES = {
  teal: "bg-teal-400",
  slate: "bg-slate-300",
};
const RAMP_TEXT_CLASSES = {
  teal: "text-teal-800",
  slate: "text-slate-800",
};

// UI-DESIGN.md §5.4 — one stacked bar = total wage. Segments resize live as wage changes.
export default function SalaryManifestBar({ salary }) {
  if (!salary) return null;

  const wage = salary.definedWage || salary.wage || 50000;

  // Defensive array conversion for components
  let componentsList = [];
  if (Array.isArray(salary.components)) {
    componentsList = salary.components;
  } else if (salary.components && typeof salary.components === "object") {
    componentsList = [
      { label: "Basic (50%)", value: salary.components.basic || 0, ramp: "teal" },
      { label: "HRA (20%)", value: salary.components.hra || 0, ramp: "teal" },
      { label: "Standard Allowance (10%)", value: salary.components.stdAllowance || 0, ramp: "teal" },
      { label: "Performance Bonus (5%)", value: salary.components.perfBonus || 0, ramp: "teal" },
      { label: "LTA (5%)", value: salary.components.lta || 0, ramp: "teal" },
      { label: "Fixed Allowance (Balancing)", value: salary.components.fixedAllowance || 0, ramp: "slate" },
    ];
  }

  // Defensive array conversion for deductions
  let deductionsList = [];
  if (Array.isArray(salary.deductions)) {
    deductionsList = salary.deductions;
  } else if (salary.deductions && typeof salary.deductions === "object") {
    deductionsList = [
      { label: "Provident Fund (PF - 12%)", value: salary.deductions.pf || 0 },
      { label: "Professional Tax (PT)", value: salary.deductions.pt || 0 },
    ];
  }

  return (
    <div className="rounded-lg bg-slate-50 p-4">
      {/* Live Stacked Bar */}
      <div className="flex h-5 w-full rounded-md overflow-hidden mb-4 bg-slate-200">
        {componentsList.map((c) => (
          <div
            key={c.label}
            className={RAMP_BAR_CLASSES[c.ramp] || "bg-teal-400"}
            style={{ width: `${(c.value / wage) * 100}%` }}
            title={`${c.label}: ${money(c.value)}`}
          />
        ))}
      </div>

      {/* Salary Components Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
        {componentsList.map((c) => (
          <div key={c.label} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-700">
              <span className={`w-2 h-2 rounded-full ${RAMP_BAR_CLASSES[c.ramp] || "bg-teal-400"}`} />
              {c.label}
            </span>
            <span className={`font-mono font-medium ${RAMP_TEXT_CLASSES[c.ramp] || "text-teal-800"}`}>{money(c.value)}</span>
          </div>
        ))}
      </div>

      {/* Deductions Breakdown */}
      <div className="border-t border-slate-200 pt-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Deductions</p>
        <div className="space-y-1.5">
          {deductionsList.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-700">{d.label}</span>
              <span className="font-mono text-slate-800 font-medium">− {money(d.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
