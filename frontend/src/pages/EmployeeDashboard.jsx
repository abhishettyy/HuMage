export default function EmployeeDashboard({ employee, onNavigate, onOpenProfile, onLogOut }) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {employee?.name || "Employee"}</h1>
        <p className="text-slate-600 mt-1">Here is what is happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 rounded-full flex items-center justify-center mb-4 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <span className="font-semibold text-slate-900">My Profile</span>
        </button>

        <button
          onClick={() => onNavigate("attendance")}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 rounded-full flex items-center justify-center mb-4 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <span className="font-semibold text-slate-900">Attendance</span>
        </button>

        <button
          onClick={() => onNavigate("timeoff")}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 rounded-full flex items-center justify-center mb-4 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-4 4-2.8-.9c-.4-.1-.8.2-1 .6L1 16l4.6 1.4L7 22l.2-1.2c.4-.2.7-.6.6-1l-.9-2.8 4-4 4 6l1.2-.7c.4-.2.7-.6.6-1.1z"/></svg>
          </div>
          <span className="font-semibold text-slate-900">Time Off</span>
        </button>

        <button
          onClick={onLogOut}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 group-hover:bg-rose-50 group-hover:text-rose-600 rounded-full flex items-center justify-center mb-4 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          </div>
          <span className="font-semibold text-slate-900">Log Out</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity & Alerts</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ti ti-check text-teal-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Leave Request Approved</p>
              <p className="text-xs text-slate-500 mt-0.5">Your Sick Leave for Oct 28 has been approved by HR.</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ti ti-file-text text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Payslip Generated</p>
              <p className="text-xs text-slate-500 mt-0.5">Your October 2025 payslip is now available for viewing.</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
