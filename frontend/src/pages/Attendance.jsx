import { useState } from "react";
import CheckInRunway from "../components/CheckInRunway";

export default function Attendance({ role, isSuperAdmin = false, currentEmployee, employees, attendanceRecords, onCheckIn, onCheckOut }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState("October 2025");

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentUser = currentEmployee || employees[0];
  const userAttendanceRecords = attendanceRecords.filter((r) => r.employeeId === currentUser?.id);
  const isUserCheckedIn = Boolean(currentUser?.checkIn);
  const daysPresent = currentUser?.presentDays !== undefined
    ? currentUser.presentDays
    : userAttendanceRecords.length > 0
    ? userAttendanceRecords.length
    : isUserCheckedIn
    ? 1
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {role === "admin"
              ? isSuperAdmin
                ? "Workforce attendance log & real-time presence control tower."
                : "Workforce attendance log & personal HR check-in runway."
              : `Your daily check-in runway and monthly log (${currentUser?.name || "Employee"}).`}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs">
          <button
            onClick={() => setCurrentMonth("September 2025")}
            className="text-slate-500 hover:text-slate-900 p-0.5 cursor-pointer"
          >
            <i className="ti ti-chevron-left" aria-hidden="true"></i>
          </button>
          <span className="font-medium text-slate-800 font-mono px-1">{currentMonth}</span>
          <button
            onClick={() => setCurrentMonth("November 2025")}
            className="text-slate-500 hover:text-slate-900 p-0.5 cursor-pointer"
          >
            <i className="ti ti-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {role === "admin" ? (
        <div className="space-y-6">
          {/* HR / Company Admin Personal Attendance Check-In Runway (Hidden for Super Admin) */}
          {!isSuperAdmin && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                My HR Admin Attendance Runway ({currentUser?.name || "Company Admin"})
              </h2>
              <CheckInRunway
                checkIn={currentUser?.checkIn}
                checkOut={currentUser?.checkOut}
                onCheckIn={() => onCheckIn(currentUser?.id)}
                onCheckOut={() => onCheckOut(currentUser?.id)}
              />
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="relative w-full sm:w-72">
              <i className="ti ti-search absolute left-3 top-2.5 text-slate-400 text-sm" aria-hidden="true"></i>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employee attendance..."
                className="w-full border border-slate-200 rounded-md pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-teal-200 bg-white"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-100">
                  <th className="px-4 py-3 font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Check in</th>
                  <th className="px-4 py-3 font-semibold">Check out</th>
                  <th className="px-4 py-3 font-semibold">Work hours</th>
                  <th className="px-4 py-3 font-semibold">Extra hours</th>
                  <th className="px-4 py-3 font-semibold">Present</th>
                  <th className="px-4 py-3 font-semibold">Leaves</th>
                  <th className="px-4 py-3 font-semibold">Total Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((e) => {
                  const empRecord = attendanceRecords.find((r) => r.employeeId === e.id) || null;
                  const isCheckedIn = Boolean(e.checkIn || empRecord?.checkIn);

                  const checkInTime = e.checkIn || empRecord?.checkIn || "—";
                  const checkOutTime = e.checkOut || empRecord?.checkOut || "—";
                  const workHours = empRecord?.workHours || (isCheckedIn ? "In Progress" : "00:00");
                  const extraHours = empRecord?.extraHours || "00:00";

                  const presentDays = e.presentDays !== undefined ? e.presentDays : isCheckedIn ? 1 : e.id.includes("OIMENA") ? 20 : 0;
                  const leavesCount = e.leavesCount !== undefined ? e.leavesCount : e.id.includes("OIMENA") ? 2 : 0;
                  const totalDays = 22;

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {e.name}
                        <span className="block font-mono text-[10px] text-slate-400 font-normal">{e.id}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{checkInTime}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{checkOutTime}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{workHours}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{extraHours}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono font-medium">{presentDays}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono">{leavesCount}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono font-medium">{totalDays}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          <CheckInRunway
            checkIn={currentUser?.checkIn}
            checkOut={currentUser?.checkOut}
            onCheckIn={() => onCheckIn(currentUser?.id)}
            onCheckOut={() => onCheckOut(currentUser?.id)}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">Working days</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">22</p>
            </div>
            <div className="rounded-lg bg-teal-50/60 border border-teal-100 px-4 py-3">
              <p className="text-xs text-teal-800 font-medium">Days Present</p>
              <p className="text-xl font-bold font-mono text-teal-900 mt-1">
                {daysPresent}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">Approved Leaves</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                {currentUser?.leavesCount || 0}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-left text-slate-600 border-b border-slate-100">
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Check in</th>
                  <th className="px-4 py-2.5 font-semibold">Check out</th>
                  <th className="px-4 py-2.5 font-semibold">Work hours</th>
                  <th className="px-4 py-2.5 font-semibold">Extra hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userAttendanceRecords.length > 0 ? (
                  userAttendanceRecords.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-mono text-slate-800">{r.date}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{r.checkIn || "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{r.checkOut || "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{r.workHours}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-600">{r.extraHours}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      No attendance check-ins recorded for this month yet. Click "Check In" above to start your flight!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
