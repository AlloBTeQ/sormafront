// src/lib/payroll/zm/config.ts
// ─────────────────────────────────────────────────────────────────────────────
// Zambia (ZRA) payroll constants — dated tables, not literals.
//
// Everything in this file that the legislature can move lives in a DATED table
// keyed by charge year, and the run is stamped against the applicable entry.
// Two of these move on their own schedule and have burned other jurisdictions
// in this codebase already:
//
//   • NAPSA ceiling — reset every January off National Average Earnings.
//   • PAYE bands    — set by the annual Budget / Income Tax (Amendment) Act.
//
// Tax year ("charge year"): 1 January – 31 December. Some third-party guides
// still say April–March; that changed years ago and is wrong.
// Currency: ZMW. Personal return due 21 June following year end.
// ─────────────────────────────────────────────────────────────────────────────

export interface ZmTaxBand {
  /** Exclusive lower edge, MONTHLY ZMW. */
  from: number;
  /** Inclusive upper edge, MONTHLY ZMW. */
  to: number;
  rate: number;
  /** Cumulative tax at `from`, MONTHLY ZMW. */
  base: number;
}

/**
 * WHICH BASE DOES PAYE RUN ON?
 *
 * The Zambian market is openly split, and the gap is real money — at K15,000
 * gross it is K277.50 per employee per month, in a direction the payslip cannot
 * show you. This is deliberately a named, exported flag rather than a decision
 * buried inside the calculation.
 *
 *   'gross'
 *       Income Tax (Amendment) Act No. 22 of 2024, s.4 replaced s.37(1) with an
 *       EMPLOYER-ONLY deduction with effect from 1 January 2025, removing the
 *       employee's relief for pension contributions. On this reading PAYE runs
 *       on full gross; NAPSA and NHIMA come off in parallel and do not shrink
 *       the band base. ZRA's own PAYE calculator is reported to behave this way.
 *
 *   'gross_less_napsa'
 *       What several Zambian payroll providers and consultancies still do, and
 *       what they describe not doing as "a common mistake". Not grounded in a
 *       cited amending Act.
 *
 * DEFAULT: 'gross' — the position with a statutory citation behind it.
 *
 * ⚠ PRACTITIONER SIGN-OFF GATE. This does not block development. It blocks a
 *   live filing. Confirm with a Zambian practitioner before the first live run.
 */
export type ZmPayeBase = 'gross' | 'gross_less_napsa';
export const ZM_PAYE_BASE: ZmPayeBase = 'gross';
// Confirmed 2026-10-20: ZRA Employer's Guide to PAYE (2020) — since 1 Jan 2018
// it is "no longer necessary to deduct the allowable pension contribution before
// arriving at chargeable/taxable pay"; Sage Zambia Tax Summary 2026 agrees.
//
// BONUS BASIS — open, recorded here so it is not lost. The same ZRA guide runs
// PAYE on CUMULATIVE tables (YTD pay → Table B/A → less tax already deducted) and
// taxes a bonus as tax(with) − tax(without). For a once-a-year bonus it says "use
// the December table", i.e. the full-year bands — which is what this engine's
// annual-marginal treatment computes. A MID-YEAR or quarterly bonus would use the
// cumulative table to that month (narrower bands), so for employees under K9,200
// a month this engine under-deducts slightly on such a bonus; above K9,200 both
// methods give 37%. Not changed: cumulative needs per-employee YTD, and whether
// ZRA still runs cumulative tables in 2026 is not confirmed (zra.org.zm blocks
// automated access). Gate for a Zambian practitioner.

export interface ZmNapsaTable {
  /** Charge year this entry is gazetted for. */
  year: number;
  /** National Average Earnings the ceiling derives from (monthly ZMW). */
  nationalAverageEarnings: number;
  /** Monthly insurable-earnings ceiling = 4 × NAE. */
  earningsCeiling: number;
  /** Convenience: ceiling × rate, per side, per month. */
  maxContributionPerSide: number;
  /**
   * Set when this entry is a PRIOR year's gazetted figure being used for a later
   * year because the later year's circular has not been obtained. Keeps a clean
   * diff when the real circular lands, instead of a silent overwrite.
   */
  carriedForwardTo?: number;
  source: string;
}

export interface ZmTaxConfig {
  chargeYear: number;
  /** Monthly PAYE bands. Annual = monthly × 12 exactly (verified in tests). */
  bands: ZmTaxBand[];
  taxFreeThreshold: number;
  payeBase: ZmPayeBase;
  napsa: {
    employeeRate: number;
    employerRate: number;
    table: ZmNapsaTable;
  };
  nhima: {
    employeeRate: number;
    employerRate: number;
    /**
     * SI 63 of 2019, Third Schedule: 1% of BASIC SALARY. Most calculators apply
     * 1% of gross. On a package that is 60% basic that is a 40% overstatement of
     * the NHIMA line — encode `basic` and keep the base visible, not assumed.
     */
    base: 'basic' | 'gross';
  };
  /** Skills Development Levy — employer only, on total emoluments. */
  skillsDevelopmentLevy: {
    rate: number;
    /** Deductible against corporate income tax from 2026 (was not before). */
    corporateTaxDeductible: boolean;
  };
  /**
   * Statutory carry-forward marker. Set when the bands in this entry are a prior
   * year's, used because no new table has been gazetted.
   */
  carriedForwardFrom?: number;
  notes: string[];
}

