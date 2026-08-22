// UI-DESIGN.md §5.3 — the actual Check In / Check Out buttons still do the work;
// this is the progress display next to them, not a replacement for the controls.
export default function CheckInRunway({ checkIn, checkOut, onCheckIn, onCheckOut }) {
  const progress = !checkIn ? 0 : !checkOut ? 55 : 100;

  return (
    <div className="rounded-lg bg-slate-50 px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Today</p>
          <p className="text-xs text-slate-600 mt-0.5">
            {checkIn ? `Checked in ${checkIn}` : "Not checked in yet"}
            {checkOut ? ` · Checked out ${checkOut}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {!checkIn && (
            <button
              onClick={onCheckIn}
              className="text-sm font-medium px-3 py-1.5 rounded-md bg-teal-600 text-white hover:bg-teal-800 transition-colors"
            >
              Check in
            </button>
          )}
          {checkIn && !checkOut && (
            <button
              onClick={onCheckOut}
              className="text-sm font-medium px-3 py-1.5 rounded-md border border-slate-200 text-slate-800 hover:bg-white transition-colors"
            >
              Check out
            </button>
          )}
        </div>
      </div>

      <div className="relative h-1.5 bg-slate-200 rounded-full mt-6">
        <div
          className="absolute left-0 top-0 h-full bg-teal-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        <i
          className="ti ti-plane-departure absolute text-teal-800 text-lg transition-all duration-500"
          style={{ left: `calc(${progress}% - 9px)`, top: "-11px" }}
          aria-hidden="true"
        ></i>
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[11px] text-slate-500">Gate (check-in)</span>
        <span className="text-[11px] text-slate-500">Runway (check-out)</span>
      </div>
    </div>
  );
}
