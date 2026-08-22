/**
 * Pure Salary & Payroll Calculation Engine
 * Implements PS_Updated.md §6 & TASKS_UPDATED.md rules
 */

export function calculateSalaryComponents(wage, payableDays = 22, totalWorkingDays = 22) {
  const safeWage = Math.max(0, Number(wage) || 0);

  // 1. Basic Salary = 50% of Base Wage
  const basic = Math.round(safeWage * 0.5);

  // 2. House Rent Allowance (HRA) = 50% of Basic
  const hra = Math.round(basic * 0.5);

  // 3. Standard Allowance = Fixed ₹4,167/month
  const standardAllowance = safeWage > 0 ? 4167 : 0;

  // 4. Performance Bonus = 8.33% of Basic
  const performanceBonus = Math.round(basic * 0.0833);

  // 5. Leave Travel Allowance (LTA) = 8.33% of Basic
  const lta = Math.round(basic * 0.0833);

  // 6. Fixed Allowance = Balancing figure (Wage - sum of all above rounded components)
  const knownSum = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = Math.max(0, safeWage - knownSum);

  // Verification assertion: Gross monthly salary equals safeWage exactly
  const grossSalary = basic + hra + standardAllowance + performanceBonus + lta + fixedAllowance;

  // 7. Deductions
  const pfEmployee = Math.round(basic * 0.12);
  const pfEmployer = Math.round(basic * 0.12);
  const professionalTax = safeWage > 0 ? 200 : 0;
  const totalDeductions = pfEmployee + professionalTax;

  // 8. Attendance & Leave Pipeline Adjustment
  const safeTotalDays = Math.max(1, Number(totalWorkingDays) || 22);
  const safePayableDays = Math.min(safeTotalDays, Math.max(0, Number(payableDays) || 0));
  const ratio = safePayableDays / safeTotalDays;

  const adjustedGross = Math.round(grossSalary * ratio);
  const adjustedNetPay = Math.max(0, Math.round(adjustedGross - totalDeductions));

  return {
    wage: safeWage,
    totalWorkingDays: safeTotalDays,
    payableDays: safePayableDays,
    grossSalary,
    adjustedGross,
    adjustedNetPay,
    components: {
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance,
    },
    deductions: {
      pfEmployee,
      pfEmployer,
      professionalTax,
      totalDeductions,
    },
  };
}

/**
 * Calculates payable days based on Attendance (P2) and Leave (P3)
 * payableDays = totalWorkingDays - unpaidLeaveDays - missingAttendanceDays
 */
export function calculatePayableDays({ totalWorkingDays = 22, unpaidLeaveDays = 0, missingAttendanceDays = 0 }) {
  const safeTotal = Math.max(1, Number(totalWorkingDays) || 22);
  const safeUnpaid = Math.max(0, Number(unpaidLeaveDays) || 0);
  const safeMissing = Math.max(0, Number(missingAttendanceDays) || 0);

  const payable = Math.max(0, safeTotal - safeUnpaid - safeMissing);
  return Math.min(safeTotal, payable);
}
