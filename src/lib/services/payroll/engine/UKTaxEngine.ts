// src/lib/services/payroll/engine/UKTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// UK PAYE. THE UK engine — not one of several.
//
// There were three UK implementations in this codebase and they disagreed:
// this file, `calcUK()` in lib/payroll/taxCalculations.ts, and an inline
// UK_TAX_CONFIG in the ukrun screen. This one is the real engine; the others
// are being retired. Do not add a fourth. See docs/compliance/UK-Engine-Recon.md.
//
// ── Tax years ────────────────────────────────────────────────────────────────
// Configs are values, so a new tax year is a new object, not a code change.
// 2026/27 is the default. 2024/25 is kept because historical runs must keep
// reproducing the figures they were filed with — never edit a past year's
// config to "fix" it.
//
// ── What changed for 2026/27 ─────────────────────────────────────────────────
// Income tax and employee NI are UNCHANGED (thresholds frozen to April 2031).
// What moved is the employer's bill and student loans:
//
//   Employer NI rate           13.8%  →  15%
//   Secondary threshold        £175/wk → £96/wk   (£9,100 → £5,000 a year)
//   Employment Allowance       £5,000 →  £10,500  (was not modelled at all)
//   Plan 5 student loans       n/a    →  live from April 2026
//
// The first two together understate an employer's NI by roughly £937 a year
// per employee on £36k if left at the old figures.
//
// ── Verified against ─────────────────────────────────────────────────────────
// House of Commons Library CBP-10618 (income tax and NI 2026/27), gov.scot
// Scottish income tax technical factsheet 2026-27, and published student loan
// thresholds. See the note on `scottishBands` about the taper region.
// ─────────────────────────────────────────────────────────────────────────────

import type { Employee, TaxCalculationResult, PayrollPeriod } from '@/types/payroll';

// =============================================================================
// TAX CONFIGURATION
// =============================================================================

/**
 * One tax band, expressed against TAXABLE income (gross less the allowance).
 *
 * `upTo` is the cumulative taxable amount at which the band ends; `null` means
 * "and everything above". Annual figures — the engine divides by the number of
 * periods.
 */
export interface TaxBand {
  upTo: number | null;
  rate: number;
  label: string;
}

export interface UKTaxConfig {
  taxYear: string;

  // Income Tax (Annual amounts)
  personalAllowance: number;
  personalAllowanceThreshold: number;
  basicRateLimit: number;
  higherRateLimit: number;
  basicRate: number;
  higherRate: number;
  additionalRate: number;

  // National Insurance Employee (Weekly amounts)
  nicLowerEarningsLimit: number;
  nicPrimaryThreshold: number;
  nicUpperEarningsLimit: number;
  nicMainRate: number;
  nicUpperRate: number;

  // National Insurance Employer (Weekly amounts)
  nicSecondaryThreshold: number;
  nicEmployerRate: number;

  /**
   * Rest-of-UK bands. Derived from the scalar fields above and kept beside them
   * so both the three-band and the six-band (Scottish) paths run through one
   * piece of arithmetic.
   */
  taxBands: TaxBand[];

  /**
   * Scotland sets its own rates and has SIX bands where rUK has three. A
   * Scottish higher-rate taxpayer pays 42%, not 40%, and the top rate is 48%.
   *
   * Applied when the tax code carries the `S` prefix. Before this existed,
   * `parseTaxCode` detected `isScottish` and nothing ever read it — every
   * Scottish employee was silently taxed at rUK rates.
   *
   * NOTE ON THE TAPER REGION: gov.scot publishes these as INCOME ranges
   * assuming the standard £12,570 allowance, and band limits are statutorily
   * taxable-income figures. The two coincide except between £100,000 and
   * £125,140, where the allowance is tapering. The boundaries here follow the
   * same treatment the rUK path already uses (top rate at £125,140 taxable,
   * which is where the allowance reaches zero). Check this against HMRC's
   * published tables before running real payroll for anyone in that band.
   */
  scottishBands: TaxBand[];

  /**
   * Employer NI relief, claimed once per employer per tax year against the
   * employer's total secondary Class 1 liability — NOT per employee.
   *
   * Not available to a company whose only employee is a director, nor to
   * connected companies claiming it elsewhere, nor where more than half the
   * work is in the public sector. The engine applies it when asked; deciding
   * eligibility is the employer's.
   */
  employmentAllowance: number;

  // Student Loans (Annual thresholds)
  studentLoanThresholds: {
    plan1: number;
    plan2: number;
    plan4: number;
    /** Live from 6 April 2026 — courses started on or after August 2023. */
    plan5: number;
    postgrad: number;
  };
  studentLoanRates: {
    plan1: number;
    plan2: number;
    plan4: number;
    plan5: number;
    postgrad: number;
  };

  // Pension Auto-Enrolment
  pensionMinEmployee: number;
  pensionMinEmployer: number;
  pensionQualifyingEarningsLower: number;
  pensionQualifyingEarningsUpper: number;

  // Apprenticeship Levy
  apprenticeshipLevyThreshold: number;
  apprenticeshipLevyAllowance: number;
  apprenticeshipLevyRate: number;
}

