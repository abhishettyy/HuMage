import { useState } from "react";
import StatusBadge from "../components/StatusBadge";

const TABS = ["Resume", "Private info", "Security"];

export default function EmployeeInfo({ employee, isSelfView = false, onBack, onUpdateEmployee }) {
  const [activeTab, setActiveTab] = useState("Resume");

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
      <div className="flex items-start gap-4 mb-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-lg font-bold text-slate-800">
          {employee.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">{employee.name}</h1>
            <StatusBadge status={employee.status} />
            {isSelfView && (
              <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded">
                MY PROFILE
              </span>
            )}
          </div>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            {employee.jobPosition} · {employee.department}
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 font-mono">
            <span>ID: {employee.id}</span>
            <span>·</span>
            <span>Joined: {employee.joiningDate}</span>
            <span>·</span>
            <span>Location: {employee.location}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {TABS.map((t) => (
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
      {activeTab === "Private info" && (
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
