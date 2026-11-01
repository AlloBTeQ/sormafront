// src/lib/services/payroll/engine/ZWTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Zimbabwe — ZIMRA PAYE engine.
//
// Thin engine over a pure, deterministic calc, mirroring ZATaxEngine /
// BOTSTaxEngine / ZAMTaxEngine's `calculate(...)` contract and emitting the SAME
// field names toPayslipEntry() normalises.
//
// TAX YEAR 2026 (1 January – 31 December), on tables gazetted for 2025 — see
// config.ts for why. Key facts:
//   • TWO currencies, two gazetted tables, and the choice between them is a RULE
//     not a preference. Mixed USD+ZWG pay uses the USD tables.
//   • Bands are slope-intercept (`income × rate − deduct`), the same shape as
//     SARS — so the band evaluator is the existing one, with no new maths.
//   • 3% AIDS levy, applied AFTER credits per ZIMRA's published sequence.
//   • Credits are capped at tax payable: they cannot create a refund position.
//   • PAYE is REMITTED IN THE CURRENCY EARNED. A mixed-currency employer files
//     and pays in both, so the result carries a currency split.
//   • Final Deduction System: the EMPLOYER, not ZIMRA, is responsible for the
//     correct ANNUAL tax. That is the same problem SARS averaging solves, so the
//     cumulative primitive is reused rather than reimplemented.
//
// ZIMRA'S ORDER OF OPERATIONS — do not reorder:
//     gross remuneration (cash + taxable benefits)
//       − exempt income (bonus up to the limit)
//       = income
//       − allowable deductions (pension, professional subs, tradesman's tools)
//       = taxable income
//       → apply the ZWG or USD table
//       = PAYE before credits
//       − tax credits (elderly, blind, disabled, medical, invalid appliance)
//       = tax payable
//       + 3% AIDS Levy on tax payable
//       = total remitted to ZIMRA
// ─────────────────────────────────────────────────────────────────────────────

import {
  ZW_TAX_CONFIG_2026,
  ZW_PERIODS_PER_YEAR,
  zwBandsForPeriod,
  zwConfigForYear,
  zwNssaCeilingAt,
  type ZwCurrency,
  type ZwPeriodicity,
  type ZwTaxBand,
  type ZwTaxConfig,
  ZW_NSSA_DEDUCTIBLE,
} from '@/lib/payroll/zw/config';
import { zwMonthlyTaxableBenefits } from '@/lib/payroll/zw/benefits';

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

/** Normalise whatever the model stores onto a gazetted periodicity. */
export function zwPeriodicity(freq?: string): ZwPeriodicity {
  switch (String(freq ?? '').toLowerCase()) {
    case 'daily': return 'daily';
    case 'weekly': return 'weekly';
    case 'fortnightly':
    case 'bi_weekly':
    case 'bi-weekly': return 'fortnightly';
    case 'annual':
    case 'annually': return 'annual';
    default: return 'monthly';
  }
}

/**
 * PAYE from a slope-intercept band table. Pure.
 *
 *     tax = income × rate − deduct,  for from < income <= to
 *
 * The tables are continuous at every edge (at USD 300/month, 20% less 20 and
 * 25% less 35 both give 40), so this needs no bracket-stacking.
 */
export function zwTaxFromBands(income: number, bands: ZwTaxBand[]): number {
  if (income <= 0) return 0;
  for (const b of bands) {
    if (income > b.from && income <= b.to) {
      return Math.max(0, income * b.rate - b.deduct);
    }
  }
  const top = bands[bands.length - 1];
  return Math.max(0, income * top.rate - top.deduct);
}

/**
 * WHICH TABLE APPLIES.
 *
 * ZIMRA's guidance is explicit: where remuneration has BOTH local (ZWG) and USD
 * components, the USD tables apply. The mixed case does not split the tax
 * calculation — only the remittance.
 */
export function zwResolveTableCurrency(usdPortion: number, zwgPortion: number): ZwCurrency {
  const hasUsd = usdPortion > 0;
  const hasZwg = zwgPortion > 0;
  if (hasUsd && hasZwg) return 'USD';  // mixed → USD tables
  if (hasZwg) return 'ZWG';
  return 'USD';                        // USD-only, and the default for zero pay
}

