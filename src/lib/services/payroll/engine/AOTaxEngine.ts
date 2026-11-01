// src/lib/services/payroll/engine/AOTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Angola — AGT IRT (Grupo A) and INSS. memos/AO-RECON-1.md.
//
// One function, calculateAoPayslip, behind the run screen, preview and saved
// runs alike.
//
//   INSS base   = all cash pay this month EXCEPT the subsídio de férias
//   INSS        = base × 3% (8% for a working retiree); employer 8%
//   exempt      = meal ≤ 30,000 + transport ≤ 30,000 + abono de família ≤ 5% of base
//   MC          = cash pay − employee INSS − exempt
//   IRT         = parcela fixa + taxa × (MC − excesso de), the dated table, literally
//   net         = cash pay − INSS − IRT
//
// Bonus, subsídio de Natal and subsídio de férias are taxed in the month paid,
// added to that month's MC (KPMG). Lines rounded to the cêntimo, half up.
// Other frequencies go through a monthly equivalent, as Lesotho does.
// ─────────────────────────────────────────────────────────────────────────────

import { aoIrtTableAt, aoInssRateAt, type AoIrtTable } from '@/lib/payroll/ao/config';

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export function aoPeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') return 26;
  return 12;
}

/** Monthly IRT on a monthly matéria colectável. Unrounded. Cliffs kept. */
export function aoMonthlyIrt(mc: number, t: AoIrtTable): number {
  if (mc <= 0) return 0;
  const band = t.bands.find(b => mc <= b.upTo) ?? t.bands[t.bands.length - 1];
  return band.rate === 0 ? 0 : band.fixed + band.rate * (mc - band.over);
}

export interface AoCalcInput {
  /** Recurring cash pay this period (basic + allowances + overtime). */
  grossPay: number;
  /** Base salary — the abono de família exemption is 5% of it. Defaults to grossPay. */
  basicPay?: number;
  /** One-off cash this period that IS in the INSS base (bonus, subsídio de Natal). */
  irregularCashThisPeriod?: number;
  /** Subsídio / gratificação de férias this period — taxed, but outside the INSS base. */
  holidaySubsidyThisPeriod?: number;
  /** Parts of grossPay that are meal / transport allowances and employer abono de família. */
  mealAllowance?: number;
  transportAllowance?: number;
  familyAllowance?: number;
  /** A retired person in work pays 8% instead of 3% (DP 227/18 art. 12.º). */
  retiredWorking?: boolean;
  inssExempt?: boolean;
  freq?: string;
  payDate?: Date;
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
}

export interface AoCalcResult {
  grossPay: number;
  inssBase: number;
  inssEmployee: number;
  inssEmployer: number;
  exempt: number;
  /** Matéria colectável. */
  taxableIncome: number;
  irt: number;
  pensionEmployee: number;
  pensionEmployer: number;
  totalDeductions: number;
  netPay: number;
  employerCost: number;
  tableFrom: string;
  tableAssumed: boolean;
  effectiveTaxRate: number;
}

