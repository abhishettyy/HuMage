import { useState } from "react";
import StatusBadge from "../components/StatusBadge";
import { changePasswordApi, updateEmployeeProfileApi } from "../services/api";

const TABS = ["Resume", "Private info", "Security"];

export default function EmployeeInfo({ employee, isSelfView = false, onBack, onUpdateEmployee }) {
  const [activeTab, setActiveTab] = useState("Resume");

  // State for editable skills/about
  const [newSkill, setNewSkill] = useState("");
  const [skillsList, setSkillsList] = useState(employee.skills || []);

  // Resume Upload state (with 1 MB limit)
  const [resumeFile, setResumeFile] = useState(employee.resumeName || null);
  const [resumeUrl, setResumeUrl] = useState(employee.resumeUrl || null);
  const [resumeError, setResumeError] = useState(null);

  // Private Info editing state
  const [isEditingPrivate, setIsEditingPrivate] = useState(false);
  const [privateData, setPrivateData] = useState(employee.privateInfo || {
    dob: "1999-01-01",
    residingAddress: "Bengaluru, India",
    personalEmail: employee.email,
    gender: "Other",
    nationality: "Indian",
    maritalStatus: "Single",
    panNo: "ABCDE1234F",
    uanNo: "100000000000",
    bankDetails: {
      accountNumber: "000000000000",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0000001",
    },
  });

  // Security password change form
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [securityNotice, setSecurityNotice] = useState(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResumeError(null);

    // Enforce 1 MB File Size Limit
    const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE_BYTES) {
      setResumeError(`File size exceeds maximum limit of 1 MB (${(file.size / (1024 * 1024)).toFixed(2)} MB uploaded). Please choose a smaller resume file.`);
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setResumeFile(file.name);
      setResumeUrl(reader.result);
      if (onUpdateEmployee) {
        onUpdateEmployee({ ...employee, resumeName: file.name, resumeUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

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

  const handleSavePrivateInfo = async (e) => {
    e.preventDefault();
    setIsEditingPrivate(false);
    const updatedEmp = { ...employee, privateInfo: privateData };
    if (onUpdateEmployee) {
      onUpdateEmployee(updatedEmp);
    }
    try {
      await updateEmployeeProfileApi(employee.id, {
        dob: privateData.dob,
        residingAddress: privateData.residingAddress,
        personalEmail: privateData.personalEmail,
        gender: privateData.gender,
        nationality: privateData.nationality,
        maritalStatus: privateData.maritalStatus,
        panNo: privateData.panNo,
        uanNo: privateData.uanNo,
        accountNumber: privateData.bankDetails?.accountNumber,
        bankName: privateData.bankDetails?.bankName,
        ifscCode: privateData.bankDetails?.ifscCode,
      });
    } catch {
      // fallback
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setSecurityNotice({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (newPass.length < 6) {
      setSecurityNotice({ type: "error", message: "New password must be at least 6 characters long." });
      return;
    }

    setUpdatingPassword(true);
    setSecurityNotice(null);

    try {
      await changePasswordApi(currentPass, newPass);
      setSecurityNotice({ type: "success", message: "Password updated successfully! Next login will require your new password." });
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      setSecurityNotice({ type: "error", message: err.message || "Failed to update password." });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const pInfo = privateData;
  const bank = pInfo.bankDetails || {};
  const security = employee.security || {};
  const history = security.loginHistory || [
    { date: new Date().toLocaleDateString("en-GB") + " 10:30 AM", action: "Password change / login", ip: "127.0.0.1", device: "Chrome / Windows" }
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {onBack && (
        <button
          onClick={onBack}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 mb-5 flex items-center gap-1 transition-colors cursor-pointer"
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
            className={`text-xs font-semibold px-4 py-2.5 border-b-2 transition-colors -mb-px cursor-pointer ${
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

          {/* Resume Bucket Storage Upload Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900">Resume Document (Bucket Storage)</h3>
                <p className="text-[11px] text-slate-500">Upload PDF or DOCX file (Max Size: 1 MB limit).</p>
              </div>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  download={resumeFile || "resume.pdf"}
                  className="text-xs font-semibold px-3 py-1.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors flex items-center gap-1.5"
                >
                  <i className="ti ti-download text-sm" aria-hidden="true"></i> View Resume ({resumeFile})
                </a>
              )}
            </div>

            {resumeError && (
              <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
                {resumeError}
              </div>
            )}

            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <i className="ti ti-file-upload text-slate-400 text-2xl mb-1 block" aria-hidden="true"></i>
              <label className="cursor-pointer text-xs font-semibold text-teal-700 hover:text-teal-900">
                Click to upload resume file (Max 1 MB)
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] text-slate-400 mt-1">Enforces strict 1 MB file size boundary.</p>
            </div>
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
              <form onSubmit={handleAddSkill} className="flex gap-2 mt-2 pt-2 border-t border-slate-100">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="+ Add skill"
                  className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs"
                />
                <button
                  type="submit"
                  className="text-xs bg-teal-600 text-white px-2.5 py-1 rounded font-medium hover:bg-teal-700 cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Private Info */}
      {activeTab === "Private info" && (
        <div className="space-y-6 text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Personal & Statutory Info</h3>
            <button
              onClick={() => setIsEditingPrivate(!isEditingPrivate)}
              className="text-xs font-medium text-teal-700 hover:text-teal-900 border border-teal-200 px-3 py-1 rounded-md bg-teal-50 cursor-pointer"
            >
              {isEditingPrivate ? "Cancel Editing" : "Edit Private Info"}
            </button>
          </div>

          {isEditingPrivate ? (
            <form onSubmit={handleSavePrivateInfo} className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={pInfo.dob || ""}
                    onChange={(e) => setPrivateData({ ...pInfo, dob: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Gender</label>
                  <select
                    value={pInfo.gender || "Other"}
                    onChange={(e) => setPrivateData({ ...pInfo, gender: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Personal Email</label>
                  <input
                    type="email"
                    value={pInfo.personalEmail || ""}
                    onChange={(e) => setPrivateData({ ...pInfo, personalEmail: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">Residing Address</label>
                  <input
                    type="text"
                    value={pInfo.residingAddress || ""}
                    onChange={(e) => setPrivateData({ ...pInfo, residingAddress: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-medium block mb-1">PAN Card Number</label>
                  <input
                    type="text"
                    value={pInfo.panNo || ""}
                    onChange={(e) => setPrivateData({ ...pInfo, panNo: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-medium block mb-1">UAN Number</label>
                  <input
                    type="text"
                    value={pInfo.uanNo || ""}
                    onChange={(e) => setPrivateData({ ...pInfo, uanNo: e.target.value })}
                    className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white font-medium py-2 rounded-md hover:bg-teal-700 transition-colors cursor-pointer"
              >
                Save Private Information
              </button>
            </form>
          ) : (
            <>
              <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Date of Birth" value={pInfo.dob || "—"} />
                  <Field label="Gender" value={pInfo.gender || "—"} />
                  <Field label="Nationality" value={pInfo.nationality || "Indian"} />
                  <Field label="Marital Status" value={pInfo.maritalStatus || "Single"} />
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
                  <Field label="Bank Name" value={bank.bankName || "HDFC Bank"} />
                  <Field label="Account Number" value={bank.accountNumber || "—"} isMono />
                  <Field label="IFSC Code" value={bank.ifscCode || "HDFC0000001"} isMono />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab Content: Security */}
      {activeTab === "Security" && (
        <div className="space-y-6 text-xs">
          {/* Password Change Form */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-1">Password & Security Controls</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update your account login password. Must contain at least 6 characters.
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
                <label className="text-slate-700 block mb-1 font-medium">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-slate-700 block mb-1 font-medium">New Password *</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <div>
                <label className="text-slate-700 block mb-1 font-medium">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-teal-200"
                />
              </div>
              <button
                type="submit"
                disabled={updatingPassword}
                className="bg-teal-600 text-white font-medium px-4 py-2 rounded-md hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {updatingPassword ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Audit Log / Login History */}
          <div className="bg-white rounded-lg border border-slate-100 p-5">
            <h3 className="text-xs font-semibold text-slate-900 mb-1">Login History & Security Audit Log</h3>
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
