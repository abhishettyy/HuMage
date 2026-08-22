const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function PayslipModal({ employee, salary, onClose }) {
  if (!employee || !salary) return null;

  const handlePrint = () => {
    window.print();
  };

  // Defensive array conversion for components
  let componentsList = [];
  if (Array.isArray(salary.components)) {
    componentsList = salary.components;
  } else if (salary.components && typeof salary.components === "object") {
    componentsList = [
      { label: "Basic Salary (50%)", value: salary.components.basic || 0 },
      { label: "House Rent Allowance (HRA 20%)", value: salary.components.hra || 0 },
      { label: "Standard Allowance (10%)", value: salary.components.stdAllowance || 0 },
      { label: "Performance Bonus (5%)", value: salary.components.perfBonus || 0 },
      { label: "Leave Travel Allowance (LTA 5%)", value: salary.components.lta || 0 },
      { label: "Fixed Allowance (Balancing)", value: salary.components.fixedAllowance || 0 },
    ];
  }

  // Defensive array conversion for deductions
  let deductionsList = [];
  if (Array.isArray(salary.deductions)) {
    deductionsList = salary.deductions;
  } else if (salary.deductions && typeof salary.deductions === "object") {
    deductionsList = [
      { label: "Provident Fund (PF - 12%)", value: salary.deductions.pf || 0 },
      { label: "Professional Tax (PT)", value: salary.deductions.pt || 0 },
    ];
  }

  const grossSalary = salary.grossEarnings || salary.grossSalary || salary.fullNetPay || salary.definedWage || 50000;
  const adjustedGross = salary.adjustedNetPay || salary.adjustedGross || grossSalary;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-payslip, #printable-payslip * {
            visibility: visible;
          }
          #printable-payslip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div id="printable-payslip" className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-pop-in">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="ti ti-plane-departure text-teal-400 text-xl" aria-hidden="true"></i>
            <div>
              <h2 className="font-semibold text-base tracking-wide">DAYFLOW HRMS</h2>
              <p className="text-[11px] text-slate-400 font-mono">OFFICIAL PAYSLIP STATEMENT</p>
            </div>
          </div>
          <div className="flex items-center gap-3 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <i className="ti ti-printer text-sm" aria-hidden="true"></i> Print / Save PDF
            </button>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
              <i className="ti ti-x text-lg" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {/* Payslip Content */}
        <div className="p-6 space-y-6 text-slate-800">
          {/* Employee & Pay Period details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs">
            <div>
              <p className="text-slate-500 font-medium">EMPLOYEE DETAILS</p>
              <p className="font-semibold text-sm text-slate-900 mt-1">{employee.name}</p>
              <p className="font-mono text-slate-600">{employee.id}</p>
              <p className="text-slate-600 mt-1">{employee.jobPosition} · {employee.department}</p>
              <p className="text-slate-600">Location: {employee.location || "Bengaluru"}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium">PAYMENT PERIOD</p>
              <p className="font-semibold text-sm text-slate-900 mt-1">October 2025</p>
              <p className="text-slate-600 mt-1">Working Days: <span className="font-mono">{salary.totalWorkingDays || 22}</span></p>
              <p className="text-slate-600">Payable Days: <span className="font-mono text-teal-700 font-medium">{salary.payableDays || 22}</span></p>
              <p className="text-slate-600">Bank: {employee.privateInfo?.bankDetails?.bankName || "HDFC Bank"}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Earnings Component
              </h3>
              <div className="space-y-2 text-xs">
                {componentsList.map((c) => (
                  <div key={c.label} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">{c.label}</span>
                    <span className="font-mono font-medium text-slate-800">{formatINR(c.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-t border-slate-200 font-semibold text-slate-900">
                  <span>Gross Monthly Salary</span>
                  <span className="font-mono">{formatINR(grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
                Deductions Component
              </h3>
              <div className="space-y-2 text-xs">
                {deductionsList.map((d) => (
                  <div key={d.label} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600">{d.label}</span>
                    <span className="font-mono font-medium text-slate-800">− {formatINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Adjustment Banner */}
          {salary.payableDays < (salary.totalWorkingDays || 22) && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center justify-between">
              <span>
                <strong>Attendance Pipeline Adjustment:</strong> Paid for {salary.payableDays}/{salary.totalWorkingDays || 22} days based on approved leaves & attendance.
              </span>
              <span className="font-mono font-medium">{formatINR(adjustedGross)}</span>
            </div>
          )}

          {/* Net Take Home */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-800 font-medium">NET TAKE HOME PAY</p>
              <p className="text-xs text-teal-600 mt-0.5">Credited directly to Bank Account</p>
            </div>
            <p className="text-2xl font-bold font-mono text-teal-900">{formatINR(salary.adjustedNetPay || adjustedGross)}</p>
          </div>

          <p className="text-[10px] text-center text-slate-400 pt-2 border-t border-slate-100">
            This is a computer-generated document. Generated via Dayflow HRMS Attendance & Payroll Pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}
