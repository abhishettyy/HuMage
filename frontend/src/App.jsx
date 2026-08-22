import { useState, useEffect } from "react";
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
  fetchEmployeesApi,
  checkInEmployee,
  checkOutEmployee,
  createEmployeeApi,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "./services/api";

export default function App() {
  const [role, setRole] = useState(null); // null | "admin" | "employee"
  const [tab, setTab] = useState("dashboard");

  // LocalStorage persistent state managers
  const [employees, setEmployees] = useState(() => {
    try {
      const saved = localStorage.getItem("dayflow_employees");
      return saved ? JSON.parse(saved) : initialEmployees;
    } catch {
      return initialEmployees;
    }
  });

  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("dayflow_leave_requests");
      return saved ? JSON.parse(saved) : initialLeaveRequests;
    } catch {
      return initialLeaveRequests;
    }
  });

  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    try {
      const saved = localStorage.getItem("dayflow_attendance");
      return saved ? JSON.parse(saved) : initialAttendanceRecords;
    } catch {
      return initialAttendanceRecords;
    }
  });

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSelfProfile, setIsSelfProfile] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch employees directly from Supabase DB via Node.js API when authenticated
  useEffect(() => {
    if (role) {
      fetchEmployeesApi().then((dbEmployees) => {
        if (dbEmployees && dbEmployees.length > 0) {
          // Merge dbEmployees into current state
          setEmployees((prev) => {
            const dbMapped = dbEmployees.map((d) => ({
              id: d.empCode || d.id,
              name: d.name,
              firstName: d.name.split(" ")[0],
              lastName: d.name.split(" ")[1] || "",
              department: d.department,
              jobPosition: d.jobPosition,
              manager: "Arjun Verma",
              email: d.empCode ? `${d.empCode.toLowerCase()}@dayflow.io` : "employee@dayflow.io",
              mobile: "+91 98765 43210",
              location: d.location || "Bengaluru",
              joiningDate: new Date().toISOString().split("T")[0],
              status: d.status === "PRESENT" ? STATUS.BOARDING : d.status === "ON_LEAVE" ? STATUS.IN_TRANSIT : STATUS.DELAYED,
              checkIn: d.checkIn,
              checkOut: d.checkOut,
              wage: 50000,
            }));

            // Combine non-duplicate employees
            const existingIds = new Set(dbMapped.map((e) => e.id));
            const localOnly = prev.filter((e) => !existingIds.has(e.id));
            return [...dbMapped, ...localOnly];
          });
        }
      });
    }
  }, [role]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem("dayflow_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("dayflow_leave_requests", JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  useEffect(() => {
    localStorage.setItem("dayflow_attendance", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const showToast = (title, message) => {
    setToast({ title, message });
    setTimeout(() => setToast(null), 4500);
  };

  const handleAddEmployee = async (newEmp) => {
    setEmployees((prev) => [newEmp, ...prev]);
    showToast("Employee Created", `Generated Login ID ${newEmp.id} for ${newEmp.name}`);

    // Persist directly to Supabase PostgreSQL database
    try {
      await createEmployeeApi({
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
        email: newEmp.email,
        department: newEmp.department,
        jobPosition: newEmp.jobPosition,
        joiningYear: new Date().getFullYear(),
        phone: newEmp.mobile,
        location: newEmp.location,
        wage: newEmp.wage,
      });
    } catch (err) {
      console.warn("Supabase DB sync fallback for new employee:", err.message);
    }
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
          ? { ...e, status: STATUS.BOARDING, checkIn: timeStr }
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

    showToast("Checked In", `Check-in recorded at ${timeStr}. Flight status set to Boarding.`);
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
        prev.map((e) => (e.id === req.employeeId ? { ...e, status: STATUS.IN_TRANSIT } : e))
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
    const targetEmp = isSelfProfile
      ? role === "admin"
        ? employees[2] || employees[0] // Priya Shah / HR Admin
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
