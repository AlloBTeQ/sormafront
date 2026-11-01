// src/config/za-tax-tables.ts
// South Africa — SARS PAYE / UIF / SDL statutory tables, versioned by year of assessment.
//
// SOURCE OF TRUTH: every figure here must be reconciled against the current SARS PAYE
// Employer Reconciliation BRS (v25.3.0, Jun 2026) and the published tax tables before
// production use. SARS reissues these every February — add a new keyed entry per year,
// never mutate a shipped one and never hard-code these figures elsewhere.
//
// This table set is the SINGLE SOURCE OF TRUTH for ZA payroll: it powers the canonical
// engine (src/lib/payroll/za/engine.ts) that computes the payroll-run breakdown, the
// payslip, and the IRP5/EMP501 module — so those figures can never diverge. The legacy
// engines (ZATaxEngine, taxCalculations.calcZA, and the in-page calculateZATax) are being
// retired onto this table; the old ZATaxEngine used a rebate of 17,820, which was wrong
// *for YOA 2026* — 17,235 is the SARS-correct primary rebate for that year. Note 17,820
// is itself the correct primary rebate for YOA 2027; it is not a wrong figure in general,
// only when applied to YOA 2026.

/** A single income-tax bracket: tax = base + (taxable − from) × rate, for from < taxable ≤ to. */
export interface TaxBracket {
  /** Lower bound (exclusive above the previous bracket). */
  from: number;
  /** Upper bound (inclusive); Infinity for the top bracket. */
  to: number;
  /** Marginal rate applied to the portion above `from`. */
  rate: number;
  /** Cumulative tax on income up to and including `from`. */
  base: number;
}

export interface ZaTaxTable {
  /** Year of assessment, e.g. 2026 = 1 Mar 2025 – 28/29 Feb 2026. */
  yearOfAssessment: number;
  /** Human label for the SARS tax year. */
  label: string;
  brackets: TaxBracket[];
  rebates: {
    /** Primary rebate — all taxpayers. */
    primary: number;
    /** Secondary rebate — age 65+ (additional to primary). */
    secondary: number;
    /** Tertiary rebate — age 75+ (additional to primary + secondary). */
    tertiary: number;
  };
  /** Tax thresholds (annual income below which no tax is due). */
  thresholds: {
    below65: number;
    age65to74: number;
    age75plus: number;
  };
  uif: {
    /** Employee (and matched employer) contribution rate. */
    rate: number;
    /** Monthly remuneration ceiling to which UIF applies. */
    monthlyCeiling: number;
    /** Below this many hours per month for an employer, UIF does not apply. */
    minHoursPerMonth: number;
  };
  sdl: {
    /** Employer-only levy rate on leviable remuneration. */
    rate: number;
    /** Annual payroll threshold — at or below this the employer is SDL-exempt. */
    annualThreshold: number;
  };
  /** Medical scheme fees tax credit — monthly Rand amounts (reduce PAYE). */
  medicalCredit: {
    /** Main member. */
    mainMember: number;
    /** First dependant. */
    firstDependant: number;
    /** Each additional dependant beyond the first. */
    additionalDependant: number;
  };
  /** Retirement-fund (pension/provident/RA) deductible contribution cap. */
  retirement: {
    /** Max deductible as a fraction of the greater of remuneration / taxable income. */
    maxPercent: number;
    /** Absolute annual cap on the deduction. */
    maxAnnual: number;
  };
}

