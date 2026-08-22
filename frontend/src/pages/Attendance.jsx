import { useState } from "react";
import CheckInRunway from "../components/CheckInRunway";
import CalendarPicker from "../components/CalendarPicker";

export default function Attendance({ role, employees, attendanceRecords, onCheckIn, onCheckOut }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateOffset, setDateOffset] = useState(0);
  
  const displayDate = new Date(2025, 9, 22 + dateOffset); // 9 is October
  
  const handleDateChange = (newDate) => {
    // Calculate the day difference from the base date (22 Oct 2025)
    const baseDate = new Date(2025, 9, 22);
    // Use Math.round to avoid daylight savings issues
    const diffTime = newDate.getTime() - baseDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    setDateOffset(diffDays);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const meera = employees.find((e) => e.name === "Meera Nair") || employees[0];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Role-Specific Views */}
      {role === "admin" ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-t-xl border border-slate-800">
            <h1 className="text-xl font-bold text-slate-100">Attendance</h1>
            <div className="relative w-full sm:w-80">
              <img src="/assets/search.svg" alt="Search" className="absolute left-3 top-2.5 w-4 h-4 opacity-50" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Searchbar"
                className="w-full border border-slate-700 bg-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between px-4 bg-slate-900 p-3 border-x border-b border-slate-800 -mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setDateOffset(prev => prev - 1)} className="bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600 px-3 py-1 rounded transition-colors cursor-pointer flex items-center justify-center">
                  <img src="/assets/chevron-left.svg" alt="Previous" className="w-4 h-4" />
                </button>
                <button onClick={() => setDateOffset(prev => prev + 1)} className="bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600 px-3 py-1 rounded transition-colors cursor-pointer flex items-center justify-center">
                  <img src="/assets/chevron-right.svg" alt="Next" className="w-4 h-4" />
                </button>
              </div>
              <CalendarPicker value={displayDate} onChange={handleDateChange} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden mt-0 rounded-t-none">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="px-4 py-3 font-semibold border-r border-slate-700 w-64">Emp</th>
                  <th className="px-4 py-3 font-semibold border-r border-slate-700">Check In</th>
                  <th className="px-4 py-3 font-semibold border-r border-slate-700">Check Out</th>
                  <th className="px-4 py-3 font-semibold border-r border-slate-700">Work Hours</th>
                  <th className="px-4 py-3 font-semibold">Extra hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredEmployees.map((e, i) => {
                  const rec = attendanceRecords[i % attendanceRecords.length] || {};
                  return (
                    <tr key={e.id} className="hover:bg-slate-800/50 text-slate-300">
                      <td className="px-4 py-3 font-medium border-r border-slate-800">{e.name}</td>
                      <td className="px-4 py-3 font-mono border-r border-slate-800">{e.checkIn || rec.checkIn || "10:00"}</td>
                      <td className="px-4 py-3 font-mono border-r border-slate-800">{e.checkOut || rec.checkOut || "19:00"}</td>
                      <td className="px-4 py-3 font-mono border-r border-slate-800">{rec.workHours || "09:00"}</td>
                      <td className="px-4 py-3 font-mono">{rec.extraHours || "01:00"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-t-xl border border-slate-800">
            <h1 className="text-xl font-bold text-slate-100">Attendance</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 px-4 bg-slate-900 p-3 border-x border-b border-slate-800 -mt-4">
            <div className="flex items-center gap-2">
              <button className="bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600 px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button className="bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600 px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>
            <button className="bg-slate-800 text-slate-300 border border-slate-600 px-6 py-1.5 rounded text-sm font-medium flex items-center gap-2">
              Oct <i className="ti ti-chevron-down text-xs"></i>
            </button>
            <div className="bg-slate-800 text-slate-300 border border-slate-600 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2">
              <span className="text-slate-400">Count of days present</span>
              <span className="text-white font-mono">20</span>
            </div>
            <div className="bg-slate-800 text-slate-300 border border-slate-600 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2">
              <span className="text-slate-400">Leaves count</span>
              <span className="text-white font-mono">2</span>
            </div>
            <div className="bg-slate-800 text-slate-300 border border-slate-600 px-4 py-1.5 rounded text-sm font-medium flex items-center gap-2">
              <span className="text-slate-400">Total working days</span>
              <span className="text-white font-mono">22</span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden mt-0 rounded-t-none">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 font-semibold text-slate-300 border-r border-slate-700 w-48"></th>
                  <th className="px-4 py-3 font-semibold text-slate-300" colSpan="4">October 2025</th>
                </tr>
                <tr className="border-b border-slate-700 text-slate-400">
                  <th className="px-4 py-3 font-semibold border-r border-slate-700">Date</th>
                  <th className="px-4 py-3 font-semibold border-r border-slate-700">Check In</th>
                  <th className="px-4 py-3 font-semibold border-r border-slate-700">Check Out</th>
                  <th className="px-4 py-3 font-semibold border-r border-slate-700">Work Hours</th>
                  <th className="px-4 py-3 font-semibold">Extra hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {attendanceRecords.map((r, i) => {
                  // Generate some consecutive dates for the mock data based on the index
                  const day = 28 + i;
                  const dateStr = `${day}/10/2025`;
                  return (
                    <tr key={i} className="hover:bg-slate-800/50 text-slate-300">
                      <td className="px-4 py-3 font-mono border-r border-slate-800">{r.date || dateStr}</td>
                      <td className="px-4 py-3 font-mono border-r border-slate-800">{r.checkIn || "10:00"}</td>
                      <td className="px-4 py-3 font-mono border-r border-slate-800">{r.checkOut || "19:00"}</td>
                      <td className="px-4 py-3 font-mono border-r border-slate-800">{r.workHours || "09:00"}</td>
                      <td className="px-4 py-3 font-mono">{r.extraHours || "01:00"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
