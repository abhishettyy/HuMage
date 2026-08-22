import { useState } from "react";

const TABS = [
  { key: "dashboard", label: "Employees", icon: "ti-users" },
  { key: "attendance", label: "Attendance", icon: "ti-clock" },
  { key: "timeoff", label: "Time off", icon: "ti-plane" },
  { key: "salary", label: "Salary", icon: "ti-report-money", adminOnly: true },
];

export default function NavBar({ active, onNavigate, role, onOpenSelfProfile, onLogOut, onCheckIn, onCheckOut, employee }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

        {/* User Avatar with Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 relative transition-colors focus:outline-none focus:ring-2 focus:ring-teal-200"
          >
            {role === "admin" ? "AD" : "MN"}
            <span className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${employee?.status === "boarding" ? "bg-teal-500" : (employee?.status === "in_transit" ? "bg-slate-400" : "bg-amber-500")}`}></span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-fade-in"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">
                  {role === "admin" ? "System Admin" : "Meera Nair"}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {role === "admin" ? "ADMIN_ROOT" : "OIMENA20240012"}
                </p>
              </div>

              {/* Check In / Check Out Floating Widget */}
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-xs font-semibold text-slate-700">Attendance</p>
                </div>
                {!employee?.checkIn && (
                  <button onClick={onCheckIn} className="w-full text-left px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded hover:bg-teal-700 mb-1 flex items-center justify-between">
                    Check In <i className="ti ti-arrow-right"></i>
                  </button>
                )}
                {employee?.checkIn && (
                  <p className="text-[10px] text-slate-500 mb-2 font-mono">Checked in: {employee.checkIn}</p>
                )}
                {employee?.checkIn && !employee?.checkOut && (
                  <button onClick={onCheckOut} className="w-full text-left px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-700 rounded hover:bg-white flex items-center justify-between shadow-sm">
                    Check Out <i className="ti ti-arrow-right"></i>
                  </button>
                )}
                {employee?.checkOut && (
                  <p className="text-[10px] text-slate-500 font-mono">Checked out: {employee.checkOut}</p>
                )}
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenSelfProfile();
                }}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <i className="ti ti-user text-sm text-slate-500" aria-hidden="true"></i> My Profile
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onLogOut();
                }}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
              >
                <i className="ti ti-logout text-sm text-rose-500" aria-hidden="true"></i> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
