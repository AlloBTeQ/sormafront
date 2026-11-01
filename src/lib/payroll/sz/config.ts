// src/lib/payroll/sz/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Eswatini (ERS) payroll constants. memos/SZ-LS-RECON-1.md.
//
// Year of assessment 1 July – 30 June. Currency SZL (E), at par with the rand.
// PAYE: annual bands, less a rebate. ENPF: 5% + 5% of wages up to a ceiling that
// steps on 1 JANUARY — not on the tax year — so it is dated by pay date.
// ─────────────────────────────────────────────────────────────────────────────

export interface SzTaxBand { from: number; to: number; rate: number; base: number }

/** Annual bands (PwC, reviewed 30 Mar 2026; AfroTools against ERS, Jul 2026). */
export const SZ_BANDS: SzTaxBand[] = [
  { from: 0,       to: 100_000,  rate: 0.20, base: 0 },
  { from: 100_000, to: 150_000,  rate: 0.25, base: 20_000 },
  { from: 150_000, to: 200_000,  rate: 0.30, base: 32_500 },
  { from: 200_000, to: Infinity, rate: 0.33, base: 47_500 },
];

export interface SzEnpfCeiling { effectiveFrom: string; ceiling: number; source: string }

/** Monthly wage ceiling for ENPF contributions. Legal Notice No. 5 of 2025 schedule. */
export const SZ_ENPF_CEILINGS: SzEnpfCeiling[] = [
  { effectiveFrom: '2025-01-01', ceiling: 4_000, source: 'ENPF, 2025' },
  { effectiveFrom: '2026-01-01', ceiling: 4_300, source: 'ENPF public notice; Sage, Jan 2026' },
  { effectiveFrom: '2027-01-01', ceiling: 4_600, source: 'Legal Notice No. 5 of 2025, per Workpay' },
  { effectiveFrom: '2028-01-01', ceiling: 4_900, source: 'Legal Notice No. 5 of 2025, per Workpay' },
  { effectiveFrom: '2029-01-01', ceiling: 5_200, source: 'Legal Notice No. 5 of 2025, per Workpay' },
];

export interface SzTaxConfig {
  /** Calendar year the year of assessment starts in (2026 = 1 Jul 2026 – 30 Jun 2027). */
  yearStart: number;
  bands: SzTaxBand[];
  rebate: { primary: number; over60: number };
  enpf: { employeeRate: number; employerRate: number; ceilings: SzEnpfCeiling[] };
  /** Employee pension deductible up to this share of pensionable salary (s14(1)(i), from 1 Jul 2024). */
  pensionDeductionCap: number;
  notes: string[];
}

export const SZ_TAX_CONFIG_2026: SzTaxConfig = {
  yearStart: 2026,
  bands: SZ_BANDS,
  rebate: { primary: 8_200, over60: 10_900 },
  enpf: { employeeRate: 0.05, employerRate: 0.05, ceilings: SZ_ENPF_CEILINGS },
  pensionDeductionCap: 0.15,
  notes: [
    'Bands and E8,200 rebate per ERS (ers.org.sz/IncomeTax/Paye); unchanged for 2026/27 (Budget Speech 27 Feb 2026, no PAYE changes).',
    'ENPF base: "wages" = any remuneration in money, allowances included (ENPF Order 1974 s2) — gross cash pay.',
    'Employee ENPF deducted before tax (ERS: "statutory deductions (SNPF)"); approved pension up to 15% of pensionable salary (LN 69 of 2024).',
    'Monthly TaxEase schedules replace the year-end reconciliation from 2024/25; the June schedule is the annual declaration.',
  ],
};

export const SZ_TAX_CONFIGS: Record<number, SzTaxConfig> = { 2026: SZ_TAX_CONFIG_2026 };

export function szConfigForYear(yearStart: number): SzTaxConfig {
  if (SZ_TAX_CONFIGS[yearStart]) return SZ_TAX_CONFIGS[yearStart];
  const years = Object.keys(SZ_TAX_CONFIGS).map(Number).sort((a, b) => a - b);
  return SZ_TAX_CONFIGS[years.filter(y => y <= yearStart).pop() ?? years[0]];
}

export function szEnpfCeilingAt(date: Date, cfg: SzTaxConfig = SZ_TAX_CONFIG_2026): SzEnpfCeiling & { assumed: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const sorted = [...cfg.enpf.ceilings].sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  const hit = sorted.filter(c => c.effectiveFrom <= iso);
  return hit.length ? { ...hit[hit.length - 1], assumed: false } : { ...sorted[0], assumed: true };
}

/**
 * PAYE: "must be paid to the ERS in full before the seventh day of the following
 * month"; the PAYE 04 return "no later than the 7th calendar day"
 * (ers.org.sz/IncomeTax/Paye). The due date shown is the payment date — the 6th —
 * the earlier of the two.
 */
export function szPayeDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 6));
}

/** The PAYE 04 return itself: by the 7th. */
export function szPayeReturnDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 7));
}

/** ENPF: "within twenty-one days after the end of the month" (ENPF Order 1974 s14(3)). */
export function szEnpfDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 21));
}

/**
 * Year-end. From 2024/25 the twelve monthly TaxEase schedules replace the
 * separate reconciliation (the June upload is the year's declaration), so what is
 * left is the PAYE05 certificate to each employee — within 14 days after the
 * 30 June year end (Sage; ERS's own wording not reached).
 */
export function szPaye05DueDate(yearStart: number): Date {
  return new Date(Date.UTC(yearStart + 1, 6, 14));
}
