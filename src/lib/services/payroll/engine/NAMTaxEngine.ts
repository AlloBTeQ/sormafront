// src/lib/services/payroll/engine/NAMTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Namibia — NamRA PAYE, Social Security Commission and VET levy.
//
// A thin engine over one pure calc, so the process route, the run builder and
// the returns cannot diverge — the same shape as ZAMTaxEngine.
//
// YEAR OF ASSESSMENT 1 March – end February. Key facts (memos/NA-RECON-1.md):
//   • PAYE: annual bands, nil to N$100,000, 18% → 37%. NO rebates of any kind.
//   • Pension / provident / RA / education-policy contributions are deductible
//     under ONE N$150,000 annual cap. Medical aid is not deductible.
//   • SSC: 0.9% + 0.9% of the BASIC wage, floor N$500, ceiling by pay date
//     (N$11,000 → N$12,500 on 1 Sep 2026 → N$14,000 on 1 Mar 2027 …).
//   • VET levy: 1% of remuneration, employer only, and only when the employer's
//     annual payroll is N$1m or more. The employer decides that, not the
//     employee, so it arrives as a flag (`vetLiable`), never inferred here.
//   • Employees' Compensation Fund: annual employer assessment. Not a payslip line.
//
// Bonuses: taxed at the margin on top of annualised recurring pay (tax with −
// tax without), not themselves annualised. Checked 2026-10-21: NamRA says
// employees' tax is withheld on the "balance of remuneration", remuneration
// includes bonuses, and no separate bonus method is published (Sage Namibia
// client guide; NamRA employer brochure). The margin method is the accurate
// reading of that: the year's tax on pay-plus-bonus, less the tax on pay.
// ─────────────────────────────────────────────────────────────────────────────

import {
  NA_TAX_CONFIG_2026,
  naConfigForYear,
  naSscCeilingAt,
  type NaTaxBand,
  type NaTaxConfig,
} from '@/lib/payroll/na/config';
import { taxYearFor } from '@/lib/payroll/taxYear';

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

/** Pay periods in a year. */
export function naPeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') return 26;
  return 12;
}

/** Annual tax on an annual taxable income. Pure. */
export function naAnnualTax(annualTaxable: number, bands: NaTaxBand[] = NA_TAX_CONFIG_2026.bands): number {
  if (annualTaxable <= 0) return 0;
  for (const b of bands) {
    if (annualTaxable > b.from && annualTaxable <= b.to) return b.base + (annualTaxable - b.from) * b.rate;
  }
  const top = bands[bands.length - 1];
  return top.base + (annualTaxable - top.from) * top.rate;
}

export interface NaCalcInput {
  /** Basic wage for the period. The SSC base — keep it distinct from allowances. */
  basicSalary: number;
  /** Taxable cash allowances for the period. In gross, not in the SSC base. */
  allowances?: number;
  /** Recurring commission / overtime for the period. */
  recurringExtra?: number;
  /** One-off taxable cash this period (bonus). Taxed at the margin. */
  irregularCashThisPeriod?: number;
  freq?: string;
  /** Employee's pension / provident fund contribution for the period. */
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
  /** Retirement annuity and education-policy premiums for the period. Share the pension cap. */
  otherRetirementPerPeriod?: number;
  /** Pay date — picks the SSC ceiling and the year's table. Defaults to 1 Mar of the config year. */
  payDate?: Date;
  /** Employer's annual payroll is N$1m or more. Decided at run level. */
  vetLiable?: boolean;
  sscExempt?: boolean;
  config?: NaTaxConfig;
  /**
   * Fringe benefits for the period (na/benefits.ts): non-cash taxable value
   * after any approved-housing-scheme reduction. Taxed, never paid out.
   */
  benefitsInKindTaxable?: number;
  /** Exempt third of a cash housing allowance under an approved scheme. */
  cashHousingExempt?: number;
  /**
   * Payment in kind for the SSC basic wage. Reg 1 defines basic wage as money
   * remuneration "including the cash equivalent of payment in kind".
   */
  inKindForSsc?: number;
}

