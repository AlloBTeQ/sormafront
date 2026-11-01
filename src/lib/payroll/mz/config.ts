// src/lib/payroll/mz/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Mozambique payroll constants. memos/MZ-RECON-1.md.
//
// Tax year = calendar year. Currency MZN (metical), 2 decimals.
// IRPS withholding (CIRPS art. 65-A): the tabela de retenção na fonte on GROSS
// monthly salary — valor fixo by number of dependants + coeficiente × (gross −
// lower limit). "–" cells mean nothing is withheld. INSS is not deducted first.
// Lei 11/2025 (from 1 Jan 2026) made withholding non-final (Modelo 10 returns),
// but left the table unchanged.
// INSS: 3% employee, 4% employer, no ceiling.
// ─────────────────────────────────────────────────────────────────────────────

/** Fixed amounts for 0, 1, 2, 3, 4+ dependants; null = nothing withheld ("–"). */
export type MzFixed = [number | null, number | null, number | null, number | null, number | null];

export interface MzBand { from: number; fixed: MzFixed; rate: number }

export interface MzIrpsTable {
  effectiveFrom: string;
  /** Ordered by `from` (lower limit, inclusive). Below the first band nothing is withheld. */
  bands: MzBand[];
  /** Non-residents: flat rate on Mozambican-source employment income (art. 57 n.º 2). */
  nonResidentRate: number;
  source: string;
}

export const MZ_IRPS_TABLES: MzIrpsTable[] = [
  {
    effectiveFrom: '2014-01-01',
    bands: [
      { from: 20_250,  fixed: [0,      null,   null,   null,   null],   rate: 0.10 },
      { from: 20_750,  fixed: [50,     0,      null,   null,   null],   rate: 0.10 },
      { from: 21_000,  fixed: [75,     25,     0,      null,   null],   rate: 0.10 },
      { from: 21_250,  fixed: [100,    50,     25,     0,      null],   rate: 0.10 },
      { from: 21_750,  fixed: [150,    100,    75,     50,     0],      rate: 0.10 },
      { from: 22_250,  fixed: [200,    150,    125,    100,    50],     rate: 0.15 },
      { from: 32_750,  fixed: [1_775,  1_725,  1_700,  1_675,  1_625],  rate: 0.20 },
      { from: 60_750,  fixed: [7_375,  7_325,  7_300,  7_275,  7_225],  rate: 0.25 },
      // 28,300 and 28,275: RSM 2026 prints 7,300 and the BR prints 27,275 — continuity gives these.
      { from: 144_750, fixed: [28_375, 28_325, 28_300, 28_275, 28_225], rate: 0.32 },
    ],
    nonResidentRate: 0.20,
    source: 'CIRPS art. 65-A, tabela de retenção (Lei 20/2013); OCAM 2024, Forvis Mazars 2024, RSM Guia Fiscal 2026 — unchanged by Lei 11/2025',
  },
];

export interface MzInssRate { effectiveFrom: string; employee: number; employer: number; source: string }
export const MZ_INSS_RATES: MzInssRate[] = [
  { effectiveFrom: '2007-01-01', employee: 0.03, employer: 0.04, source: 'Lei 4/2007; Decreto 51/2017 as amended by Decreto 56/2024; RSM 2026, PwC (reviewed Aug 2026)' },
];

function latest<T extends { effectiveFrom: string }>(rows: T[], date: Date): T & { assumed: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const sorted = [...rows].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const hit = sorted.filter(r => r.effectiveFrom <= iso);
  return hit.length ? { ...hit[hit.length - 1], assumed: false } : { ...sorted[0], assumed: true };
}
export const mzIrpsTableAt = (d: Date) => latest(MZ_IRPS_TABLES, d);
export const mzInssRateAt = (d: Date) => latest(MZ_INSS_RATES, d);

/** IRPS withheld: paid and declared (M/19) by the 20th of the following month (Decreto 8/2008 art. 29(3)). */
export function mzIrpsDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 20));
}
/** INSS declaration (SISSMO) and payment: by the 10th of the following month. */
export function mzInssDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 10));
}
/** Annual certificate to each employee: by 20 January (Decreto 8/2008 art. 44(1)(b)). */
export function mzCertificateDueDate(year: number): Date {
  return new Date(Date.UTC(year + 1, 0, 20));
}

export const MZ_NOTES = [
  'IRPS withheld on gross monthly salary from the tabela de retenção: fixed amount by dependants + 10–32% on the excess; nothing withheld to MZN 20,249.99.',
  'INSS (3% + 4%, no ceiling) is not deducted before IRPS. Holiday pay (férias), profit share and meal subsidy are outside the INSS base.',
  'From 1 Jan 2026 (Lei 11/2025) withholding is no longer final: employees file Modelo 10 for 2026 onwards.',
  'IRPS and M/19 by the 20th; INSS by the 10th; employee certificates by 20 January.',
  'Non-residents: flat 20%.',
];
