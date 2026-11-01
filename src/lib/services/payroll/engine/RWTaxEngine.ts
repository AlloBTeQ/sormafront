// src/lib/services/payroll/engine/RWTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Rwanda — RRA PAYE plus the RSSB lines. memos/RW-RECON-1.md.
//
// One function, calculateRwPayslip, used by the run screen, preview and saved
// runs alike (the BW/ZM/ZW/KE pattern: one engine, never two that disagree).
//
// Order of computation, monthly:
//   cash        = recurring cash pay + irregular cash this month (bonus etc.)
//   benefits    = car 10% / housing 20% of cash, + other benefits at cost
//   base        = cash + benefits                    ← PAYE AND RSSB base
//   PAYE        = bands(base) | flat 30% (second employer) | 15% over 60k (casual)
//   pension     = base × dated rate, each side       (not deductible for PAYE)
//   maternity   = base × 0.3%, each side
//   occ. hazard = base × 2%, employer
//   medical     = basic × 7.5%, each side            (RAMA members only)
//   CBHI        = (base − PAYE − pension − maternity) × 0.5%, employee
//   net pay     = cash − every employee deduction    (benefits are not cash)
//
// Each line is rounded to the whole franc, half up. PwC's worked sample ties to
// the franc on every line under this rule.
// Other frequencies are converted to a monthly equivalent for the bands and
// back, as Lesotho does.
// ─────────────────────────────────────────────────────────────────────────────

import { rwPayeTableAt, rwPensionRateAt, rwRssbRatesAt, RW_BIK, type RwPayeTable } from '@/lib/payroll/rw/config';

const fr = (x: number) => Math.round(x + Number.EPSILON);

export type RwEmployeeType = 'primary' | 'secondary' | 'casual';

export function rwPeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') return 26;
  return 12;
}

/** Monthly PAYE on a monthly base, by employee type. Unrounded. */
export function rwMonthlyPaye(monthly: number, t: RwPayeTable, type: RwEmployeeType = 'primary'): number {
  if (monthly <= 0) return 0;
  if (type === 'secondary') return monthly * t.secondaryFlatRate;
  if (type === 'casual') return Math.max(0, monthly - t.casualThresholdMonthly) * t.casualRate;
  let tax = 0;
  for (const b of t.bands) {
    if (monthly <= b.from) break;
    tax += (Math.min(monthly, b.to) - b.from) * b.rate;
  }
  return tax;
}

export interface RwCalcInput {
  /** Recurring cash pay this period (basic + allowances + recurring overtime). */
  grossPay: number;
  /** Basic salary this period — the RAMA medical base. Defaults to grossPay. */
  basicPay?: number;
  /** One-off cash this period (bonus, commission, leave pay, termination pay). */
  irregularCashThisPeriod?: number;
  freq?: string;
  payDate?: Date;
  employeeType?: RwEmployeeType;
  companyCar?: boolean;
  employerHousing?: boolean;
  /** Other benefits in kind, at cost to the employer, this period. */
  otherBenefitsAtCost?: number;
  /** RAMA medical scheme member (employer admitted to the scheme). */
  medicalScheme?: boolean;
  /** Exempt from RSSB (e.g. a non-resident seconded under a social-security agreement). */
  rssbExempt?: boolean;
  /** Private occupational pension on top of RSSB (not deductible for PAYE). */
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
}

export interface RwCalcResult {
  cashPay: number;
  benefitsInKind: number;
  /** PAYE and RSSB base: cash + taxable benefits. */
  taxableIncome: number;
  paye: number;
  rssbPensionEmployee: number;
  rssbPensionEmployer: number;
  maternityEmployee: number;
  maternityEmployer: number;
  occupationalHazards: number;
  medicalEmployee: number;
  medicalEmployer: number;
  cbhi: number;
  pensionEmployee: number;
  pensionEmployer: number;
  totalDeductions: number;
  netPay: number;
  employerCost: number;
  pensionRateFrom: string;
  rateAssumed: boolean;
  effectiveTaxRate: number;
}

