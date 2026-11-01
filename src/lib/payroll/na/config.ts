// src/lib/payroll/na/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Namibia (NamRA) payroll constants — dated tables, not literals.
//
// Year of assessment: 1 March – end February (the same window as SARS; see
// lib/payroll/taxYear.ts). Currency: NAD, at par with the rand under the CMA.
//
// Researched at source 2026-10-20 — memos/NA-RECON-1.md, Part A:
//   • PAYE bands      PwC Namibia Tax Reference & Rate Card, Sept 2026
//   • SSC ceiling     Social Security Act regulations as amended; Sage, Sept 2026
//   • VET levy        VET Act 1 of 2008, Levy Regulations (GN 67 of 2021)
//   • Filing dates    NamRA "Employee Tax" page, captured 2026-10-20
//
// Three things here move on their own schedule:
//   • PAYE bands     — the annual Budget.
//   • SSC ceiling    — already gazetted to step up every March to 2029. A single
//                      constant would go stale on 1 March 2027; it is a dated table.
//   • VET threshold  — regulation, currently N$1m of annual payroll.
// ─────────────────────────────────────────────────────────────────────────────

export interface NaTaxBand {
  /** Exclusive lower edge, ANNUAL NAD. */
  from: number;
  /** Inclusive upper edge, ANNUAL NAD. */
  to: number;
  rate: number;
  /** Cumulative tax at `from`, ANNUAL NAD. */
  base: number;
}

/**
 * Individuals, years of assessment ending 2026/27 (PwC rate card, Sept 2026).
 * No primary, age or other rebate exists in Namibia: the N$100,000 nil band is
 * the whole of the relief. Do not port SARS rebates here.
 */
export const NA_BANDS_2027: NaTaxBand[] = [
  { from: 0,         to: 100_000,   rate: 0,    base: 0 },
  { from: 100_000,   to: 150_000,   rate: 0.18, base: 0 },
  { from: 150_000,   to: 350_000,   rate: 0.25, base: 9_000 },
  { from: 350_000,   to: 550_000,   rate: 0.28, base: 59_000 },
  { from: 550_000,   to: 850_000,   rate: 0.30, base: 115_000 },
  { from: 850_000,   to: 1_550_000, rate: 0.32, base: 205_000 },
  { from: 1_550_000, to: Infinity,  rate: 0.37, base: 429_000 },
];

/**
 * Social Security Commission (Maternity, Sick-leave and Death fund) ceilings.
 *
 * The contribution is 0.9% each side of the employee's BASIC wage, between a
 * floor and a ceiling. Ceilings by effective date; the entry applying to a pay
 * date is the latest one on or before it.
 *
 * 2027–2029 steps are gazetted already (Sage community announcement, Sept 2026).
 * The N$11,000 entry is dated from the earliest date we hold a source for; a run
 * dated before it uses it too, and says so via `sscCeilingAt().assumed`.
 */
export interface NaSscCeiling {
  /** ISO date the ceiling takes effect. */
  effectiveFrom: string;
  /** Monthly basic-wage ceiling, NAD. */
  ceiling: number;
  source: string;
}

// ── Checked at source 2026-10-21 ─────────────────────────────────────────────
// Regulations under the Social Security Act 34 of 1994 (GN 198 of 1995), reg 1
// "basic wage", as amended to GN 236 of 2026 (GG 8975, 15 July 2026). The
// Gazette's own table dates the N$12,500 step "1 March 2026". DO NOT "correct"
// the entry below to March: the Social Security Commission announced that,
// because the notice was gazetted late, it applies from 1 SEPTEMBER 2026
// (PwC Namibia Tax Alert Aug 2026; CRS News Flash 7 Aug 2026; CR van Wyk).
// Contributions for March–August 2026 at the N$11,000 ceiling were correct.
export const NA_SSC_CEILINGS: NaSscCeiling[] = [
  // Was N$9,000 (floor N$300) before 1 Mar 2025. Notice 275 of 2024, GG 8461 of
  // 1 Oct 2024 per HRTorque/CRS; the LAC annotation cites it as GN 285/2024.
  { effectiveFrom: '2025-03-01', ceiling: 11_000, source: 'Notice 275/2024 (GG 8461, 1 Oct 2024); LAC annotation cites GN 285/2024' },
  { effectiveFrom: '2026-09-01', ceiling: 12_500, source: 'GN 236/2026 (GG 8975, 15 Jul 2026) — gazette says 1 Mar 2026; SSC implements 1 Sep 2026' },
  { effectiveFrom: '2027-03-01', ceiling: 14_000, source: 'GN 236/2026 (GG 8975) table, financial year 2026/27' },
  { effectiveFrom: '2028-03-01', ceiling: 15_000, source: 'GN 236/2026 (GG 8975) table, financial year 2027/28' },
  { effectiveFrom: '2029-03-01', ceiling: 16_000, source: 'GN 236/2026 (GG 8975) table, financial year 2028/29' },
];

