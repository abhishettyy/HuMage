// Central mock data + status vocabulary & utilities.
// Matches PS_Updated.md, UI-DESIGN.md, and TASKS_UPDATED.md requirements.

export const STATUS = {
  BOARDING: "boarding",    // Green Dot: Present & checked in
  IN_TRANSIT: "in_transit", // Airplane Icon: On approved leave
  DELAYED: "delayed",      // Yellow Dot: Absent / not checked in
  GROUNDED: "grounded",   // Yellow Dot: Off duty / grounded
  PRESENT: "boarding",
  ON_LEAVE: "in_transit",
  ABSENT: "delayed",
};

export const STATUS_META = {
  [STATUS.BOARDING]: { label: "Boarding", ramp: "teal", iconSvg: "/assets/status-dot-green.svg", icon: "ti-circle-check" },
  [STATUS.IN_TRANSIT]: { label: "In transit", ramp: "slate", iconSvg: "/assets/plane.svg", icon: "ti-plane" },
  [STATUS.DELAYED]: { label: "Delayed", ramp: "amber", iconSvg: "/assets/status-dot-yellow.svg", icon: "ti-alert-circle" },
  [STATUS.GROUNDED]: { label: "Grounded", ramp: "slate", iconSvg: "/assets/status-dot-yellow.svg", icon: "ti-clock" },
};

export function generateLoginId(firstName, lastName, year = 2026, count = 1) {
  const f = (firstName || "E").slice(0, 2).toUpperCase();
  const l = (lastName || "M").slice(0, 2).toUpperCase();
  const numStr = String(count).padStart(4, "0");
  return `OI${f}${l}${year}${numStr}`;
}

export const initialEmployees = [
  {
    id: "OIMENA20240012",
    name: "Meera Nair",
    firstName: "Meera",
    lastName: "Nair",
    department: "Engineering",
    jobPosition: "Frontend Engineer",
    manager: "Arjun Verma",
    email: "meera.nair@dayflow.io",
    mobile: "+91 98765 43210",
    location: "Bengaluru",
    joiningDate: "2024-03-11",
    status: STATUS.BOARDING,
    checkIn: "09:58",
    checkOut: null,
    wage: 50000,
    skills: ["React", "TypeScript", "Tailwind CSS", "Vite", "REST APIs"],
    certifications: ["AWS Certified Developer", "Meta Frontend Professional"],
    about: "Passionate frontend developer focused on crafting responsive, high-performance web applications.",
    interests: "Aviation, photography, open-source tech",
    privateInfo: {
      dob: "1997-08-14",
      gender: "Female",
      maritalStatus: "Single",
      nationality: "Indian",
      pan: "ABCDE1234F",
      aadhaar: "XXXX-XXXX-4321",
    },
    bankDetails: {
      bankName: "HDFC Bank",
      accountNo: "50100234567890",
      ifsc: "HDFC0001234",
    },
    presentDays: 20,
    leavesCount: 2,
  },
  {
    id: "OIARVE20230004",
    name: "Arjun Verma",
    firstName: "Arjun",
    lastName: "Verma",
    department: "Engineering",
    jobPosition: "Engineering Director",
    manager: "Executive Board",
    email: "arjun.verma@dayflow.io",
    mobile: "+91 98765 12345",
    location: "Bengaluru",
    joiningDate: "2023-01-15",
    status: STATUS.BOARDING,
    checkIn: "09:30",
    checkOut: null,
    wage: 120000,
    skills: ["System Architecture", "Node.js", "PostgreSQL", "Team Leadership"],
    certifications: ["PMP Certified", "AWS Solutions Architect"],
    about: "Engineering leader building scalable enterprise platforms.",
    interests: "Marathons, chess, tech mentoring",
    privateInfo: {
      dob: "1988-04-22",
      gender: "Male",
      maritalStatus: "Married",
      nationality: "Indian",
      pan: "XYZPD9876K",
      aadhaar: "XXXX-XXXX-9876",
    },
    bankDetails: {
      bankName: "ICICI Bank",
      accountNo: "000401567890",
      ifsc: "ICIC0000004",
    },
    presentDays: 22,
    leavesCount: 0,
  },
  {
    id: "OIROKU20250007",
    name: "Rohan Kulkarni",
    firstName: "Rohan",
    lastName: "Kulkarni",
    department: "Design",
    jobPosition: "UI/UX Lead",
    manager: "Arjun Verma",
    email: "rohan.kulkarni@dayflow.io",
    mobile: "+91 98765 67890",
    location: "Mumbai",
    joiningDate: "2025-02-01",
    status: STATUS.IN_TRANSIT,
    checkIn: null,
    checkOut: null,
    wage: 65000,
    skills: ["Figma", "Design Systems", "User Research", "Prototyping"],
    certifications: ["Google UX Design Certificate"],
    about: "Crafting beautiful and functional aviation-themed user interfaces.",
    interests: "UI design, sketch comedy, travel",
    privateInfo: {
      dob: "1995-11-30",
      gender: "Male",
      maritalStatus: "Single",
      nationality: "Indian",
      pan: "KLMNO4567P",
      aadhaar: "XXXX-XXXX-6789",
    },
    bankDetails: {
      bankName: "Axis Bank",
      accountNo: "9180100234567",
      ifsc: "UTIB0000258",
    },
    presentDays: 18,
    leavesCount: 4,
  },
  {
    id: "OIPRPA20240019",
    name: "Priya Patel",
    firstName: "Priya",
    lastName: "Patel",
    department: "Human Resources",
    jobPosition: "HR Lead / Company Admin",
    manager: "Arjun Verma",
    email: "priya.patel@dayflow.io",
    mobile: "+91 98765 87654",
    location: "Bengaluru",
    joiningDate: "2024-06-01",
    status: STATUS.BOARDING,
    checkIn: "09:45",
    checkOut: null,
    wage: 75000,
    skills: ["HR Management", "Talent Acquisition", "Payroll", "Compliance"],
    certifications: ["SHRM Certified Professional"],
    about: "Dedicated HR lead ensuring positive workplace culture and smooth onboarding.",
    interests: "Reading, yoga, community organizing",
    privateInfo: {
      dob: "1992-09-05",
      gender: "Female",
      maritalStatus: "Married",
      nationality: "Indian",
      pan: "PRPAT3456Q",
      aadhaar: "XXXX-XXXX-3456",
    },
    bankDetails: {
      bankName: "State Bank of India",
      accountNo: "30123456789",
      ifsc: "SBIN0000800",
    },
    presentDays: 21,
    leavesCount: 1,
  },
  {
    id: "OIJODO20260002",
    name: "John Doe",
    firstName: "John",
    lastName: "Doe",
    department: "Human Resources",
    jobPosition: "HR Manager / Admin",
    manager: "Priya Patel",
    email: "john.doe@dayflow.io",
    mobile: "+91 98765 99999",
    location: "Bengaluru",
    joiningDate: "2026-01-10",
    status: STATUS.DELAYED,
    checkIn: null,
    checkOut: null,
    wage: 70000,
    skills: ["HR Operations", "Onboarding", "Policy Implementation"],
    certifications: ["HR Analytics Specialist"],
    about: "HR Manager overseeing employee relations and company onboarding.",
    interests: "Badminton, podcasting",
    privateInfo: {
      dob: "1994-12-12",
      gender: "Male",
      maritalStatus: "Single",
      nationality: "Indian",
      pan: "JOHND1122M",
      aadhaar: "XXXX-XXXX-1122",
    },
    bankDetails: {
      bankName: "Kotak Mahindra Bank",
      accountNo: "7711223344",
      ifsc: "KKBK0000123",
    },
    presentDays: 15,
    leavesCount: 3,
  },
];

