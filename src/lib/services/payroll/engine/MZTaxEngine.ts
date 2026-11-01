// src/lib/services/payroll/engine/MZTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Mozambique — AT IRPS withholding and INSS. memos/MZ-RECON-1.md.
//
//   IRPS = valor fixo (dependants) + coeficiente × (gross − band floor), on the
//          GROSS monthly salary — INSS is not deducted first (CIRPS art. 29).
//          "–" cells withhold nothing. Non-residents: flat 20%.
//   INSS = 3% employee / 4% employer, no ceiling; holiday pay (férias) outside.
//   net  = gross − INSS − IRPS
//
// A bonus or 13th month is added to the month it is paid in and run through the
// table (no separate method is published). Lines rounded to the centavo.
// ─────────────────────────────────────────────────────────────────────────────

import { mzIrpsTableAt, mzInssRateAt, type MzIrpsTable } from '@/lib/payroll/mz/config';

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export function mzPeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') return 26;
  return 12;
}

/** Monthly IRPS withholding on a monthly gross. Unrounded. */
export function mzMonthlyIrps(gross: number, t: MzIrpsTable, dependants = 0, nonResident = false): number {
  if (gross <= 0) return 0;
  if (nonResident) return gross * t.nonResidentRate;
  const col = Math.min(4, Math.max(0, Math.floor(dependants || 0)));
  let band = null as MzIrpsTable['bands'][number] | null;
  for (const b of t.bands) if (gross >= b.from) band = b;
  if (!band) return 0;
  const fixed = band.fixed[col];
  return fixed === null ? 0 : fixed + band.rate * (gross - band.from);
}

export interface MzCalcInput {
  grossPay: number;
  /** One-off cash in the INSS base (bonus, 13th month). */
  irregularCashThisPeriod?: number;
  /** Holiday pay this period — taxed, outside the INSS base. */
  holidayPayThisPeriod?: number;
  dependants?: number;
  nonResident?: boolean;
  inssExempt?: boolean;
  freq?: string;
  payDate?: Date;
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
}

export interface MzCalcResult {
  grossPay: number;
  inssBase: number;
  inssEmployee: number;
  inssEmployer: number;
  taxableIncome: number;
  irps: number;
  pensionEmployee: number;
  pensionEmployer: number;
  totalDeductions: number;
  netPay: number;
  employerCost: number;
  tableFrom: string;
  tableAssumed: boolean;
  effectiveTaxRate: number;
}

export function calculateMzPayslip(input: MzCalcInput): MzCalcResult {
  const date = input.payDate ?? new Date();
  const t = mzIrpsTableAt(date);
  const rate = mzInssRateAt(date);
  const n = mzPeriodsInYear(input.freq);

  const recurring = Math.max(0, input.grossPay || 0);
  const irregular = Math.max(0, input.irregularCashThisPeriod || 0);
  const holiday = Math.max(0, input.holidayPayThisPeriod || 0);
  const gross = recurring + irregular + holiday;
  const extra = irregular + holiday;

  const inssBase = recurring + irregular;
  const inssEmployee = input.inssExempt ? 0 : r2(inssBase * rate.employee);
  const inssEmployer = input.inssExempt ? 0 : r2(inssBase * rate.employer);

  const dep = input.dependants ?? 0;
  const nr = !!input.nonResident;
  const monthly = recurring * n / 12;
  const base = mzMonthlyIrps(monthly, t, dep, nr) * 12 / n;
  const onExtra = extra > 0 ? mzMonthlyIrps(monthly + extra, t, dep, nr) - mzMonthlyIrps(monthly, t, dep, nr) : 0;
  const irps = r2(base + onExtra);

  const pensionEmployee = r2(Math.max(0, input.pensionEmployeePerPeriod || 0));
  const pensionEmployer = r2(Math.max(0, input.pensionEmployerPerPeriod || 0));
  const totalDeductions = r2(inssEmployee + irps + pensionEmployee);

  return {
    grossPay: r2(gross), inssBase: r2(inssBase), inssEmployee, inssEmployer,
    taxableIncome: r2(gross), irps, pensionEmployee, pensionEmployer, totalDeductions,
    netPay: r2(gross - totalDeductions),
    employerCost: r2(gross + inssEmployer + pensionEmployer),
    tableFrom: t.effectiveFrom, tableAssumed: t.assumed || rate.assumed,
    effectiveTaxRate: gross > 0 ? irps / gross : 0,
  };
}

export class MozambiqueTaxEngine {
  calculate(employee: any, _ps: string, _pe: string, payDate?: string) {
    const comp = employee?.compensation ?? {};
    const mz = employee?.taxInfo?.mz ?? {};
    const pcfg = employee?.deductions?.pension ?? {};
    const basic = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const overtime = Number(comp.overtimePay) || 0;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const off = pcfg.enabled === false;
    const r = calculateMzPayslip({
      grossPay: basic + overtime,
      dependants: Number(mz.dependants) || 0, nonResident: !!mz.nonResident, inssExempt: !!mz.inssExempt,
      freq: comp.payFrequency || 'monthly',
      payDate: payDate ? new Date(payDate) : undefined,
      pensionEmployeePerPeriod: off ? 0 : basic * norm(Number(pcfg.employeePercent ?? 0)),
      pensionEmployerPerPeriod: off ? 0 : basic * norm(Number(pcfg.employerPercent ?? 0)),
    });
    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id, employee,
      earnings: { basicSalary: basic, overtimePay: overtime, bonus: 0, grossPay: r.grossPay, taxableIncome: r.taxableIncome },
      deductions: { paye: r.irps, uif: 0, socialSecurity: r.inssEmployee, pensionFund: r.pensionEmployee, medicalAid: 0, totalDeductions: r.totalDeductions },
      netPay: r.netPay,
      employerCosts: { uif: 0, sdl: 0, socialSecurity: r.inssEmployer, employerPension: r.pensionEmployer, totalEmployerCost: r.employerCost },
      ytd: { grossPay: (Number(yt.grossPay) || 0) + r.grossPay, paye: (Number(yt.paye) || 0) + r.irps, uif: 0, netPay: (Number(yt.netPay) || 0) + r.netPay },
      taxDetail: { annualTaxableIncome: r.taxableIncome * mzPeriodsInYear(comp.payFrequency), annualTax: 0, primaryRebate: 0, secondaryRebate: 0, tertiaryRebate: 0, medicalTaxCredit: 0, effectiveTaxRate: r.effectiveTaxRate, marginalRate: 0 },
      payeBasis: { recurringRemuneration: r.grossPay, irregularIncome: 0, taxWithheld: r.irps },
      mzDetail: { tableFrom: r.tableFrom, tableAssumed: r.tableAssumed },
    };
  }
}

export default MozambiqueTaxEngine;
