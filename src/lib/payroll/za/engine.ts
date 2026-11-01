// src/lib/payroll/za/engine.ts
// THE single source of truth for South-African monthly payroll calculation.
//
// Pure & table-driven: it reads the year-keyed statutory figures from
// src/config/za-tax-tables.ts (update those yearly; never hard-code here) and imports
// nothing server-only, so the SAME function powers the run-page breakdown (client), the
// create/preview/process APIs (server), the payslip, and the IRP5 feed. If they all call
// this, they can never disagree.
//
// Rules implemented (per user spec):
//   • Medical aid  — OPT-IN. Credit applied only when the employee is actually enrolled.
//   • Pension/RA   — OPT-IN, pre-tax, capped at retirement.maxPercent / retirement.maxAnnual.
//   • SDL          — employer-only, and ONLY when the ENTITY is SDL-liable
//                    (total annual payroll > sdl.annualThreshold, i.e. R500,000).
//   • UIF          — 1% employee + 1% employer, capped at the monthly ceiling.
//   • Custom lines — additionalIncome[] / additionalDeductions[], each carrying a SARS
//                    source code, folded into gross / taxable / net per their flags.

import { getZaTaxTables, ZA_TAX_TABLES, type ZaTaxTable } from '@/config/za-tax-tables';
import { isIrregularIncomeCode } from '@/config/za-source-codes';

/** A custom income or deduction line an employer adds to an employee's pay. */
export interface ZaLineItem {
  description: string;
  /** Monthly Rand amount. */
  amount: number;
  /** SARS IRP5 source code (required — see src/config/za-source-codes.ts). */
  sourceCode: string;
  /** Income: enters TAXABLE gross. Deduction: ignored. */
  taxable?: boolean;
  /** Income: enters the PAYE base. Deduction: ignored. */
  payeBearing?: boolean;
  /** Deduction: reduces taxable income before PAYE (pre-tax). Income: ignored. */
  preTax?: boolean;
  /**
   * Income: marks this line as IRREGULAR (bonus / once-off) so it is taxed in full but
   * added AFTER annualisation instead of being scaled ×periods by the Fourth-Schedule
   * averaging. When omitted, irregularity is derived from `sourceCode` (see
   * `isIrregularIncomeCode`, e.g. 3605 = annual payment/bonus). Deduction: ignored.
   */
  irregular?: boolean;
}

export interface ZaPayslipInput {
  /** Year of assessment (e.g. 2026 = 1 Mar 2025–28 Feb 2026). Defaults to the latest shipped table. */
  yearOfAssessment?: number;
  /** Monthly basic gross salary. */
  basicSalary: number;
  /** Age at pay date — drives age-based rebates. Defaults to 35 (under-65). */
  age?: number;
  /** Opt-in medical aid; `members` = total lives covered (main + dependants). Null/absent ⇒ no credit. */
  medicalAid?: { members: number } | null;
  /** Opt-in retirement contribution (employee). Use `amount` (fixed) or `percent` of pensionable pay. */
  pension?: { percent?: number; amount?: number } | null;
  /** Employer retirement contribution as a % of pensionable pay. */
  employerPensionPercent?: number;
  /** Custom taxable/non-taxable income lines (allowances, bonuses, fringe benefits). */
  additionalIncome?: ZaLineItem[];
  /** Custom deduction lines (pre- or post-tax), each source-coded. */
  additionalDeductions?: ZaLineItem[];
  /** UIF contributor (default true). False ⇒ no UIF (e.g. certain directors / >65 exemptions). */
  uifContributor?: boolean;
  /** Entity-level context: the employer is SDL-liable only above the payroll threshold. */
  entity?: { sdlLiable?: boolean };
  /**
   * Cumulative YTD figures for this employee, this YOA, EXCLUDING the current period being
   * calculated — i.e. the state BEFORE this run. Drives correct SARS Fourth-Schedule PAYE
   * averaging (self-correcting for mid-year hires, raises, bonuses). Omitting it computes
   * as the FIRST period of the year (all priors zero) — mathematically identical to the
   * old flat method for a genuine period 1, but a caller that omits it for a LATER period
   * silently understates the averaging; §4 callers must always supply it (see brief).
   */
  ytdCumulative?: {
    /** Cumulative recurring monthly TAXABLE remuneration (PAYE base, post pre-tax
     *  deductions) so far this YOA — the figure that gets annualised. */
    recurringRemuneration: number;
    /** Cumulative irregular income (bonuses / once-offs) so far this YOA — added flat,
     *  never annualised. */
    irregularIncome: number;
    /** Cumulative PAYE already withheld so far this YOA. */
    taxWithheld: number;
    /** Number of pay periods already run this YOA, BEFORE this one. */
    periodsWorked: number;
  };
  /** Total pay periods in the tax year for this employee's frequency (12 for monthly,
   *  52 weekly, 26 fortnightly). Defaults to 12. Used by the averaging formula. */
  periodsInYear?: number;
  /**
   * Share of this pay period the employee was employed for (0 < f ≤ 1; default 1).
   * A mid-period starter or leaver is paid `basicSalary` ALREADY PRORATED by the caller
   * (lib/payroll/proration.ts); this tells the averaging that the period was partial, so
   * the prorated pay is annualised over the fraction actually worked instead of being
   * read as a full month at a lower salary (which under-withholds), and only that
   * fraction of a period's tax accrues.
   */
  periodFraction?: number;
}

