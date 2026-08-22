const TABS = [
  { key: "dashboard", label: "Employees", icon: "ti-users" },
  { key: "attendance", label: "Attendance", icon: "ti-clock" },
  { key: "timeoff", label: "Time off", icon: "ti-plane" },
  { key: "salary", label: "Salary", icon: "ti-report-money", adminOnly: true },
];

export default function NavBar({ active, onNavigate, role }) {
  return (
    <div className="border-b border-slate-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ti ti-plane-departure text-teal-600 text-xl" aria-hidden="true"></i>
          <span className="font-medium text-slate-900">Dayflow</span>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.filter((t) => !t.adminOnly || role === "admin").map((t) => (
            <button
              key={t.key}
              onClick={() => onNavigate(t.key)}
              className={`text-sm px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                active === t.key
                  ? "bg-teal-50 text-teal-800 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <i className={`ti ${t.icon} text-base`} aria-hidden="true"></i>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-700">
          {role === "admin" ? "AD" : "ME"}
        </div>
      </div>
    </div>
  );
}