// ── 2026 year of assessment (1 Mar 2025 – 28 Feb 2026) ───────────────────────
// Values per the build spec §4.1. VERIFY against SARS tables before shipping.
const ZA_TAX_2026: ZaTaxTable = {
  yearOfAssessment: 2026,
  label: '2025/2026',
  brackets: [
    { from: 0,       to: 237100,        rate: 0.18, base: 0      },
    { from: 237100,  to: 370500,        rate: 0.26, base: 42678  },
    { from: 370500,  to: 512800,        rate: 0.31, base: 77362  },
    { from: 512800,  to: 673000,        rate: 0.36, base: 121475 },
    { from: 673000,  to: 857900,        rate: 0.39, base: 179147 },
    { from: 857900,  to: 1817000,       rate: 0.41, base: 251258 },
    { from: 1817000, to: Number.POSITIVE_INFINITY, rate: 0.45, base: 644489 },
  ],
  rebates: {
    primary:   17235,
    secondary: 9444,
    tertiary:  3145,
  },
  thresholds: {
    below65:   95750,
    age65to74: 148217,
    age75plus: 165689,
  },
  uif: {
    rate:            0.01,
    monthlyCeiling:  17712, // → R212,544 / year
    minHoursPerMonth: 24,
  },
  sdl: {
    rate:            0.01,
    annualThreshold: 500000,
  },
  medicalCredit: {
    mainMember:          364,
    firstDependant:      364,
    additionalDependant: 246,
  },
  retirement: {
    maxPercent: 0.275,
    maxAnnual:  350000,
  },
};

// ── 2027 year of assessment (1 Mar 2026 – 28 Feb 2027) ───────────────────────
// Budget 2026 (speech 25 Feb 2026) adjusted brackets, rebates and thresholds by ~3.4%
// after two years of no adjustment, and raised the s11F retirement cap for the first
// time since 2016 (R350,000 → R430,000, per the Draft Rates and Monetary Amounts Bill,
// 25 Feb 2026, deemed effective 1 Mar 2026).
//
// NOTE on the primary rebate: the file header above flags 17,820 as the "incorrect"
// rebate — that is correct FOR THE 2026 YOA, where the legacy ZATaxEngine wrongly used
// it. 17,820 is the genuine SARS primary rebate for the 2027 YOA. The two are unrelated.
//
// Verified 2026-07-22 against sars.gov.za: brackets/rebates/thresholds from the Rates of
// Tax for Individuals page; medical credits from the Medical Tax Credit Rates page;
// s11F cap from the Draft Rates Bill. UIF ceiling and SDL threshold unchanged.
const ZA_TAX_2027: ZaTaxTable = {
  yearOfAssessment: 2027,
  label: '2026/2027',
  brackets: [
    { from: 0,       to: 245100,        rate: 0.18, base: 0      },
    { from: 245100,  to: 383100,        rate: 0.26, base: 44118  },
    { from: 383100,  to: 530200,        rate: 0.31, base: 79998  },
    { from: 530200,  to: 695800,        rate: 0.36, base: 125599 },
    { from: 695800,  to: 887000,        rate: 0.39, base: 185215 },
    { from: 887000,  to: 1878600,       rate: 0.41, base: 259783 },
    { from: 1878600, to: Number.POSITIVE_INFINITY, rate: 0.45, base: 666339 },
  ],
  rebates: {
    primary:   17820,
    secondary: 9765,
    tertiary:  3249,
  },
  thresholds: {
    below65:   99000,
    age65to74: 153250,
    age75plus: 171300,
  },
  uif: {
    rate:            0.01,
    monthlyCeiling:  17712, // → R212,544 / year (unchanged)
    minHoursPerMonth: 24,
  },
  sdl: {
    rate:            0.01,
    annualThreshold: 500000,
  },
  medicalCredit: {
    mainMember:          376,
    firstDependant:      376,
    additionalDependant: 254,
  },
  retirement: {
    maxPercent: 0.275,
    maxAnnual:  430000,
  },
};

/** All shipped ZA tax tables, keyed by year of assessment. */
export const ZA_TAX_TABLES: Record<number, ZaTaxTable> = {
  2026: ZA_TAX_2026,
  2027: ZA_TAX_2027,
};

/**
 * Select the statutory table for a year of assessment.
 * @throws if no table has been loaded for that year — callers must never fall back
 *         to a different year's figures silently.
 */
export function getZaTaxTables(yearOfAssessment: number): ZaTaxTable {
  const table = ZA_TAX_TABLES[yearOfAssessment];
  if (!table) {
    throw new Error(
      `No ZA tax table loaded for year of assessment ${yearOfAssessment}. ` +
      `Add it to src/config/za-tax-tables.ts (verified against the SARS BRS) first.`
    );
  }
  return table;
}