export interface ZwCredits {
  /** Employee is 55 or over at any time in the year of assessment. */
  elderly?: boolean;
  /** Blind or disabled person's credit. */
  disabled?: boolean;
  /** Qualifying medical spend for the period, INCLUDING medical-aid society
   *  contributions. Residents only. */
  medicalSpend?: number;
  /** Invalid appliance cost for the period. Residents only. */
  invalidApplianceCost?: number;
  /** Credits are residents-only except the elderly/disability ones. */
  isResident?: boolean;
}

export interface ZwCalcInput {
  /** Cash pay for the period, in USD. */
  usdPay?: number;
  /** Cash pay for the period, in ZWG. */
  zwgPay?: number;
  /**
   * ZWG per 1 USD, as at the DAY OF PAYMENT. Required only when pay is mixed.
   * Stamped on the run; never recomputed.
   */
  interbankRate?: number;
  freq?: string;

  /** Recurring taxable benefits-in-kind for the period, in the TABLE currency. */
  taxableBenefitsPerPeriod?: number;
  /** Bonus / performance award paid this period, in the table currency. */
  bonusThisPeriod?: number;
  /**
   * Bonus exemption ALREADY used earlier in this year of assessment, in the
   * table currency. The USD 700 exemption is annual; without this every bonus
   * got a fresh 700, so a second bonus in the year was under-taxed.
   */
  bonusExemptUsedYtd?: number;

  /** Employee pension contribution for the period, in the table currency. */
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
  /**
   * ZWG regime only: the monthly converted equivalent of the USD 5,400/yr
   * pension cap. ZIMRA gazettes no local-currency limit, so the user supplies it.
   */
  pensionMonthlyCapOverride?: number;

  /** Professional subscriptions and tradesman's tools — actual, deductible. */
  otherDeductiblePerPeriod?: number;

  credits?: ZwCredits;

  /** NSSA POBS exemption (domestic workers, informal sector). */
  nssaExempt?: boolean;
  /** NSSA APWCS (workers' comp) rate by industry code — employer only, opt-in. */
  apwcsRate?: number;
  /** NEC dues for the period — sector-specific, both sides. */
  necEmployeePerPeriod?: number;
  necEmployerPerPeriod?: number;
  /** Employer medical-aid contribution — inside the ZIMDEF base. */
  medicalAidEmployerPerPeriod?: number;

  /** Date of payment — drives the NSSA quarterly ceiling lookup. */
  payDate?: Date;
  config?: ZwTaxConfig;
}

export interface ZwCalcResult {
  /** Which gazetted table was applied, and why. */
  tableCurrency: ZwCurrency;
  currencyBasis: 'usd_only' | 'zwg_only' | 'mixed_usd_tables';
  /** Rate used to convert the ZWG portion. 1 when not mixed. */
  interbankRate: number;

  /** Cash gross for the period, expressed in the TABLE currency. */
  grossPay: number;
  taxableBenefits: number;
  /** After the bonus exemption. */
  income: number;
  allowableDeductions: number;
  taxableIncome: number;

  payeBeforeCredits: number;
  creditsApplied: number;
  taxPayable: number;
  aidsLevy: number;
  /** taxPayable + aidsLevy — what reaches ZIMRA. */
  totalToZimra: number;

  /**
   * Remittance split, because PAYE is paid in the currency earned.
   * Both are in their OWN currency, not converted.
   */
  remittance: { usd: number; zwg: number };

  nssaEmployee: number;
  nssaEmployer: number;
  nssaCapped: boolean;
  nssaCeilingProvisional: boolean;
  apwcs: number;
  necEmployee: number;
  necEmployer: number;
  /** ZIMDEF, on the WIDE base — see config. */
  zimdef: number;
  zimdefBase: number;

  pensionEmployee: number;
  pensionEmployer: number;
  /** Contribution disallowed by the cap — recorded, not discarded. */
  pensionDisallowed: number;

  totalDeductions: number;
  netPay: number;
  employerCost: number;

  annualTaxableIncome: number;
  effectiveTaxRate: number;
  taxYear: number;
  tablesCarriedForward: boolean;
}

