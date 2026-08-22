import { useState, useEffect } from "react";
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
  fetchEmployeesApi,
  checkInEmployee,
  checkOutEmployee,
  deleteEmployeeApi,
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "./services/api";

export default function App() {
  // Session persistence across page refreshes
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem("dayflow_role") || null;
    } catch {
      return null;
    }
  });

  const [loggedInEmpCode, setLoggedInEmpCode] = useState(() => {
    try {
      return localStorage.getItem("dayflow_emp_code") || null;
    } catch {
      return null;
    }
  });

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

  const loggedInEmployee = employees.find((e) => e.id === loggedInEmpCode) || employees[0];
  const isSuperAdmin = Boolean(loggedInEmpCode === "admin" || (role === "admin" && (!loggedInEmpCode || loggedInEmpCode === "admin")));

  const handleSignIn = (selectedRole, empCode) => {
    setRole(selectedRole);
    if (empCode) setLoggedInEmpCode(empCode);
    try {
      localStorage.setItem("dayflow_role", selectedRole);
      if (empCode) localStorage.setItem("dayflow_emp_code", empCode);
    } catch {
      // fallback
    }
  };

  const handleLogOut = () => {
    setRole(null);
    setLoggedInEmpCode(null);
    try {
      localStorage.removeItem("dayflow_role");
      localStorage.removeItem("dayflow_emp_code");
      localStorage.removeItem("dayflow_token");
    } catch {
      // fallback
    }
    setSelectedEmployee(null);
    setIsSelfProfile(false);
  };

  // Fetch employees directly from Supabase DB via Node.js API when authenticated
  useEffect(() => {
    if (role) {
      fetchEmployeesApi().then((dbEmployees) => {
        if (dbEmployees && dbEmployees.length > 0) {
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
              role: d.role
            }));

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

  const handleAddEmployee = (newEmp) => {
    setEmployees((prev) => [newEmp, ...prev]);
    showToast("Account Created", `Generated Login ID ${newEmp.id} for ${newEmp.name} (${newEmp.role || 'EMPLOYEE'})`);
  };

  const handleDeleteEmployee = async (id) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    if (emp) {
      showToast("Employee Deleted", `Deleted employee record for ${emp.name} (${id})`);
    }

    try {
      await deleteEmployeeApi(id);
    } catch (err) {
      console.warn("Supabase DB delete sync error:", err.message);
    }
  };

  const handleUpdateEmployee = (updatedEmp) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
    showToast("Profile Updated", `Saved profile changes for ${updatedEmp.name}`);
  };

  const handleCheckIn = async (targetId) => {
    const empId = targetId || loggedInEmployee.id;
    const emp = employees.find((e) => e.id === empId) || loggedInEmployee;

    const apiRes = await checkInEmployee(emp.id);
    const timeStr = apiRes?.checkIn || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === emp.id
          ? { ...e, status: STATUS.PRESENT, checkIn: timeStr, presentDays: (e.presentDays || 0) + 1 }
          : e
      )
    );

    setAttendanceRecords((prev) => [
      {
        employeeId: emp.id,
        name: emp.name,
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

  const handleCheckOut = async (targetId) => {
    const empId = targetId || loggedInEmployee.id;
    const emp = employees.find((e) => e.id === empId) || loggedInEmployee;

    const apiRes = await checkOutEmployee(emp.id);
    const timeStr = apiRes?.checkOut || new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, checkOut: timeStr } : e))
    );

    setAttendanceRecords((prev) =>
      prev.map((r, i) =>
        i === 0 && r.employeeId === emp.id
          ? { ...r, checkOut: timeStr, workHours: `${apiRes?.workHours || 8.85} hrs`, extraHours: `${apiRes?.extraHours || 0.85} hrs` }
          : r
      )
    );

    showToast("Checked Out", `Check-out recorded at ${timeStr} for ${emp.name}. Day landing completed.`);
  };

  const handleApproveLeave = async (id) => {
    await approveLeaveRequest(id);
    const req = leaveRequests.find((r) => r.id === id);
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );

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
    showToast("Leave Request Submitted", `Leave request for ${newReq.name} submitted for Admin/HR review.`);
  };

  if (!role) {
    return <SignIn onSignIn={(r) => {
      setRole(r);
      setTab("dashboard");
    }} />;
  }

  if (selectedEmployee || isSelfProfile) {
    const currentEmployee = role === "admin" ? employees[2] : employees[0];
    const targetEmp = isSelfProfile
      ? role === "admin"
        ? employees[2] || employees[0]
        : loggedInEmployee
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
          onCheckIn={() => handleCheckIn(targetEmp?.id)}
          onCheckOut={() => handleCheckOut(targetEmp?.id)}
          employee={targetEmp}
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
        onCheckIn={() => handleCheckIn(loggedInEmployee?.id)}
        onCheckOut={() => handleCheckOut(loggedInEmployee?.id)}
        employee={loggedInEmployee}
      />

      {tab === "dashboard" && role === "admin" && (
        <Dashboard
          role={role}
          isSuperAdmin={isSuperAdmin}
          employees={employees}
          onSelectEmployee={setSelectedEmployee}
          onAddEmployee={handleAddEmployee}
          onDeleteEmployee={handleDeleteEmployee}
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
          currentEmployee={loggedInEmployee}
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
          currentEmployee={loggedInEmployee}
          employees={employees}
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
