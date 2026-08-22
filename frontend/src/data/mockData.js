// Central mock data + status vocabulary & utilities.
// Matches PS_Updated.md, UI-DESIGN.md, and TASKS_UPDATED.md requirements.

export const STATUS = {
  BOARDING: "boarding", // checked in / present
  DELAYED: "delayed", // absent, no approved leave
  IN_TRANSIT: "in_transit", // approved leave, active today
  GROUNDED: "grounded", // not yet checked in, day not started
};

export const STATUS_META = {
  [STATUS.BOARDING]: { label: "Boarding", ramp: "teal", icon: "ti-plane-departure" },
  [STATUS.DELAYED]: { label: "Delayed", ramp: "amber", icon: "ti-alert-circle" },
  [STATUS.IN_TRANSIT]: { label: "In transit", ramp: "slate", icon: "ti-plane" },
  [STATUS.GROUNDED]: { label: "Grounded", ramp: "slate", icon: "ti-clock" },
};

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
      residingAddress: "42 Mg Road, Indiranagar, Bengaluru, KA 560038",
      personalEmail: "meera.nair.personal@gmail.com",
      gender: "Female",
      nationality: "Indian",
      maritalStatus: "Single",
      panNo: "ABCDE1234F",
      uanNo: "100987654321",
      bankDetails: {
        accountNumber: "918020045678901",
        bankName: "HDFC Bank",
        ifscCode: "HDFC0001234",
      },
    },
    security: {
      mustChangePassword: false,
      lastLogin: "2026-08-22 09:55 AM",
      loginHistory: [
        { date: "2026-08-22 09:55:12", action: "Successful Sign In", ip: "192.168.1.45", device: "Chrome / Windows" },
        { date: "2026-08-21 09:48:02", action: "Successful Sign In", ip: "192.168.1.45", device: "Chrome / Windows" },
        { date: "2026-08-20 10:02:44", action: "Successful Sign In", ip: "192.168.1.45", device: "Chrome / Windows" },
      ],
    },
  },
  {
    id: "OIARVE20230004",
    name: "Arjun Verma",
    firstName: "Arjun",
    lastName: "Verma",
    department: "Design",
    jobPosition: "Design Lead",
    manager: "Priya Shah",
    email: "arjun.verma@dayflow.io",
    mobile: "+91 91234 56789",
    location: "Bengaluru",
    joiningDate: "2023-06-01",
    status: STATUS.DELAYED,
    checkIn: null,
    checkOut: null,
    wage: 75000,
    skills: ["Figma", "UI Systems", "User Research", "Prototyping"],
    certifications: ["Google UX Design Professional"],
    about: "Design Lead creating intuitive design systems and human-centric software experiences.",
    interests: "Sketching, UI motion design",
    privateInfo: {
      dob: "1994-03-22",
      residingAddress: "15 Koramangala 5th Block, Bengaluru, KA 560095",
      personalEmail: "arjun.verma.design@gmail.com",
      gender: "Male",
      nationality: "Indian",
      maritalStatus: "Married",
      panNo: "XYZPS5678K",
      uanNo: "100123456789",
      bankDetails: {
        accountNumber: "50100234567890",
        bankName: "ICICI Bank",
        ifscCode: "ICIC0000456",
      },
    },
    security: {
      mustChangePassword: false,
      lastLogin: "2026-08-21 06:12 PM",
      loginHistory: [
        { date: "2026-08-21 18:12:00", action: "Successful Sign In", ip: "192.168.1.88", device: "Safari / macOS" },
      ],
    },
  },
  {
    id: "OIPRSH20220001",
    name: "Priya Shah",
    firstName: "Priya",
    lastName: "Shah",
    department: "Human Resources",
    jobPosition: "HR Officer",
    manager: "—",
    email: "priya.shah@dayflow.io",
    mobile: "+91 99887 76655",
    location: "Bengaluru",
    joiningDate: "2022-01-10",
    status: STATUS.IN_TRANSIT,
    checkIn: null,
    checkOut: null,
    wage: 60000,
    skills: ["HR Operations", "Talent Acquisition", "Payroll Management", "Conflict Resolution"],
    certifications: ["SHRM Certified Professional (SHRM-CP)"],
    about: "HR Specialist dedicated to employee experience, onboarding pipelines, and organizational growth.",
    interests: "Reading, mentoring, podcasting",
    privateInfo: {
      dob: "1992-11-05",
      residingAddress: "78 Whitefield Main Rd, Bengaluru, KA 560066",
      personalEmail: "priya.shah.hr@gmail.com",
      gender: "Female",
      nationality: "Indian",
      maritalStatus: "Married",
      panNo: "PRYSH9012M",
      uanNo: "100555444333",
      bankDetails: {
        accountNumber: "000401567890",
        bankName: "Axis Bank",
        ifscCode: "UTIB0000004",
      },
    },
    security: {
      mustChangePassword: false,
      lastLogin: "2026-08-22 08:30 AM",
      loginHistory: [
        { date: "2026-08-22 08:30:15", action: "Successful Sign In", ip: "192.168.1.12", device: "Chrome / Windows" },
      ],
    },
  },
  {
    id: "OIROKU20250007",
    name: "Rohan Kulkarni",
    firstName: "Rohan",
    lastName: "Kulkarni",
    department: "Engineering",
    jobPosition: "Backend Engineer",
    manager: "Arjun Verma",
    email: "rohan.kulkarni@dayflow.io",
    mobile: "+91 90909 09090",
    location: "Pune",
    joiningDate: "2025-02-18",
    status: STATUS.GROUNDED,
    checkIn: null,
    checkOut: null,
    wage: 55000,
    skills: ["Node.js", "PostgreSQL", "Docker", "Python", "Redis"],
    certifications: ["PostgreSQL Associate Certification"],
    about: "Backend Systems Engineer who loves scalable API architecture and database optimizations.",
    interests: "Chess, trekking, robotics",
    privateInfo: {
      dob: "1998-05-30",
      residingAddress: "12 Baner Road, Pune, MH 411045",
      personalEmail: "rohan.k.backend@gmail.com",
      gender: "Male",
      nationality: "Indian",
      maritalStatus: "Single",
      panNo: "ROHKU3456L",
      uanNo: "100777888999",
      bankDetails: {
        accountNumber: "309810123456",
        bankName: "State Bank of India",
        ifscCode: "SBIN0001234",
      },
    },
    security: {
      mustChangePassword: true,
      lastLogin: "2026-08-20 05:40 PM",
      loginHistory: [
        { date: "2026-08-20 17:40:00", action: "Successful Sign In", ip: "192.168.2.90", device: "Firefox / Linux" },
      ],
    },
  },
];

