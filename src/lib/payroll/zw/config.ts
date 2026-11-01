// src/lib/payroll/zw/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Zimbabwe (ZIMRA) payroll constants.
//
// THE STATUS PROBLEM — read before touching the tables.
// ZIMRA HAS NOT PUBLISHED A 2026 PAYE TABLE. The official tax-tables page tops
// out at USD Jan–Dec 2025 and ZWG 2025. The 2026 National Budget (27 Nov 2025)
// changed VAT, IMTT, the PE threshold and mining loss carry-forward, but
// announced NO PAYE band change, and nothing has been gazetted since.
//
// So the 2025 tables are the operative tables for 2026 pay runs. They are
// encoded here as 2025 tables carrying an explicit `carriedForwardTo: 2026`
// rather than relabelled 2026 — when ZIMRA does publish, that gives a clean diff
// instead of a silent overwrite.
//
// ⚠ Several commercial calculators publish confidently wrong "2026 ZIMRA
//   tables" (one has a 4-band ZWG structure that exists in no gazette). Do not
//   seed from them.
//
// RE-VERIFIED 2026-08-26 against ZIMRA's own pages. Nothing changed; recorded so
// the next reader knows when this was last actually looked at rather than
// assumed:
//
//   • zimra.co.zw/domestic-taxes/tax-tables still lists NOTHING for 2026. The
//     newest entries remain "USD Jan-Dec 2025" and "ZWG 2025". The
//     carriedForwardTo: 2026 position below is therefore still correct.
//   • The PAYE page confirms the thresholds encoded here: USD 100/month and
//     ZWG 2,800/month tax-free, top rate 40%.
//   • The same page states, verbatim, "Calculate 3% Aids Levy and add to tax
//     after credits" — which confirms ZW_AIDS_LEVY_BASIS = 'after_credits'.
//     That was a judgement call when it was made; it is now sourced.
//
// The commercial calculators warned about above are STILL publishing "2026"
// tables. They remain unsourced.
//
// THE CURRENCY DIMENSION is architectural, not cosmetic. ZIMRA publishes two
// entirely separate tables, and the choice between them is a RULE:
//   1. USD-only pay          → USD tables
//   2. ZWG-only pay          → ZWG tables
//   3. Mixed USD + ZWG       → USD tables, ZWG portion converted at the
//                              prevailing interbank rate ON THE DAY OF PAYMENT
// That last clause is the trap: the rate is a TRANSACTION-DATE input, not a
// period constant. It must be captured on the run and stored immutably, or
// every historic payslip silently re-renders at today's rate.
//
// Tax year: 1 January – 31 December. Portal: TaRMS.
// Residents and non-residents use the SAME tables.
// ─────────────────────────────────────────────────────────────────────────────

/** The two currencies ZIMRA gazettes separate tables for. */
export type ZwCurrency = 'USD' | 'ZWG';

/**
 * A PAYE band in ZIMRA's published slope-intercept form:
 *
 *     tax = income × rate − deduct
 *
 * The same shape as the SARS tables, which is why the existing table-driven
 * band evaluator carries over with no new maths.
 */
export interface ZwTaxBand {
  /** Exclusive lower edge, ANNUAL, in the band's own currency. */
  from: number;
  /** Inclusive upper edge, ANNUAL. */
  to: number;
  rate: number;
  /** The "deduct Y" term, ANNUAL. */
  deduct: number;
}

/**
 * Pay periodicities ZIMRA gazettes a table for.
 *
 * ZIMRA publishes daily, weekly, fortnightly, monthly AND annual tables, and
 * they are separately rounded rather than derived. We hold the ANNUAL table as
 * the source of truth and derive the rest, because the published ZWG
 * sub-monthly PDF contains OCR-grade artefacts (band edges like 646.15 → 646.17,
 * and `#` placeholders in the first row's "from" column). Deriving reproduces
 * the gazetted thresholds — USD daily 3.29, weekly 23.08, fortnightly 46.15 —
 * without transcribing the corruption.
 *
 * ⚠ SIGN-OFF GATE: confirm the ZWG sub-monthly band edges against a clean
 *   gazette copy before a live filing.
 */
export type ZwPeriodicity = 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'annual';

export const ZW_PERIODS_PER_YEAR: Record<ZwPeriodicity, number> = {
  daily: 365,
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
  annual: 1,
};

