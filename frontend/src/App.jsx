import { useState } from "react";
import NavBar from "./layout/NavBar";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import TimeOff from "./pages/TimeOff";
import Salary from "./pages/Salary";
import EmployeeInfo from "./pages/EmployeeInfo";
import ToastBanner from "./components/ToastBanner";
import {
  initialEmployees,
  initialLeaveRequests,
  initialAttendanceRecords,
  STATUS,
} from "./data/mockData";
import {
  checkInEmployee,
  checkOutEmployee,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "./services/api";

export default function App() {
  const [role, setRole] = useState(null); // null | "admin" | "employee"
  const [tab, setTab] = useState("dashboard");
  const [employees, setEmployees] = useState(initialEmployees);
  const [leaveRequests, setLeaveRequests] = useState(initialLeaveRequests);
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSelfProfile, setIsSelfProfile] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees((prev) => [newEmp, ...prev]);
    showToast("Employee Created", `Generated Login ID ${newEmp.id} for ${newEmp.name}`);
  };

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
    showToast("Profile Updated", `Saved profile changes for ${updatedEmp.name}`);
  };

  const handleCheckIn = async () => {
    const apiRes = await checkInEmployee("OIMENA20240012");
    const timeStr = apiRes?.checkIn || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    setEmployees((prev) =>
      prev.map((e) =>
        e.name === "Meera Nair"
          ? { ...e, status: STATUS.PRESENT, checkIn: timeStr }
          : e
      )
    );
    // Add to attendance log table
    setAttendanceRecords((prev) => [
      {
        employeeId: "OIMENA20240012",
        name: "Meera Nair",
        date: new Date().toLocaleDateString("en-GB"),
        checkIn: timeStr,
        checkOut: null,
        workHours: "In Progress",
        extraHours: "00:00",
      },
      ...prev,
    ]);

    showToast("Checked In", `Check-in recorded at ${timeStr}. Status set to Present.`);
  };

  const handleCheckOut = async () => {
    const apiRes = await checkOutEmployee("OIMENA20240012");
    const timeStr = apiRes?.checkOut || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    setEmployees((prev) =>
      prev.map((e) => (e.name === "Meera Nair" ? { ...e, checkOut: timeStr } : e))
    );

    setAttendanceRecords((prev) =>
      prev.map((r, i) =>
        i === 0 && r.employeeId === "OIMENA20240012"
          ? { ...r, checkOut: timeStr, workHours: `${apiRes?.workHours || 8.85} hrs`, extraHours: `${apiRes?.extraHours || 0.85} hrs` }
          : r
      )
    );

    showToast("Checked Out", `Check-out recorded at ${timeStr}. Day landing completed.`);
  };

  const handleApproveLeave = async (id) => {
    await approveLeaveRequest(id);
    const req = leaveRequests.find((r) => r.id === id);
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );

    // Update employee status to In Transit
    if (req) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === req.employeeId ? { ...e, status: STATUS.ON_LEAVE } : e))
      );
      showToast(
        "Leave Approved & Pipeline Updated",
        `Approved leave for ${req.name}. Payable days for payroll updated!`
      );
    }
  };

  const handleRejectLeave = async (id) => {
    await rejectLeaveRequest(id);
    const req = leaveRequests.find((r) => r.id === id);
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
    if (req) {
      showToast("Leave Rejected", `Leave request for ${req.name} set to Rejected.`);
    }
  };

  const handleSubmitLeave = async (newReq) => {
    await submitLeaveRequest(newReq);
    setLeaveRequests((prev) => [newReq, ...prev]);
    showToast("Leave Request Submitted", "Your request is pending Admin/HR review.");
  };

  if (!role) {
    return <SignIn onSignIn={setRole} />;
  }

  // Viewing a specific employee or self profile
  if (selectedEmployee || isSelfProfile) {
    const currentEmployee = role === "admin" ? employees[2] : employees[0];
    const targetEmp = isSelfProfile
      ? role === "admin"
        ? employees[2] // Priya Shah / HR Admin
        : employees[0] // Meera Nair
      : selectedEmployee;

    return (
      <div className="min-h-screen bg-white">
        <NavBar
          active={tab}
          onNavigate={(t) => {
            setSelectedEmployee(null);
            setIsSelfProfile(false);
            setTab(t);
          }}
          role={role}
          onOpenSelfProfile={() => {
            setSelectedEmployee(null);
            setIsSelfProfile(true);
          }}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          employee={currentEmployee}
          onLogOut={() => {
            setRole(null);
            setSelectedEmployee(null);
            setIsSelfProfile(false);
          }}
        />
        <EmployeeInfo
          employee={targetEmp}
          isSelfView={isSelfProfile}
          onBack={() => {
            setSelectedEmployee(null);
            setIsSelfProfile(false);
          }}
          onUpdateEmployee={handleUpdateEmployee}
        />
        <ToastBanner toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <NavBar
        active={tab}
        onNavigate={setTab}
        role={role}
        onOpenSelfProfile={() => setIsSelfProfile(true)}
        onLogOut={() => setRole(null)}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        employee={role === "admin" ? employees[2] : employees[0]}
      />

      {tab === "dashboard" && (
        <Dashboard
          role={role}
          employees={employees}
          onSelectEmployee={setSelectedEmployee}
          onAddEmployee={handleAddEmployee}
        />
      )}

      {tab === "attendance" && (
        <Attendance
          role={role}
          employees={employees}
          attendanceRecords={attendanceRecords}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      )}

      {tab === "timeoff" && (
        <TimeOff
          role={role}
          requests={leaveRequests}
          onApproveLeave={handleApproveLeave}
          onRejectLeave={handleRejectLeave}
          onSubmitLeave={handleSubmitLeave}
        />
      )}

      {tab === "salary" && role === "admin" && (
        <Salary role={role} employees={employees} leaveRequests={leaveRequests} />
      )}

      <ToastBanner toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
