import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { computeSalary } from "../data/mockData";

export default function EmployeeInfo({ employee, isSelfView = false, role, onBack, onUpdateEmployee }) {
  if (!employee) return null;
  const tabs = ["Resume", "Private Info", "Salary Info"];
  if (role === "employee" || !isSelfView) {
    tabs.push("Security");
  }

  const [activeTab, setActiveTab] = useState("Resume");

  // State for editable Salary Info
  const [wage, setWage] = useState(employee?.wage || 50000);
  const [workingDays, setWorkingDays] = useState("5");
  const [breakTime, setBreakTime] = useState("1");
  const salaryData = computeSalary(Number(wage) || 0);

  // State for editable skills/about
  const [newSkill, setNewSkill] = useState("");
  const [skillsList, setSkillsList] = useState(employee.skills || []);

  // Security password change form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [securityNotice, setSecurityNotice] = useState(null);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skillsList.includes(newSkill.trim())) {
      const updated = [...skillsList, newSkill.trim()];
      setSkillsList(updated);
      setNewSkill("");
      if (onUpdateEmployee) {
        onUpdateEmployee({ ...employee, skills: updated });
      }
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setSecurityNotice({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (newPass.length < 6) {
      setSecurityNotice({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }
    setSecurityNotice({ type: "success", message: "Password successfully updated!" });
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  const pInfo = employee.privateInfo || {};
  const bank = pInfo.bankDetails || {};
  const security = employee.security || {};
  const history = security.loginHistory || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {onBack && (
        <button
          onClick={onBack}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 mb-5 flex items-center gap-1 transition-colors"
        >
          <i className="ti ti-arrow-left text-sm" aria-hidden="true"></i> Back to employees
        </button>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-8 mb-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-28 h-28 shrink-0 rounded-full bg-slate-50 border border-slate-200 shadow-sm flex items-center justify-center text-4xl font-bold text-slate-800">
          {employee.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
          {isSelfView && (
            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer">
              <img src="/assets/pencil.svg" alt="Edit" className="w-4 h-4 opacity-70" />
            </button>
          )}
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{employee.name}</h1>
            <StatusBadge status={employee.status} />
            {isSelfView && (
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-1 rounded-md border border-teal-100 uppercase tracking-wider">
                My Profile
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Login ID</span>
              <span className="font-mono text-slate-800 font-medium">{employee.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Company</span>
              <span className="text-slate-800 font-medium">Dayflow Inc.</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Email</span>
              <span className="text-slate-800">{employee.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Department</span>
              <span className="text-slate-800">{employee.department}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Mobile</span>
              <span className="text-slate-800">{employee.mobile}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Manager</span>
              <span className="text-slate-800">{employee.manager}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500 font-medium">Location</span>
              <span className="text-slate-800">{employee.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-xs font-semibold px-4 py-2.5 border-b-2 transition-colors -mb-px ${
              activeTab === t
                ? "border-teal-600 text-teal-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content: Resume */}
      {activeTab === "Resume" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {employee.about || "No profile bio written yet."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Work Contact</h3>
              <Field label="Work Email" value={employee.email} />
              <Field label="Mobile Phone" value={employee.mobile} />
              <Field label="Manager" value={employee.manager} />
              <Field label="Work Location" value={employee.location} />
            </div>

            <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              {isSelfView && (
                <form onSubmit={handleAddSkill} className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="+ Add skill"
                    className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded font-medium hover:bg-teal-700"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>
          </div>

          {employee.certifications && employee.certifications.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Certifications</h3>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {employee.certifications.map((cert) => (
                  <li key={cert}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Private Info */}
      {activeTab === "Private Info" && (
        <div className="space-y-6 text-xs">
          <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of Birth" value={pInfo.dob || "—"} />
              <Field label="Gender" value={pInfo.gender || "—"} />
              <Field label="Nationality" value={pInfo.nationality || "—"} />
              <Field label="Marital Status" value={pInfo.maritalStatus || "—"} />
              <Field label="Personal Email" value={pInfo.personalEmail || "—"} />
              <Field label="Residing Address" value={pInfo.residingAddress || "—"} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Tax & Statutory Identification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="PAN Card Number" value={pInfo.panNo || "—"} isMono />
              <Field label="UAN Number" value={pInfo.uanNo || "—"} isMono />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Bank Account Details
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Bank Name" value={bank.bankName || "—"} />
              <Field label="Account Number" value={bank.accountNumber || "—"} isMono />
              <Field label="IFSC Code" value={bank.ifscCode || "—"} isMono />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Salary Info (Admin Only) */}
      {activeTab === "Salary Info" && role === "admin" && (
        <div className="space-y-6">
          {/* Top Inputs */}
          <div className="grid grid-cols-2 gap-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-slate-700">Month Wage</span>
                <input
                  type="number"
                  value={wage}
                  onChange={(e) => setWage(e.target.value)}
                  className="flex-1 border-b border-slate-300 focus:border-teal-500 outline-none py-1 text-right font-medium text-slate-800"
                />
                <span className="text-sm text-slate-500">/ Month</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-slate-700">Yearly wage</span>
                <input
                  type="number"
                  value={Number(wage) * 12}
                  readOnly
                  className="flex-1 border-b border-slate-300 py-1 text-right font-medium text-slate-800 bg-transparent"
                />
                <span className="text-sm text-slate-500">/ Yearly</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-48 text-sm font-medium text-slate-700">No of working days in a week:</span>
                <input
                  type="number"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  className="w-16 border-b border-slate-300 focus:border-teal-500 outline-none py-1 text-center font-medium text-slate-800"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-48 text-sm font-medium text-slate-700">Break Time:</span>
                <input
                  type="number"
                  value={breakTime}
                  onChange={(e) => setBreakTime(e.target.value)}
                  className="w-16 border-b border-slate-300 focus:border-teal-500 outline-none py-1 text-center font-medium text-slate-800"
                />
                <span className="text-sm text-slate-500">/ hrs</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {/* Left Col: Salary Components */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Salary Components</h3>
              <div className="space-y-4">
                <SalaryComponentRow 
                  label="Basic Salary" 
                  description="Define Basic salary from company cost compute it based on monthly Wages"
                  value={salaryData.components[0].value}
                  percentage="50.00"
                />
                <SalaryComponentRow 
                  label="House Rent Allowance" 
                  description="HRA provided to employees 50% of the basic salary"
                  value={salaryData.components[1].value}
                  percentage="50.00"
                />
                <SalaryComponentRow 
                  label="Standard Allowance" 
                  description="A standard allowance is a predetermined, fixed amount provided to employee as part of their salary"
                  value={salaryData.components[2].value}
                  percentage="16.67"
                />
                <SalaryComponentRow 
                  label="Performance Bonus" 
                  description="Variable amount paid during payroll. The value defined by the company and calculated as a % of the basic salary"
                  value={salaryData.components[3].value}
                  percentage="8.33"
                />
                <SalaryComponentRow 
                  label="Leave Travel Allowance" 
                  description="LTA is paid by the company to employees to cover their travel expenses, and calculated as a % of the basic salary"
                  value={salaryData.components[4].value}
                  percentage="8.33"
                />
                <SalaryComponentRow 
                  label="Fixed Allowance" 
                  description="fixed allowance portion of wages is determined after calculating all salary components"
                  value={salaryData.components[5].value}
                  percentage="11.67"
                />
              </div>
            </div>

            {/* Right Col: Deductions */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Provident Fund (PF) Contribution</h3>
              <div className="space-y-4 mb-8">
                <SalaryComponentRow 
                  label="Employee" 
                  description="PF is calculated based on the basic salary"
                  value={salaryData.deductions[0].value}
                  percentage="12.00"
                />
                <SalaryComponentRow 
                  label="Employer" 
                  description="PF is calculated based on the basic salary"
                  value={salaryData.deductions[1].value}
                  percentage="12.00"
                />
              </div>

              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Tax Deductions</h3>
              <div className="space-y-4">
                <SalaryComponentRow 
                  label="Professional Tax" 
                  description="Professional Tax deducted from the Gross salary"
                  value={salaryData.deductions[2].value}
                  percentage={null}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Security */}
      {activeTab === "Security" && (
        <div className="space-y-6 text-xs">
          {/* Password Change Form */}
          <div className="bg-white rounded-lg border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-1">Password & Security</h3>
            <p className="text-xs text-slate-500 mb-4">
              Manage your account password. Must contain at least 6 characters.
            </p>

            {securityNotice && (
              <div
                className={`p-3 rounded-md mb-4 text-xs font-medium ${
                  securityNotice.type === "success"
                    ? "bg-teal-50 text-teal-800 border border-teal-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                }`}
              >
                {securityNotice.message}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="max-w-md space-y-3">
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Current Password</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-700 block mb-1 font-medium">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs"
                />
              </div>
              <button
                type="submit"
                className="bg-slate-900 text-white font-medium px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Audit Log / Login History */}
          <div className="bg-white rounded-lg border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-1">Login History & Audit Log</h3>
            <p className="text-xs text-slate-500 mb-3">
              Recent sign-in activity recorded for security auditing.
            </p>

            <div className="overflow-hidden border border-slate-100 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                  <tr>
                    <th className="px-3 py-2">Timestamp</th>
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">IP Address</th>
                    <th className="px-3 py-2">Client / Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((h, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 font-mono text-slate-600">{h.date}</td>
                      <td className="px-3 py-2 text-slate-800 font-medium">{h.action}</td>
                      <td className="px-3 py-2 font-mono text-slate-600">{h.ip}</td>
                      <td className="px-3 py-2 text-slate-500">{h.device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, isMono = false }) {
  return (
    <div className="flex flex-col border-b border-slate-50 pb-2">
      <span className="text-[11px] font-medium text-slate-400">{label}</span>
      <span className={`text-xs text-slate-900 mt-0.5 ${isMono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function SalaryComponentRow({ label, description, value, percentage }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">{Number(value).toFixed(2)}</span>
            <span className="text-xs text-slate-500">₹ / month</span>
          </div>
          {percentage && (
            <div className="flex items-center gap-1 w-16 justify-end">
              <span className="text-sm font-medium text-slate-800">{percentage}</span>
              <span className="text-xs text-slate-500">%</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-slate-500 max-w-[80%]">{description}</p>
      <div className="border-b border-slate-200 mt-2"></div>
    </div>
  );
}