export const initialLeaveRequests = [
  {
    id: "1",
    employeeId: "OIMENA20240012",
    name: "Meera Nair",
    leaveType: "PAID",
    startDate: "2025-10-28",
    endDate: "2025-10-29",
    days: 2,
    reason: "Family event in Chennai",
    status: "Pending",
    attachmentUrl: null,
  },
  {
    id: "2",
    employeeId: "OIROKU20250007",
    name: "Rohan Kulkarni",
    leaveType: "SICK",
    startDate: "2025-10-20",
    endDate: "2025-10-20",
    days: 1,
    reason: "Fever and rest",
    status: "Approved",
    attachmentUrl: "https://example.com/medical-cert.pdf",
  },
  {
    id: "3",
    employeeId: "OIJODO20260002",
    name: "John Doe",
    leaveType: "UNPAID",
    startDate: "2025-10-05",
    endDate: "2025-10-06",
    days: 2,
    reason: "Personal leave",
    status: "Approved",
    attachmentUrl: null,
  },
];

export const initialAttendanceRecords = [
  {
    id: "att-1",
    employeeId: "OIMENA20240012",
    name: "Meera Nair",
    date: "22/10/2025",
    checkIn: "09:58",
    checkOut: "18:45",
    workHours: "8.78 hrs",
    extraHours: "0.78 hrs",
  },
  {
    id: "att-2",
    employeeId: "OIMENA20240012",
    name: "Meera Nair",
    date: "21/10/2025",
    checkIn: "09:45",
    checkOut: "18:30",
    workHours: "8.75 hrs",
    extraHours: "0.75 hrs",
  },
  {
    id: "att-3",
    employeeId: "OIARVE20230004",
    name: "Arjun Verma",
    date: "22/10/2025",
    checkIn: "09:30",
    checkOut: "19:15",
    workHours: "9.75 hrs",
    extraHours: "1.75 hrs",
  },
];

// Wage calculation utility according to PS_Updated.md §3.1
export function computeSalary(wageInput, payableDays = 22, totalWorkingDays = 22) {
  const W = Number(wageInput) || 50000;
  const Ratio = Math.max(0, Math.min(1, payableDays / totalWorkingDays));

  // Base wage components
  const basic = Math.round(W * 0.5); // 50% Basic
  const hra = Math.round(W * 0.2); // 20% HRA
  const stdAllowance = Math.round(W * 0.1); // 10% Standard Allowance
  const perfBonus = Math.round(W * 0.05); // 5% Performance Bonus
  const lta = Math.round(W * 0.05); // 5% LTA

  // Fixed allowance is computed as balancing figure so components sum EXACTLY to defined Wage W
  const fixedAllowance = Math.max(0, W - (basic + hra + stdAllowance + perfBonus + lta));

  // Deductions
  const pf = Math.round(basic * 0.12); // 12% PF on Basic
  const pt = 200; // Fixed ₹200 Professional Tax

  const grossEarnings = basic + hra + stdAllowance + perfBonus + lta + fixedAllowance;
  const totalDeductions = pf + pt;
  const fullNetPay = grossEarnings - totalDeductions;

  // Attendance-adjusted net pay based on payable days
  const adjustedNetPay = Math.round(fullNetPay * Ratio);

  return {
    definedWage: W,
    payableDays,
    totalWorkingDays,
    ratio: Ratio,
    components: {
      basic,
      hra,
      stdAllowance,
      perfBonus,
      lta,
      fixedAllowance,
    },
    deductions: {
      pf,
      pt,
      totalDeductions,
    },
    grossEarnings,
    fullNetPay,
    adjustedNetPay,
  };
}
