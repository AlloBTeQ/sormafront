// src/lib/services/payroll/engine/BOTSTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Botswana — BURS (Botswana Unified Revenue Service) PAYE engine.
//
// Thin engine over a pure, deterministic calc so the process route, the run page
// and the BURS returns can never diverge. Mirrors ZATaxEngine's `calculate(...)`
// contract and emits the SAME field names toPayslipEntry() normalises
// (deductions.paye, deductions.pensionFund, employerCosts.*, earnings.grossPay…).
//
// TAX YEAR 2026/27 (from 1 July 2026). Key facts:
//   • Progressive PAYE, tax year 1 Jul – 30 Jun, currency BWP.
//   • NEW top band: taxable income over P400,000/yr → 27.5% (was 25%),
//     enacted effective 1 July 2026.
//   • Residents: P48,000/yr tax-free threshold. Non-residents: taxed from the
//     first Pula (5%), NO tax-free threshold, separate bracket table.
//   • NO mandatory employer payroll levy (no UIF/SDL analogue). The Vocational
//     Training Levy is turnover-based, not payroll — so employer cost is just
//     gross + any pension match.
//   • Employee pension contributions are tax-deductible, capped at 15% of
//     remuneration / P60,000 p.a. Medical aid is treated as a POST-TAX deduction
//     (Botswana has no medical tax credit) — flagged for confirmation.
// ─────────────────────────────────────────────────────────────────────────────

import { bwMonthlyTaxableBenefits } from '@/lib/payroll/bw/benefits';

export interface BwTaxBracket { from: number; to: number; rate: number; base: number; }

export interface BwTaxConfig {
  taxYear: string;
  taxYearStart: string;
  taxYearEnd: string;
  residentBrackets: BwTaxBracket[];
  nonResidentBrackets: BwTaxBracket[];
  taxFreeThreshold: number;              // residents only
  pension: { maxDeductibleRate: number; maxAnnualDeduction: number };
  gratuity: { taxFreeLimit: number };
  medicalAidDeductible: boolean;         // false = post-tax (current assumption)
}

// PAYE tables effective 1 July 2026 (BWP, ANNUAL). tax = base + (income-from)*rate
// for  from < income <= to.  Verified against PwC (Jan 2026) + RSM/Mmegi (Jul 2026
// reform introducing the 27.5% band above P400,000).
export const BW_TAX_CONFIG_2026_27: BwTaxConfig = {
  taxYear: '2026/27',
  taxYearStart: 'July 2026',
  taxYearEnd: 'June 2027',
  residentBrackets: [
    { from: 0,      to: 48000,    rate: 0,      base: 0 },
    { from: 48000,  to: 84000,    rate: 0.05,   base: 0 },
    { from: 84000,  to: 120000,   rate: 0.125,  base: 1800 },
    { from: 120000, to: 156000,   rate: 0.1875, base: 6300 },
    { from: 156000, to: 400000,   rate: 0.25,   base: 13050 },
    { from: 400000, to: Infinity, rate: 0.275,  base: 74050 },
  ],
  nonResidentBrackets: [
    { from: 0,      to: 84000,    rate: 0.05,   base: 0 },
    { from: 84000,  to: 120000,   rate: 0.125,  base: 4200 },
    { from: 120000, to: 156000,   rate: 0.1875, base: 8700 },
    { from: 156000, to: 400000,   rate: 0.25,   base: 15450 },
    { from: 400000, to: Infinity, rate: 0.275,  base: 76450 },
  ],
  taxFreeThreshold: 48000,
  pension: { maxDeductibleRate: 0.15, maxAnnualDeduction: 60000 },
  gratuity: { taxFreeLimit: 48000 },
  medicalAidDeductible: false,
};

function periodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly') return 26;
  return 12;
}

/** Annual PAYE from a bracket table (progressive, marginal). Pure. */
export function bwAnnualTax(annualTaxable: number, brackets: BwTaxBracket[]): number {
  if (annualTaxable <= 0) return 0;
  for (const b of brackets) {
    if (annualTaxable > b.from && annualTaxable <= b.to) {
      return b.base + (annualTaxable - b.from) * b.rate;
    }
  }
  const top = brackets[brackets.length - 1];
  return top.base + (annualTaxable - top.from) * top.rate;
}