export interface ZaPayslipResult {
  yearOfAssessment: number;
  grossPay: number;
  taxableIncome: number;
  paye: number;
  medicalCredit: number;
  uif: number;
  employerUif: number;
  sdl: number;
  pension: number;
  employerPension: number;
  additionalIncome: ZaLineItem[];
  additionalDeductions: ZaLineItem[];
  totalDeductions: number;
  netPay: number;
  employerCosts: { pension: number; uif: number; sdl: number; total: number };
  /**
   * This period's PAYE-averaging basis — the exact figures the NEXT period must add to
   * its `ytdCumulative`. Persist these on the payslip so the YTD write path can accumulate
   * them without re-deriving (and independent of the payslip's deduction-field shape).
   */
  payeBasis: {
    /** Recurring taxable remuneration this period (post pension / pre-tax deductions). */
    recurringRemuneration: number;
    /** Irregular (bonus / once-off) taxable income this period. */
    irregularIncome: number;
    /** PAYE withheld this period. */
    taxWithheld: number;
    /** Periods this payslip adds to `periodsWorked` — 1, or the fraction of a partial period. */
    periodsWorked: number;
  };
}

/** Minimal shape of a persisted `ytdByYear` bucket that the averaging needs to read. */
export interface ZaYtdBucketLike {
  incomeTax?: number;
  recurringRemuneration?: number;
  irregularIncome?: number;
  periodsWorked?: number;
}

/**
 * Read one year-of-assessment bucket from an `Employee.ytdByYear` value, tolerating both
 * a hydrated Mongoose Map and a `.lean()` plain object. Returns undefined when absent
 * (⇒ the caller passes no `ytdCumulative`, i.e. period 1).
 */
export function readYtdBucket(
  ytdByYear: unknown,
  yearOfAssessment: number | string,
): ZaYtdBucketLike | undefined {
  if (!ytdByYear) return undefined;
  const key = String(yearOfAssessment);
  if (ytdByYear instanceof Map) return ytdByYear.get(key) as ZaYtdBucketLike | undefined;
  return (ytdByYear as Record<string, ZaYtdBucketLike>)[key];
}

/**
 * Shape a `ytdByYear` bucket into `ZaPayslipInput.ytdCumulative`. THE single documented
 * home for the bucket→cumulative field mapping (PAYROLL-FIX-2 §4): `taxWithheld` maps from
 * the bucket's `incomeTax`; the recurring/irregular split maps from dedicated bucket fields
 * persisted by the YTD write path (not derivable from `grossPay`). Returns undefined for an
 * absent bucket so the engine computes period 1.
 */
export function ytdCumulativeFromBucket(
  bucket: ZaYtdBucketLike | undefined | null,
): NonNullable<ZaPayslipInput['ytdCumulative']> | undefined {
  if (!bucket) return undefined;
  return {
    recurringRemuneration: bucket.recurringRemuneration ?? 0,
    irregularIncome: bucket.irregularIncome ?? 0,
    taxWithheld: bucket.incomeTax ?? 0,
    periodsWorked: bucket.periodsWorked ?? 0,
  };
}

const r2 = (n: number) => Math.round(((n || 0) + Number.EPSILON) * 100) / 100;

/** The latest year of assessment for which a table has shipped. */
export function latestZaYearOfAssessment(): number {
  return Math.max(...Object.keys(ZA_TAX_TABLES).map(Number));
}

/** Annual PAYE from the bracket table (before rebates/credits). */
function annualTaxFromBrackets(annualTaxable: number, table: ZaTaxTable): number {
  if (annualTaxable <= 0) return 0;
  for (const b of table.brackets) {
    if (annualTaxable > b.from && annualTaxable <= b.to) {
      return b.base + (annualTaxable - b.from) * b.rate;
    }
  }
  // Above the top bracket's finite `from` but `to` is Infinity — handled by the loop;
  // this is a safety fallback for the top bracket.
  const top = table.brackets[table.brackets.length - 1];
  return top.base + (annualTaxable - top.from) * top.rate;
}

