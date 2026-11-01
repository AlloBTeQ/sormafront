// src/lib/payroll/ke/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Kenya (KRA) payroll constants — checked at source 2026-10-23.
//
// PRIMARY — Income Tax Act (Cap. 470), Kenya Law consolidation as at 1 July 2026
// (Mvelase's copy):
//   • Head B: 10% on the first 288,000; 25% on the next 100,000; 30% on the next
//     5,612,000; 32.5% on the next 3,600,000; 35% above 9,600,000 (a year).
//   • Head A: personal relief 28,800 a year; insurance relief 15% of premiums,
//     capped at 60,000 a year.
//   • s15(2)(ac): the employee's Affordable Housing Levy is deductible.
//   • s15(2)(ae): contributions to the Social Health Insurance Fund are deductible.
//   • s15(3)(b): residential mortgage interest deductible up to 360,000 a year.
//   • s22A(1): registered-fund contributions (NSSF included) deductible up to the
//     lesser of contributions, 30% of pensionable income, 360,000 a year.
// SHIF — the Social Health Insurance Act No. 16 of 2023, s27(2)(a): "a monthly
//   statutory deduction ... at a rate prescribed". The rate is in the Social
//   Health Insurance Regulations 2024 (not in hand): 2.75% of gross, minimum KES
//   300 a month, from 1 October 2024, remitted by the 9th (EY, 25 Sep 2024).
// NSSF — National Social Security Fund Act (Cap. 258), Kenya Law consolidation as
//   at 31 Dec 2022 (Mvelase's copy), read 2026-10-24:
//   • s20(1): employer and employee each 6% of monthly pensionable earnings;
//     s20(1A): paid on the ninth day of each month.
//   • Third Schedule table: Lower Earnings Limit 6,000 / 7,000 / 8,000 / 9,000 in
//     years 1–4; Upper Earnings Limit 0.5× / 1× / 2× / 3× National Average
//     Earnings (KNBS Economic Survey). From year 5 the LEL is the gazetted average
//     statutory minimum wage and the UEL 4× National Average Earnings.
//   • The LEL figures are therefore PRIMARY. The UEL amounts (36,000 / 72,000 /
//     108,000) are the Act's multiple applied to KNBS earnings as published by
//     NSSF and payroll vendors (Sage, Vialto, Force HRM) — the multiple is
//     primary, the shilling figure secondary.
//   • Year 4 runs from February 2026, so year 5 (February 2027) needs the gazetted
//     LEL and 4× NAE — the table below ends there on purpose.
// AHL — Affordable Housing Act 2024: 1.5% employee + 1.5% employer of gross (the
//   Act is not in hand; s15(2)(ac) of the ITA confirms the levy is deductible).
// ─────────────────────────────────────────────────────────────────────────────

export const KE_BANDS_ANNUAL = [
  { upTo: 288_000, rate: 0.10 },
  { upTo: 388_000, rate: 0.25 },
  { upTo: 6_000_000, rate: 0.30 },
  { upTo: 9_600_000, rate: 0.325 },
  { upTo: Infinity, rate: 0.35 },
] as const;

export const KE_RELIEF = {
  personalAnnual: 28_800,
  insuranceRate: 0.15,
  insuranceCapAnnual: 60_000,
} as const;

export const KE_DEDUCTION_CAPS = {
  /** s22A(1)(b)–(c). */
  pensionShareOfPensionable: 0.30,
  pensionAnnual: 360_000,
  /** s15(3)(b). */
  mortgageInterestAnnual: 360_000,
} as const;

export const KE_SHIF = { rate: 0.0275, minimumMonthly: 300, from: '2024-10-01' } as const;
export const KE_AHL = { employeeRate: 0.015, employerRate: 0.015 } as const;
/** Industrial Training Levy — employer only, KES 50 a month per employee. */
export const KE_NITA_MONTHLY = 50;

export interface KeNssfLimits { effectiveFrom: string; lel: number; uel: number; source: string }
export const KE_NSSF_RATE = 0.06;
export const KE_NSSF_LIMITS: KeNssfLimits[] = [
  { effectiveFrom: '2024-02-01', lel: 7_000, uel: 36_000, source: 'Third Schedule year 2: LEL 7,000; UEL 1× NAE' },
  { effectiveFrom: '2025-02-01', lel: 8_000, uel: 72_000, source: 'Third Schedule year 3: LEL 8,000; UEL 2× NAE' },
  { effectiveFrom: '2026-02-01', lel: 9_000, uel: 108_000, source: 'Third Schedule year 4: LEL 9,000; UEL 3× NAE (108,000 per NSSF / vendors)' },
];

export function keNssfLimitsAt(date: Date): KeNssfLimits & { assumed: boolean } {
  const iso = date.toISOString().slice(0, 10);
  const hit = KE_NSSF_LIMITS.filter(l => l.effectiveFrom <= iso);
  // Before the table, or from year 5 (the gazetted LEL and 4× NAE are not held),
  // the nearest row is used and flagged as assumed.
  if (!hit.length) return { ...KE_NSSF_LIMITS[0], assumed: true };
  return { ...hit[hit.length - 1], assumed: iso >= KE_NSSF_TABLE_ENDS };
}

/** Tax on a monthly taxable income: the annual bands ÷ 12. */
export function keMonthlyTax(monthlyTaxable: number): number {
  if (monthlyTaxable <= 0) return 0;
  let tax = 0;
  let floor = 0;
  for (const b of KE_BANDS_ANNUAL) {
    const top = b.upTo / 12;
    if (monthlyTaxable > floor) tax += (Math.min(monthlyTaxable, top) - floor) * b.rate;
    floor = top;
    if (monthlyTaxable <= top) break;
  }
  return tax;
}

/** NSSF: "on the ninth day of each month" (s20(1A)); SHIF also by the 9th. */
export function keNssfDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 9));
}

/** Year 5 of the Third Schedule starts here; the limits after it are not yet known. */
export const KE_NSSF_TABLE_ENDS = '2027-02-01';