export interface BwCalcInput {
  monthlyGross: number;              // CASH per period: basic + cash allowances
  isResident: boolean;
  pensionEmployeePerPeriod: number;
  pensionEmployerPerPeriod: number;
  medicalAidPerPeriod: number;
  freq: string;                      // 'monthly' | 'weekly' | 'fortnightly'
  config?: BwTaxConfig;
  // ── Enrichments (Income Tax Act CAP 52:01). All optional; 0/undefined ⇒ prior behaviour.
  /** Recurring taxable benefits-in-kind per period (housing s32(3), car, loan s32(1)(e)).
   *  Taxable but NON-CASH: they raise PAYE, they do NOT reduce take-home pay. */
  taxableBenefitsPerPeriod?: number;
  /** One-off CASH paid this period (bonus, gratuity paid out) — added to net cash. */
  irregularCashThisPeriod?: number;
  /** Taxable portion of the one-off this period (e.g. gratuity 2/3, s32(7)); taxed at the
   *  MARGINAL rate on top of annualised recurring income, and NOT itself annualised. */
  irregularTaxableThisPeriod?: number;
}

export interface BwCalcResult {
  grossPay: number;            // cash gross this period
  taxableIncome: number;       // this period, recurring taxable (after deductible pension)
  taxableBenefits: number;     // this period, non-cash taxable BIK
  paye: number;                // this period (recurring + irregular marginal)
  pension: number;             // employee contribution actually withheld
  medicalAid: number;
  totalDeductions: number;
  netPay: number;
  employerPension: number;
  annualTaxableIncome: number;
  annualTax: number;           // annual tax on recurring income
  irregularTax: number;        // PAYE attributable to the one-off this period
  effectiveTaxRate: number;
}

/** Deterministic, pure Botswana per-period payslip calc. Benefits + gratuity aware. */
export function calculateBwPayslip(input: BwCalcInput): BwCalcResult {
  const cfg = input.config ?? BW_TAX_CONFIG_2026_27;
  const n = periodsInYear(input.freq);
  const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

  const cashGross = Math.max(0, input.monthlyGross);
  const benefits = Math.max(0, input.taxableBenefitsPerPeriod ?? 0);
  const recurringTaxableGrossPeriod = cashGross + benefits;           // employment income (taxable) per period
  const annualEmploymentIncome = recurringTaxableGrossPeriod * n;

  // Tax-deductible pension: 15% of earned income (s-based) and the config cap (if set > 0).
  const pensionActualAnnual = Math.max(0, input.pensionEmployeePerPeriod) * n;
  const capParts = [pensionActualAnnual, cfg.pension.maxDeductibleRate * annualEmploymentIncome];
  if (cfg.pension.maxAnnualDeduction && cfg.pension.maxAnnualDeduction > 0) capParts.push(cfg.pension.maxAnnualDeduction);
  const pensionDeductibleAnnual = Math.min(...capParts);

  const brackets = input.isResident ? cfg.residentBrackets : cfg.nonResidentBrackets;

  const annualRecurringTaxable = Math.max(0, annualEmploymentIncome - pensionDeductibleAnnual);
  const taxRecurringAnnual = bwAnnualTax(annualRecurringTaxable, brackets);
  const payeRecurringPeriod = taxRecurringAnnual / n;

  // Irregular (bonus / taxable gratuity): marginal tax on top of the recurring annual base.
  const irregularTaxable = Math.max(0, input.irregularTaxableThisPeriod ?? 0);
  const irregularTax = irregularTaxable > 0
    ? bwAnnualTax(annualRecurringTaxable + irregularTaxable, brackets) - taxRecurringAnnual
    : 0;

  const paye = r2(payeRecurringPeriod + irregularTax);
  const pension = r2(Math.max(0, input.pensionEmployeePerPeriod));
  const medicalAid = r2(Math.max(0, input.medicalAidPerPeriod));
  const irregularCash = r2(Math.max(0, input.irregularCashThisPeriod ?? 0));

  // Net cash: benefits are non-cash, so they never reduce take-home.
  const totalDeductions = r2(paye + pension + medicalAid);
  const netPay = r2(cashGross + irregularCash - totalDeductions);

  return {
    grossPay: r2(cashGross),
    taxableIncome: r2(annualRecurringTaxable / n),
    taxableBenefits: r2(benefits),
    paye,
    pension,
    medicalAid,
    totalDeductions,
    netPay,
    employerPension: r2(Math.max(0, input.pensionEmployerPerPeriod)),
    annualTaxableIncome: r2(annualRecurringTaxable),
    annualTax: r2(taxRecurringAnnual),
    irregularTax: r2(irregularTax),
    effectiveTaxRate: (cashGross + benefits) > 0 ? paye / (cashGross + benefits) : 0,
  };
}

