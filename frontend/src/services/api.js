/**
 * API Service Client connecting Frontend to Node.js Backend Server
 * Supports P2 (Attendance), P3 (Leave) & P4 (Salary/Payroll) endpoints with automatic fallback
 */

const API_BASE_URL = "http://localhost:5000/api";

export async function checkInEmployee(employeeId = "OIMENA20240012") {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    if (!res.ok) throw new Error("Check-in request failed");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local handler for check-in:", err.message);
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return { success: true, checkIn: timeStr, message: `Checked in at ${timeStr}` };
  }
}

export async function checkOutEmployee(employeeId = "OIMENA20240012") {
  try {
    const res = await fetch(`${API_BASE_URL}/attendance/check-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId }),
    });
    if (!res.ok) throw new Error("Check-out request failed");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local handler for check-out:", err.message);
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    return { success: true, checkOut: timeStr, workHours: 8.85, extraHours: 0.85, message: `Checked out at ${timeStr}` };
  }
}

export async function fetchSalaryConfig(employeeId = "OIMENA20240012") {
  try {
    const res = await fetch(`${API_BASE_URL}/salary/${employeeId}`);
    if (!res.ok) throw new Error("Failed to fetch salary config");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local salary engine calculation:", err.message);
    return null;
  }
}

export async function updateBaseWage(employeeId = "OIMENA20240012", wage = 50000) {
  try {
    const res = await fetch(`${API_BASE_URL}/salary/${employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wage }),
    });
    if (!res.ok) throw new Error("Failed to update base wage");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local wage handler:", err.message);
    return null;
  }
}

export async function fetchPayrollPipeline(employeeId = "OIMENA20240012") {
  try {
    const res = await fetch(`${API_BASE_URL}/salary/${employeeId}/payroll-pipeline`);
    if (!res.ok) throw new Error("Failed to fetch payroll pipeline");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local pipeline handler:", err.message);
    return null;
  }
}

export async function submitLeaveRequest(newReq) {
  try {
    const res = await fetch(`${API_BASE_URL}/leave/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReq),
    });
    if (!res.ok) throw new Error("Failed to submit leave request");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local submit leave handler:", err.message);
    return { success: true, request: newReq };
  }
}

export async function approveLeaveRequest(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/leave/${id}/approve`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to approve leave request");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local approve leave handler:", err.message);
    return { success: true };
  }
}

export async function rejectLeaveRequest(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/leave/${id}/reject`, {
      method: "PUT",
    });
    if (!res.ok) throw new Error("Failed to reject leave request");
    return await res.json();
  } catch (err) {
    console.warn("API Offline, using local reject leave handler:", err.message);
    return { success: true };
  }
}