/**
 * WHERE DOES THE AIDS LEVY GO?
 *
 * ZIMRA's published order of operations applies the 3% levy AFTER tax credits.
 * Some Zimbabwean payroll packages apply it to pre-credit tax. It is a small
 * number that will be audited, so it is a named flag rather than a decision
 * buried in the calculation — the same treatment as the Zambian PAYE base.
 *
 * ⚠ PRACTITIONER SIGN-OFF GATE.
 */
export type ZwAidsLevyBasis = 'after_credits' | 'before_credits';
export const ZW_AIDS_LEVY_BASIS: ZwAidsLevyBasis = 'after_credits';
export const ZW_AIDS_LEVY_RATE = 0.03;

/**
 * Is the employee's NSSA (POBS) contribution an allowable deduction for PAYE?
 *
 * YES — sourced 2026-10-20 from ZIMRA's own FDS Guide (reviewed Feb 2014): both
 * worked examples deduct NSSA before the tables ("Less: Pension contributions
 * 180 / NSSA 120 / Old Mutual RAF 80 … Taxable Income 2,070.00") and it states
 * "The contributions are deducted before applying tax." Statute: s15(2)(h) and
 * the Sixth Schedule, Income Tax Act [Ch. 23:06]. Shares one annual cap with
 * pension and RA contributions (deductions.pensionAnnualCapUsd).
 *
 * A flag, not a constant buried in the engine, so a practitioner who reads the
 * Sixth Schedule differently can turn it and see every test that moves.
 */
export const ZW_NSSA_DEDUCTIBLE = true;

/**
 * NSSA insurable-earnings ceiling.
 *
 * ⚠ GAZETTED QUARTERLY. This cannot be a hardcoded constant — it needs the same
 *   treatment as an exchange rate: a dated table with the run stamped against
 *   the applicable entry. A hardcoded ceiling silently under-deducts for a whole
 *   quarter before anyone notices.
 */
export interface ZwNssaCeilingEntry {
  /** Inclusive start of the quarter this ceiling applies from (UTC). */
  effectiveFrom: string;   // 'YYYY-MM-DD'
  /** Monthly insurable-earnings ceiling, USD. */
  ceilingUsd: number;
  source: string;
  /** True when this entry is being used beyond its gazetted quarter. */
  provisional?: boolean;
}

/**
 * Dated NSSA ceilings, oldest first.
 *
 * CHECKED 2026-08-26 against nssa.org.zw/scheduleofinsurableearnings: the
 * schedule lists USD 700.00 effective 01/06/2024 with NO end date. So the figure
 * below is right, and it has been stable for over two years — this file used to
 * claim the ceiling "moves every quarter", which the published schedule does not
 * support. Historic entries change at irregular intervals, not quarterly.
 *
 * `provisional` is KEPT anyway, for a reason that survives the correction: we
 * hold only the USD side. NSSA's schedule also carries a ZiG equivalent that
 * does move, and a ZWG-denominated employer is capped against that, not against
 * a converted 700. Until a ZiG series is held here, a ZWG run's cap is an
 * inference — and an inference presented as a certainty is how a wrong
 * contribution gets remitted with confidence.
 */
export const ZW_NSSA_CEILINGS: ZwNssaCeilingEntry[] = [
  {
    effectiveFrom: '2025-01-01',
    ceilingUsd: 700,
    source:
      'NSSA schedule of insurable earnings (nssa.org.zw), USD 700.00 effective 01/06/2024, ' +
      'no end date. Verified 2026-08-26. ZiG equivalent not held — see the note above.',
    provisional: true,
  },
];

export interface ZwTaxCredits {
  /** Elderly person (55+). USD per year, spread over 12 months. */
  elderlyAnnual: number;
  /** Blind or disabled person. USD per year. */
  disabilityAnnual: number;
  /** Medical expenses — proportion of qualifying spend. Residents only. */
  medicalRate: number;
  /** Invalid appliance — proportion of cost. Residents only. */
  invalidApplianceRate: number;
}

export interface ZwTaxConfig {
  taxYear: number;
  /** The year these tables were gazetted for, if different from taxYear. */
  gazettedFor: number;
  carriedForwardTo?: number;

  /** ANNUAL bands per currency. Sub-annual periods derive from these. */
  bands: Record<ZwCurrency, ZwTaxBand[]>;

  aidsLevy: { rate: number; basis: ZwAidsLevyBasis };

