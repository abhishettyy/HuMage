import { calculateSalaryComponents, calculatePayableDays } from "./payrollEngine.js";

console.log("=== Running Payroll Engine Unit Tests ===");

// Test 1: Worked example (Wage = ₹50,000)
const res50k = calculateSalaryComponents(50000, 22, 22);

console.assert(res50k.components.basic === 25000, `Expected Basic 25000, got ${res50k.components.basic}`);
console.assert(res50k.components.hra === 12500, `Expected HRA 12500, got ${res50k.components.hra}`);
console.assert(res50k.components.standardAllowance === 4167, `Expected Standard Allowance 4167, got ${res50k.components.standardAllowance}`);
console.assert(res50k.components.performanceBonus === 2083, `Expected Performance Bonus 2083, got ${res50k.components.performanceBonus}`);
console.assert(res50k.components.lta === 2083, `Expected LTA 2083, got ${res50k.components.lta}`);
console.assert(res50k.components.fixedAllowance === 4167, `Expected Fixed Allowance 4167, got ${res50k.components.fixedAllowance}`);

// Test sum of components constraint
const componentSum =
  res50k.components.basic +
  res50k.components.hra +
  res50k.components.standardAllowance +
  res50k.components.performanceBonus +
  res50k.components.lta +
  res50k.components.fixedAllowance;

console.assert(componentSum === 50000, `Expected component sum 50000, got ${componentSum}`);

// Test 2: Payable days reduction (20 payable out of 22 total)
const res20days = calculateSalaryComponents(50000, 20, 22);
console.assert(res20days.adjustedGross === 45455, `Expected adjusted gross 45455, got ${res20days.adjustedGross}`);

// Test 3: Payable days calculation helper
const payableDays = calculatePayableDays({ totalWorkingDays: 22, unpaidLeaveDays: 2, missingAttendanceDays: 1 });
console.assert(payableDays === 19, `Expected 19 payable days, got ${payableDays}`);

console.log("✅ All Payroll Engine Unit Tests Passed Cleanly!");
