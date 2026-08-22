import { useState } from "react";

const TABS = [
  { key: "dashboard", label: "Employees", icon: "ti-users" },
  { key: "attendance", label: "Attendance", icon: "ti-clock" },
  { key: "timeoff", label: "Time off", icon: "ti-plane" },
  { key: "salary", label: "Salary", icon: "ti-report-money", adminOnly: true },
];

export default function NavBar({ active, onNavigate, role, currentEmployee, onOpenSelfProfile, onLogOut }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userName = currentEmployee?.name || (role === "admin" ? "Root Super Admin" : "Employee");
  const userId = currentEmployee?.id || (role === "admin" ? "ADMIN_ROOT" : "USER");
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "US";

  return (
    <div className="border-b border-slate-100 bg-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("dashboard")}>
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <i className="ti ti-plane-departure text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <span className="font-semibold text-slate-900 tracking-tight text-base">Dayflow</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono ml-2 px-1.5 py-0.5 rounded uppercase">
              {role}
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.filter((t) => !t.adminOnly || role === "admin").map((t) => (
            <button
              key={t.key}
              onClick={() => onNavigate(t.key)}
              className={`text-sm px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                active === t.key
                  ? "bg-teal-50 text-teal-800 font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <i className={`ti ${t.icon} text-base`} aria-hidden="true"></i>
              {t.key === "dashboard" && role === "employee" ? "Dashboard" : t.label}
            </button>
          ))}
        </nav>

        {/* Right side items */}
        <div className="flex items-center gap-6">
          {/* Check In / Out Systray */}
          <div className="flex items-center gap-3 mr-2">
            {employee?.checkIn && !employee?.checkOut ? (
              <img src="/assets/status-dot-green.svg" alt="Present" className="w-5 h-5 drop-shadow-sm" />
            ) : (
              <img src="/assets/status-dot-red.svg" alt="Absent" className="w-5 h-5 drop-shadow-sm" />
            )}
            
            {!employee?.checkIn && (
              <button onClick={onCheckIn} className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                Check IN <img src="/assets/arrow-right.svg" alt="in" className="w-3 h-3 opacity-60" />
              </button>
            )}
            {employee?.checkIn && !employee?.checkOut && (
              <div className="flex flex-col items-end">
                <div className="text-[9px] text-slate-500 font-mono tracking-tight mb-0.5">Since {employee.checkIn}</div>
                <button onClick={onCheckOut} className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  Check Out <img src="/assets/arrow-right.svg" alt="out" className="w-3 h-3 opacity-60" />
                </button>
              </div>
            )}
            {employee?.checkOut && (
              <div className="text-[10px] text-slate-400 font-mono tracking-tight bg-slate-100 px-2 py-1 rounded border border-slate-200">Checked out: {employee.checkOut}</div>
            )}
          </div>

          {/* User Avatar with Dropdown Menu */}
          <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-200 cursor-pointer"
          >
            {userInitials}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-fade-in"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {userId}
                </p>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenSelfProfile();
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <i className="ti ti-user text-sm text-slate-500" aria-hidden="true"></i> My Profile
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogOut();
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer"
              >
                <i className="ti ti-logout text-sm text-rose-500" aria-hidden="true"></i> Log Out
              </button>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
