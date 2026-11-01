// src/lib/payroll/taxYear.ts
// ─────────────────────────────────────────────────────────────────────────────
// Where each jurisdiction's tax year starts, in one table.
//
// Before 2026-10-20 there was no per-region notion of a tax year. Each country
// had its own helper (ZA taxYearOf, bwTaxYearOf, zm/zw calendar-year helpers
// defined twice each), and the one generic method, PayrollRun.getRunsForTaxPeriod,
// assumed a UK April start for everyone. It had no callers and is gone.
//
// The SADC expansion makes this unavoidable: Namibia starts 1 March, Eswatini
// 1 July, Lesotho 1 April. Adding a region to lib/regions.ts makes TAX_YEAR_START
// below a compile error until its start is recorded.
//
// This answers "which window contains this date". Labels stay with each region
// (SARS names a year by its February end, BURS writes "2026/27", ZIMRA uses the
// calendar year) because those are what their own returns print.
// ─────────────────────────────────────────────────────────────────────────────

import { toPayrollRegion, type PayrollRegion } from '@/lib/regions';

/** Month (0 = January) and day the tax year starts on. */
export interface TaxYearStart { month: number; day: number }

export const TAX_YEAR_START: Record<PayrollRegion, TaxYearStart> = {
  RSA: { month: 2, day: 1 },   // SARS: 1 March – end February
  UK:  { month: 3, day: 6 },   // HMRC: 6 April – 5 April
  US:  { month: 0, day: 1 },   // IRS: calendar year
  KE:  { month: 0, day: 1 },   // KRA: calendar year
  UG:  { month: 6, day: 1 },   // URA: 1 July – 30 June
  BW:  { month: 6, day: 1 },   // BURS: 1 July – 30 June
  ZM:  { month: 0, day: 1 },   // ZRA: calendar (charge) year
  ZW:  { month: 0, day: 1 },   // ZIMRA: calendar year
  NA:  { month: 2, day: 1 },   // NamRA: 1 March – end February
  SZ:  { month: 6, day: 1 },   // ERS: 1 July – 30 June
  LS:  { month: 3, day: 1 },   // RSL: 1 April – 31 March
  RW:  { month: 0, day: 1 },   // RRA: calendar year
  AO:  { month: 0, day: 1 },   // AGT: calendar year
  MZ:  { month: 0, day: 1 },   // AT: calendar year
};

export interface TaxYearWindow {
  /** First instant of the tax year, UTC. */
  start: Date;
  /** Last millisecond of the tax year, UTC. */
  end: Date;
  /** Calendar year the window starts in. */
  startYear: number;
  /** Calendar year the window ends in (equal to startYear for calendar-year regions). */
  endYear: number;
}

/** The tax-year window, for `region`, that contains `date`. Throws for an unknown region. */
export function taxYearFor(region: unknown, date: Date | string): TaxYearWindow {
  const r = toPayrollRegion(region);
  if (!r) throw new Error(`No tax year defined for region "${String(region)}"`);
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${String(date)}`);

  const { month, day } = TAX_YEAR_START[r];
  const y = d.getUTCFullYear();
  const startThisYear = Date.UTC(y, month, day);
  const startYear = d.getTime() >= startThisYear ? y : y - 1;

  const start = new Date(Date.UTC(startYear, month, day));
  const end = new Date(Date.UTC(startYear + 1, month, day) - 1);
  return { start, end, startYear, endYear: end.getUTCFullYear() };
}