/** Age-based total rebate for the year. */
function rebateForAge(age: number, table: ZaTaxTable): number {
  let rebate = table.rebates.primary;
  if (age >= 65) rebate += table.rebates.secondary;
  if (age >= 75) rebate += table.rebates.tertiary;
  return rebate;
}

/** Monthly medical scheme fees tax credit for a given number of members (0 ⇒ 0). */
function monthlyMedicalCredit(members: number, table: ZaTaxTable): number {
  if (!members || members < 1) return 0;
  const { mainMember, firstDependant, additionalDependant } = table.medicalCredit;
  let credit = mainMember;
  if (members >= 2) credit += firstDependant;
  if (members > 2) credit += (members - 2) * additionalDependant;
  return credit;
}

/**
 * Compute a full ZA monthly payslip from the statutory tables. Deterministic and pure.
 */
export function calculateZaPayslip(input: ZaPayslipInput): ZaPayslipResult {
  const yoa = input.yearOfAssessment ?? latestZaYearOfAssessment();
  const table = getZaTaxTables(yoa);
  const age = input.age ?? 35;

  const basic = input.basicSalary || 0;
  const addIncome = input.additionalIncome ?? [];
  const addDeductions = input.additionalDeductions ?? [];

  // ── Income ──
  // A PAYE-bearing income line is irregular (bonus/once-off) when explicitly flagged, or
  // when its SARS source code says so (e.g. 3605). Irregular income is taxed but excluded
  // from the recurring-pay annualisation below.
  const isLineIrregular = (l: ZaLineItem) => l.irregular ?? isIrregularIncomeCode(l.sourceCode);
  const payeBearingIncome = addIncome.filter((l) => l.taxable !== false && l.payeBearing !== false);
  const incomeTaxablePayeRecurring = payeBearingIncome
    .filter((l) => !isLineIrregular(l))
    .reduce((s, l) => s + (l.amount || 0), 0);
  const incomeTaxablePayeIrregular = payeBearingIncome
    .filter((l) => isLineIrregular(l))
    .reduce((s, l) => s + (l.amount || 0), 0);
  const incomeTaxablePaye = incomeTaxablePayeRecurring + incomeTaxablePayeIrregular;
  const incomeOther = addIncome
    .filter((l) => !(l.taxable !== false && l.payeBearing !== false))
    .reduce((s, l) => s + (l.amount || 0), 0);

  const grossPay = basic + incomeTaxablePaye + incomeOther;
  // Pensionable / remuneration base for retirement + the PAYE base (taxable portion).
  const remuneration = basic + incomeTaxablePaye;

  // ── Retirement (employee) — pre-tax, capped ──
  const rawPension = input.pension
    ? (input.pension.amount ?? (remuneration * ((input.pension.percent ?? 0) / 100)))
    : 0;
  const pensionCapMonthly = Math.min(
    remuneration * table.retirement.maxPercent,
    table.retirement.maxAnnual / 12,
  );
  const pension = Math.min(rawPension, pensionCapMonthly);

  const employerPension = input.employerPensionPercent
    ? remuneration * (input.employerPensionPercent / 100)
    : 0;

  // Pre-tax custom deductions also reduce taxable income.
  const preTaxDeductions = addDeductions
    .filter((l) => l.preTax)
    .reduce((s, l) => s + (l.amount || 0), 0);

  // ── PAYE (SARS Fourth-Schedule cumulative averaging) ──
  // Pension + pre-tax deductions are recurring monthly reductions, so they reduce the
  // RECURRING taxable base; irregular (bonus) income is taxed in full and added after
  // annualisation so it is never scaled as if it recurs every period.
  const recurringTaxableThisPeriod = Math.max(
    0,
    (basic + incomeTaxablePayeRecurring) - pension - preTaxDeductions,
  );
  const irregularTaxableThisPeriod = incomeTaxablePayeIrregular;
  // Displayed/period taxable income (parity with the old figure when no irregular lines).
  const monthlyTaxable = recurringTaxableThisPeriod + irregularTaxableThisPeriod;

  // Cumulative YTD state BEFORE this period (all zero ⇒ this is period 1, which reduces
  // to the old flat calculation when there is no irregular income). See §3 of the brief:
  // omitting ytdCumulative for a LATER period silently understates — callers must supply it.
  const periodsInYear = input.periodsInYear ?? 12;
  const priorPeriods = input.ytdCumulative?.periodsWorked ?? 0;
  const rawFraction = input.periodFraction ?? 1;
  const periodFraction = Number.isFinite(rawFraction) && rawFraction > 0 ? Math.min(1, rawFraction) : 1;
  const periodsToDate = priorPeriods + periodFraction;
  const priorRecurring = input.ytdCumulative?.recurringRemuneration ?? 0;
  const priorIrregular = input.ytdCumulative?.irregularIncome ?? 0;
  const priorWithheld = input.ytdCumulative?.taxWithheld ?? 0;

  const medicalCredit = input.medicalAid
    ? monthlyMedicalCredit(input.medicalAid.members, table)
    : 0;

  /** Annual tax on a taxable figure, after the age rebate and medical credits. */
  const netAnnualTax = (taxableAnnual: number): number => {
    const gross = annualTaxFromBrackets(taxableAnnual, table);
    const afterRebate = Math.max(0, gross - rebateForAge(age, table));
    return Math.max(0, afterRebate - medicalCredit * 12);
  };

  // ── The two components are taxed on DIFFERENT timetables. ──
  //
  // Recurring pay is annualised and spread: each period collects its share of the
  // year's liability, self-correcting as the average moves.
  //
  // An annual payment (bonus, once-off) has its FULL incremental tax deducted in
  // the period it is paid — not spread over the remaining periods.
  //
  // Why, explicitly: spreading it under-withholds. The employer's EMP201s look
  // fine and the year-end total still reconciles, but if the employee leaves, the
  // tables change, or the year is short, the shortfall lands on the EMPLOYEE as a
  // SARS assessment at filing season — for money their employer was supposed to
  // have withheld. Over-withholding produces a refund, which is recoverable and
  // nobody's emergency. Given the choice, we take the recoverable error.
  //
  // This is the SARS annual-payment method: tax the annualised regular figure,
  // tax it again with the annual payment added, and the difference is the tax
  // attributable to that payment.
  const recurringAnnualEquivalent =
    ((priorRecurring + recurringTaxableThisPeriod) / periodsToDate) * periodsInYear;

  const cumulativeIrregular = priorIrregular + irregularTaxableThisPeriod;

  const taxOnRecurring = netAnnualTax(recurringAnnualEquivalent);
  const taxWithIrregular = netAnnualTax(recurringAnnualEquivalent + cumulativeIrregular);

  // Tax attributable to every annual payment made so far this YOA. Held
  // cumulatively so the period that pays a bonus takes the whole charge, and
  // later periods neither repeat it nor refund it.
  const irregularTaxToDate = Math.max(0, taxWithIrregular - taxOnRecurring);

  // Recurring liability accrues pro rata; irregular liability is due in full.
  const cumulativeTaxToDate =
    taxOnRecurring * (periodsToDate / periodsInYear) + irregularTaxToDate;

  // Net off what has already been withheld this YOA.
  const paye = Math.max(0, cumulativeTaxToDate - priorWithheld);


  // ── UIF (employee + matched employer) ──
  const uifContributes = input.uifContributor !== false;
  const uifBase = Math.min(grossPay, table.uif.monthlyCeiling);
  const uif = uifContributes ? uifBase * table.uif.rate : 0;
  const employerUif = uif;

  // ── SDL (employer only, entity-gated) ──
  const sdl = input.entity?.sdlLiable ? grossPay * table.sdl.rate : 0;

  // ── Net ──
  const otherDeductions = addDeductions.reduce((s, l) => s + (l.amount || 0), 0);
  const totalDeductions = paye + uif + pension + otherDeductions;
  const netPay = grossPay - totalDeductions;

  const employerCosts = {
    pension: r2(employerPension),
    uif: r2(employerUif),
    sdl: r2(sdl),
    total: r2(employerPension + employerUif + sdl),
  };

  return {
    yearOfAssessment: yoa,
    grossPay: r2(grossPay),
    taxableIncome: r2(monthlyTaxable),
    paye: r2(paye),
    medicalCredit: r2(medicalCredit),
    uif: r2(uif),
    employerUif: r2(employerUif),
    sdl: r2(sdl),
    pension: r2(pension),
    employerPension: r2(employerPension),
    additionalIncome: addIncome,
    additionalDeductions: addDeductions,
    totalDeductions: r2(totalDeductions),
    netPay: r2(netPay),
    employerCosts,
    payeBasis: {
      recurringRemuneration: r2(recurringTaxableThisPeriod),
      irregularIncome: r2(irregularTaxableThisPeriod),
      taxWithheld: r2(paye),
      periodsWorked: Math.round(periodFraction * 10000) / 10000,
    },
  };
}
