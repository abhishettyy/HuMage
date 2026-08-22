import { useState } from "react";
import NavBar from "./layout/NavBar";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import TimeOff from "./pages/TimeOff";
import Salary from "./pages/Salary";
import EmployeeInfo from "./pages/EmployeeInfo";

export default function App() {
  const [role, setRole] = useState(null); // null | "admin" | "employee"
  const [tab, setTab] = useState("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  if (!role) {
    return <SignIn onSignIn={setRole} />;
  }

  if (selectedEmployee) {
    return (
      <div className="min-h-screen bg-white">
        <NavBar active={tab} onNavigate={setTab} role={role} />
        <EmployeeInfo employee={selectedEmployee} onBack={() => setSelectedEmployee(null)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavBar active={tab} onNavigate={setTab} role={role} />
      {tab === "dashboard" && (
        <Dashboard role={role} onSelectEmployee={setSelectedEmployee} />
      )}
      {tab === "attendance" && <Attendance role={role} />}
      {tab === "timeoff" && <TimeOff role={role} />}
      {tab === "salary" && role === "admin" && <Salary />}
    </div>
  );
}