/**
 * PAYE bands — 2025, and unchanged for 2026.
 *
 * PKF Zambia's 2026 Budget Tax Highlights sets the 2026 proposed bands side by
 * side with 2025 and they are IDENTICAL. The Income Tax (Amendment) Act No. 17
 * of 2025 carried other changes (turnover tax, rental tax tiers, a Minimum
 * Alternative Tax, WHT on government securities, reduced late-payment
 * penalties) but left PAYE bands alone.
 *
 * ⚠ DO NOT seed from the widely-circulated "25% / 30% / 37.5% above K9,900"
 *   table. It is on at least one prominent Zambian consultancy's site presented
 *   as the 2026 bands and it is wrong on three of four rows. PKF and the Act
 *   govern. The quarantined engine this file replaces carried the 37.5% error.
 *
 * Same rates for residents and non-residents — there is no separate
 * non-resident employment-income table, and no 15% withholding on employment
 * income. (The predecessor engine had one; it was invented.)
 */
export const ZM_PAYE_BANDS_2026: ZmTaxBand[] = [
  { from: 0,    to: 5100,     rate: 0,    base: 0 },
  { from: 5100, to: 7100,     rate: 0.20, base: 0 },
  { from: 7100, to: 9200,     rate: 0.30, base: 400 },   // 2,000 × 20%
  { from: 9200, to: Infinity, rate: 0.37, base: 1030 },  // 400 + 2,100 × 30%
];

/**
 * NAPSA ceiling.
 *
 * 2025 is the last figure traceable to a citable source (PwC): NAE K8,541,
 * ceiling 4 × NAE = K34,164, max K1,708.20 per side per month.
 *
 * For 2026 the sources split — several still carry K34,164 / K1,708.20, others
 * assert K37,236 / K1,861.80 (implying NAE ≈ K9,309). NAPSA gazettes this each
 * January. Until the 2026 circular is in hand we carry the 2025 figure forward
 * EXPLICITLY rather than guess an uplift.
 *
 * ⚠ PRACTITIONER SIGN-OFF GATE: obtain the 2026 NAPSA circular and either
 *   confirm this entry or add a real 2026 one.
 */
export const ZM_NAPSA_2025: ZmNapsaTable = {
  year: 2025,
  nationalAverageEarnings: 8541,
  earningsCeiling: 34164,
  maxContributionPerSide: 1708.2,
  carriedForwardTo: 2026,
  source: 'PwC Worldwide Tax Summaries (2025). 2026 circular not yet obtained.',
};

export const ZM_TAX_CONFIG_2026: ZmTaxConfig = {
  chargeYear: 2026,
  bands: ZM_PAYE_BANDS_2026,
  taxFreeThreshold: 5100,
  payeBase: ZM_PAYE_BASE,
  napsa: {
    employeeRate: 0.05,
    employerRate: 0.05,
    table: ZM_NAPSA_2025,
  },
  nhima: {
    employeeRate: 0.01,
    employerRate: 0.01,
    base: 'basic',
  },
  skillsDevelopmentLevy: {
    rate: 0.005,
    corporateTaxDeductible: true,
  },
  carriedForwardFrom: 2025,
  notes: [
    'PAYE bands identical to 2025 (PKF Zambia 2026 Budget Tax Highlights).',
    'NAPSA ceiling carried forward from 2025 — 2026 circular outstanding.',
    'Casual and part-time workers are in scope for PAYE and NAPSA; NAPSA applies from one day of employment.',
    'Expatriates covered by an approved home-country scheme are the only NAPSA exemption.',
  ],
};

/** Charge-year → config. Add a new entry; never edit a shipped one in place. */
export const ZM_TAX_CONFIGS: Record<number, ZmTaxConfig> = {
  2026: ZM_TAX_CONFIG_2026,
};

/**
 * Resolve the config for a charge year.
 *
 * Falls back to the newest config we hold rather than throwing, so a run dated
 * into a year we have not tabled still calculates — but the caller can see the
 * mismatch via `config.chargeYear`, and `isCarriedForward` says so out loud.
 */
export function zmConfigForYear(year: number): ZmTaxConfig {
  const exact = ZM_TAX_CONFIGS[year];
  if (exact) return exact;
  const years = Object.keys(ZM_TAX_CONFIGS).map(Number).sort((a, b) => a - b);
  const newest = years[years.length - 1];
  return ZM_TAX_CONFIGS[newest];
}

/** True when the bands or the NAPSA ceiling in use are a prior year's. */
export function zmIsCarriedForward(cfg: ZmTaxConfig, forYear: number): boolean {
  return cfg.chargeYear !== forYear
    || cfg.carriedForwardFrom !== undefined
    || cfg.napsa.table.year !== forYear;
}

/**
 * Everything is due on the 10th of the following month: P11 PAYE return and
 * remittance (ZRA), NAPSA Schedule 1, NHIMA return, Skills Development Levy.
 */
export function zmMonthlyDueDate(periodEnd: Date): Date {
  return new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 10));
}

/**
 * Late PAYE: 5% penalty on the amount due, plus interest at BoZ discount rate
 * + 2%. The 2026 Act reduced late-payment penalties generally — whether this
 * specific rate moved is a sign-off gate, so this is exported for display and
 * deliberately not applied automatically anywhere.
 */
export const ZM_LATE_PAYMENT = {
  penaltyRate: 0.05,
  interestOverBozDiscountRate: 0.02,
  verified: false,
} as const;
