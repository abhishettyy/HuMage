import { useState } from "react";
import { generateLoginId, STATUS } from "../data/mockData";

export default function NewEmployeeModal({ currentEmployeeCount, onSubmit, onClose }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [jobPosition, setJobPosition] = useState("Software Engineer");
  const [manager, setManager] = useState("Arjun Verma");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("+91 ");
  const [location, setLocation] = useState("Bengaluru");
  const [wage, setWage] = useState(60000);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split("T")[0]);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) return;

    const joinYear = new Date(joiningDate).getFullYear();
    const generatedId = generateLoginId(firstName, lastName, joinYear, currentEmployeeCount + 1);
    const initialPassword = `Dayflow@${Math.floor(1000 + Math.random() * 9000)}`;

    const newEmp = {
      id: generatedId,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      department,
      jobPosition,
      manager,
      email,
      mobile,
      location,
      joiningDate,
      status: STATUS.ABSENT,
      checkIn: null,
      checkOut: null,
      wage: Number(wage) || 50000,
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

    setCreatedCredentials({ id: generatedId, password: initialPassword });
    onSubmit(newEmp);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add New Employee</h2>
            <p className="text-xs text-slate-500">
              Admin & HR onboarding flow. Login ID & Password will be auto-generated.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="ti ti-x text-lg" aria-hidden="true"></i>
          </button>
        </div>

        {createdCredentials ? (
          <div className="space-y-4 py-3">
            <div className="rounded-lg bg-teal-50 border border-teal-200 p-4 text-center">
              <i className="ti ti-circle-check text-teal-600 text-3xl mb-2" aria-hidden="true"></i>
              <h3 className="text-sm font-semibold text-teal-900">Employee Created Successfully!</h3>
              <p className="text-xs text-teal-700 mt-1">
                Share these system-generated credentials with the new employee.
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
            </div>

            <button
              onClick={onClose}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2 rounded-md transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-medium block mb-1">First Name *</label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Meera"
                  className="w-full border border-slate-200 rounded-md px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Last Name *</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Nair"
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
                  placeholder="e.g. Frontend Engineer"
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
                  placeholder="e.g. meera@dayflow.io"
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
                className="flex-1 text-sm font-medium py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                Create Employee
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-sm font-medium py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
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
