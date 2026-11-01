// src/lib/services/payroll/engine/LSTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Lesotho — RSL PAYE. Monthly computation, as RSL's own guide does it:
//   20% on the first band, 30% above, less the monthly non-refundable credit.
// RSL's worked example: M10,000 → 1,296 + 1,056 − 1,020 = M1,332.
//
// Other frequencies are converted to a monthly equivalent and back.
// A bonus is taxed in the month paid: tax(month + bonus) − tax(month). RSL
// publishes no averaging method; over-withholding is refunded on assessment.
// Employee contributions to an employer superannuation fund come off before
// tax: Income Tax Order 1993 s95(2)-(4) limits employer + employee deductions to
// 20% of employment income, "the employee's contributions are taken into
// account first" — so the employee's own deduction is capped at 20% on its own
// (RSL return instructions and Form P.16 line (e) agree).
// No statutory social security exists for private-sector employees.
// ─────────────────────────────────────────────────────────────────────────────

import { lsTableAt, type LsTable } from '@/lib/payroll/ls/config';

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export function lsPeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') return 26;
  return 12;
}

/** Monthly tax on a monthly chargeable income, after the credit, never below nil. */
export function lsMonthlyTax(monthly: number, t: LsTable): number {
  if (monthly <= 0) return 0;
  const lower = Math.min(monthly, t.lowerBandMonthly) * t.lowerRate;
  const upper = Math.max(0, monthly - t.lowerBandMonthly) * t.upperRate;
  return Math.max(0, lower + upper - t.creditMonthly);
}

export interface LsCalcInput {
  grossPay: number;
  irregularCashThisPeriod?: number;
  freq?: string;
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
  payDate?: Date;
}

export interface LsCalcResult {
  grossPay: number;
  paye: number;
  irregularTax: number;
  creditMonthly: number;
  lowerBandMonthly: number;
  tableFrom: string;
  tableAssumed: boolean;
  pensionEmployee: number;
  pensionEmployer: number;
  /** Employee pension allowed before tax — at most 20% of employment income. */
  pensionDeductible: number;
  totalDeductions: number;
  netPay: number;
  employerCost: number;
  effectiveTaxRate: number;
}

/** Superannuation contributions deductible up to this share of employment income. */
export const LS_PENSION_DEDUCTION_CAP = 0.20;

export function calculateLsPayslip(input: LsCalcInput): LsCalcResult {
  const n = lsPeriodsInYear(input.freq);
  const table = lsTableAt(input.payDate ?? new Date());
  const gross = Math.max(0, input.grossPay || 0);
  const irregular = Math.max(0, input.irregularCashThisPeriod || 0);

  const pensionEmployee = r2(Math.max(0, input.pensionEmployeePerPeriod || 0));
  const pensionEmployer = r2(Math.max(0, input.pensionEmployerPerPeriod || 0));
  const pensionDeductible = r2(Math.min(pensionEmployee, gross * LS_PENSION_DEDUCTION_CAP));

  // Period pay (after the deductible pension) → its monthly equivalent, tax
  // that, and bring it back to the period.
  const monthly = (gross - pensionDeductible) * n / 12;
  const taxRecurring = lsMonthlyTax(monthly, table) * 12 / n;
  // The bonus lands in one period; taxed in that month on top of its monthly pay.
  const irregularTax = irregular > 0
    ? lsMonthlyTax(monthly + irregular, table) - lsMonthlyTax(monthly, table)
    : 0;
  const paye = r2(taxRecurring + irregularTax);

  const totalDeductions = r2(paye + pensionEmployee);
  const netPay = r2(gross + irregular - totalDeductions);

  return {
    grossPay: r2(gross), paye, irregularTax: r2(irregularTax),
    creditMonthly: table.creditMonthly, lowerBandMonthly: table.lowerBandMonthly,
    tableFrom: table.effectiveFrom, tableAssumed: table.assumed,
    pensionEmployee, pensionEmployer, pensionDeductible, totalDeductions, netPay,
    employerCost: r2(gross + irregular + pensionEmployer),
    effectiveTaxRate: gross + irregular > 0 ? paye / (gross + irregular) : 0,
  };
}

export class LesothoTaxEngine {
  calculate(employee: any, _ps: string, _pe: string, payDate?: string) {
    const comp = employee?.compensation ?? {};
    const pcfg = employee?.deductions?.pension ?? {};
    const basic = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const off = pcfg.enabled === false;
    const r = calculateLsPayslip({
      grossPay: basic + (Number(comp.overtimePay) || 0),
      freq: comp.payFrequency || 'monthly',
      pensionEmployeePerPeriod: off ? 0 : basic * norm(Number(pcfg.employeePercent ?? 0)),
      pensionEmployerPerPeriod: off ? 0 : basic * norm(Number(pcfg.employerPercent ?? 0)),
      payDate: payDate ? new Date(payDate) : undefined,
    });
    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id, employee,
      earnings: { basicSalary: basic, overtimePay: Number(comp.overtimePay) || 0, bonus: 0, grossPay: r.grossPay, taxableIncome: r2(r.grossPay - r.pensionDeductible) },
      deductions: { paye: r.paye, uif: 0, socialSecurity: 0, pensionFund: r.pensionEmployee, medicalAid: 0, totalDeductions: r.totalDeductions },
      netPay: r.netPay,
      employerCosts: { uif: 0, sdl: 0, socialSecurity: 0, employerPension: r.pensionEmployer, totalEmployerCost: r.employerCost },
      ytd: { grossPay: (Number(yt.grossPay) || 0) + r.grossPay, paye: (Number(yt.paye) || 0) + r.paye, uif: 0, netPay: (Number(yt.netPay) || 0) + r.netPay },
      taxDetail: { annualTaxableIncome: r.grossPay * lsPeriodsInYear(comp.payFrequency), annualTax: 0, primaryRebate: 0, secondaryRebate: 0, tertiaryRebate: 0, medicalTaxCredit: 0, effectiveTaxRate: r.effectiveTaxRate, marginalRate: 0 },
      payeBasis: { recurringRemuneration: r.grossPay, irregularIncome: 0, taxWithheld: r.paye },
      lsDetail: { creditMonthly: r.creditMonthly, lowerBandMonthly: r.lowerBandMonthly, tableFrom: r.tableFrom, tableAssumed: r.tableAssumed },
    };
  }
}

export default LesothoTaxEngine;
