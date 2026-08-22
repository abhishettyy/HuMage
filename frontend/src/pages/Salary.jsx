import { useState } from "react";
import SalaryManifestBar from "../components/SalaryManifestBar";
import PayslipModal from "../components/PayslipModal";
import { computeSalary } from "../data/mockData";

export default function Salary({ role, employees, leaveRequests }) {
  const [selectedId, setSelectedId] = useState(employees[0]?.id || "OIMENA20240012");
  const [wage, setWage] = useState(employees[0]?.wage || 50000);
  const [showPayslipModal, setShowPayslipModal] = useState(false);

  const currentEmployee = employees.find((e) => e.id === selectedId) || employees[0];

  // Calculate approved leaves for selected employee
  const approvedLeaves = leaveRequests.filter(
    (r) => r.employeeId === selectedId && r.status === "Approved"
  );
  const unpaidLeaveDays = approvedLeaves
    .filter((r) => r.type === "Unpaid leave")
    .reduce((acc, r) => acc + (r.days || 1), 0);

  const totalWorkingDays = 22;
  const payableDays = Math.max(1, totalWorkingDays - unpaidLeaveDays);

  const salary = computeSalary(wage, payableDays, totalWorkingDays);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Salary Info & Payroll Engine</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Admin Salary Manifest — Live wage component simulator & attendance-adjusted payslip generator.
          </p>
        </div>

        <button
          onClick={() => setShowPayslipModal(true)}
          className="text-xs font-semibold px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-2 transition-colors"
        >
          <i className="ti ti-file-certificate text-base" aria-hidden="true"></i> Generate Payslip
        </button>
      </div>

      {/* Employee Selector & Wage Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Select Employee</label>
            <select
              value={selectedId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedId(id);
                const emp = employees.find((emp) => emp.id === id);
                if (emp) setWage(emp.wage);
              }}
              className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-teal-200"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.id}) — {e.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Base Wage (₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={wage}
                onChange={(e) => setWage(Number(e.target.value) || 0)}
                className="w-full border border-slate-200 rounded-md px-3 py-2 text-xs font-mono font-bold text-slate-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Live Wage Slider */}
        <div>
          <div className="flex justify-between text-[11px] text-slate-500 mb-1">
            <span>Live Wage Simulator Slider</span>
            <span className="font-mono">₹30,000 — ₹150,000</span>
          </div>
          <input
            type="range"
            min={30000}
            max={150000}
            step={2500}
            value={wage}
            onChange={(e) => setWage(Number(e.target.value))}
            className="w-full accent-teal-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Attendance & Leave Pipeline Banner */}
      <div className="rounded-lg bg-teal-50/70 border border-teal-200 p-4 mb-6 flex items-center justify-between text-xs text-teal-900">
        <div className="flex items-center gap-3">
          <i className="ti ti-link text-teal-600 text-xl" aria-hidden="true"></i>
          <div>
            <p className="font-semibold text-teal-950">Attendance & Leave Pipeline Connected</p>
            <p className="text-[11px] text-teal-800 mt-0.5">
              Approved unpaid leaves ({unpaidLeaveDays} days) auto-adjust payable days: <span className="font-mono font-bold text-teal-950">{payableDays}/{totalWorkingDays} days</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-teal-700 uppercase font-medium">Net Take-Home Pay</span>
          <p className="text-base font-bold font-mono text-teal-950">
            ₹{salary.adjustedNetPay.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Manifest Bar */}
      <SalaryManifestBar salary={salary} />

      {/* Constraint Note */}
      <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
        <strong>Hard constraint verified:</strong> Sum of Basic, HRA, Standard Allowance, Performance Bonus, LTA, and Fixed Allowance equals defined Wage. Fixed Allowance is computed as balancing figure.
      </p>

      {/* Payslip Modal */}
      {showPayslipModal && (
        <PayslipModal
          employee={currentEmployee}
          salary={salary}
          onClose={() => setShowPayslipModal(false)}
        />
      )}
    </div>
  );
}