export class BotswanaTaxEngine {
  private config: BwTaxConfig;
  constructor(config: BwTaxConfig = BW_TAX_CONFIG_2026_27) { this.config = config; }
  getConfig(): BwTaxConfig { return this.config; }

  /**
   * Matches ZATaxEngine.calculate's positional contract. `levyLiable` is accepted
   * for signature-parity but unused (Botswana has no employer payroll levy).
   */
  calculate(employee: any, _periodStart: string, _periodEnd: string, _payDate: string, _levyLiable = false) {
    const comp = employee?.compensation ?? {};
    const ded = employee?.deductions ?? {};
    const bw = employee?.taxInfo?.bw ?? {};

    const basicSalary      = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const travelAllowance  = Number(comp.travelAllowance)  || 0;
    const housingAllowance = Number(comp.housingAllowance) || 0;
    const otherAllowances  = Number(comp.otherAllowances)  || 0;
    const grossPay = basicSalary + travelAllowance + housingAllowance + otherAllowances;

    const isResident = bw.isResident !== undefined ? !!bw.isResident : true;
    const freq = comp.payFrequency || 'monthly';
    const periods = freq === 'weekly' ? 52 : (freq === 'fortnightly' || freq === 'bi_weekly') ? 26 : 12;

    // Pension is stored on the model as deductions.pension.{employeePercent,employerPercent}
    // (a percentage). Normalise (accepts 5 or 0.05) → a per-period amount.
    const pcfg = ded.pension ?? {};
    const pOut = pcfg.enabled === false;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const pensionEmp = pOut ? 0 : grossPay * norm(Number(pcfg.employeePercent ?? ded.pensionFundEmployee ?? 0));
    const pensionEr  = pOut ? 0 : grossPay * norm(Number(pcfg.employerPercent ?? 0));

    const r = calculateBwPayslip({
      monthlyGross: grossPay,
      isResident,
      pensionEmployeePerPeriod: pensionEmp,
      pensionEmployerPerPeriod: pensionEr,
      medicalAidPerPeriod: Number(ded.medicalAidEmployee) || 0,
      freq,
      taxableBenefitsPerPeriod: bwMonthlyTaxableBenefits(bw, periods),
      config: this.config,
    });

    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id,
      employee,
      earnings: {
        basicSalary, travelAllowance, housingAllowance, otherAllowances,
        overtimePay: 0, bonus: 0,
        grossPay: r.grossPay,
        taxableIncome: r.taxableIncome,
      },
      deductions: {
        paye: r.paye,
        uif: 0,
        pensionFund: r.pension,
        medicalAid: r.medicalAid,
        totalDeductions: r.totalDeductions,
      },
      netPay: r.netPay,
      employerCosts: {
        uif: 0,
        sdl: 0,
        employerPension: r.employerPension,
        totalEmployerCost: Math.round((r.grossPay + r.employerPension) * 100) / 100,
      },
      ytd: {
        grossPay: (Number(yt.grossPay) || 0) + r.grossPay,
        paye:     (Number(yt.paye) || 0) + r.paye,
        uif:      0,
        netPay:   (Number(yt.netPay) || 0) + r.netPay,
      },
      taxDetail: {
        annualTaxableIncome: r.annualTaxableIncome,
        annualTax: r.annualTax,
        primaryRebate: 0,
        secondaryRebate: 0,
        tertiaryRebate: 0,
        medicalTaxCredit: 0,
        effectiveTaxRate: r.effectiveTaxRate,
        marginalRate: 0,
      },
      payeBasis: {
        recurringRemuneration: r.grossPay,
        irregularIncome: 0,
        taxWithheld: r.paye,
      },
    };
  }
}

export default BotswanaTaxEngine;