export function calculateAoPayslip(input: AoCalcInput): AoCalcResult {
  const date = input.payDate ?? new Date();
  const t = aoIrtTableAt(date);
  const rate = aoInssRateAt(date);
  const n = aoPeriodsInYear(input.freq);

  const recurring = Math.max(0, input.grossPay || 0);
  const irregular = Math.max(0, input.irregularCashThisPeriod || 0);
  const holiday = Math.max(0, input.holidaySubsidyThisPeriod || 0);
  const gross = recurring + irregular + holiday;
  const basic = Math.max(0, input.basicPay ?? recurring);

  const inssBase = recurring + irregular;
  const eeRate = input.retiredWorking ? rate.retiredEmployee : rate.employee;
  const inssEmployee = input.inssExempt ? 0 : r2(inssBase * eeRate);
  const inssEmployer = input.inssExempt ? 0 : r2(inssBase * rate.employer);

  const exempt = r2(
    Math.min(Math.max(0, input.mealAllowance || 0), t.mealAllowanceExempt) +
    Math.min(Math.max(0, input.transportAllowance || 0), t.transportAllowanceExempt) +
    Math.min(Math.max(0, input.familyAllowance || 0), basic * t.familyAllowanceExemptShareOfBase),
  );
  const mc = Math.max(0, r2(gross - inssEmployee - exempt));

  // Monthly table: the recurring part goes through its monthly equivalent and
  // back; the one-off part (bonus, Natal, férias) lands in the month it is paid,
  // taxed at the margin on top. For monthly pay this is exactly table(MC).
  const eeShare = input.inssExempt ? 0 : eeRate;
  const recurringMc = Math.max(0, recurring - recurring * eeShare - exempt);
  const extraMc = irregular - irregular * eeShare + holiday;
  const monthly = recurringMc * n / 12;
  const irt = r2(
    aoMonthlyIrt(monthly, t) * 12 / n +
    (extraMc > 0 ? aoMonthlyIrt(monthly + extraMc, t) - aoMonthlyIrt(monthly, t) : 0),
  );

  const pensionEmployee = r2(Math.max(0, input.pensionEmployeePerPeriod || 0));
  const pensionEmployer = r2(Math.max(0, input.pensionEmployerPerPeriod || 0));
  const totalDeductions = r2(inssEmployee + irt + pensionEmployee);

  return {
    grossPay: r2(gross), inssBase: r2(inssBase), inssEmployee, inssEmployer, exempt,
    taxableIncome: mc, irt, pensionEmployee, pensionEmployer, totalDeductions,
    netPay: r2(gross - totalDeductions),
    employerCost: r2(gross + inssEmployer + pensionEmployer),
    tableFrom: t.effectiveFrom, tableAssumed: t.assumed || rate.assumed,
    effectiveTaxRate: gross > 0 ? irt / gross : 0,
  };
}

export class AngolaTaxEngine {
  calculate(employee: any, _ps: string, _pe: string, payDate?: string) {
    const comp = employee?.compensation ?? {};
    const ao = employee?.taxInfo?.ao ?? {};
    const pcfg = employee?.deductions?.pension ?? {};
    const basic = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const overtime = Number(comp.overtimePay) || 0;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const off = pcfg.enabled === false;
    const r = calculateAoPayslip({
      grossPay: basic + overtime, basicPay: basic,
      mealAllowance: Number(ao.mealAllowanceMonthly) || 0,
      transportAllowance: Number(ao.transportAllowanceMonthly) || 0,
      familyAllowance: Number(ao.familyAllowanceMonthly) || 0,
      retiredWorking: !!ao.retiredWorking, inssExempt: !!ao.inssExempt,
      freq: comp.payFrequency || 'monthly',
      payDate: payDate ? new Date(payDate) : undefined,
      pensionEmployeePerPeriod: off ? 0 : basic * norm(Number(pcfg.employeePercent ?? 0)),
      pensionEmployerPerPeriod: off ? 0 : basic * norm(Number(pcfg.employerPercent ?? 0)),
    });
    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id, employee,
      earnings: { basicSalary: basic, overtimePay: overtime, bonus: 0, grossPay: r.grossPay, taxableIncome: r.taxableIncome },
      deductions: { paye: r.irt, uif: 0, socialSecurity: r.inssEmployee, pensionFund: r.pensionEmployee, medicalAid: 0, totalDeductions: r.totalDeductions },
      netPay: r.netPay,
      employerCosts: { uif: 0, sdl: 0, socialSecurity: r.inssEmployer, employerPension: r.pensionEmployer, totalEmployerCost: r.employerCost },
      ytd: { grossPay: (Number(yt.grossPay) || 0) + r.grossPay, paye: (Number(yt.paye) || 0) + r.irt, uif: 0, netPay: (Number(yt.netPay) || 0) + r.netPay },
      taxDetail: { annualTaxableIncome: r.taxableIncome * aoPeriodsInYear(comp.payFrequency), annualTax: 0, primaryRebate: 0, secondaryRebate: 0, tertiaryRebate: 0, medicalTaxCredit: 0, effectiveTaxRate: r.effectiveTaxRate, marginalRate: 0 },
      payeBasis: { recurringRemuneration: r.grossPay, irregularIncome: 0, taxWithheld: r.irt },
      aoDetail: { tableFrom: r.tableFrom, tableAssumed: r.tableAssumed, exempt: r.exempt },
    };
  }
}

export default AngolaTaxEngine;
