import { useState } from "react";
import NavBar from "./layout/NavBar";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import TimeOff from "./pages/TimeOff";
import Salary from "./pages/Salary";
import EmployeeInfo from "./pages/EmployeeInfo";
import EmployeeDashboard from "./pages/EmployeeDashboard";
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
    const currentUser = role === "admin" ? employees[2] : employees[0];
    const currentId = currentUser?.id;

    const apiRes = await checkInEmployee(currentId);
    const timeStr = apiRes?.checkIn || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === currentId
          ? { ...e, status: STATUS.PRESENT, checkIn: timeStr }
          : e
      )
    );
    // Add to attendance log table
    setAttendanceRecords((prev) => [
      {
        employeeId: currentId,
        name: currentUser?.name || "Employee",
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
    const currentUser = role === "admin" ? employees[2] : employees[0];
    const currentId = currentUser?.id;

    const apiRes = await checkOutEmployee(currentId);
    const timeStr = apiRes?.checkOut || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    setEmployees((prev) =>
      prev.map((e) => (e.id === currentId ? { ...e, checkOut: timeStr } : e))
    );

    setAttendanceRecords((prev) =>
      prev.map((r, i) =>
        r.employeeId === currentId && r.checkOut === null
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
    return <SignIn onSignIn={(r) => {
      setRole(r);
      setTab("dashboard");
    }} />;
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
          role={role}
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

      {tab === "dashboard" && role === "admin" && (
        <Dashboard
          role={role}
          employees={employees}
          onSelectEmployee={setSelectedEmployee}
          onAddEmployee={handleAddEmployee}
        />
      )}

      {tab === "dashboard" && role === "employee" && (
        <EmployeeDashboard
          employee={employees.find((e) => e.name === "Meera Nair")}
          onNavigate={setTab}
          onLogOut={() => setRole(null)}
          onOpenProfile={() => {
            setSelectedEmployee(null);
            setIsSelfProfile(true);
          }}
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
          employee={employees.find(e => e.name === "Meera Nair")}
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