/** Deterministic, pure Zimbabwean per-period payslip calc. */
export function calculateZwPayslip(input: ZwCalcInput): ZwCalcResult {
  const cfg = input.config ?? ZW_TAX_CONFIG_2026;
  const periodicity = zwPeriodicity(input.freq);
  const n = ZW_PERIODS_PER_YEAR[periodicity];

  const usdPay = Math.max(0, input.usdPay ?? 0);
  const zwgPay = Math.max(0, input.zwgPay ?? 0);

  // ── 1. Which table, and in which currency do we compute? ──
  const tableCurrency = zwResolveTableCurrency(usdPay, zwgPay);
  const isMixed = usdPay > 0 && zwgPay > 0;
  const currencyBasis: ZwCalcResult['currencyBasis'] =
    isMixed ? 'mixed_usd_tables' : (tableCurrency === 'ZWG' ? 'zwg_only' : 'usd_only');

  // The rate converts the ZWG portion INTO the table currency. Only meaningful
  // when mixed; a rate supplied for a single-currency run is ignored rather
  // than silently applied.
  const interbankRate = isMixed ? Math.max(0, input.interbankRate ?? 0) : 1;
  if (isMixed && interbankRate <= 0) {
    throw new Error(
      'Zimbabwe mixed-currency pay requires an interbank rate stamped on the run ' +
      '(ZWG per USD, as at the day of payment). Refusing to guess one — a wrong ' +
      'rate silently misstates PAYE and every historic payslip that re-renders.',
    );
  }

  // Recurring cash, expressed in the table currency.
  const recurringCash = tableCurrency === 'USD'
    ? r2(usdPay + (isMixed ? zwgPay / interbankRate : 0))
    : r2(zwgPay);

  // A bonus is CASH paid on top of recurring pay, so it belongs in gross — the
  // exemption below then removes the exempt slice from TAXABLE income, which is
  // ZIMRA's sequence ("gross remuneration … less exempt income"). Adding it here
  // rather than expecting the caller to fold it into `usdPay` keeps the input
  // unambiguous: `usdPay` is recurring, `bonusThisPeriod` is the one-off.
  const bonus = Math.max(0, input.bonusThisPeriod ?? 0);
  const grossPay = r2(recurringCash + bonus);

  // ── 2. ZIMRA's order of operations ──
  const benefits = Math.max(0, input.taxableBenefitsPerPeriod ?? 0);
  const grossRemuneration = grossPay + benefits;
  const bonusCapInTableCurrency = tableCurrency === 'USD'
    ? cfg.exemptions.bonusAnnualUsd
    : cfg.exemptions.bonusAnnualUsd * (input.interbankRate ?? 0);
  const bonusCapRemaining = Math.max(0, bonusCapInTableCurrency - Math.max(0, input.bonusExemptUsedYtd ?? 0));
  const bonusExempt = Math.min(bonus, bonusCapRemaining);
  const income = Math.max(0, grossRemuneration - bonusExempt);

  // ── 2b. NSSA POBS — ceiling is gazetted QUARTERLY ──
  // Computed BEFORE taxable income because the employee's contribution is an
  // allowable deduction (see the combined cap below). It used to be computed
  // after tax, so PAYE ran on gross and every ZW payslip was over-taxed.
  const ceilingEntry = zwNssaCeilingAt(input.payDate ?? new Date(Date.UTC(cfg.taxYear, 0, 1)), cfg);
  // The ceiling is published in USD. Under the ZWG regime it converts at the
  // day's rate; without one we cannot cap honestly, so we do not.
  const ceilingInTableCurrency = tableCurrency === 'USD'
    ? ceilingEntry.ceilingUsd * (12 / n)
    : (input.interbankRate
        ? ceilingEntry.ceilingUsd * input.interbankRate * (12 / n)
        : Number.POSITIVE_INFINITY);

  const nssaBaseUncapped = grossPay;
  const nssaBase = input.nssaExempt ? 0 : Math.min(nssaBaseUncapped, ceilingInTableCurrency);
  const nssaCapped = !input.nssaExempt && nssaBaseUncapped > ceilingInTableCurrency;
  const nssaEmployee = r2(nssaBase * cfg.nssa.pobsEmployeeRate);
  const nssaEmployer = r2(nssaBase * cfg.nssa.pobsEmployerRate);

  // Allowable deductions: pension AND employee NSSA, under ONE combined cap,
  // plus professional subs / tools.
  //
  // NSSA IS DEDUCTIBLE. ZIMRA's FDS Guide (reviewed Feb 2014) deducts it in both
  // worked examples — "Less: Pension contributions 180 / NSSA 120 / Old Mutual
  // RAF 80" — and states "The contributions are deducted before applying tax."
  // s15(2)(h) Income Tax Act [Ch. 23:06] (Sixth Schedule). The cap is shared by
  // pension, NSSA and retirement annuities: USD 5,400 a year per Sage Zimbabwe
  // Payroll Summary (Jan 2026), following ZIMRA Public Notice 9 of 2024 moving
  // the limits into USD. Before 2026-10-20 this engine taxed gross. Gate: ZW_NSSA_DEDUCTIBLE.
  const pensionActual = Math.max(0, input.pensionEmployeePerPeriod ?? 0);
  const pensionCapPerPeriod = tableCurrency === 'USD'
    ? cfg.deductions.pensionAnnualCapUsd / n
    // ZIMRA gazettes no ZWG pension limit; the user supplies the monthly
    // converted equivalent. Absent one, the contribution is NOT capped — better
    // than inventing a limit that does not exist.
    : (input.pensionMonthlyCapOverride != null
        ? input.pensionMonthlyCapOverride * (12 / n)
        : Number.POSITIVE_INFINITY);
  // NSSA first (statutory, always paid), then pension, against the shared cap.
  const nssaClaim = ZW_NSSA_DEDUCTIBLE ? nssaEmployee : 0;
  const nssaDeductible = Math.min(nssaClaim, pensionCapPerPeriod);
  const pensionDeductible = Math.min(pensionActual, Math.max(0, pensionCapPerPeriod - nssaDeductible));
  const pensionDisallowed = r2(Math.max(0, pensionActual - pensionDeductible));

  const otherDeductible = Math.max(0, input.otherDeductiblePerPeriod ?? 0);
  const allowableDeductions = r2(nssaDeductible + pensionDeductible + otherDeductible);
  const taxableIncome = Math.max(0, income - allowableDeductions);

  // ── 3. Apply the table ──
  const bands = zwBandsForPeriod(cfg.bands[tableCurrency], periodicity);
  const payeBeforeCredits = r2(zwTaxFromBands(taxableIncome, bands));

  // ── 4. Credits, capped at tax payable — they cannot create a refund ──
  const c = input.credits ?? {};
  const isResident = c.isResident !== false;
  const perPeriod = (annual: number) => annual / n;
  let creditsRaw = 0;
  if (c.elderly) creditsRaw += perPeriod(cfg.credits.elderlyAnnual);
  if (c.disabled) creditsRaw += perPeriod(cfg.credits.disabilityAnnual);
  if (isResident) {
    creditsRaw += Math.max(0, c.medicalSpend ?? 0) * cfg.credits.medicalRate;
    creditsRaw += Math.max(0, c.invalidApplianceCost ?? 0) * cfg.credits.invalidApplianceRate;
  }
  const creditsApplied = r2(Math.min(creditsRaw, payeBeforeCredits));
  const taxPayable = r2(payeBeforeCredits - creditsApplied);

  // ── 5. AIDS levy — 3%, on the basis the config names ──
  const levyBase = cfg.aidsLevy.basis === 'before_credits' ? payeBeforeCredits : taxPayable;
  const aidsLevy = r2(levyBase * cfg.aidsLevy.rate);
  const totalToZimra = r2(taxPayable + aidsLevy);

  // ── 6. Remittance split — PAYE is paid in the currency EARNED ──
  // Pro-rated by the currency composition of cash pay. Single-currency runs
  // land entirely on one side, which is the common case.
  let remitUsd = 0;
  let remitZwg = 0;
  if (isMixed) {
    // Split by the currency composition of RECURRING cash — the bonus follows
    // the same proportions unless the employer says otherwise, and inventing a
    // separate bonus currency here would be a guess.
    const zwgAsUsd = zwgPay / interbankRate;
    const totalUsdEquivalent = usdPay + zwgAsUsd;
    const usdShare = totalUsdEquivalent > 0 ? usdPay / totalUsdEquivalent : 1;
    remitUsd = r2(totalToZimra * usdShare);
    // The ZWG side is expressed in ZWG, converted back at the same stamped rate.
    remitZwg = r2((totalToZimra - remitUsd) * interbankRate);
  } else if (tableCurrency === 'USD') {
    remitUsd = totalToZimra;
  } else {
    remitZwg = totalToZimra;
  }

  // ── 7. NSSA POBS — computed in step 2b, before taxable income. ──

  // NSSA APWCS — workers' compensation, employer only, industry-rated, opt-in.
  const apwcs = r2(grossPay * Math.max(0, input.apwcsRate ?? 0));

  const necEmployee = r2(Math.max(0, input.necEmployeePerPeriod ?? 0));
  const necEmployer = r2(Math.max(0, input.necEmployerPerPeriod ?? 0));
  const pensionEmployer = r2(Math.max(0, input.pensionEmployerPerPeriod ?? 0));
  const medicalAidEmployer = r2(Math.max(0, input.medicalAidEmployerPerPeriod ?? 0));

  // ── 8. ZIMDEF — the WIDE base ──
  // Gross wage bill INCLUSIVE of allowances, bonuses, benefits, the employer's
  // own NSSA and pension contributions, medical aid and NEC dues. `1% × gross`
  // understates it, which is the default mistake.
  const zimdefBase = r2(
    grossPay + benefits + nssaEmployer + pensionEmployer + medicalAidEmployer + necEmployer,
  );
  const zimdef = r2(zimdefBase * cfg.zimdef.rate);

  // ── 9. Totals ──
  const pensionEmployee = r2(pensionActual);
  const totalDeductions = r2(totalToZimra + nssaEmployee + pensionEmployee + necEmployee);
  // Benefits are non-cash: they raise tax but never reduce take-home pay.
  const netPay = r2(grossPay - totalDeductions);
  const employerCost = r2(
    grossPay + nssaEmployer + apwcs + zimdef + pensionEmployer + medicalAidEmployer + necEmployer,
  );

  return {
    tableCurrency,
    currencyBasis,
    interbankRate,
    grossPay,
    taxableBenefits: r2(benefits),
    income: r2(income),
    allowableDeductions,
    taxableIncome: r2(taxableIncome),
    payeBeforeCredits,
    creditsApplied,
    taxPayable,
    aidsLevy,
    totalToZimra,
    remittance: { usd: remitUsd, zwg: remitZwg },
    nssaEmployee,
    nssaEmployer,
    nssaCapped,
    nssaCeilingProvisional: !!ceilingEntry.provisional,
    apwcs,
    necEmployee,
    necEmployer,
    zimdef,
    zimdefBase,
    pensionEmployee,
    pensionEmployer,
    pensionDisallowed,
    totalDeductions,
    netPay,
    employerCost,
    annualTaxableIncome: r2(taxableIncome * n),
    effectiveTaxRate: grossRemuneration > 0 ? totalToZimra / grossRemuneration : 0,
    taxYear: cfg.taxYear,
    tablesCarriedForward: cfg.gazettedFor !== cfg.taxYear,
  };
}