/**
 * What the SSC "basic wage" is, per reg 1 (checked 2026-10-21): remuneration in
 * money, INCLUDING the cash equivalent of payment in kind, for ordinary hours.
 * EXCLUDED by name: allowances (travel, subsistence, housing, motor vehicle,
 * transport, professional), overtime, Sunday / public-holiday and night-work
 * premiums, and pension, annuity, medical or insurance payments.
 *
 * NOT NAMED either way: bonus and commission. The engine leaves both out (it
 * contributes on basic salary only) — a judgement call recorded in READINESS.NA.
 * Payment in kind is in the definition but fringe benefits are not computed
 * yet, so an employee paid partly in kind is under-contributed until they are.
 */
export const NA_SSC_BASIC_WAGE_RULE = 'basic salary only; allowances, overtime, bonus and commission excluded' as const;

/**
 * Employees' Compensation Fund (Employees' Compensation Act 30 of 1941),
 * checked 2026-10-21. An EMPLOYER assessment, never a payslip deduction:
 *   • rate: by industry class, under 1% for office work up to about 8% for
 *     drilling, tunnelling and blasting (PwC Worldwide Tax Summaries). Set by
 *     the Commission on the employer's registration — not something we can know.
 *   • cover: employees earning above the ceiling are EXCLUDED, not capped
 *     (unless a special arrangement is made with the Commission).
 *   • return: wage return form E.As.6, by 31 March, for March–February.
 */
export const NA_ECF = {
  annualEarningsCeilings: [
    { effectiveFrom: '2025-03-01', ceiling: 101_625, source: 'GN 277 of 2024 (GG 8461, 1 Oct 2024); was N$81,300' },
  ],
  returnForm: 'E.As.6',
} as const;

/** The ECF earnings ceiling in force on a date (annual N$). */
export function naEcfCeilingAt(date: Date): number {
  const iso = date.toISOString().slice(0, 10);
  const list = [...NA_ECF.annualEarningsCeilings].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const hit = list.filter(c => c.effectiveFrom <= iso).pop() ?? list[0];
  return hit.ceiling;
}

export interface NaTaxConfig {
  /** Calendar year the year of assessment STARTS in (2026 = 1 Mar 2026 – 28 Feb 2027). */
  yearStart: number;
  /** Annual bands. */
  bands: NaTaxBand[];
  deductions: {
    /**
     * Pension, provident, retirement-annuity and education-policy contributions
     * share ONE annual cap. Medical aid is NOT deductible for employees.
     */
    retirementAnnualCap: number;
  };
  ssc: {
    employeeRate: number;
    employerRate: number;
    /** Monthly basic-wage floor: contributions are never below rate × floor. */
    monthlyFloor: number;
    ceilings: NaSscCeiling[];
  };
  /** Vocational Education and Training levy — employer only, paid to the NTA. */
  vetLevy: {
    rate: number;
    /** Employer liable when ANNUAL payroll is at least this. */
    annualPayrollThreshold: number;
  };
  /** Set when these bands are a prior year's, carried into a year not yet tabled. */
  carriedForwardFrom?: number;
  notes: string[];
}

export const NA_TAX_CONFIG_2026: NaTaxConfig = {
  yearStart: 2026,
  bands: NA_BANDS_2027,
  deductions: { retirementAnnualCap: 150_000 },
  ssc: {
    employeeRate: 0.009,
    employerRate: 0.009,
    monthlyFloor: 500,
    ceilings: NA_SSC_CEILINGS,
  },
  vetLevy: { rate: 0.01, annualPayrollThreshold: 1_000_000 },
  notes: [
    'Bands per PwC Namibia rate card (Sept 2026) for years of assessment ending 2026/27.',
    'Retirement/education deduction cap N$150,000, unchanged from 2025/26.',
    'SSC base is the BASIC wage (SS regs reg 1): allowances, overtime and premiums excluded by name; bonus and commission excluded by our choice.',
    'Employees\' Compensation Fund is assessed annually on the employer (E.As.6 by 31 Mar); it is not a payslip line.',
    'Bonus: NamRA withholds on the "balance of remuneration", which includes bonuses, and publishes no separate bonus method. We tax it at the margin on top of annualised recurring pay.',
    'Housing allowance is taxed in full. One third is exempt where the employer runs an approved housing scheme (NamRA, Tax on Individuals) — not modelled.',
    'Fringe benefits (vehicle 1.5%/1.4% of cost, 12% loan benefit, housing table) are not computed here yet.',
    'Part-time employees: NamRA practice is a flat 18% on the balance of remuneration — not modelled; the engine annualises them like anyone else.',
  ],
};

/** Year-of-assessment start year → config. Add an entry; never edit a shipped one in place. */
export const NA_TAX_CONFIGS: Record<number, NaTaxConfig> = {
  2026: NA_TAX_CONFIG_2026,
};

/**
 * Config for a year of assessment. Falls back to the newest we hold, so a run in a
 * year not yet tabled still calculates; `naIsCarriedForward` says so out loud.
 */
export function naConfigForYear(yearStart: number): NaTaxConfig {
  const exact = NA_TAX_CONFIGS[yearStart];
  if (exact) return exact;
  const years = Object.keys(NA_TAX_CONFIGS).map(Number).sort((a, b) => a - b);
  const pick = years.filter(y => y <= yearStart).pop() ?? years[0];
  return NA_TAX_CONFIGS[pick];
}

