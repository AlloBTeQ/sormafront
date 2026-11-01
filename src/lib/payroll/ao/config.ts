// src/lib/payroll/ao/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Angola payroll constants. memos/AO-RECON-1.md.
//
// Tax year = calendar year. Currency AOA (Kz), 2 decimals.
// IRT Grupo A: MONTHLY table — parcela fixa + taxa × (MC − excesso de), on the
// matéria colectável = gross − employee INSS − exempt allowances.
// Lei 14/25 (OGE 2026), Anexo I, from 1 Jan 2026. The table has two cliffs (at
// 150,000 and 200,000) that are in the law; it is applied literally.
// IRT is replaced by IRPS from 1 Jan 2027 — that needs a new dated entry.
// INSS (DP 227/18 art. 12.º): 3% employee, 8% employer; a retired person who
// works pays 8%.
// ─────────────────────────────────────────────────────────────────────────────

export interface AoBand { upTo: number; fixed: number; rate: number; over: number }

export interface AoIrtTable {
  effectiveFrom: string;
  /** Ordered by upTo; upper bounds inclusive. The first band is exempt. */
  bands: AoBand[];
  /** Monthly exemption caps (Código do IRT art. 2.º n.º 1, as amended by Lei 28/20). */
  mealAllowanceExempt: number;
  transportAllowanceExempt: number;
  /** Employer abono de família exempt up to this share of base salary. */
  familyAllowanceExemptShareOfBase: number;
  source: string;
}

export const AO_IRT_TABLES: AoIrtTable[] = [
  {
    effectiveFrom: '2026-01-01',
    bands: [
      { upTo: 150_000,    fixed: 0,         rate: 0,     over: 0 },
      { upTo: 200_000,    fixed: 12_500,    rate: 0.16,  over: 150_000 },
      { upTo: 300_000,    fixed: 31_250,    rate: 0.18,  over: 200_000 },
      { upTo: 500_000,    fixed: 49_250,    rate: 0.19,  over: 300_000 },
      { upTo: 1_000_000,  fixed: 87_250,    rate: 0.20,  over: 500_000 },
      { upTo: 1_500_000,  fixed: 187_250,   rate: 0.21,  over: 1_000_000 },
      { upTo: 2_000_000,  fixed: 292_250,   rate: 0.22,  over: 1_500_000 },
      { upTo: 2_500_000,  fixed: 402_250,   rate: 0.23,  over: 2_000_000 },
      { upTo: 5_000_000,  fixed: 517_250,   rate: 0.24,  over: 2_500_000 },
      { upTo: 10_000_000, fixed: 1_117_250, rate: 0.245, over: 5_000_000 },
      { upTo: Infinity,   fixed: 2_342_250, rate: 0.25,  over: 10_000_000 },
    ],
    mealAllowanceExempt: 30_000,
    transportAllowanceExempt: 30_000,
    familyAllowanceExemptShareOfBase: 0.05,
    source: 'Lei 14/25 (OGE 2026) art. 21.º, Anexo I; PwC taxsummaries (reviewed 24 Jun 2026, verified 27 Oct 2026)',
  },
];

export interface AoInssRate { effectiveFrom: string; employee: number; employer: number; retiredEmployee: number; source: string }

/** DP 227/18 art. 12.º. A rise to 5% + 10% was announced (May 2025) but not decreed. */
export const AO_INSS_RATES: AoInssRate[] = [
  { effectiveFrom: '2018-12-26', employee: 0.03, employer: 0.08, retiredEmployee: 0.08, source: 'Decreto Presidencial 227/18 de 27 de Setembro, art. 12.º' },
];

function latest<T extends { effectiveFrom: string }>(rows: T[], date: Date): T & { assumed: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const sorted = [...rows].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const hit = sorted.filter(r => r.effectiveFrom <= iso);
  return hit.length ? { ...hit[hit.length - 1], assumed: false } : { ...sorted[0], assumed: true };
}
export const aoIrtTableAt = (d: Date) => latest(AO_IRT_TABLES, d);
export const aoInssRateAt = (d: Date) => latest(AO_INSS_RATES, d);

/** IRT withheld: paid over by the end of the following month (Código do IRT art. 11.º). */
export function aoIrtDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 2, 0));
}
/** INSS contributions and folha de remunerações: by the 10th of the following month. */
export function aoInssDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 10));
}
/** Annual Modelo 2: by the end of February after the year (art. 12.º). */
export function aoModelo2DueDate(year: number): Date {
  return new Date(Date.UTC(year + 1, 2, 0));
}

export const AO_NOTES = [
  'IRT Grupo A monthly table from 1 Jan 2026 (Lei 14/25 Anexo I): exempt to Kz 150,000, then 16% … 25%. The cliffs at 150,000 and 200,000 are in the law.',
  'Matéria colectável = gross − employee INSS (3%) − meal (≤ Kz 30,000) and transport (≤ Kz 30,000) allowances − abono de família (≤ 5% of base).',
  'INSS 3% + 8% on all cash pay except the subsídio de férias (DP 227/18). A working retiree pays 8%.',
  'IRT paid over by the end of the following month; INSS by the 10th; Modelo 2 by the end of February.',
  'IRT is replaced by IRPS from 1 Jan 2027 (approved 25 Jun 2026) — a 2027 table is still to be entered.',
];