// Tax Year 2024/25 Configuration (6 April 2024 - 5 April 2025)
export const UK_TAX_CONFIG_2024_25: UKTaxConfig = {
  taxYear: '2024/25',

  // Income Tax (Annual)
  personalAllowance: 12570,
  personalAllowanceThreshold: 100000,
  basicRateLimit: 37700,
  higherRateLimit: 125140,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,

  // National Insurance Employee (Weekly - converted to monthly in calculations)
  nicLowerEarningsLimit: 123,      // £6,396/year
  nicPrimaryThreshold: 242,        // £12,570/year
  nicUpperEarningsLimit: 967,      // £50,270/year
  nicMainRate: 0.08,               // 8% (reduced from 12% in Jan 2024)
  nicUpperRate: 0.02,              // 2% above UEL

  // National Insurance Employer (Weekly)
  nicSecondaryThreshold: 175,      // £9,100/year
  nicEmployerRate: 0.138,          // 13.8%

  // Student Loans (Annual thresholds)
  // rUK bands, taxable-relative. Identical arithmetic to the scalar fields.
  taxBands: [
    { upTo: 37700,  rate: 0.20, label: 'Basic' },
    { upTo: 125140, rate: 0.40, label: 'Higher' },
    { upTo: null,   rate: 0.45, label: 'Additional' },
  ],
  scottishBands: [
    { upTo: 2306,   rate: 0.19, label: 'Starter' },
    { upTo: 13991,  rate: 0.20, label: 'Basic' },
    { upTo: 31092,  rate: 0.21, label: 'Intermediate' },
    { upTo: 62430,  rate: 0.42, label: 'Higher' },
    { upTo: 125140, rate: 0.45, label: 'Advanced' },
    { upTo: null,   rate: 0.48, label: 'Top' },
  ],
  employmentAllowance: 5000,

  studentLoanThresholds: {
    plan1: 22015,
    plan2: 27295,
    plan4: 27660,
    plan5: 25000,
    postgrad: 21000,
  },
  studentLoanRates: {
    plan1: 0.09,
    plan2: 0.09,
    plan4: 0.09,
    plan5: 0.09,
    postgrad: 0.06,
  },

  // Pension Auto-Enrolment
  pensionMinEmployee: 0.05,
  pensionMinEmployer: 0.03,
  pensionQualifyingEarningsLower: 6240,
  pensionQualifyingEarningsUpper: 50270,

  // Apprenticeship Levy (for employers with annual payroll > £3m)
  apprenticeshipLevyThreshold: 3000000,
  apprenticeshipLevyAllowance: 15000,
  apprenticeshipLevyRate: 0.005,
};

// Tax Year 2026/27 (6 April 2026 - 5 April 2027) — THE CURRENT YEAR.
//
// Income tax thresholds and employee NI are unchanged from 2024/25: the
// personal allowance and higher-rate threshold are frozen to April 2031. What
// moved is the employer's side and student loans.
export const UK_TAX_CONFIG_2026_27: UKTaxConfig = {
  taxYear: '2026/27',

  // Income Tax (Annual) — frozen
  personalAllowance: 12570,
  personalAllowanceThreshold: 100000,
  basicRateLimit: 37700,
  higherRateLimit: 125140,
  basicRate: 0.20,
  higherRate: 0.40,
  additionalRate: 0.45,

  taxBands: [
    { upTo: 37700,  rate: 0.20, label: 'Basic' },
    { upTo: 125140, rate: 0.40, label: 'Higher' },
    { upTo: null,   rate: 0.45, label: 'Additional' },
  ],

  // Scotland 2026/27. Six bands. Taxable-relative — see the note on the field.
  //   Starter      19%   £12,571 – £16,537 income
  //   Basic        20%   £16,538 – £29,526
  //   Intermediate 21%   £29,527 – £43,662
  //   Higher       42%   £43,663 – £75,000
  //   Advanced     45%   £75,001 – £125,140
  //   Top          48%   above £125,140
  scottishBands: [
    { upTo: 3967,   rate: 0.19, label: 'Starter' },
    { upTo: 16956,  rate: 0.20, label: 'Basic' },
    { upTo: 31092,  rate: 0.21, label: 'Intermediate' },
    { upTo: 62430,  rate: 0.42, label: 'Higher' },
    { upTo: 125140, rate: 0.45, label: 'Advanced' },
    { upTo: null,   rate: 0.48, label: 'Top' },
  ],

  // National Insurance Employee (Weekly) — unchanged
  nicLowerEarningsLimit: 123,
  nicPrimaryThreshold: 242,        // £12,570/year
  nicUpperEarningsLimit: 967,      // £50,270/year
  nicMainRate: 0.08,
  nicUpperRate: 0.02,

  // National Insurance Employer (Weekly) — BOTH CHANGED from 6 April 2025
  nicSecondaryThreshold: 96,       // £5,000/year, down from £9,100
  nicEmployerRate: 0.15,           // 15%, up from 13.8%

  employmentAllowance: 10500,      // up from £5,000

  // Student Loans (Annual thresholds)
  studentLoanThresholds: {
    plan1: 26900,
    plan2: 29385,
    plan4: 33795,
    plan5: 25000,                  // repayments begin April 2026
    postgrad: 21000,
  },
  studentLoanRates: {
    plan1: 0.09,
    plan2: 0.09,
    plan4: 0.09,
    plan5: 0.09,
    postgrad: 0.06,
  },

  // Pension Auto-Enrolment
  pensionMinEmployee: 0.05,
  pensionMinEmployer: 0.03,
  pensionQualifyingEarningsLower: 6240,
  pensionQualifyingEarningsUpper: 50270,

  // Apprenticeship Levy
  apprenticeshipLevyThreshold: 3000000,
  apprenticeshipLevyAllowance: 15000,
  apprenticeshipLevyRate: 0.005,
};