export interface NaCalcResult {
  grossPay: number;
  basicSalary: number;
  paye: number;
  /** PAYE on recurring pay only, for the period. */
  payeRecurring: number;
  /** Extra PAYE caused by the irregular payment. */
  irregularTax: number;
  retirementDeductible: number;
  retirementDisallowed: number;
  annualTaxableIncome: number;
  annualTax: number;
  sscEmployee: number;
  sscEmployer: number;
  sscBase: number;
  sscCapped: boolean;
  sscCeiling: number;
  /** True when the pay date precedes every SSC ceiling we hold. */
  sscCeilingAssumed: boolean;
  vetLevy: number;
  pensionEmployee: number;
  pensionEmployer: number;
  otherRetirement: number;
  totalDeductions: number;
  netPay: number;
  totalEmployerContributions: number;
  employerCost: number;
  effectiveTaxRate: number;
  yearStart: number;
  /** Taxable income for the period: cash + benefits − exemptions − retirement allowed. */
  taxableIncome: number;
}

/** Deterministic, pure Namibian per-period payslip calc. */
export function calculateNaPayslip(input: NaCalcInput): NaCalcResult {
  const cfg = input.config ?? NA_TAX_CONFIG_2026;
  const n = naPeriodsInYear(input.freq);
  const payDate = input.payDate ?? new Date(Date.UTC(cfg.yearStart, 2, 1));

  const basic = Math.max(0, input.basicSalary || 0);
  const allowances = Math.max(0, input.allowances || 0);
  const recurringExtra = Math.max(0, input.recurringExtra || 0);
  const irregular = Math.max(0, input.irregularCashThisPeriod || 0);

  const grossPay = basic + allowances + recurringExtra;

  // ── Retirement deductions under the shared annual cap ─────────────────────
  const pensionEmployee = Math.max(0, input.pensionEmployeePerPeriod || 0);
  const otherRetirement = Math.max(0, input.otherRetirementPerPeriod || 0);
  const capPerPeriod = cfg.deductions.retirementAnnualCap / n;
  const claimed = pensionEmployee + otherRetirement;
  const retirementDeductible = Math.min(claimed, capPerPeriod);

  // ── PAYE ─────────────────────────────────────────────────────────────────
  const inKind = Math.max(0, input.benefitsInKindTaxable || 0);
  const cashExempt = Math.max(0, input.cashHousingExempt || 0);
  const recurringTaxable = Math.max(0, grossPay + inKind - cashExempt - retirementDeductible);
  const annualRecurring = recurringTaxable * n;
  const annualTax = naAnnualTax(annualRecurring, cfg.bands);
  const payeRecurring = annualTax / n;
  const irregularTax = irregular > 0
    ? naAnnualTax(annualRecurring + irregular, cfg.bands) - annualTax
    : 0;
  const paye = r2(payeRecurring + irregularTax);

  // ── SSC: 0.9% each side of the basic wage, floor and dated ceiling ────────
  const ceilingEntry = naSscCeilingAt(payDate, cfg);
  const periodCeiling = (ceilingEntry.ceiling * 12) / n;
  const periodFloor = (cfg.ssc.monthlyFloor * 12) / n;
  const sscCapped = !input.sscExempt && basic + Math.max(0, input.inKindForSsc || 0) > periodCeiling;
  const sscWage = basic + Math.max(0, input.inKindForSsc || 0);
  const sscBase = input.sscExempt || sscWage <= 0 ? 0 : Math.min(Math.max(sscWage, periodFloor), periodCeiling);
  const sscEmployee = r2(sscBase * cfg.ssc.employeeRate);
  const sscEmployer = r2(sscBase * cfg.ssc.employerRate);

  // ── VET levy: employer only, on remuneration, only for liable employers ───
  const vetLevy = input.vetLiable ? r2((grossPay + irregular) * cfg.vetLevy.rate) : 0;

  const pensionEmployer = r2(Math.max(0, input.pensionEmployerPerPeriod || 0));

  const totalDeductions = r2(paye + sscEmployee + pensionEmployee + otherRetirement);
  const netPay = r2(grossPay + irregular - totalDeductions);
  const totalEmployerContributions = r2(sscEmployer + vetLevy + pensionEmployer);
  const employerCost = r2(grossPay + irregular + totalEmployerContributions);
  const taxed = grossPay + irregular;

  return {
    grossPay: r2(grossPay),
    basicSalary: r2(basic),
    paye,
    payeRecurring: r2(payeRecurring),
    irregularTax: r2(irregularTax),
    retirementDeductible: r2(retirementDeductible),
    retirementDisallowed: r2(claimed - retirementDeductible),
    annualTaxableIncome: r2(annualRecurring),
    annualTax: r2(annualTax),
    sscEmployee,
    sscEmployer,
    sscBase: r2(sscBase),
    sscCapped,
    sscCeiling: ceilingEntry.ceiling,
    sscCeilingAssumed: ceilingEntry.assumed,
    vetLevy,
    pensionEmployee: r2(pensionEmployee),
    pensionEmployer,
    otherRetirement: r2(otherRetirement),
    totalDeductions,
    netPay,
    totalEmployerContributions,
    employerCost,
    effectiveTaxRate: taxed > 0 ? paye / taxed : 0,
    yearStart: cfg.yearStart,
    taxableIncome: r2(recurringTaxable + irregular),
  };
}