export class ZimbabweTaxEngine {
  private config: ZwTaxConfig;
  constructor(config: ZwTaxConfig = ZW_TAX_CONFIG_2026) { this.config = config; }
  getConfig(): ZwTaxConfig { return this.config; }

  /**
   * Matches ZATaxEngine.calculate's positional contract. `levyLiable` is
   * accepted for signature parity but unused — ZIMDEF has no entity-level
   * payroll threshold.
   */
  calculate(
    employee: any,
    _periodStart: string,
    _periodEnd: string,
    payDate?: string,
    _levyLiable = false,
  ) {
    const comp = employee?.compensation ?? {};
    const ded = employee?.deductions ?? {};
    const zw = employee?.taxInfo?.zw ?? {};

    const freq = comp.payFrequency || 'monthly';
    const periodicity = zwPeriodicity(freq);
    const n = ZW_PERIODS_PER_YEAR[periodicity];

    // Pay may be split across the two currencies on the employee record. Where
    // only a single salary is stored, it belongs to the employee's nominated
    // pay currency — defaulting to USD, which is the majority case.
    const basic = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const allowances =
      (Number(comp.housingAllowance) || 0) +
      (Number(comp.transportAllowance) || 0) +
      (Number(comp.otherAllowances) || 0);
    const cash = basic + allowances;

    const payCurrency: ZwCurrency = (zw.payCurrency === 'ZWG') ? 'ZWG' : 'USD';
    const usdPay = zw.usdPay != null ? Number(zw.usdPay) || 0 : (payCurrency === 'USD' ? cash : 0);
    const zwgPay = zw.zwgPay != null ? Number(zw.zwgPay) || 0 : (payCurrency === 'ZWG' ? cash : 0);

    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const pcfg = ded.pension ?? {};
    const pensionOff = pcfg.enabled === false;
    const pensionEmp = pensionOff ? 0 : cash * norm(Number(pcfg.employeePercent ?? 0));
    const pensionEr = pensionOff ? 0 : cash * norm(Number(pcfg.employerPercent ?? 0));

    const payDateObj = payDate ? new Date(payDate) : undefined;
    const cfg = payDate ? zwConfigForYear(new Date(payDate).getUTCFullYear()) : this.config;

    const r = calculateZwPayslip({
      usdPay,
      zwgPay,
      interbankRate: Number(zw.interbankRate) || undefined,
      freq,
      taxableBenefitsPerPeriod: zwMonthlyTaxableBenefits(zw, n),
      pensionEmployeePerPeriod: pensionEmp,
      pensionEmployerPerPeriod: pensionEr,
      pensionMonthlyCapOverride: Number(zw.pensionMonthlyCapZwg) || undefined,
      otherDeductiblePerPeriod: Number(zw.professionalSubscriptions) || 0,
      credits: {
        elderly: !!zw.elderly,
        disabled: !!zw.disabled,
        medicalSpend: Number(zw.medicalSpend) || 0,
        invalidApplianceCost: Number(zw.invalidApplianceCost) || 0,
        isResident: zw.isResident !== false,
      },
      nssaExempt: !!zw.nssaExempt,
      apwcsRate: Number(zw.apwcsRate) || 0,
      necEmployeePerPeriod: Number(zw.necEmployee) || 0,
      necEmployerPerPeriod: Number(zw.necEmployer) || 0,
      medicalAidEmployerPerPeriod: Number(ded.medicalAidEmployer) || 0,
      payDate: payDateObj,
      config: cfg,
    });

    const yt = employee?.ytdTotals ?? {};

    return {
      employeeId: employee?._id,
      employee,
      earnings: {
        basicSalary: basic,
        otherAllowances: allowances,
        overtimePay: 0,
        bonus: 0,
        grossPay: r.grossPay,
        taxableIncome: r.taxableIncome,
      },
      deductions: {
        // `paye` is the name toPayslipEntry maps onto deductions.incomeTax. It
        // carries tax payable PLUS the AIDS levy, because that is one payment
        // to ZIMRA — splitting them here would understate the PAYE liability.
        paye: r.totalToZimra,
        uif: 0,
        socialSecurity: r.nssaEmployee,   // NSSA POBS, on the generic slot
        nssa: r.nssaEmployee,
        pensionFund: r.pensionEmployee,
        nec: r.necEmployee,
        medicalAid: 0,
        totalDeductions: r.totalDeductions,
      },
      netPay: r.netPay,
      employerCosts: {
        uif: 0,
        sdl: r.zimdef,                    // ZIMDEF is the training-levy analogue
        zimdef: r.zimdef,
        socialSecurity: r.nssaEmployer,
        nssa: r.nssaEmployer,
        apwcs: r.apwcs,
        nec: r.necEmployer,
        employerPension: r.pensionEmployer,
        totalEmployerCost: r.employerCost,
      },
      ytd: {
        grossPay: (Number(yt.grossPay) || 0) + r.grossPay,
        paye: (Number(yt.paye) || 0) + r.totalToZimra,
        uif: 0,
        netPay: (Number(yt.netPay) || 0) + r.netPay,
      },
      taxDetail: {
        annualTaxableIncome: r.annualTaxableIncome,
        annualTax: r2(r.taxPayable * n),
        primaryRebate: 0,
        secondaryRebate: 0,
        tertiaryRebate: 0,
        medicalTaxCredit: r.creditsApplied,
        effectiveTaxRate: r.effectiveTaxRate,
        marginalRate: 0,
      },
      payeBasis: {
        recurringRemuneration: r.grossPay,
        irregularIncome: 0,
        taxWithheld: r.totalToZimra,
      },
      // Surfaced so the run page, the P2 and the ledger can show WHICH table was
      // applied and how the remittance splits, without re-deriving any of it.
      zwDetail: {
        tableCurrency: r.tableCurrency,
        currencyBasis: r.currencyBasis,
        interbankRate: r.interbankRate,
        payeBeforeCredits: r.payeBeforeCredits,
        creditsApplied: r.creditsApplied,
        taxPayable: r.taxPayable,
        aidsLevy: r.aidsLevy,
        remittance: r.remittance,
        nssaCapped: r.nssaCapped,
        nssaCeilingProvisional: r.nssaCeilingProvisional,
        zimdefBase: r.zimdefBase,
        pensionDisallowed: r.pensionDisallowed,
        tablesCarriedForward: r.tablesCarriedForward,
      },
    };
  }
}

export default ZimbabweTaxEngine;