/** Every tax year this engine can calculate, newest first. */
export const UK_TAX_CONFIGS: Record<string, UKTaxConfig> = {
  '2026/27': UK_TAX_CONFIG_2026_27,
  '2024/25': UK_TAX_CONFIG_2024_25,
};

export const CURRENT_UK_TAX_CONFIG = UK_TAX_CONFIG_2026_27;

// =============================================================================
// TAX CODE PARSING
// =============================================================================

export interface ParsedTaxCode {
  allowance: number;
  isEmergency: boolean;
  isScottish: boolean;
  isWelsh: boolean;
  prefix?: string;
  suffix?: string;
  specialCode?: 'BR' | 'D0' | 'D1' | 'NT' | '0T';
}

// =============================================================================
// UK TAX ENGINE CLASS
// =============================================================================

export class UKTaxEngine {
  private config: UKTaxConfig;

  // Defaults to the CURRENT tax year. Pass an older config explicitly to
  // reproduce a historical run — never to work around a wrong figure.
  constructor(config: UKTaxConfig = CURRENT_UK_TAX_CONFIG) {
    this.config = config;
  }

  /**
   * Compatibility bridge for legacy payroll processing
   */
  calculate(input: {
    annualSalary: number;
    taxCode?: string;
    studentLoanPlan?: 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad' | 'none';
    pensionContribution?: { employeePercent: number; employerPercent: number };
    /** Employment Allowance still unused this tax year. Omit for none. */
    employmentAllowanceRemaining?: number;
    /**
     * Variable pay paid in THIS period only — bonus, commission, overtime. HMRC
     * taxes and NICs it as pay of the period it is paid in; it must not be
     * annualised (×12) the way `annualSalary` is. Not pensionable here: scheme
     * rules decide that, and basic pay is the conservative default.
     */
    periodExtra?: number;
  }) {
    const extra = Math.max(0, Number(input.periodExtra) || 0);
    const basicPeriod = input.annualSalary / 12;
    const periodGross = basicPeriod + extra;
    const parsedTaxCode = this.parseTaxCode(input.taxCode || '1257L');
    // The £100k taper reads the year's income, which now includes this payment.
    const adjustedAllowance = this.calculateAdjustedAllowance(input.annualSalary + extra, parsedTaxCode.allowance);

    const pension = this.calculatePension(
      basicPeriod,
      input.pensionContribution?.employeePercent || 0,
      input.pensionContribution?.employerPercent || 0,
      'monthly'
    );

    const { tax: incomeTax } = this.calculateIncomeTax(
      periodGross,
      adjustedAllowance,
      'monthly',
      1,
      0, 0,
      parsedTaxCode.isEmergency,
      parsedTaxCode.specialCode,
      // The S prefix finally does something.
      parsedTaxCode.isScottish
    );

    const { ni: employeeNI } = this.calculateEmployeeNI(periodGross, 'monthly');
    const employerNIResult = this.calculateEmployerNIWithAllowance(
      periodGross,
      input.employmentAllowanceRemaining ?? 0,
      'monthly'
    );
    const employerNI = employerNIResult.employerNI;
    const { studentLoan } = this.calculateStudentLoan(periodGross, input.studentLoanPlan, 'monthly');

    const totalDeductions = incomeTax + employeeNI + studentLoan + pension.employee;

    return {
      earnings: { basic: basicPeriod, gross: periodGross },
      deductions: {
        incomeTax,
        nationalInsurance: employeeNI,
        studentLoan,
        pension: pension.employee,
        total: totalDeductions
      },
      netPay: periodGross - totalDeductions,
      employerCosts: {
        nationalInsurance: employerNI,
        pension: pension.employer,
        total: employerNI + pension.employer,
        employmentAllowanceUsed: employerNIResult.allowanceUsed,
        employmentAllowanceRemaining: employerNIResult.allowanceRemaining,
      },
      taxBasis: {
        taxYear: this.config.taxYear,
        isScottish: parsedTaxCode.isScottish,
        taxCode: input.taxCode || '1257L',
      }
    };
  }


  // ---------------------------------------------------------------------------
  // TAX CODE PARSING
  // ---------------------------------------------------------------------------

  /**
   * Parse a UK tax code and extract the personal allowance
   */
  parseTaxCode(taxCode: string): ParsedTaxCode {
    const code = taxCode.toUpperCase().trim();

    // Default result
    const result: ParsedTaxCode = {
      allowance: this.config.personalAllowance,
      isEmergency: false,
      isScottish: code.startsWith('S'),
      isWelsh: code.startsWith('C'),
    };

    // Remove Scottish/Welsh prefix for parsing
    const baseCode = code.replace(/^[SC]/, '');

    // Special codes
    if (baseCode === 'BR') {
      return { ...result, allowance: 0, specialCode: 'BR' };
    }
    if (baseCode === 'D0') {
      return { ...result, allowance: 0, specialCode: 'D0' };
    }
    if (baseCode === 'D1') {
      return { ...result, allowance: 0, specialCode: 'D1' };
    }
    if (baseCode === 'NT') {
      return { ...result, allowance: Infinity, specialCode: 'NT' };
    }
    if (baseCode === '0T') {
      return { ...result, allowance: 0, specialCode: '0T' };
    }

    // Standard codes: 1257L, K475, 1257L M1, 1257L X.
    //
    // The previous pattern ended `([W1M1]?)` — a CHARACTER CLASS matching one
    // character from {W,1,M}, so it could never match the two-character "W1" or
    // "M1". Two things followed, and the second was the worse one:
    //
    //   1. isEmergency was never true, so employees on an emergency code were
    //      taxed cumulatively instead of on a week-1/month-1 basis; and
    //   2. the whole regex FAILED on those codes, so `allowance` silently fell
    //      back to the config default. A "1000L X" employee was given £12,570
    //      of allowance instead of £10,000 — under-taxed by £2,570 a year.
    //
    // X is itself an emergency marker, so it moves out of the suffix class.
    // \s* absorbs the space HMRC prints between the number and the marker.
    const match = baseCode.match(/^(K?)(\d+)\s*([LMNTY]?)\s*(W1|M1|X)?$/);

    if (match) {
      const [, prefix, number, suffix, emergency] = match;
      let allowance = parseInt(number, 10) * 10;

      // K code = negative allowance (underpayment from previous year)
      if (prefix === 'K') {
        allowance = -allowance;
      }

      result.allowance = allowance;
      result.prefix = prefix || undefined;
      result.suffix = suffix || undefined;
      result.isEmergency = emergency === 'W1' || emergency === 'M1' || emergency === 'X';
    }

    return result;
  }