export function naIsCarriedForward(cfg: NaTaxConfig, yearStart: number): boolean {
  return cfg.yearStart !== yearStart || cfg.carriedForwardFrom !== undefined;
}

/** The SSC ceiling in force on a date. `assumed` when the date predates every entry we hold. */
export function naSscCeilingAt(date: Date, cfg: NaTaxConfig = NA_TAX_CONFIG_2026): NaSscCeiling & { assumed: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const sorted = [...cfg.ssc.ceilings].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const applicable = sorted.filter(c => c.effectiveFrom <= iso);
  if (applicable.length) return { ...applicable[applicable.length - 1], assumed: false };
  return { ...sorted[0], assumed: true };
}

// ── Due dates (NamRA "Employee Tax" page; VET Levy Regulations; SSC) ─────────

// ── Public holidays (Public Holidays Act 26 of 1990, as amended) ─────────────
// Fixed dates, plus Good Friday, Easter Monday and Ascension Day from Easter.
// Genocide Remembrance Day (28 May) is a public holiday from 2025. "The Monday
// following a Sunday which is a public holiday shall also be a public holiday."
// Checked against the Namibian Embassy's 2026 list, 2026-10-21.
const NA_FIXED_HOLIDAYS: Array<[month: number, day: number, fromYear?: number]> = [
  [1, 1], [3, 21], [5, 1], [5, 4], [5, 25], [5, 28, 2025], [8, 26], [12, 10], [12, 25], [12, 26],
];

/** Western Easter Sunday (anonymous Gregorian algorithm), UTC. */
function easterSunday(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, month - 1, day));
}

/** Every Namibian public holiday in a year, as ISO dates (Sunday holidays add their Monday). */
export function naPublicHolidays(year: number): Set<string> {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const day = 86_400_000;
  const out = new Set<string>();
  const add = (d: Date) => {
    out.add(iso(d));
    if (d.getUTCDay() === 0) out.add(iso(new Date(d.getTime() + day)));
  };
  for (const [m, dd, from] of NA_FIXED_HOLIDAYS) {
    if (from && year < from) continue;
    add(new Date(Date.UTC(year, m - 1, dd)));
  }
  const easter = easterSunday(year).getTime();
  add(new Date(easter - 2 * day));   // Good Friday
  add(new Date(easter + 1 * day));   // Easter Monday
  add(new Date(easter + 39 * day));  // Ascension Day
  return out;
}

/** The date itself, or the next day that is neither a weekend nor a public holiday. */
export function naNextWorkingDay(d: Date): Date {
  let cur = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  for (let i = 0; i < 10; i++) {
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6 && !naPublicHolidays(cur.getUTCFullYear()).has(cur.toISOString().slice(0, 10))) return cur;
    cur = new Date(cur.getTime() + 86_400_000);
  }
  return cur;
}

/**
 * Monthly PAYE (ETX) return and payment: within 20 days after month-end. When
 * the 20th is a weekend or public holiday it moves to the next working day
 * (Sage Namibia client guide, per NamRA practice) — e.g. 20 Sep 2026 is a
 * Sunday, so August 2026 PAYE is due Monday 21 Sep.
 */
export function naPayeDueDate(periodEnd: Date): Date {
  return naNextWorkingDay(new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 20)));
}

/** VET levy and its NTA return: by the 20th of the following month. */
export function naVetDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 20));
}

/** SSC contributions: 30 days after the end of the month. */
export function naSscDueDate(periodEnd: Date): Date {
  const monthEnd = Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 0);
  return new Date(monthEnd + 30 * 86_400_000);
}

/**
 * Annual employer return to NamRA: "within 30 days from 28 Feb". Counted from the
 * last day of February, so a leap year resolves to 30 March as well.
 * RESOLVED 2026-10-21 (ITAS FAQ, read in the browser): since March 2019 the
 * monthly ETX return is detailed per employee and mandatory; "the monthly values
 * will accumulate to an annual value but the employer will not be required to
 * submit an annual recon. The employer should however render each employee with
 * a PAYE 5 certificate." PAYE4 was the pre-ITAS return. NamRA's brochure still
 * words it as a return "within 30 days from 28 Feb"; under ITAS the twelve ETX
 * returns are that return. This date is therefore the PAYE 5 deadline. PAYE 5
 * is also due within 14 days of an employee leaving, and within 7 days when the
 * employer ceases to be one (NamRA, Employer's Tax Obligations brochure).
 */
export function naAnnualReturnDueDate(yearStart: number): Date {
  const febEnd = Date.UTC(yearStart + 1, 2, 0); // last day of Feb in the year the YOA ends
  return new Date(febEnd + 30 * 86_400_000);
}

/** PAYE 5 certificates to employees: 30 days after end-February (same day as the return). */
export const naPaye5DueDate = naAnnualReturnDueDate;

/** Employees' Compensation Fund wage return (E.As.6): 31 March, for March–February. */
export function naEcfReturnDueDate(yearStart: number): Date {
  return new Date(Date.UTC(yearStart + 1, 2, 31));
}