export function calculateRwPayslip(input: RwCalcInput): RwCalcResult {
  const date = input.payDate ?? new Date();
  const table = rwPayeTableAt(date);
  const pen = rwPensionRateAt(date);
  const rs = rwRssbRatesAt(date);
  const n = rwPeriodsInYear(input.freq);
  const type = input.employeeType ?? 'primary';

  const recurring = Math.max(0, input.grossPay || 0);
  const irregular = Math.max(0, input.irregularCashThisPeriod || 0);
  const cash = recurring + irregular;
  const basic = Math.max(0, input.basicPay ?? recurring);

  // Car and housing are shares of cash employment income EXCLUDING benefits.
  // They are DEEMED values — they set the tax, they are not money the employer
  // spends — so they stay out of employer cost. Benefits "at cost" are real.
  const atCost = fr(Math.max(0, input.otherBenefitsAtCost || 0));
  const deemed = fr(
    (input.companyCar ? cash * RW_BIK.companyCarRate : 0) +
    (input.employerHousing ? cash * RW_BIK.employerHousingRate : 0),
  );
  const benefits = deemed + atCost;
  const base = cash + benefits;

  // Bands are monthly: convert the period to its monthly equivalent and back.
  const paye = fr(rwMonthlyPaye(base * n / 12, table, type) * 12 / n);

  const rssb = !input.rssbExempt;
  const rssbPensionEmployee = rssb ? fr(base * pen.employee) : 0;
  const rssbPensionEmployer = rssb ? fr(base * pen.employer) : 0;
  const maternityEmployee = rssb ? fr(base * rs.maternityEmployee) : 0;
  const maternityEmployer = rssb ? fr(base * rs.maternityEmployer) : 0;
  const occupationalHazards = rssb ? fr(base * rs.occupationalHazardsEmployer) : 0;
  const medicalEmployee = rssb && input.medicalScheme ? fr(basic * rs.medicalEmployee) : 0;
  const medicalEmployer = rssb && input.medicalScheme ? fr(basic * rs.medicalEmployer) : 0;
  const cbhi = rssb ? fr(Math.max(0, base - paye - rssbPensionEmployee - maternityEmployee) * rs.cbhiEmployeeOfNet) : 0;

  const pensionEmployee = fr(Math.max(0, input.pensionEmployeePerPeriod || 0));
  const pensionEmployer = fr(Math.max(0, input.pensionEmployerPerPeriod || 0));

  const totalDeductions = paye + rssbPensionEmployee + maternityEmployee + medicalEmployee + cbhi + pensionEmployee;
  const netPay = fr(cash) - totalDeductions;
  const employerCost = fr(cash) + atCost + rssbPensionEmployer + maternityEmployer + occupationalHazards + medicalEmployer + pensionEmployer;

  return {
    cashPay: fr(cash), benefitsInKind: benefits, taxableIncome: fr(base), paye,
    rssbPensionEmployee, rssbPensionEmployer, maternityEmployee, maternityEmployer,
    occupationalHazards, medicalEmployee, medicalEmployer, cbhi,
    pensionEmployee, pensionEmployer, totalDeductions, netPay, employerCost,
    pensionRateFrom: pen.effectiveFrom, rateAssumed: pen.assumed || table.assumed,
    effectiveTaxRate: base > 0 ? paye / base : 0,
  };
}

export class RwandaTaxEngine {
  calculate(employee: any, _ps: string, _pe: string, payDate?: string) {
    const comp = employee?.compensation ?? {};
    const rw = employee?.taxInfo?.rw ?? {};
    const pcfg = employee?.deductions?.pension ?? {};
    const basic = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const overtime = Number(comp.overtimePay) || 0;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const off = pcfg.enabled === false;
    const r = calculateRwPayslip({
      grossPay: basic + overtime,
      basicPay: basic,
      freq: comp.payFrequency || 'monthly',
      payDate: payDate ? new Date(payDate) : undefined,
      employeeType: rw.employeeType,
      companyCar: !!rw.companyCar,
      employerHousing: !!rw.employerHousing,
      otherBenefitsAtCost: Number(rw.otherBenefitsMonthly) || 0,
      medicalScheme: !!rw.medicalScheme,
      rssbExempt: !!rw.rssbExempt,
      pensionEmployeePerPeriod: off ? 0 : basic * norm(Number(pcfg.employeePercent ?? 0)),
      pensionEmployerPerPeriod: off ? 0 : basic * norm(Number(pcfg.employerPercent ?? 0)),
    });
    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id, employee,
      earnings: { basicSalary: basic, overtimePay: overtime, bonus: 0, grossPay: r.cashPay, taxableIncome: r.taxableIncome },
      deductions: {
        paye: r.paye, uif: 0, socialSecurity: r.rssbPensionEmployee, pensionFund: r.pensionEmployee,
        medicalAid: r.medicalEmployee, maternity: r.maternityEmployee, cbhi: r.cbhi, totalDeductions: r.totalDeductions,
      },
      netPay: r.netPay,
      employerCosts: {
        uif: 0, sdl: 0, socialSecurity: r.rssbPensionEmployer, employerPension: r.pensionEmployer,
        maternity: r.maternityEmployer, occupationalHazards: r.occupationalHazards, medical: r.medicalEmployer,
        totalEmployerCost: r.employerCost,
      },
      ytd: { grossPay: (Number(yt.grossPay) || 0) + r.cashPay, paye: (Number(yt.paye) || 0) + r.paye, uif: 0, netPay: (Number(yt.netPay) || 0) + r.netPay },
      taxDetail: { annualTaxableIncome: r.taxableIncome * rwPeriodsInYear(comp.payFrequency), annualTax: 0, primaryRebate: 0, secondaryRebate: 0, tertiaryRebate: 0, medicalTaxCredit: 0, effectiveTaxRate: r.effectiveTaxRate, marginalRate: 0 },
      payeBasis: { recurringRemuneration: r.cashPay, irregularIncome: 0, taxWithheld: r.paye },
      rwDetail: { pensionRateFrom: r.pensionRateFrom, rateAssumed: r.rateAssumed, benefitsInKind: r.benefitsInKind },
    };
  }
}

export default RwandaTaxEngine;