  // ---------------------------------------------------------------------------
  // PERSONAL ALLOWANCE ADJUSTMENT
  // ---------------------------------------------------------------------------

  /**
   * Calculate adjusted personal allowance for high earners
   * Allowance reduces by £1 for every £2 over £100,000
   */
  calculateAdjustedAllowance(annualIncome: number, baseAllowance: number): number {
    if (baseAllowance === Infinity) return Infinity; // NT code
    if (baseAllowance <= 0) return baseAllowance; // Special codes

    if (annualIncome <= this.config.personalAllowanceThreshold) {
      return baseAllowance;
    }

    const excess = annualIncome - this.config.personalAllowanceThreshold;
    const reduction = Math.floor(excess / 2);

    return Math.max(0, baseAllowance - reduction);
  }

  // ---------------------------------------------------------------------------
  // BAND ARITHMETIC
  // ---------------------------------------------------------------------------

  /**
   * The band set that applies to this taxpayer.
   *
   * Scotland sets its own rates and bands for non-savings income; the `S`
   * prefix on the tax code is what identifies a Scottish taxpayer. Wales sets
   * rates too (`C` prefix) but has so far always matched rUK, so Welsh
   * taxpayers use the rUK set — if that ever diverges, add `welshBands` here
   * rather than special-casing at the call site.
   */
  bandsFor(isScottish: boolean): TaxBand[] {
    return isScottish ? this.config.scottishBands : this.config.taxBands;
  }

  /**
   * Tax on a taxable amount, walking the bands.
   *
   * `scale` divides the annual band limits — 1 for an annual figure, or the
   * cumulative fraction of the year for a period calculation. Returns the
   * per-band split as well as the total, because a payslip has to show it and
   * because a wrong band is easier to spot than a wrong total.
   */
  taxFromBands(taxable: number, bands: TaxBand[], scale = 1): { tax: number; perBand: Array<{ label: string; amount: number }> } {
    const perBand: Array<{ label: string; amount: number }> = [];
    let tax = 0;
    let lower = 0;

    for (const band of bands) {
      if (taxable <= lower) break;
      const upper = band.upTo === null ? Infinity : band.upTo * scale;
      const slice = Math.min(taxable, upper) - lower;
      if (slice > 0) {
        const amount = slice * band.rate;
        tax += amount;
        perBand.push({ label: band.label, amount: Math.round(amount * 100) / 100 });
      }
      if (band.upTo === null) break;
      lower = upper;
    }

    return { tax: Math.round(tax * 100) / 100, perBand };
  }

  // ---------------------------------------------------------------------------
  // INCOME TAX CALCULATION
  // ---------------------------------------------------------------------------