export const initialAttendanceRecords = [
  { employeeId: "OIMENA20240012", name: "Meera Nair", date: "27/10/2025", checkIn: "09:55", checkOut: "18:50", workHours: "08:55", extraHours: "00:00" },
  { employeeId: "OIMENA20240012", name: "Meera Nair", date: "28/10/2025", checkIn: "10:00", checkOut: "19:00", workHours: "09:00", extraHours: "01:00" },
  { employeeId: "OIMENA20240012", name: "Meera Nair", date: "29/10/2025", checkIn: "09:48", checkOut: "18:40", workHours: "08:52", extraHours: "00:00" },
  { employeeId: "OIARVE20230004", name: "Arjun Verma", date: "27/10/2025", checkIn: "10:15", checkOut: "18:30", workHours: "08:15", extraHours: "00:00" },
  { employeeId: "OIARVE20230004", name: "Arjun Verma", date: "28/10/2025", checkIn: null, checkOut: null, workHours: "00:00", extraHours: "00:00" },
  { employeeId: "OIPRSH20220001", name: "Priya Shah", date: "27/10/2025", checkIn: "09:30", checkOut: "17:30", workHours: "08:00", extraHours: "00:00" },
  { employeeId: "OIROKU20250007", name: "Rohan Kulkarni", date: "27/10/2025", checkIn: "10:05", checkOut: "19:10", workHours: "09:05", extraHours: "01:05" },
];

