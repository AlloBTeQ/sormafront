// src/lib/services/payroll/engine/SZTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Eswatini — ERS PAYE and ENPF. One pure calc behind the process-route engine and
// the run path, as for Namibia and Zambia.
//
//   PAYE: (pay − employee ENPF − allowable pension) annualised → bands → less
//         rebate (E8,200; E10,900 over 60) → ÷ periods. A bonus is taxed at the
//         margin on top of annualised recurring pay.
//   ENPF: 5% + 5% of wages up to the ceiling in force on the pay date. "Wages"
//         is any remuneration in money, allowances included (ENPF Order 1974 s2),
//         so the base is gross cash pay — a bonus included — not basic.
//
// Before tax (memos/SZ-LS-RECON-1.md Part B, checked at source 2026-10-23):
//   - employee ENPF: ERS lists "statutory deductions (SNPF)" as allowable when
//     determining taxable income (ers.org.sz/IncomeTax/Paye);
//   - employee contributions to an approved pension fund, up to 15% of
//     pensionable salary from 1 July 2024 (Income Tax (Amendment) Act 2023,
//     s14(1)(i); Legal Notice 69 of 2024 — via PaySpace and Sage).
// ─────────────────────────────────────────────────────────────────────────────

import { SZ_TAX_CONFIG_2026, szConfigForYear, szEnpfCeilingAt, type SzTaxBand, type SzTaxConfig } from '@/lib/payroll/sz/config';
import { taxYearFor } from '@/lib/payroll/taxYear';

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export function szPeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') return 26;
  return 12;
}

/** Annual tax BEFORE the rebate. */
export function szAnnualTaxBeforeRebate(income: number, bands: SzTaxBand[] = SZ_TAX_CONFIG_2026.bands): number {
  if (income <= 0) return 0;
  for (const b of bands) if (income > b.from && income <= b.to) return b.base + (income - b.from) * b.rate;
  const top = bands[bands.length - 1];
  return top.base + (income - top.from) * top.rate;
}

export function szAnnualTax(income: number, over60 = false, cfg: SzTaxConfig = SZ_TAX_CONFIG_2026): number {
  const rebate = over60 ? cfg.rebate.over60 : cfg.rebate.primary;
  return Math.max(0, szAnnualTaxBeforeRebate(income, cfg.bands) - rebate);
}

export interface SzCalcInput {
  grossPay: number;
  irregularCashThisPeriod?: number;
  freq?: string;
  over60?: boolean;
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
  /** Salary the pension is a percentage of; the 15% deduction cap is on this. Defaults to grossPay. */
  pensionableSalaryPerPeriod?: number;
  enpfExempt?: boolean;
  payDate?: Date;
  config?: SzTaxConfig;
}

export interface SzCalcResult {
  grossPay: number;
  paye: number;
  irregularTax: number;
  annualTaxableIncome: number;
  annualTax: number;
  enpfEmployee: number;
  enpfEmployer: number;
  enpfBase: number;
  enpfCeiling: number;
  enpfCeilingAssumed: boolean;
  pensionEmployee: number;
  pensionEmployer: number;
  /** Employee pension allowed before tax — capped at 15% of pensionable salary. */
  pensionDeductible: number;
  totalDeductions: number;
  netPay: number;
  employerCost: number;
  effectiveTaxRate: number;
  yearStart: number;
}