  /**
   * Calculate income tax for a pay period
   * Uses cumulative method by default, or Week 1/Month 1 for emergency codes
   */
  calculateIncomeTax(
    periodGross: number,
    personalAllowance: number,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly' = 'monthly',
    periodNumber: number = 1,
    ytdGross: number = 0,
    ytdTax: number = 0,
    isEmergencyCode: boolean = false,
    specialCode?: 'BR' | 'D0' | 'D1' | 'NT' | '0T',
    // Scottish taxpayers (S-prefixed code) run through the six Scottish bands.
    // Defaults false so every existing caller keeps rUK behaviour exactly.
    isScottish: boolean = false
  ): { tax: number; breakdown: { basic: number; higher: number; additional: number }; perBand?: Array<{ label: string; amount: number }> } {
    // NT code = no tax
    if (specialCode === 'NT') {
      return { tax: 0, breakdown: { basic: 0, higher: 0, additional: 0 } };
    }

    const periodsPerYear = payPeriod === 'weekly' ? 52 : payPeriod === 'bi_weekly' ? 26 : 12;

    // BR code = all earnings at basic rate
    if (specialCode === 'BR') {
      const tax = periodGross * this.config.basicRate;
      return { tax, breakdown: { basic: tax, higher: 0, additional: 0 } };
    }

    // D0 code = all earnings at higher rate
    if (specialCode === 'D0') {
      const tax = periodGross * this.config.higherRate;
      return { tax, breakdown: { basic: 0, higher: tax, additional: 0 } };
    }

    // D1 code = all earnings at additional rate
    if (specialCode === 'D1') {
      const tax = periodGross * this.config.additionalRate;
      return { tax, breakdown: { basic: 0, higher: 0, additional: tax } };
    }

    // 0T code = no allowance, tax all earnings
    if (specialCode === '0T') {
      // Calculate tax on all earnings using standard rates
      let tax = 0;
      const breakdown = { basic: 0, higher: 0, additional: 0 };

      const basicLimit = this.config.basicRateLimit / (payPeriod === 'weekly' ? 52 : payPeriod === 'bi_weekly' ? 26 : 12);
      const higherLimit = (this.config.higherRateLimit - this.config.basicRateLimit) / (payPeriod === 'weekly' ? 52 : payPeriod === 'bi_weekly' ? 26 : 12);

      // Basic rate band
      const basicBand = Math.min(periodGross, basicLimit);
      breakdown.basic = basicBand * this.config.basicRate;
      tax += breakdown.basic;

      // Higher rate band
      if (periodGross > basicLimit) {
        const higherBand = Math.min(periodGross - basicLimit, higherLimit);
        breakdown.higher = higherBand * this.config.higherRate;
        tax += breakdown.higher;
      }

      // Additional rate band
      if (periodGross > basicLimit + higherLimit) {
        const additionalBand = periodGross - basicLimit - higherLimit;
        breakdown.additional = additionalBand * this.config.additionalRate;
        tax += breakdown.additional;
      }

      return {
        tax: Math.round(tax * 100) / 100,
        breakdown: {
          basic: Math.round(breakdown.basic * 100) / 100,
          higher: Math.round(breakdown.higher * 100) / 100,
          additional: Math.round(breakdown.additional * 100) / 100,
        },
      };
    }

    // Emergency codes use Week 1/Month 1 basis
    if (isEmergencyCode) {
      periodNumber = 1;
      ytdGross = 0;
      ytdTax = 0;
    }

    // Calculate cumulative amounts
    const cumulativeAllowance = (personalAllowance / periodsPerYear) * periodNumber;
    const cumulativeBasicLimit = (this.config.basicRateLimit / periodsPerYear) * periodNumber;
    const cumulativeHigherLimit = ((this.config.higherRateLimit - this.config.basicRateLimit) / periodsPerYear) * periodNumber;

    const cumulativeGross = ytdGross + periodGross;
    const cumulativeTaxable = Math.max(0, cumulativeGross - cumulativeAllowance);

    // ── Scottish path ────────────────────────────────────────────────────────
    // Six bands rather than three, so it goes through the band walker. Same
    // cumulative machinery: tax the year-to-date taxable amount, subtract what
    // has already been paid.
    if (isScottish) {
      const scale = periodNumber / periodsPerYear;
      const { tax: cumulativeScottishTax, perBand } =
        this.taxFromBands(cumulativeTaxable, this.config.scottishBands, scale);
      const periodScottishTax = Math.max(0, cumulativeScottishTax - ytdTax);

      // The three-way breakdown is an rUK shape and does not describe six
      // bands. Report the total under `basic` for callers that only read the
      // sum, and hand back the real split in `perBand`.
      return {
        tax: Math.round(periodScottishTax * 100) / 100,
        breakdown: { basic: Math.round(periodScottishTax * 100) / 100, higher: 0, additional: 0 },
        perBand,
      };
    }

    // Calculate cumulative tax due
    let cumulativeTax = 0;
    let breakdown = { basic: 0, higher: 0, additional: 0 };

    if (cumulativeTaxable > 0) {
      // Basic rate band
      const basicBand = Math.min(cumulativeTaxable, cumulativeBasicLimit);
      breakdown.basic = basicBand * this.config.basicRate;
      cumulativeTax += breakdown.basic;

      // Higher rate band
      if (cumulativeTaxable > cumulativeBasicLimit) {
        const higherBand = Math.min(
          cumulativeTaxable - cumulativeBasicLimit,
          cumulativeHigherLimit
        );
        breakdown.higher = higherBand * this.config.higherRate;
        cumulativeTax += breakdown.higher;
      }

      // Additional rate band
      if (cumulativeTaxable > cumulativeBasicLimit + cumulativeHigherLimit) {
        const additionalBand = cumulativeTaxable - cumulativeBasicLimit - cumulativeHigherLimit;
        breakdown.additional = additionalBand * this.config.additionalRate;
        cumulativeTax += breakdown.additional;
      }
    }

    // Tax for this period = cumulative tax - tax already paid
    const periodTax = Math.max(0, cumulativeTax - ytdTax);

    // Adjust breakdown proportionally for this period
    const taxRatio = cumulativeTax > 0 ? periodTax / cumulativeTax : 0;
    breakdown = {
      basic: breakdown.basic * taxRatio,
      higher: breakdown.higher * taxRatio,
      additional: breakdown.additional * taxRatio,
    };

    return {
      tax: Math.round(periodTax * 100) / 100,
      breakdown: {
        basic: Math.round(breakdown.basic * 100) / 100,
        higher: Math.round(breakdown.higher * 100) / 100,
        additional: Math.round(breakdown.additional * 100) / 100,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // NATIONAL INSURANCE CALCULATION
  // ---------------------------------------------------------------------------

  /**
   * Calculate Employee National Insurance for a pay period
   */
  calculateEmployeeNI(
    periodGross: number,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly' = 'monthly'
  ): { ni: number; breakdown: { main: number; upper: number } } {
    // Convert weekly thresholds to period amounts
    const weeksPerPeriod = payPeriod === 'weekly' ? 1 : payPeriod === 'bi_weekly' ? 2 : 52 / 12;

    const primaryThreshold = this.config.nicPrimaryThreshold * weeksPerPeriod;
    const upperLimit = this.config.nicUpperEarningsLimit * weeksPerPeriod;

    let mainNI = 0;
    let upperNI = 0;

    if (periodGross > primaryThreshold) {
      // Main rate: between primary threshold and upper earnings limit
      const mainBand = Math.min(periodGross - primaryThreshold, upperLimit - primaryThreshold);
      mainNI = Math.max(0, mainBand) * this.config.nicMainRate;

      // Upper rate: above upper earnings limit
      if (periodGross > upperLimit) {
        upperNI = (periodGross - upperLimit) * this.config.nicUpperRate;
      }
    }

    const totalNI = mainNI + upperNI;

    return {
      ni: Math.round(totalNI * 100) / 100,
      breakdown: {
        main: Math.round(mainNI * 100) / 100,
        upper: Math.round(upperNI * 100) / 100,
      },
    };
  }

  /**
   * Calculate Employer National Insurance for a pay period
   */
  calculateEmployerNI(
    periodGross: number,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly' = 'monthly'
  ): number {
    const weeksPerPeriod = payPeriod === 'weekly' ? 1 : payPeriod === 'bi_weekly' ? 2 : 52 / 12;
    const secondaryThreshold = this.config.nicSecondaryThreshold * weeksPerPeriod;

    if (periodGross <= secondaryThreshold) {
      return 0;
    }

    const employerNI = (periodGross - secondaryThreshold) * this.config.nicEmployerRate;
    return Math.round(employerNI * 100) / 100;
  }

  /**
   * Employer NI after Employment Allowance.
   *
   * The allowance is an EMPLOYER-level, TAX-YEAR-level relief — £10,500 off the
   * employer's total secondary Class 1 bill, not a per-employee discount and
   * not a monthly one. It is consumed as the liability arises: a small employer
   * typically pays nothing for the first months of the year and then starts
   * paying once it is used up.
   *
   * So this takes what remains of the allowance and returns what remains after
   * this calculation. The CALLER owns that running total across the payroll run
   * and across the year — the engine is stateless on purpose, because the
   * balance belongs to the employer's tax year, not to an engine instance.
   *
   * Eligibility is the employer's to determine and is deliberately not decided
   * here: it is unavailable to a single-director company with no other
   * employees, to connected companies claiming it elsewhere, and where more
   * than half the work is in the public sector. Pass `allowanceRemaining: 0`
   * for an employer who cannot claim.
   */
  calculateEmployerNIWithAllowance(
    periodGross: number,
    allowanceRemaining: number,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly' = 'monthly'
  ): { employerNI: number; allowanceUsed: number; allowanceRemaining: number } {
    const gross = this.calculateEmployerNI(periodGross, payPeriod);
    const available = Math.max(0, allowanceRemaining);
    const used = Math.min(gross, available);

    return {
      employerNI: Math.round((gross - used) * 100) / 100,
      allowanceUsed: Math.round(used * 100) / 100,
      allowanceRemaining: Math.round((available - used) * 100) / 100,
    };
  }

  // ---------------------------------------------------------------------------
  // STUDENT LOAN CALCULATION
  // ---------------------------------------------------------------------------

  /**
   * Calculate Student Loan deduction for a pay period
   */
  calculateStudentLoan(
    periodGross: number,
    plan: 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad' | 'none' | undefined,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly' = 'monthly',
    hasPostgradLoan: boolean = false
  ): { studentLoan: number; postgradLoan: number } {
    if (!plan || plan === 'none') {
      return { studentLoan: 0, postgradLoan: hasPostgradLoan ? this.calculatePostgradLoan(periodGross, payPeriod) : 0 };
    }

    const periodsPerYear = payPeriod === 'weekly' ? 52 : payPeriod === 'bi_weekly' ? 26 : 12;
    const threshold = this.config.studentLoanThresholds[plan] / periodsPerYear;
    const rate = this.config.studentLoanRates[plan];

    let studentLoan = 0;
    if (periodGross > threshold) {
      studentLoan = (periodGross - threshold) * rate;
    }

    const postgradLoan = hasPostgradLoan ? this.calculatePostgradLoan(periodGross, payPeriod) : 0;

    return {
      studentLoan: Math.round(studentLoan * 100) / 100,
      postgradLoan: Math.round(postgradLoan * 100) / 100,
    };
  }

  private calculatePostgradLoan(
    periodGross: number,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly'
  ): number {
    const periodsPerYear = payPeriod === 'weekly' ? 52 : payPeriod === 'bi_weekly' ? 26 : 12;
    const threshold = this.config.studentLoanThresholds.postgrad / periodsPerYear;

    if (periodGross > threshold) {
      return (periodGross - threshold) * this.config.studentLoanRates.postgrad;
    }
    return 0;
  }

  // ---------------------------------------------------------------------------
  // PENSION CALCULATION
  // ---------------------------------------------------------------------------

  /**
   * Calculate pension contributions
   */
  calculatePension(
    periodGross: number,
    employeePercent: number,
    employerPercent: number,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly' = 'monthly'
  ): { employee: number; employer: number; qualifyingEarnings: number } {
    // Calculate qualifying earnings for auto-enrolment
    const periodsPerYear = payPeriod === 'weekly' ? 52 : payPeriod === 'bi_weekly' ? 26 : 12;
    const lowerLimit = this.config.pensionQualifyingEarningsLower / periodsPerYear;
    const upperLimit = this.config.pensionQualifyingEarningsUpper / periodsPerYear;

    const qualifyingEarnings = Math.min(Math.max(0, periodGross - lowerLimit), upperLimit - lowerLimit);

    // Calculate contributions (can be on gross or qualifying earnings)
    // Using gross for simplicity - adjust based on scheme rules
    const employeePension = periodGross * (employeePercent / 100);
    const employerPension = periodGross * (employerPercent / 100);

    return {
      employee: Math.round(employeePension * 100) / 100,
      employer: Math.round(employerPension * 100) / 100,
      qualifyingEarnings: Math.round(qualifyingEarnings * 100) / 100,
    };
  }

  // ---------------------------------------------------------------------------
  // APPRENTICESHIP LEVY
  // ---------------------------------------------------------------------------

  /**
   * Apprenticeship Levy attributable to ONE employee's pay.
   *
   * ⚠ READ THIS BEFORE USING IT. The levy is an EMPLOYER-level charge: 0.5% of
   * the employer's whole pay bill, less a £15,000 annual allowance that the
   * EMPLOYER gets once. This method takes one employee's period pay and
   * subtracts the employer's whole monthly allowance from it, which is only
   * correct if the employer has exactly one employee. With 100 employees it
   * deducts £1,250 a hundred times and the levy comes out at zero — a large
   * employer would under-declare to HMRC.
   *
   * Use `calculateApprenticeshipLevyForPeriod` once per RUN instead. This one
   * is kept because callers exist; both now agree for a single-employee
   * employer, and only this one is unsafe past that.
   */
  calculateApprenticeshipLevy(
    annualPayrollBill: number,
    periodGross: number
  ): number {
    if (annualPayrollBill < this.config.apprenticeshipLevyThreshold) {
      return 0;
    }

    // Monthly allowance = £15,000 / 12 = £1,250
    const monthlyAllowance = this.config.apprenticeshipLevyAllowance / 12;
    const levy = periodGross * this.config.apprenticeshipLevyRate;

    // Apply monthly portion of allowance
    return Math.max(0, Math.round((levy - monthlyAllowance) * 100) / 100);
  }

  /**
   * Apprenticeship Levy for the EMPLOYER for one pay period — the correct
   * shape. Charge this ONCE per payroll run, not once per employee.
   *
   * 0.5% of the pay bill for the period, less the period's share of the
   * £15,000 annual allowance. Employers under the £3m annual pay bill pay
   * nothing, which is almost every user of this product.
   *
   * @param annualPayrollBill the employer's total annual pay bill
   * @param payPeriod         how often this employer runs payroll
   */
  calculateApprenticeshipLevyForPeriod(
    annualPayrollBill: number,
    payPeriod: 'weekly' | 'bi_weekly' | 'monthly' = 'monthly'
  ): number {
    if (annualPayrollBill < this.config.apprenticeshipLevyThreshold) {
      return 0;
    }

    const periodsPerYear = payPeriod === 'weekly' ? 52 : payPeriod === 'bi_weekly' ? 26 : 12;
    const periodPayBill = annualPayrollBill / periodsPerYear;
    const periodAllowance = this.config.apprenticeshipLevyAllowance / periodsPerYear;
    const levy = periodPayBill * this.config.apprenticeshipLevyRate;

    return Math.max(0, Math.round((levy - periodAllowance) * 100) / 100);
  }

  // ---------------------------------------------------------------------------
  // COMPLETE PAYSLIP CALCULATION
  // ---------------------------------------------------------------------------

  /**
   * Calculate complete payslip for an employee
   */
  calculatePayslip(
    employee: Employee,
    period: PayrollPeriod,
    options?: {
      overtime?: { hours: number; rate: number };
      bonus?: number;
      commission?: number;
      annualPayrollBill?: number;
      /** Employment Allowance still unclaimed this tax year. Omit for none. */
      employmentAllowanceRemaining?: number;
    }
  ): TaxCalculationResult {
    const payFrequency = employee.compensation.payFrequency;
    const annualSalary = employee.compensation.baseSalary;
    const ukTaxInfo = employee.taxInfo.uk!;

    // Calculate period number (1-12 for monthly, 1-52 for weekly)
    const periodStart = new Date(period.startDate);
    const taxYearStart = this.getTaxYearStart(periodStart);
    const periodNumber = this.calculatePeriodNumber(periodStart, taxYearStart, payFrequency);

    // Parse tax code
    const parsedTaxCode = this.parseTaxCode(ukTaxInfo.taxCode || '1257L');

    // Calculate monthly gross
    let periodGross = annualSalary / (payFrequency === 'weekly' ? 52 : payFrequency === 'bi_weekly' ? 26 : 12);

    // Add overtime
    if (options?.overtime) {
      periodGross += options.overtime.hours * options.overtime.rate;
    }

    // Add bonus
    if (options?.bonus) {
      periodGross += options.bonus;
    }

    // Add commission
    if (options?.commission) {
      periodGross += options.commission;
    }

    // Calculate adjusted allowance for high earners
    const adjustedAllowance = this.calculateAdjustedAllowance(annualSalary, parsedTaxCode.allowance);

    // Calculate pension (before tax for salary sacrifice schemes)
    const pension = this.calculatePension(
      periodGross,
      employee.deductions.pension.enabled ? employee.deductions.pension.employeePercent : 0,
      employee.deductions.pension.enabled ? employee.deductions.pension.employerPercent : 0,
      payFrequency
    );

    // For salary sacrifice, reduce gross for tax purposes
    // (We'll use relief at source for simplicity)
    const taxableGross = periodGross;

    // Calculate income tax
    const ytdGross = employee.ytdTotals?.grossPay || 0;
    const ytdTax = employee.ytdTotals?.incomeTax || 0;

    const { tax: incomeTax, breakdown: taxBreakdown } = this.calculateIncomeTax(
      taxableGross,
      adjustedAllowance,
      payFrequency,
      periodNumber,
      ytdGross,
      ytdTax,
      parsedTaxCode.isEmergency,
      parsedTaxCode.specialCode,
      // An S-prefixed code means Scottish rates. This argument was missing here
      // while calculate() passed it, so the two entry points taxed the same
      // Scottish employee differently — this path silently applied rUK bands.
      parsedTaxCode.isScottish
    );

    // Calculate National Insurance (Employee)
    const { ni: employeeNI, breakdown: niBreakdown } = this.calculateEmployeeNI(periodGross, payFrequency);

    // Calculate Employer NI, net of any Employment Allowance the employer has
    // left. Callers that track the claim pass what remains; absent it nothing
    // is claimed, which is the safe direction (never under-declares to HMRC).
    const employerNIResult = this.calculateEmployerNIWithAllowance(
      periodGross,
      options?.employmentAllowanceRemaining ?? 0,
      payFrequency
    );
    const employerNI = employerNIResult.employerNI;

    // Calculate Student Loan
    const { studentLoan, postgradLoan } = this.calculateStudentLoan(
      periodGross,
      ukTaxInfo.studentLoanPlan,
      payFrequency,
      ukTaxInfo.postgraduateLoan
    );
    const totalStudentLoan = studentLoan + postgradLoan;

    // Calculate Apprenticeship Levy
    const apprenticeshipLevy = this.calculateApprenticeshipLevy(
      options?.annualPayrollBill || 0,
      periodGross
    );

    // Calculate other deductions
    let otherDeductions = 0;
    employee.deductions.other?.forEach((deduction) => {
      if (deduction.type === 'fixed') {
        otherDeductions += deduction.amount;
      } else {
        otherDeductions += periodGross * (deduction.amount / 100);
      }
    });

    // Total deductions
    const totalDeductions = incomeTax + employeeNI + totalStudentLoan + pension.employee + otherDeductions;

    // Net pay
    const netPay = periodGross - totalDeductions;

    // Total employer cost
    const totalEmployerCost = periodGross + employerNI + pension.employer + apprenticeshipLevy;

    return {
      grossPay: Math.round(periodGross * 100) / 100,
      taxableIncome: Math.round(taxableGross * 100) / 100,
      incomeTax,
      nationalInsurance: employeeNI,
      uif: 0, // Not applicable for UK
      studentLoan: totalStudentLoan,
      pensionEmployee: pension.employee,
      pensionEmployer: pension.employer,
      otherDeductions: Math.round(otherDeductions * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      netPay: Math.round(netPay * 100) / 100,
      employerNI,
      employerUIF: 0,
      employerSDL: 0,
      apprenticeshipLevy,
      totalEmployerCost: Math.round(totalEmployerCost * 100) / 100,
      breakdown: {
        tax: taxBreakdown,
        ni: niBreakdown,
        pension: {
          employee: pension.employee,
          employer: pension.employer,
          qualifyingEarnings: pension.qualifyingEarnings,
        },
      },
    };
  }

  // ---------------------------------------------------------------------------
  // HELPER METHODS
  // ---------------------------------------------------------------------------

  /**
   * Get tax year start date (6 April)
   */
  private getTaxYearStart(date: Date): Date {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Tax year starts 6 April
    if (month > 3 || (month === 3 && day >= 6)) {
      return new Date(year, 3, 6); // 6 April this year
    }
    return new Date(year - 1, 3, 6); // 6 April last year
  }

  /**
   * Calculate period number within tax year
   */
  private calculatePeriodNumber(
    periodDate: Date,
    taxYearStart: Date,
    payFrequency: 'weekly' | 'bi_weekly' | 'monthly'
  ): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysDiff = Math.floor((periodDate.getTime() - taxYearStart.getTime()) / msPerDay);

    if (payFrequency === 'weekly') {
      return Math.min(52, Math.floor(daysDiff / 7) + 1);
    } else if (payFrequency === 'bi_weekly') {
      return Math.min(26, Math.floor(daysDiff / 14) + 1);
    } else {
      // Monthly - count months from April
      let months = (periodDate.getFullYear() - taxYearStart.getFullYear()) * 12;
      months += periodDate.getMonth() - taxYearStart.getMonth();
      return Math.min(12, months + 1);
    }
  }

  /**
   * Get current tax year string
   */
  getTaxYear(date: Date = new Date()): string {
    const taxYearStart = this.getTaxYearStart(date);
    const startYear = taxYearStart.getFullYear();
    const endYear = startYear + 1;
    return `${startYear}/${endYear.toString().slice(-2)}`;
  }

  /**
   * Get tax month number (1-12, where 1 = April)
   */
  getTaxMonth(date: Date = new Date()): number {
    const month = date.getMonth(); // 0-11
    // April (3) = Month 1, March (2) = Month 12
    if (month >= 3) {
      return month - 2; // April=1, May=2, etc.
    }
    return month + 10; // Jan=10, Feb=11, Mar=12
  }
}

// Export singleton instance
export const ukTaxEngine = new UKTaxEngine();