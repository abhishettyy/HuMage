import { useState } from "react";
import { generateLoginId, STATUS } from "../data/mockData";
import { createEmployeeApi } from "../services/api";

export default function NewEmployeeModal({ currentEmployeeCount, isSuperAdmin = false, onSubmit, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [jobPosition, setJobPosition] = useState("Software Engineer");
  const [manager, setManager] = useState("Arjun Verma");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("+91 ");
  const [location, setLocation] = useState("Bengaluru");
  const [wage, setWage] = useState(50000);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountRole, setAccountRole] = useState("EMPLOYEE");
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    setSubmitting(true);
    setErrorMsg(null);

    const targetRole = isSuperAdmin ? accountRole : "EMPLOYEE";
    const joinYear = new Date(joiningDate).getFullYear();
    const fallbackId = generateLoginId(firstName, lastName, joinYear, currentEmployeeCount + 1);
    const fallbackPassword = `Dayflow@${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Call backend API to create user & employee in Supabase PostgreSQL
      const apiData = await createEmployeeApi({
        firstName,
        lastName,
        email,
        department,
        jobPosition,
        role: targetRole,
        joiningYear: joinYear,
        joiningDate,
        phone: mobile,
        location,
        wage: Number(wage) || 50000,
      });

      const actualLoginId = apiData?.loginId || fallbackId;
      const actualPassword = apiData?.initialPassword || fallbackPassword;
      const assignedRole = apiData?.assignedRole || targetRole;

      const newEmp = {
        id: actualLoginId,
        name: `${firstName.trim()} ${lastName.trim()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        department,
        jobPosition,
        manager,
        email,
        mobile,
        location,
        joiningDate,
        role: assignedRole,
        status: STATUS.DELAYED, // Starts with Yellow Dot (Absent / Delayed)
        checkIn: null,
        checkOut: null,
        wage: Number(wage) || 50000,
        presentDays: 0,
        leavesCount: 0,
        skills: ["JavaScript", "HTML", "CSS"],
        certifications: [],
        about: "Newly onboarded team member.",
        interests: "",
        privateInfo: {
          dob: "1999-01-01",
          residingAddress: "Bengaluru, India",
          personalEmail: email,
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
        },
        security: {
          mustChangePassword: true,
          lastLogin: "Never",
          loginHistory: [],
        },
      };

      setCreatedCredentials({ id: actualLoginId, password: actualPassword, role: assignedRole });
      onSubmit(newEmp);
    } catch (err) {
      setErrorMsg(err.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {isSuperAdmin ? "Add New Account (Super Admin)" : "Add New Employee"}
            </h2>
            <p className="text-xs text-slate-500">
              Admin & HR Onboarding Flow. Login ID & Password will be auto-generated.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <i className="ti ti-x text-lg" aria-hidden="true"></i>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 mb-3">
            {errorMsg}
          </div>
        )}

        {createdCredentials ? (
          <div className="space-y-4 py-3">
            <div className="rounded-lg bg-teal-50 border border-teal-200 p-4 text-center">
              <i className="ti ti-circle-check text-teal-600 text-3xl mb-2" aria-hidden="true"></i>
              <h3 className="text-sm font-semibold text-teal-900">
                {createdCredentials.role === "ADMIN" ? "Company Admin Created!" : "Employee Created Successfully!"}
              </h3>
              <p className="text-xs text-teal-700 mt-1">
                Share these system-generated credentials with the new {createdCredentials.role === "ADMIN" ? "Admin" : "employee"}.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Auto-Generated Login ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                  {createdCredentials.id}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Initial Password:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                  {createdCredentials.password}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Assigned Privilege:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${createdCredentials.role === "ADMIN" ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-teal-100 text-teal-900 border-teal-300"}`}>
                  {createdCredentials.role}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 rounded-md transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Account Role Selector (Super Admin Only) */}
            {isSuperAdmin && (
              <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg">
                <label className="text-amber-950 font-semibold block mb-1">
                  <i className="ti ti-shield-lock text-amber-600 mr-1" aria-hidden="true"></i>
                  Account Role Privilege (Super Admin Only)
                </label>
                <select
                  value={accountRole}
                  onChange={(e) => setAccountRole(e.target.value)}
                  className="w-full border border-amber-300 rounded-md px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-amber-300 cursor-pointer"
                >
                  <option value="EMPLOYEE">Employee (Standard Access)</option>
                  <option value="ADMIN">Company Admin (Full Admin Control & HR Privileges)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">First Name *</label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Last Name *</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                >
                  <option>Engineering</option>
                  <option>Design</option>
                  <option>Human Resources</option>
                  <option>Product</option>
                </select>
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Job Position</label>
                <input
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john.doe@dayflow.io"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Mobile Phone</label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Location</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Base Wage (₹)</label>
                <input
                  type="number"
                  value={wage}
                  onChange={(e) => setWage(e.target.value)}
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 text-sm font-medium py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {submitting ? "Creating Account..." : `Create ${isSuperAdmin && accountRole === "ADMIN" ? "Admin" : "Employee"}`}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-sm font-medium py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
