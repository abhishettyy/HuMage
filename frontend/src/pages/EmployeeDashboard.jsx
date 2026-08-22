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
            <i className="ti ti-user text-xl"></i>
          </div>
          <span className="font-semibold text-slate-900">My Profile</span>
        </button>

        <button
          onClick={() => onNavigate("attendance")}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 rounded-full flex items-center justify-center mb-4 transition-colors">
            <i className="ti ti-clock text-xl"></i>
          </div>
          <span className="font-semibold text-slate-900">Attendance</span>
        </button>

        <button
          onClick={() => onNavigate("timeoff")}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-teal-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600 rounded-full flex items-center justify-center mb-4 transition-colors">
            <i className="ti ti-plane text-xl"></i>
          </div>
          <span className="font-semibold text-slate-900">Time Off</span>
        </button>

        <button
          onClick={onLogOut}
          className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-xl hover:border-rose-400 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-600 group-hover:bg-rose-50 group-hover:text-rose-600 rounded-full flex items-center justify-center mb-4 transition-colors">
            <i className="ti ti-logout text-xl"></i>
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
              <p className="text-xs text-slate-500 mt-0.5">Your Sick Leave request has been reviewed & approved by HR.</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <i className="ti ti-file-text text-blue-600"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Payslip Generated</p>
              <p className="text-xs text-slate-500 mt-0.5">Your monthly payslip is now available for viewing and PDF download.</p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