  deductions: {
    /**
     * Statutory pension cap, USD per year, aggregate across all funds. Excess is
     * disallowed and RECORDED, to reduce the taxable portion of the pension at
     * maturity.
     *
     * Under the ZWG regime ZIMRA gazettes no local-currency limit, so the user
     * supplies the monthly converted equivalent.
     */
    pensionAnnualCapUsd: number;
  };

  exemptions: {
    /**
     * Bonus / performance award exemption, USD per year of assessment, across
     * single or multiple bonuses.
     *
     * Raised from USD 400 by FINANCE ACT NO. 2 OF 2024. ZIMRA's own website
     * still shows the superseded 400 figure — the Act governs.
     */
    bonusAnnualUsd: number;
  };

  credits: ZwTaxCredits;

  nssa: {
    /** POBS — pension. Employee and employer each. */
    pobsEmployeeRate: number;
    pobsEmployerRate: number;
    ceilings: ZwNssaCeilingEntry[];
    /**
     * Domestic workers and the informal sector are expressly NOT covered by
     * POBS. A Zimbabwean domestic employer has PAYE and ZIMDEF exposure but no
     * NSSA pension obligation — directly relevant to FISI positioning.
     */
    excludesDomesticWorkers: true;
  };

  /**
   * ZIMDEF training levy — 1%, employer only.
   *
   * ⚠ ITS BASE IS WIDER THAN GROSS PAY. It is charged on the gross wage bill
   *   INCLUSIVE of allowances, bonuses, benefits, the employer's own NSSA
   *   contribution, medical aid, NEC dues and pension contributions. A naive
   *   `1% × gross` understates it. This is the ZW analogue of the SDL base
   *   question, and it is got wrong by default.
   */
  zimdef: { rate: number };

  notes: string[];
}

/**
 * USD table — ZIMRA Jan–Dec 2025, operative for 2026.
 *
 * Held ANNUAL. Monthly equivalents (the form ZIMRA publishes most visibly):
 *   0–100 @ 0% · 100.01–300 @ 20% less 20 · 300.01–1,000 @ 25% less 35
 *   1,000.01–2,000 @ 30% less 85 · 2,000.01–3,000 @ 35% less 185
 *   3,000.01+ @ 40% less 335
 *
 * Every band edge is continuous — at 300, 20% less 20 and 25% less 35 both give
 * 40. That continuity is asserted in the tests; a transcription slip breaks it.
 */
export const ZW_BANDS_USD_2025: ZwTaxBand[] = [
  { from: 0,     to: 1200,     rate: 0,    deduct: 0 },
  { from: 1200,  to: 3600,     rate: 0.20, deduct: 240 },
  { from: 3600,  to: 12000,    rate: 0.25, deduct: 420 },
  { from: 12000, to: 24000,    rate: 0.30, deduct: 1020 },
  { from: 24000, to: 36000,    rate: 0.35, deduct: 2220 },
  { from: 36000, to: Infinity, rate: 0.40, deduct: 4020 },
];

/**
 * ZWG table — ZIMRA 1 Jan – 31 Dec 2025, operative for 2026.
 *
 * Monthly equivalents:
 *   0–2,800 @ 0% · 2,800.01–8,400 @ 20% less 560
 *   8,400.01–28,000 @ 25% less 980 · 28,000.01–56,000 @ 30% less 2,380
 *   56,000.01–84,000 @ 35% less 5,180 · 84,000.01+ @ 40% less 9,380
 */
export const ZW_BANDS_ZWG_2025: ZwTaxBand[] = [
  { from: 0,       to: 33600,    rate: 0,    deduct: 0 },
  { from: 33600,   to: 100800,   rate: 0.20, deduct: 6720 },
  { from: 100800,  to: 336000,   rate: 0.25, deduct: 11760 },
  { from: 336000,  to: 672000,   rate: 0.30, deduct: 28560 },
  { from: 672000,  to: 1008000,  rate: 0.35, deduct: 62160 },
  { from: 1008000, to: Infinity, rate: 0.40, deduct: 112560 },
];