/** Config for the year of assessment containing a pay date. */
export function naConfigForPayDate(payDate: Date | string | undefined): NaTaxConfig {
  if (!payDate) return NA_TAX_CONFIG_2026;
  return naConfigForYear(taxYearFor('NA', payDate).startYear);
}

export class NamibiaTaxEngine {
  calculate(employee: any, _periodStart: string, _periodEnd: string, payDate?: string, levyLiable = false) {
    const comp = employee?.compensation ?? {};
    const ded = employee?.deductions ?? {};
    const na = employee?.taxInfo?.na ?? {};

    const basicSalary = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const allowances =
      (Number(comp.housingAllowance) || 0) + (Number(comp.transportAllowance) || 0) +
      (Number(comp.mealAllowance ?? comp.lunchAllowance) || 0) + (Number(comp.otherAllowances) || 0);

    const pcfg = ded.pension ?? {};
    const pensionOff = pcfg.enabled === false;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const pensionEmp = pensionOff ? 0 : basicSalary * norm(Number(pcfg.employeePercent ?? 0));
    const pensionEr = pensionOff ? 0 : basicSalary * norm(Number(pcfg.employerPercent ?? 0));

    const r = calculateNaPayslip({
      basicSalary,
      allowances,
      recurringExtra: Number(comp.overtimePay) || 0,
      freq: comp.payFrequency || 'monthly',
      pensionEmployeePerPeriod: pensionEmp,
      pensionEmployerPerPeriod: pensionEr,
      otherRetirementPerPeriod: Number(na.retirementAnnuityPerPeriod) || 0,
      payDate: payDate ? new Date(payDate) : undefined,
      vetLiable: levyLiable,
      sscExempt: !!na.sscExempt,
      config: naConfigForPayDate(payDate),
    });

    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id,
      employee,
      earnings: {
        basicSalary,
        allowances,
        overtimePay: Number(comp.overtimePay) || 0,
        bonus: 0,
        grossPay: r.grossPay,
        taxableIncome: r.grossPay - r.retirementDeductible,
      },
      deductions: {
        paye: r.paye,
        uif: 0,
        socialSecurity: r.sscEmployee,
        pensionFund: r.pensionEmployee + r.otherRetirement,
        medicalAid: 0,
        totalDeductions: r.totalDeductions,
      },
      netPay: r.netPay,
      employerCosts: {
        uif: 0,
        // The VET levy rides the generic training-levy slot, as SDL and ZIMDEF do.
        sdl: r.vetLevy,
        socialSecurity: r.sscEmployer,
        employerPension: r.pensionEmployer,
        totalEmployerCost: r.employerCost,
      },
      ytd: {
        grossPay: (Number(yt.grossPay) || 0) + r.grossPay,
        paye: (Number(yt.paye) || 0) + r.paye,
        uif: 0,
        netPay: (Number(yt.netPay) || 0) + r.netPay,
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
      payeBasis: { recurringRemuneration: r.grossPay, irregularIncome: 0, taxWithheld: r.paye },
      naDetail: {
        sscBase: r.sscBase,
        sscCeiling: r.sscCeiling,
        sscCapped: r.sscCapped,
        sscCeilingAssumed: r.sscCeilingAssumed,
        retirementDisallowed: r.retirementDisallowed,
        yearStart: r.yearStart,
      },
    };
  }
}

export default NamibiaTaxEngine;
