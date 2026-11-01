// src/lib/payroll/rw/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Rwanda payroll constants. memos/RW-RECON-1.md.
//
// Tax year = calendar year. Currency RWF (FRW), whole francs.
// PAYE (RRA): MONTHLY bands, Law 027/2022 Art. 56 Table 2 (from 1 Nov 2023) —
// no reliefs, no credits, no annualisation; bonus taxed in the month paid.
// RSSB: pension, occupational hazards, maternity, CBHI and (opt-in) medical,
// all declared with PAYE on ONE unified RRA e-Tax return by the 15th.
//
// Everything that steps is a dated table read by PAY DATE (architecture rule:
// statutory figures are never hardcoded in the engine).
// ─────────────────────────────────────────────────────────────────────────────

export interface RwBand { from: number; to: number; rate: number }

export interface RwPayeTable {
  effectiveFrom: string;
  /** Monthly bands, primary employer. */
  bands: RwBand[];
  /** Art. 57: an employer who is not the first employer withholds at this flat rate. */
  secondaryFlatRate: number;
  /** Casual labourers: 0% up to the threshold, this rate above it (monthly). */
  casualRate: number;
  casualThresholdMonthly: number;
  source: string;
}

export const RW_PAYE_TABLES: RwPayeTable[] = [
  {
    effectiveFrom: '2023-11-01',
    bands: [
      { from: 0,       to: 60_000,   rate: 0 },
      { from: 60_000,  to: 100_000,  rate: 0.10 },
      { from: 100_000, to: 200_000,  rate: 0.20 },
      { from: 200_000, to: Infinity, rate: 0.30 },
    ],
    secondaryFlatRate: 0.30,
    casualRate: 0.15,
    casualThresholdMonthly: 60_000,
    source: 'Law 027/2022 Art. 56 Table 2; RRA Calculate PAYE page (verified 27 Oct 2026); RRA Basic Information Nov 2025 §6.2',
  },
];

export interface RwPensionRate { effectiveFrom: string; employee: number; employer: number; source: string }

/**
 * RSSB pension. Presidential Order 086/01 of 12 Dec 2024: 6% + 6% from 1 Jan
 * 2025, then +1 point each side every 1 January to 10% + 10% in 2030. The 2025
 * row is confirmed on RRA's own page; the step-ups rest on firm sources (PwC,
 * EY) and the order is "subject to actuarial review" — re-check each January.
 */
export const RW_PENSION_RATES: RwPensionRate[] = [
  { effectiveFrom: '2003-01-01', employee: 0.03, employer: 0.03, source: 'RSSB pension 3% + 3% before Presidential Order 086/01' },
  { effectiveFrom: '2025-01-01', employee: 0.06, employer: 0.06, source: 'Presidential Order 086/01 of 12/12/2024; RRA pension page' },
  { effectiveFrom: '2027-01-01', employee: 0.07, employer: 0.07, source: 'Order 086/01 schedule, per PwC (reviewed 23 Sep 2026) and EY (17 Jan 2025)' },
  { effectiveFrom: '2028-01-01', employee: 0.08, employer: 0.08, source: 'Order 086/01 schedule, per PwC and EY' },
  { effectiveFrom: '2029-01-01', employee: 0.09, employer: 0.09, source: 'Order 086/01 schedule, per PwC and EY' },
  { effectiveFrom: '2030-01-01', employee: 0.10, employer: 0.10, source: 'Order 086/01 schedule, per PwC and EY' },
];

export interface RwRssbRates {
  effectiveFrom: string;
  occupationalHazardsEmployer: number;
  maternityEmployee: number;
  maternityEmployer: number;
  /** Of NET salary: base − PAYE − employee pension − employee maternity (PwC method). */
  cbhiEmployeeOfNet: number;
  /** RAMA medical scheme — basic salary only, employers admitted to the scheme. */
  medicalEmployee: number;
  medicalEmployer: number;
  source: string;
}

export const RW_RSSB_RATES: RwRssbRates[] = [
  {
    effectiveFrom: '2020-02-13',
    occupationalHazardsEmployer: 0.02,
    maternityEmployee: 0.003,
    maternityEmployer: 0.003,
    cbhiEmployeeOfNet: 0.005,
    medicalEmployee: 0.075,
    medicalEmployer: 0.075,
    source: 'RRA RSSB pages (maternity, CBHI, medical); PM Order 034/01 of 13/01/2020 (CBHI); PwC sample (occupational hazards 2%)',
  },
];

/** Benefits in kind (RRA Register for PAYE; PwC): shares of CASH employment income. */
export const RW_BIK = { companyCarRate: 0.10, employerHousingRate: 0.20 } as const;

function latest<T extends { effectiveFrom: string }>(rows: T[], date: Date): T & { assumed: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const sorted = [...rows].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const hit = sorted.filter(r => r.effectiveFrom <= iso);
  return hit.length ? { ...hit[hit.length - 1], assumed: false } : { ...sorted[0], assumed: true };
}

export const rwPayeTableAt = (d: Date) => latest(RW_PAYE_TABLES, d);
export const rwPensionRateAt = (d: Date) => latest(RW_PENSION_RATES, d);
export const rwRssbRatesAt = (d: Date) => latest(RW_RSSB_RATES, d);

/** Unified PAYE + RSSB declaration and payment: within 15 days after the month (RRA Declare PAYE). */
export function rwMonthlyDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 15));
}

/** Quarterly filers (turnover ≤ FRW 200M): within 15 days after the quarter ends. */
export function rwQuarterlyDueDate(periodEnd: Date): Date {
  const m = periodEnd.getUTCMonth();
  const qEnd = m - (m % 3) + 2;
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), qEnd + 1, 15));
}

export const RW_NOTES = [
  'PAYE monthly bands 0 / 10 / 20 / 30% at FRW 60k / 100k / 200k (Law 027/2022 Table 2, from 1 Nov 2023); unchanged by Law 014/2025 and the 2026/27 budget.',
  'No PAYE reliefs: RSSB contributions do not reduce the PAYE base. Bonus, overtime and commission taxed in the month paid; termination pay fully taxable.',
  'RSSB contribution base = the PAYE base (cash + taxable benefits); RAMA medical on basic salary only.',
  'Second employer withholds a flat 30% (Art. 57). Casual labourer: 0% to FRW 60,000, 15% above.',
  'One unified PAYE + RSSB return on RRA e-Tax, declared and paid by the 15th; quarterly for turnover ≤ FRW 200M.',
  'No statutory employer annual reconciliation or employee annual certificate.',
];