export const ZW_TAX_CONFIG_2026: ZwTaxConfig = {
  taxYear: 2026,
  gazettedFor: 2025,
  carriedForwardTo: 2026,
  bands: { USD: ZW_BANDS_USD_2025, ZWG: ZW_BANDS_ZWG_2025 },
  aidsLevy: { rate: ZW_AIDS_LEVY_RATE, basis: ZW_AIDS_LEVY_BASIS },
  // Combined cap — pension + NSSA + retirement annuity — USD 5,400 a year
  // (Sage Zimbabwe Payroll Summary, Jan 2026; ZIMRA PN 9 of 2024 moved the limits to USD).
  deductions: { pensionAnnualCapUsd: 5400 },
  exemptions: { bonusAnnualUsd: 700 },
  credits: {
    elderlyAnnual: 900,
    disabilityAnnual: 900,
    medicalRate: 0.5,
    invalidApplianceRate: 0.5,
  },
  nssa: {
    pobsEmployeeRate: 0.045,
    pobsEmployerRate: 0.045,
    ceilings: ZW_NSSA_CEILINGS,
    excludesDomesticWorkers: true,
  },
  zimdef: { rate: 0.01 },
  notes: [
    'No 2026 PAYE table has been gazetted; the 2025 tables are operative.',
    'Residents and non-residents use the same tables.',
    'Zimbabwe runs a Final Deduction System (FDS) — the EMPLOYER is responsible for arriving at the correct ANNUAL tax per employee.',
    'There is no national minimum wage; NEC sector rates govern. Do not ship a minimum-wage validator.',
    'PAYE is remitted in the currency in which the income was earned.',
  ],
};

export const ZW_TAX_CONFIGS: Record<number, ZwTaxConfig> = {
  2026: ZW_TAX_CONFIG_2026,
};

/** Resolve the config for a tax year, falling back to the newest held. */
export function zwConfigForYear(year: number): ZwTaxConfig {
  const exact = ZW_TAX_CONFIGS[year];
  if (exact) return exact;
  const years = Object.keys(ZW_TAX_CONFIGS).map(Number).sort((a, b) => a - b);
  return ZW_TAX_CONFIGS[years[years.length - 1]];
}

/** True when the tables in use were gazetted for an earlier year. */
export function zwIsCarriedForward(cfg: ZwTaxConfig): boolean {
  return cfg.gazettedFor !== cfg.taxYear;
}

/**
 * The NSSA ceiling applicable at a date.
 *
 * Returns the newest entry effective on or before `on`. `provisional` is
 * propagated so the caller can say out loud that a quarterly figure is being
 * used beyond its quarter.
 */
export function zwNssaCeilingAt(on: Date, cfg: ZwTaxConfig = ZW_TAX_CONFIG_2026): ZwNssaCeilingEntry {
  const t = on.getTime();
  const applicable = cfg.nssa.ceilings
    .filter(c => new Date(`${c.effectiveFrom}T00:00:00Z`).getTime() <= t)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  return applicable[applicable.length - 1] ?? cfg.nssa.ceilings[0];
}

/** P2 monthly PAYE remittance — due the 10th of the following month. */
export function zwP2DueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 10));
}

/** ZIMDEF monthly declaration — due the 15th of the following month. */
export function zwZimdefDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 15));
}

/** ITF16 annual employer reconciliation — within 30 days of year end. */
export function zwItf16DueDate(taxYear: number): Date {
  return new Date(Date.UTC(taxYear + 1, 0, 30));
}

/** P6 employee tax certificates — within 30 days of year end. */
export function zwP6DueDate(taxYear: number): Date {
  return new Date(Date.UTC(taxYear + 1, 0, 30));
}

/**
 * Scale an ANNUAL band table to a pay periodicity.
 *
 * Both the edges and the `deduct` term scale by the same divisor, which is what
 * keeps the slope-intercept form valid at every periodicity.
 */
export function zwBandsForPeriod(annual: ZwTaxBand[], periodicity: ZwPeriodicity): ZwTaxBand[] {
  const n = ZW_PERIODS_PER_YEAR[periodicity];
  if (n === 1) return annual;
  return annual.map(b => ({
    from: b.from / n,
    to: b.to === Infinity ? Infinity : b.to / n,
    rate: b.rate,
    deduct: b.deduct / n,
  }));
}

/**
 * The exchange rate stamped on a payroll run.
 *
 * `rate` is ZWG per 1 USD, as at `asAtDate` — the DAY OF PAYMENT, not the period
 * end. Stored on the run and never recomputed: re-deriving it later would make
 * every historic payslip re-render at today's rate, which is the same class of
 * plausible-wrong bug as period-natured-versus-cumulative reporting.
 */
export interface ZwExchangeRate {
  /** ZWG per 1 USD. */
  rate: number;
  /** ISO date the rate was taken for — the transaction date. */
  asAtDate: string;
  source: string;
}

export const ZW_LATE_PAYMENT = {
  /** Exported for display. Not applied automatically — unverified. */
  verified: false,
} as const;