export function calculateSzPayslip(input: SzCalcInput): SzCalcResult {
  const cfg = input.config ?? SZ_TAX_CONFIG_2026;
  const n = szPeriodsInYear(input.freq);
  const payDate = input.payDate ?? new Date(Date.UTC(cfg.yearStart, 6, 1));
  const gross = Math.max(0, input.grossPay || 0);
  const irregular = Math.max(0, input.irregularCashThisPeriod || 0);

  // ENPF first: it comes off before tax. Recurring and bonus parts kept apart so
  // the bonus is taxed at the margin on its own net-of-ENPF amount.
  const ceilingEntry = szEnpfCeilingAt(payDate, cfg);
  const periodCeiling = (ceilingEntry.ceiling * 12) / n;
  const enpfBaseRecurring = input.enpfExempt ? 0 : Math.min(gross, periodCeiling);
  const enpfBase = input.enpfExempt ? 0 : Math.min(gross + irregular, periodCeiling);
  const enpfEmployee = r2(enpfBase * cfg.enpf.employeeRate);
  const enpfEmployer = r2(enpfBase * cfg.enpf.employerRate);
  const enpfOnRecurring = enpfBaseRecurring * cfg.enpf.employeeRate;
  const enpfOnBonus = enpfBase * cfg.enpf.employeeRate - enpfOnRecurring;

  const pensionEmployee = r2(Math.max(0, input.pensionEmployeePerPeriod || 0));
  const pensionEmployer = r2(Math.max(0, input.pensionEmployerPerPeriod || 0));
  const pensionable = Math.max(0, input.pensionableSalaryPerPeriod ?? gross);
  const pensionDeductible = r2(Math.min(pensionEmployee, pensionable * cfg.pensionDeductionCap));

  const annual = Math.max(0, gross - enpfOnRecurring - pensionDeductible) * n;
  const annualTax = szAnnualTax(annual, !!input.over60, cfg);
  const bonusTaxable = Math.max(0, irregular - enpfOnBonus);
  const irregularTax = bonusTaxable > 0 ? szAnnualTax(annual + bonusTaxable, !!input.over60, cfg) - annualTax : 0;
  const paye = r2(annualTax / n + irregularTax);

  const totalDeductions = r2(paye + enpfEmployee + pensionEmployee);
  const netPay = r2(gross + irregular - totalDeductions);
  const employerCost = r2(gross + irregular + enpfEmployer + pensionEmployer);

  return {
    grossPay: r2(gross), paye, irregularTax: r2(irregularTax),
    annualTaxableIncome: r2(annual), annualTax: r2(annualTax),
    enpfEmployee, enpfEmployer, enpfBase: r2(enpfBase),
    enpfCeiling: ceilingEntry.ceiling, enpfCeilingAssumed: ceilingEntry.assumed,
    pensionEmployee, pensionEmployer, pensionDeductible, totalDeductions, netPay, employerCost,
    effectiveTaxRate: gross + irregular > 0 ? paye / (gross + irregular) : 0,
    yearStart: cfg.yearStart,
  };
}

export function szConfigForPayDate(payDate: Date | string | undefined): SzTaxConfig {
  if (!payDate) return SZ_TAX_CONFIG_2026;
  return szConfigForYear(taxYearFor('SZ', payDate).startYear);
}

export class EswatiniTaxEngine {
  calculate(employee: any, _ps: string, _pe: string, payDate?: string) {
    const comp = employee?.compensation ?? {};
    const sz = employee?.taxInfo?.sz ?? {};
    const pcfg = employee?.deductions?.pension ?? {};
    const basic = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const off = pcfg.enabled === false;
    const r = calculateSzPayslip({
      grossPay: basic + (Number(comp.overtimePay) || 0),
      freq: comp.payFrequency || 'monthly',
      over60: !!sz.over60,
      enpfExempt: !!sz.enpfExempt,
      pensionEmployeePerPeriod: off ? 0 : basic * norm(Number(pcfg.employeePercent ?? 0)),
      pensionEmployerPerPeriod: off ? 0 : basic * norm(Number(pcfg.employerPercent ?? 0)),
      pensionableSalaryPerPeriod: basic,
      payDate: payDate ? new Date(payDate) : undefined,
      config: szConfigForPayDate(payDate),
    });
    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id, employee,
      earnings: { basicSalary: basic, overtimePay: Number(comp.overtimePay) || 0, bonus: 0, grossPay: r.grossPay, taxableIncome: r2(r.annualTaxableIncome / szPeriodsInYear(comp.payFrequency || 'monthly')) },
      deductions: { paye: r.paye, uif: 0, socialSecurity: r.enpfEmployee, pensionFund: r.pensionEmployee, medicalAid: 0, totalDeductions: r.totalDeductions },
      netPay: r.netPay,
      employerCosts: { uif: 0, sdl: 0, socialSecurity: r.enpfEmployer, employerPension: r.pensionEmployer, totalEmployerCost: r.employerCost },
      ytd: { grossPay: (Number(yt.grossPay) || 0) + r.grossPay, paye: (Number(yt.paye) || 0) + r.paye, uif: 0, netPay: (Number(yt.netPay) || 0) + r.netPay },
      taxDetail: { annualTaxableIncome: r.annualTaxableIncome, annualTax: r.annualTax, primaryRebate: 0, secondaryRebate: 0, tertiaryRebate: 0, medicalTaxCredit: 0, effectiveTaxRate: r.effectiveTaxRate, marginalRate: 0 },
      payeBasis: { recurringRemuneration: r.grossPay, irregularIncome: 0, taxWithheld: r.paye },
      szDetail: { enpfBase: r.enpfBase, enpfCeiling: r.enpfCeiling, enpfCeilingAssumed: r.enpfCeilingAssumed, yearStart: r.yearStart },
    };
  }
}

export default EswatiniTaxEngine;
