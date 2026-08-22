import { useState } from "react";
import CheckInRunway from "../components/CheckInRunway";

export default function Attendance({ role, employees, attendanceRecords, onCheckIn, onCheckOut }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState("October 2025");

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const meera = employees.find((e) => e.name === "Meera Nair") || employees[0];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {role === "admin"
              ? "All employees attendance log & working hours balance."
              : "Your daily check-in runway and monthly log."}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs">
          <button
            onClick={() => setCurrentMonth("September 2025")}
            className="text-slate-500 hover:text-slate-900 p-0.5"
          >
            <i className="ti ti-chevron-left" aria-hidden="true"></i>
          </button>
          <span className="font-medium text-slate-800 font-mono px-1">{currentMonth}</span>
          <button
            onClick={() => setCurrentMonth("November 2025")}
            className="text-slate-500 hover:text-slate-900 p-0.5"
          >
            <i className="ti ti-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {role === "admin" ? (
        <div className="space-y-4">
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
                {filteredEmployees.map((e, i) => {
                  const rec = attendanceRecords[i % attendanceRecords.length] || {};
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {e.name}
                        <span className="block font-mono text-[10px] text-slate-400 font-normal">{e.id}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{e.checkIn || rec.checkIn || "—"}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{e.checkOut || rec.checkOut || "—"}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{rec.workHours || "08:30"}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{rec.extraHours || "00:00"}</td>
                      <td className="px-4 py-3 text-slate-700 font-mono">20</td>
                      <td className="px-4 py-3 text-slate-700 font-mono">2</td>
                      <td className="px-4 py-3 text-slate-700 font-mono font-medium">22</td>
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
            checkIn={meera.checkIn}
            checkOut={meera.checkOut}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">Working days</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">22</p>
            </div>
            <div className="rounded-lg bg-teal-50/60 border border-teal-100 px-4 py-3">
              <p className="text-xs text-teal-800 font-medium">Days Present</p>
              <p className="text-xl font-bold font-mono text-teal-900 mt-1">20</p>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-xs text-slate-500">Approved Leaves</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">2</p>
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
                {attendanceRecords.map((r) => (
                  <tr key={r.date} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 font-mono text-slate-800">{r.date}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.checkIn || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.checkOut || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.workHours}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600">{r.extraHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
