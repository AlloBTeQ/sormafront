// src/lib/payroll/ls/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Lesotho (RSL) payroll constants. memos/SZ-LS-RECON-1.md.
//
// Year of assessment 1 April – 31 March. Currency LSL (M), at par with the rand.
// PAYE is computed MONTHLY: 20% on the first band, 30% above, less a monthly
// non-refundable credit (RSL Guide on Taxation of Employment Income 26/27).
// No statutory social security for private-sector employees.
//
// Tables are dated by EFFECTIVE DATE, so a March 2026 run uses the 2025/26 band.
// ─────────────────────────────────────────────────────────────────────────────

export interface LsTable {
  effectiveFrom: string;
  /** Monthly width of the 20% band. */
  lowerBandMonthly: number;
  lowerRate: number;
  upperRate: number;
  /** Monthly non-refundable tax credit. */
  creditMonthly: number;
  source: string;
}

export const LS_TABLES: LsTable[] = [
  {
    effectiveFrom: '2025-04-01', lowerBandMonthly: 6_170, lowerRate: 0.20, upperRate: 0.30, creditMonthly: 970,
    source: 'RSL Income Tax structure 2026–2027 (prior-year figures stated there)',
  },
  {
    effectiveFrom: '2026-04-01', lowerBandMonthly: 6_480, lowerRate: 0.20, upperRate: 0.30, creditMonthly: 1_020,
    source: 'RSL Income Tax structure 2026–2027; Legal Notice No. 24 of 2026',
  },
];

export function lsTableAt(date: Date): LsTable & { assumed: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const sorted = [...LS_TABLES].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const hit = sorted.filter(t => t.effectiveFrom <= iso);
  return hit.length ? { ...hit[hit.length - 1], assumed: false } : { ...sorted[0], assumed: true };
}

/** PAYE: by the 15th of the following month. */
export function lsMonthlyDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 15));
}

export const LS_NOTES = [
  'Bands and credit from RSL (Legal Notice No. 24 of 2026, effective 1 April 2026).',
  'No statutory social security for private-sector employees.',
  'Fringe benefits are taxed on the EMPLOYER (FBT, ITO s116; quarterly return within 14 days, s152) and stay out of PAYE — not computed: Fourth Schedule 40% in the 1993 text, RSL ruling and Sage; ACCA 2025 says 30%.',
  'Employee superannuation contributions deducted before tax: ITO s95(3)-(4) caps employer + employee at 20% of employment income, the employee\'s counted first.',
  'Terminal benefits exempt up to 25% of career basic salary (needs a directive) — not modelled.',
];

/**
 * Year-end. Income Tax Order 1993 s163(2)(a): the tax withholding certificate
 * (Form P.16) goes to each employee "within 28 days after the end of the year
 * of assessment" — and within 7 days of an employee leaving; s164(2): the
 * employer's statement to the Commissioner within the same 28 days. Read in the
 * 1993 text (LesLII, as at 1 April 1993); Sage gives "before the end of June"
 * for current practice. The statute's date is the earlier one, and is used.
 */
export function lsAnnualDueDate(yearStart: number): Date {
  return new Date(Date.UTC(yearStart + 1, 3, 28));
}

/** A leaver's P.16: within 7 days of the date employment ceased (s163(2)(a)). */
export function lsLeaverCertificateDueDate(lastDay: Date): Date {
  return new Date(Date.UTC(lastDay.getUTCFullYear(), lastDay.getUTCMonth(), lastDay.getUTCDate() + 7));
}