export const initialLeaveRequests = [
  { id: 1, employeeId: "OIMENA20240012", name: "Meera Nair", start: "28/10/2025", end: "29/10/2025", days: 2, type: "Paid time off", status: "Pending" },
  { id: 2, employeeId: "OIROKU20250007", name: "Rohan Kulkarni", start: "02/11/2025", end: "02/11/2025", days: 1, type: "Sick leave", status: "Approved" },
  { id: 3, employeeId: "OIARVE20230004", name: "Arjun Verma", start: "15/10/2025", end: "16/10/2025", days: 2, type: "Unpaid leave", status: "Rejected" },
];

export const initialLeaveBalances = {
  OIMENA20240012: { paid: 24, sick: 7 },
  OIARVE20230004: { paid: 22, sick: 7 },
  OIPRSH20220001: { paid: 20, sick: 6 },
  OIROKU20250007: { paid: 24, sick: 6 },
};

// Deterministic Login ID Generator (PS_Updated.md §3 algorithm)
export function generateLoginId(firstName, lastName, joiningYear, serialNumber) {
  const companyPrefix = "OI"; // Odoo India / Company prefix
  const fn2 = (firstName || "XX").slice(0, 2).toUpperCase();
  const ln2 = (lastName || "XX").slice(0, 2).toUpperCase();
  const yr = joiningYear || new Date().getFullYear();
  const serialStr = String(serialNumber).padStart(4, "0");
  return `${companyPrefix}${fn2}${ln2}${yr}${serialStr}`;
}

// Salary Component Engine (PS_Updated.md §6 formulas)
export function computeSalary(wage, payableDays = 22, totalWorkingDays = 22) {
  const safeWage = Math.max(0, wage || 0);
  
  // Component formulas
  const basic = safeWage * 0.5;
  const hra = basic * 0.5;
  const standardAllowance = Math.min(4167, safeWage > 0 ? 4167 : 0);
  const performanceBonus = basic * 0.0833;
  const lta = basic * 0.0833;
  
  // Fixed allowance is the balancing figure
  const knownSum = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, safeWage - knownSum);

  // Deductions
  const pfEmployee = basic * 0.12;
  const pfEmployer = basic * 0.12;
  const professionalTax = safeWage > 0 ? 200 : 0;
  const totalDeductions = pfEmployee + professionalTax;

  // Gross monthly before attendance adjustment
  const grossSalary = basic + hra + standardAllowance + performanceBonus + lta + fixedAllowance;

  // Payable days ratio
  const ratio = totalWorkingDays > 0 ? payableDays / totalWorkingDays : 1;
  const adjustedGross = Math.round(grossSalary * ratio);
  const adjustedNetPay = Math.max(0, Math.round(adjustedGross - totalDeductions));

  return {
    wage: safeWage,
    totalWorkingDays,
    payableDays,
    grossSalary,
    adjustedGross,
    adjustedNetPay,
    components: [
      { label: "Basic salary", value: Math.round(basic), ramp: "teal" },
      { label: "House rent allowance", value: Math.round(hra), ramp: "teal" },
      { label: "Standard allowance", value: Math.round(standardAllowance), ramp: "teal" },
      { label: "Performance bonus", value: Math.round(performanceBonus), ramp: "teal" },
      { label: "Leave travel allowance", value: Math.round(lta), ramp: "teal" },
      { label: "Fixed allowance", value: Math.round(fixedAllowance), ramp: "slate" },
    ],
    deductions: [
      { label: "Provident fund (employee)", value: Math.round(pfEmployee) },
      { label: "Provident fund (employer)", value: Math.round(pfEmployer) },
      { label: "Professional tax", value: Math.round(professionalTax) },
    ],
  };
}
