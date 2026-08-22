import { useState } from "react";
import { initialLeaveBalances } from "../data/mockData";

export default function TimeOff({ role, employee, requests, onApproveLeave, onRejectLeave, onSubmitLeave }) {
  const [showNew, setShowNew] = useState(false);
  const [activeTab, setActiveTab] = useState("Time Off");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [leaveType, setLeaveType] = useState("Paid time Off");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allocation, setAllocation] = useState(1);
  const [hasAttachment, setHasAttachment] = useState(false);

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    const startObj = new Date(start);
    const endObj = new Date(end);
    if (endObj < startObj) return 1;
    const diffTime = Math.abs(endObj - startObj);
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    setAllocation(calculateDays(e.target.value, endDate));
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
    setAllocation(calculateDays(startDate, e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const diffTime = Math.abs(endObj - startObj);
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const startFormatted = startObj.toLocaleDateString("en-GB");
    const endFormatted = endObj.toLocaleDateString("en-GB");

    const newReq = {
      id: Date.now(),
      employeeId: employee?.id || "OIMENA20240012",
      name: employee?.name || "Meera Nair",
      start: startFormatted,
      end: endFormatted,
      days: allocation,
      type: leaveType,
      status: "Pending",
    };

    onSubmitLeave(newReq);
    setShowNew(false);
    setStartDate("");
    setEndDate("");
    setAllocation(1);
  };

  const balances = initialLeaveBalances["OIMENA20240012"] || { paid: 24, sick: 7 };
  const displayedRequests = role === "admin" ? requests : requests.filter((r) => r.name === "Meera Nair");

  const renderCalendarMock = () => {
    const months = [
      "January 2025", "February 2025", "March 2025", "April 2025", 
      "May 2025", "June 2025", "July 2025", "August 2025", 
      "September 2025", "October 2025", "November 2025", "December 2025"
    ];
    
    // Helper to see if a date has a leave request
    const getLeaveStatusForDate = (day, monthStr) => {
      const dateObj = new Date(`${day} ${monthStr}`);
      for (const r of displayedRequests) {
        const [sD, sM, sY] = r.start.split('/');
        const [eD, eM, eY] = r.end.split('/');
        // Use local time parsing to avoid timezone shifts
        const reqStart = new Date(parseInt(sY), parseInt(sM) - 1, parseInt(sD));
        const reqEnd = new Date(parseInt(eY), parseInt(eM) - 1, parseInt(eD), 23, 59, 59);
        
        if (dateObj >= reqStart && dateObj <= reqEnd) {
          return r.status;
        }
      }
      return null;
    };
    
    return (
      <div className="bg-white border border-slate-700 rounded-b-lg p-6 flex flex-col md:flex-row gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 flex-grow">
          {months.map((month, mIdx) => (
            <div key={month} className="w-full">
              <div className="text-[11px] font-bold text-slate-800 mb-2">{month}</div>
              <div className="grid grid-cols-7 gap-1 text-[9px] text-center text-slate-400 mb-1 font-medium">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-700">
                {Array.from({ length: 31 }).map((_, i) => {
                  let bgClass = "hover:bg-slate-100 rounded-md cursor-pointer p-0.5";
                  let textClass = "";
                  
                  const status = getLeaveStatusForDate(i + 1, month);
                  if (status === "Approved") {
                    bgClass = "bg-purple-600 text-white rounded-md font-bold shadow-sm";
                  } else if (status === "Pending") {
                    bgClass = "bg-slate-200 text-slate-800 rounded-md font-bold shadow-sm border border-slate-300";
                    // Repeating background pattern
                    textClass = "relative overflow-hidden z-10";
                  } else if (status === "Rejected") {
                    bgClass = "bg-rose-500 text-white rounded-md font-bold shadow-sm";
                  }
                  
                  return (
                    <div key={i} className={`${bgClass} ${textClass} aspect-square flex items-center justify-center`}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend Panel */}
        <div className="w-full md:w-48 shrink-0 pl-6 border-l border-slate-100">
          <h4 className="text-xs font-bold text-slate-800 mb-3">Legend</h4>
          <div className="space-y-2 text-[10px] text-slate-600 mb-6">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-600 rounded-sm shadow-sm"></div> Validated (Approved)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-200 border border-slate-300 rounded-sm"></div> To Approve (Pending)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-500 rounded-sm shadow-sm"></div> Refused (Rejected)</div>
          </div>
          
          <h4 className="text-xs font-bold text-slate-800 mb-3">Public Holidays</h4>
          <div className="space-y-2 text-[10px] text-slate-600 font-medium">
            <p>Jan 14, 2025 : Kite Festival</p>
            <p>Jan 26, 2025 : Republic Day</p>
            <p>Mar 4, 2025 : Dhuleti</p>
            <p>Aug 15, 2025 : Independence Day</p>
            <p>Aug 28, 2025 : Rakhi</p>
            <p>Oct 2, 2025 : Gandhi Jayanti</p>
            <p>Nov 8, 2025 : Diwali</p>
            <p>Nov 10, 2025 : New Year</p>
            <p>Nov 11, 2025 : Bhai Duj</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Top Header matching Attendance */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-t-xl border border-slate-800 border-b-0">
        <h1 className="text-xl font-bold text-slate-100">Time off</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-grow sm:flex-grow-0 sm:w-80">
            <img src="/assets/search.svg" alt="Search" className="absolute left-3 top-2.5 w-4 h-4 opacity-50 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Searchbar"
              className="w-full border border-slate-700 bg-slate-800 rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-slate-500"
            />
          </div>
          {role === "employee" && (
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs rounded shadow-sm flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              <img src="/assets/plus.svg" alt="New" className="w-4 h-4" /> NEW
            </button>
          )}
        </div>
      </div>

      {/* Balances Strip */}
      {role === "employee" && (
        <div className="bg-slate-900 border border-t-0 border-slate-700 px-4 py-6 flex justify-around items-center">
          <div className="text-center">
            <p className="text-blue-400 font-medium mb-1">Paid time Off</p>
            <p className="text-slate-300 text-sm">{balances.paid} Days Available</p>
          </div>
          <div className="text-center">
            <p className="text-blue-400 font-medium mb-1">Sick time off</p>
            <p className="text-slate-300 text-sm">{balances.sick} Days Available</p>
          </div>
        </div>
      )}

      {/* Role specific content below balances */}
      {role === "admin" ? (
        <div className="bg-slate-900 border border-t-0 border-slate-700 rounded-b-lg overflow-hidden relative min-h-[300px]">
          <div className="absolute right-6 -top-24 flex items-center gap-2">
             <span className="text-slate-300 text-xs italic opacity-80">&lt;- Reject & Approve buttons</span>
          </div>
          {activeTab === "Time Off" ? (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-t border-b border-slate-700 text-slate-200 bg-slate-900/50">
                  <th className="px-4 py-3 font-medium border-r border-slate-700 w-48">Name</th>
                  <th className="px-4 py-3 font-medium border-r border-slate-700">Start Date</th>
                  <th className="px-4 py-3 font-medium border-r border-slate-700">End Date</th>
                  <th className="px-4 py-3 font-medium border-r border-slate-700">Time off Type</th>
                  <th className="px-4 py-3 font-medium border-r border-slate-700">Status</th>
                  <th className="px-4 py-3 font-medium w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {displayedRequests.map((r) => (
                  <tr key={r.id} className="text-slate-300 hover:bg-slate-800/50">
                    <td className="px-4 py-4 font-mono border-r border-slate-700">{r.name}</td>
                    <td className="px-4 py-4 font-mono border-r border-slate-700">{r.start}</td>
                    <td className="px-4 py-4 font-mono border-r border-slate-700">{r.end}</td>
                    <td className="px-4 py-4 text-blue-400 border-r border-slate-700">{r.type}</td>
                    <td className="px-4 py-4 border-r border-slate-700">
                      {r.status === "Pending" ? (
                        <div className="flex gap-2">
                          <button onClick={() => onRejectLeave?.(r.id)} className="w-8 h-6 rounded-sm bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-white cursor-pointer transition-colors shadow-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                          <button onClick={() => onApproveLeave?.(r.id)} className="w-8 h-6 rounded-sm bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white cursor-pointer transition-colors shadow-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg></button>
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-slate-800 rounded">{r.status}</span>
                      )}
                    </td>
                    <td className="px-4 py-4"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500">
              Allocation dashboard is under construction.
            </div>
          )}
        </div>
      ) : (
        renderCalendarMock()
      )}

      {/* New Time Off Request Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-[460px] bg-[#1c1e21] rounded-2xl shadow-2xl border border-slate-700 overflow-hidden animate-pop-in">
            <div className="flex items-center justify-between px-8 py-5 border-b border-slate-700">
              <h2 className="text-base font-semibold text-slate-200">Time off Type Request</h2>
              <button onClick={() => setShowNew(false)} className="text-slate-400 hover:text-slate-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6 text-sm">
              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-300 font-medium">Employee</label>
                <div className="col-span-2 text-blue-400 font-mono">{employee?.name || "Employee"}</div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-300 font-medium">Time off Type</label>
                <div className="col-span-2">
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-transparent text-blue-400 font-mono border-none focus:ring-0 p-0 cursor-pointer"
                  >
                    <option className="bg-slate-800">[Paid time Off]</option>
                    <option className="bg-slate-800">[Sick Leave]</option>
                    <option className="bg-slate-800">[Unpaid Leaves]</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-300 font-medium">Validity Period</label>
                <div className="col-span-2 flex items-center gap-3">
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={handleStartDateChange}
                    className="bg-transparent text-blue-400 font-mono border-none focus:ring-0 p-0 w-[110px]"
                  />
                  <span className="text-slate-400">To</span>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={handleEndDateChange}
                    className="bg-transparent text-blue-400 font-mono border-none focus:ring-0 p-0 w-[110px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 items-center">
                <label className="text-slate-300 font-medium">Allocation</label>
                <div className="col-span-2 flex items-center gap-2 text-blue-400 font-mono">
                  {allocation.toFixed(2).padStart(5, '0')} <span className="text-slate-300 font-sans">Days</span>
                </div>
              </div>

              <div className="grid grid-cols-3 items-start pt-2">
                <label className="text-slate-300 font-medium">Attachment:</label>
                <div className="col-span-2 flex flex-col items-start gap-1">
                  <label className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    <input type="file" className="hidden" onChange={(e) => setHasAttachment(!!e.target.files.length)} />
                  </label>
                  <span className="text-slate-400 text-[10px] italic">(For sick leave certificate)</span>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors text-sm"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="px-5 py-2 rounded-md bg-slate-700 text-slate-300 font-medium hover:bg-slate-600 transition-colors text-sm"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
