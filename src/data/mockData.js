// Central mock data + status vocabulary.
// Swap fetchEmployees()/fetchAttendance()/etc for real API calls — everything downstream
// (BoardingPassCard, ControlTowerStrip, DeparturesBoard...) reads this same shape.

// Status vocabulary — UI-DESIGN.md §2. Keep these four states everywhere; don't invent
// new labels per screen.
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

export const employees = [
  {
    id: "OIMENA20240012",
    name: "Meera Nair",
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
  },
  {
    id: "OIARVE20230004",
    name: "Arjun Verma",
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
  },
  {
    id: "OIPRSH20220001",
    name: "Priya Shah",
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
  },
  {
    id: "OIROKU20250007",
    name: "Rohan Kulkarni",
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
  },
];

export const attendanceRecords = [
  { date: "27/10/2025", checkIn: "09:55", checkOut: "18:50", workHours: "08:55", extraHours: "00:00" },
  { date: "28/10/2025", checkIn: "10:00", checkOut: "19:00", workHours: "09:00", extraHours: "01:00" },
  { date: "29/10/2025", checkIn: "09:48", checkOut: "18:40", workHours: "08:52", extraHours: "00:00" },
];

export const attendanceSummary = {
  totalWorkingDays: 22,
  daysPresent: 20,
  leavesCount: 2,
};

export const leaveBalances = [
  { type: "Paid time off", available: 24 },
  { type: "Sick leave", available: 7 },
];

export const leaveRequests = [
  { id: 1, name: "Meera Nair", start: "28/10/2025", end: "29/10/2025", type: "Paid time off", status: "Pending" },
  { id: 2, name: "Rohan Kulkarni", start: "02/11/2025", end: "02/11/2025", type: "Sick leave", status: "Approved" },
  { id: 3, name: "Arjun Verma", start: "15/10/2025", end: "16/10/2025", type: "Unpaid leave", status: "Rejected" },
];

// Salary calc engine — mirrors PS.md §6 formulas exactly. Keep this the single source
// of truth; every screen (manifest bar, payslip, admin config) should call this rather
// than re-deriving the math.
export function computeSalary(wage) {
  const basic = wage * 0.5;
  const hra = basic * 0.5;
  const standardAllowance = 4167;
  const performanceBonus = basic * 0.0833;
  const lta = basic * 0.0833;
  const fixedAllowance = wage - (basic + hra + standardAllowance + performanceBonus + lta);

  const pfEmployee = basic * 0.12;
  const pfEmployer = basic * 0.12;
  const professionalTax = 200;

  return {
    wage,
    components: [
      { label: "Basic salary", value: basic, ramp: "teal" },
      { label: "House rent allowance", value: hra, ramp: "teal" },
      { label: "Standard allowance", value: standardAllowance, ramp: "teal" },
      { label: "Performance bonus", value: performanceBonus, ramp: "teal" },
      { label: "Leave travel allowance", value: lta, ramp: "teal" },
      { label: "Fixed allowance", value: fixedAllowance, ramp: "slate" },
    ],
    deductions: [
      { label: "Provident fund (employee)", value: pfEmployee },
      { label: "Provident fund (employer)", value: pfEmployer },
      { label: "Professional tax", value: professionalTax },
    ],
  };
}
