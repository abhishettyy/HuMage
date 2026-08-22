import { useState } from "react";
import CheckInRunway from "../components/CheckInRunway";
import {
  attendanceRecords,
  attendanceSummary,
  employees,
} from "../data/mockData";

export default function Attendance({ role }) {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);

  const now = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (role === "admin") {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-lg font-medium text-slate-900 mb-1">Attendance</h1>
        <p className="text-sm text-slate-600 mb-5">All employees, 22 October 2025.</p>

        <input
          placeholder="Search employees"
          className="w-full sm:w-72 border border-slate-200 rounded-md px-3 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />

        <div className="rounded-lg border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-600">
                <th className="px-4 py-2.5 font-medium">Employee</th>
                <th className="px-4 py-2.5 font-medium">Check in</th>
                <th className="px-4 py-2.5 font-medium">Check out</th>
                <th className="px-4 py-2.5 font-medium">Work hours</th>
                <th className="px-4 py-2.5 font-medium">Extra hours</th>
                <th className="px-4 py-2.5 font-medium">Days present</th>
                <th className="px-4 py-2.5 font-medium">Leaves</th>
                <th className="px-4 py-2.5 font-medium">Total working days</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 text-slate-900">{e.name}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    {attendanceRecords[i % attendanceRecords.length].checkIn}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    {attendanceRecords[i % attendanceRecords.length].checkOut}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    {attendanceRecords[i % attendanceRecords.length].workHours}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-600">
                    {attendanceRecords[i % attendanceRecords.length].extraHours}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{attendanceSummary.daysPresent}</td>
                  <td className="px-4 py-2.5 text-slate-700">{attendanceSummary.leavesCount}</td>
                  <td className="px-4 py-2.5 text-slate-700">{attendanceSummary.totalWorkingDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-lg font-medium text-slate-900 mb-1">Attendance</h1>
      <p className="text-sm text-slate-600 mb-5">October 2025.</p>

      <CheckInRunway
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckIn={() => setCheckIn(now())}
        onCheckOut={() => setCheckOut(now())}
      />

      <div className="grid grid-cols-3 gap-3 my-5">
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-600">Working days</p>
          <p className="text-xl font-medium text-slate-900 mt-1">
            {attendanceSummary.totalWorkingDays}
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-600">Present</p>
          <p className="text-xl font-medium text-slate-900 mt-1">{attendanceSummary.daysPresent}</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-600">Leaves</p>
          <p className="text-xl font-medium text-slate-900 mt-1">{attendanceSummary.leavesCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs text-slate-600">
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Check in</th>
              <th className="px-4 py-2.5 font-medium">Check out</th>
              <th className="px-4 py-2.5 font-medium">Work hours</th>
              <th className="px-4 py-2.5 font-medium">Extra hours</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((r) => (
              <tr key={r.date} className="border-t border-slate-100">
                <td className="px-4 py-2.5 font-mono text-slate-700">{r.date}</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">{r.checkIn}</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">{r.checkOut}</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">{r.workHours}</td>
                <td className="px-4 py-2.5 font-mono text-slate-600">{r.extraHours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
