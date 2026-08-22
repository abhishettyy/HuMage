import { useState, useRef, useEffect } from "react";

export default function CalendarPicker({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Month navigation state within the calendar
  const [currentMonth, setCurrentMonth] = useState(new Date(value.getFullYear(), value.getMonth(), 1));

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelectDate = (d) => {
    onChange(d);
    setIsOpen(false);
  };

  // Generate calendar grid
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay(); // 0 is Sunday
  
  const days = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null); // empty padding
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const dateString = value.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const monthString = currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
      >
        {dateString}
        <img src="/assets/chevron-right.svg" className="w-3 h-3 opacity-50 rotate-90" alt="dropdown" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
              <img src="/assets/chevron-left.svg" alt="prev" className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-200 text-sm">{monthString}</span>
            <button onClick={handleNextMonth} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
              <img src="/assets/chevron-right.svg" alt="next" className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            {weekDays.map(wd => (
              <div key={wd} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{wd}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              if (!d) return <div key={i} className="aspect-square"></div>;
              
              const isSelected = d.toDateString() === value.toDateString();
              const isToday = d.toDateString() === new Date().toDateString();

              let btnClass = "aspect-square flex items-center justify-center rounded-md text-xs font-medium transition-colors cursor-pointer ";
              
              if (isSelected) {
                btnClass += "bg-blue-600 text-white shadow-sm";
              } else if (isToday) {
                btnClass += "bg-slate-700 text-blue-400 border border-slate-600 hover:bg-slate-600";
              } else {
                btnClass += "text-slate-300 hover:bg-slate-700";
              }

              return (
                <button 
                  key={i} 
                  onClick={() => handleSelectDate(d)}
                  className={btnClass}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
