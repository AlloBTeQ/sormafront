// src/lib/services/payroll/engine/ZAMTaxEngine.ts
// ─────────────────────────────────────────────────────────────────────────────
// Zambia — ZRA (Zambia Revenue Authority) PAYE engine.
//
// Thin engine over a pure, deterministic calc so the process route, the run page
// and the ZRA returns can never diverge. Mirrors ZATaxEngine/BOTSTaxEngine's
// `calculate(...)` contract and emits the SAME field names toPayslipEntry()
// normalises (deductions.paye, deductions.pensionFund, employerCosts.*,
// earnings.grossPay…).
//
// CHARGE YEAR 2026 (1 January – 31 December). Key facts:
//   • Progressive PAYE 0/20/30/37 at K5,100 / K7,100 / K9,200 monthly. Bands are
//     unchanged from 2025. SAME table for residents and non-residents.
//   • NAPSA 5% + 5%, on gross earnings, capped by a ceiling that resets each
//     January. Gratuity is excluded from the NAPSA base.
//   • NHIMA 1% + 1% on BASIC SALARY (SI 63 of 2019, Third Schedule) — not gross.
//   • Skills Development Levy 0.5%, employer only, on total emoluments.
//   • Everything remits on the 10th of the following month.
//
// THIS FILE REPLACES A QUARANTINED PREDECESSOR. What was wrong with it, so the
// same errors are not reintroduced:
//   ✗ top band 37.5%          → 37% (K15,000 only reconciles to K3,176 at 37%)
//   ✗ NAPSA ceiling K26,535   → dated table, currently K34,164 (2024 → 2025/26)
//   ✗ NHIMA on gross          → on basic, per the SI
//   ✗ PAYE base hardcoded to gross-less-NAPSA → named ZM_PAYE_BASE flag
//   ✗ 15% non-resident withholding on employment income → does not exist
//   ✗ invented 36-month gratuity exemption → removed; see the gratuity note below
//   ✗ `import type { PayrollPeriod } from '@/types/payroll'` used as a string
//     union when it is an INTERFACE — the typecheck failure that took
//     `next build` down for the whole app. This file does not import it.
// ─────────────────────────────────────────────────────────────────────────────

import {
  ZM_TAX_CONFIG_2026,
  zmConfigForYear,
  type ZmTaxBand,
  type ZmTaxConfig,
} from '@/lib/payroll/zm/config';

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

/** Pay periods in a year. Bare strings — deliberately not the PayrollPeriod interface. */
export function zmPeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly') return 26;
  return 12;
}

/** Monthly bands scaled to annual. Rates unchanged; edges and bases × 12. */
export function zmAnnualBands(bands: ZmTaxBand[]): ZmTaxBand[] {
  return bands.map(b => ({
    from: b.from * 12,
    to: b.to === Infinity ? Infinity : b.to * 12,
    rate: b.rate,
    base: b.base * 12,
  }));
}

/**
 * Annual PAYE from a band table (progressive, marginal). Pure.
 * tax = base + (income − from) × rate, for from < income <= to.
 */
export function zmAnnualTax(annualTaxable: number, bands: ZmTaxBand[]): number {
  if (annualTaxable <= 0) return 0;
  for (const b of bands) {
    if (annualTaxable > b.from && annualTaxable <= b.to) {
      return b.base + (annualTaxable - b.from) * b.rate;
    }
  }
  const top = bands[bands.length - 1];
  return top.base + (annualTaxable - top.from) * top.rate;
}

/** Monthly PAYE on a monthly taxable figure. Convenience for the run page / previews. */
export function zmMonthlyTax(monthlyTaxable: number, cfg: ZmTaxConfig = ZM_TAX_CONFIG_2026): number {
  return r2(zmAnnualTax(monthlyTaxable * 12, zmAnnualBands(cfg.bands)) / 12);
}

export interface ZmCalcInput {
  /** Basic salary for the period. Drives the NHIMA base — keep it distinct from allowances. */
  basicSalary: number;
  /** Cash allowances for the period (housing, transport, meal, other). */
  allowances?: number;
  /** Recurring overtime / commission for the period. Part of gross and the NAPSA base. */
  overtime?: number;
  /** 'monthly' | 'fortnightly' | 'bi_weekly' | 'weekly'. */
  freq?: string;
  /**
   * Employee's private/voluntary pension contribution for the period.
   *
   * NOTE: under ZM_PAYE_BASE='gross' this does NOT reduce the band base — Act
   * No. 22 of 2024 s.4 made the pension deduction employer-only from 1 Jan 2025.
   * It is still withheld from cash, so it reduces net pay.
   */
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
  /** Exempt from NAPSA (approved home-country scheme — the only exemption). */
  napsaExempt?: boolean;
  nhimaExempt?: boolean;
  /**
   * One-off CASH this period (bonus, commission true-up). Added to net cash and
   * taxed at the MARGINAL rate on top of annualised recurring income — it is NOT
   * itself annualised. In the NAPSA base (bonuses are gross earnings).
   */
  irregularCashThisPeriod?: number;
  /**
   * Gratuity paid this period. EXCLUDED from the NAPSA base by statute.
   *
   * ⚠ Its PAYE treatment is a sign-off gate. The predecessor engine invented a
   *   "first 36 months tax-free, 25% on the excess" rule with no statutory
   *   basis. Nothing is invented here: gratuity is taxed at the marginal rate
   *   like any other irregular income unless `gratuityExemptAmount` is supplied
   *   explicitly by the caller on a practitioner's instruction.
   */
  gratuityThisPeriod?: number;
  gratuityExemptAmount?: number;
  /**
   * Workers' Compensation Fund. Rate is industry-specific and is NOT one of the
   * three universal statutory contributions, so it is OPT-IN: 0/undefined means
   * no WCF line, rather than a default 1% silently inflating employer cost.
   */
  wcfRate?: number;
  config?: ZmTaxConfig;
}

export interface ZmCalcResult {
  grossPay: number;
  basicSalary: number;
  /** The figure the bands were actually applied to, this period. */
  payeBase: number;
  payeBaseKind: 'gross' | 'gross_less_napsa';
  paye: number;
  napsaEmployee: number;
  napsaEmployer: number;
  /** True when the NAPSA ceiling bit this period. */
  napsaCapped: boolean;
  nhimaEmployee: number;
  nhimaEmployer: number;
  /** The base NHIMA was charged on — basic salary under the SI. */
  nhimaBase: number;
  pensionEmployee: number;
  pensionEmployer: number;
  skillsDevelopmentLevy: number;
  wcf: number;
  totalDeductions: number;
  netPay: number;
  totalEmployerContributions: number;
  employerCost: number;
  annualTaxableIncome: number;
  annualTax: number;
  irregularTax: number;
  effectiveTaxRate: number;
  /** Charge year the config came from, and whether it is a carried-forward table. */
  chargeYear: number;
}

/** Deterministic, pure Zambian per-period payslip calc. */
export function calculateZmPayslip(input: ZmCalcInput): ZmCalcResult {
  const cfg = input.config ?? ZM_TAX_CONFIG_2026;
  const n = zmPeriodsInYear(input.freq);
  const annualBands = zmAnnualBands(cfg.bands);

  const basic = Math.max(0, input.basicSalary || 0);
  const allowances = Math.max(0, input.allowances || 0);
  const overtime = Math.max(0, input.overtime || 0);
  const irregularCash = Math.max(0, input.irregularCashThisPeriod || 0);
  const gratuity = Math.max(0, input.gratuityThisPeriod || 0);

  // Recurring cash gross for the period.
  const grossPay = basic + allowances + overtime;

  // ── NAPSA ────────────────────────────────────────────────────────────────
  // Base is gross earnings: basic + all cash allowances, overtime, bonuses,
  // commissions. Gratuity is EXCLUDED. Ceiling is monthly and pro-rated to the
  // pay frequency so a weekly payroll is not capped at a monthly figure.
  const napsaBaseUncapped = grossPay + irregularCash;
  const periodCeiling = (cfg.napsa.table.earningsCeiling * 12) / n;
  const napsaBase = input.napsaExempt ? 0 : Math.min(napsaBaseUncapped, periodCeiling);
  const napsaCapped = !input.napsaExempt && napsaBaseUncapped > periodCeiling;
  const napsaEmployee = r2(napsaBase * cfg.napsa.employeeRate);
  const napsaEmployer = r2(napsaBase * cfg.napsa.employerRate);

  // ── NHIMA ────────────────────────────────────────────────────────────────
  // SI 63 of 2019, Third Schedule: 1% of BASIC SALARY. No ceiling.
  const nhimaBase = input.nhimaExempt ? 0 : (cfg.nhima.base === 'basic' ? basic : grossPay);
  const nhimaEmployee = r2(nhimaBase * cfg.nhima.employeeRate);
  const nhimaEmployer = r2(nhimaBase * cfg.nhima.employerRate);

  // ── PAYE ─────────────────────────────────────────────────────────────────
  // The band base, per the ZM_PAYE_BASE flag. This is the K277.50-a-month
  // decision — see the flag's documentation in config.ts.
  const payeBaseKind = cfg.payeBase;
  const recurringPayeBase = payeBaseKind === 'gross_less_napsa'
    ? Math.max(0, grossPay - napsaEmployee)
    : grossPay;

  const annualRecurringTaxable = recurringPayeBase * n;
  const taxRecurringAnnual = zmAnnualTax(annualRecurringTaxable, annualBands);
  const payeRecurringPeriod = taxRecurringAnnual / n;

  // Irregular income (bonus, gratuity): marginal tax on top of the recurring
  // annual base, NOT annualised itself.
  const gratuityTaxable = Math.max(0, gratuity - Math.max(0, input.gratuityExemptAmount || 0));
  const irregularTaxable = irregularCash + gratuityTaxable;
  const irregularTax = irregularTaxable > 0
    ? zmAnnualTax(annualRecurringTaxable + irregularTaxable, annualBands) - taxRecurringAnnual
    : 0;

  const paye = r2(payeRecurringPeriod + irregularTax);

  // ── Employer-side ────────────────────────────────────────────────────────
  // SDL: 0.5% of total emoluments, employer only.
  const skillsDevelopmentLevy = r2(
    (grossPay + irregularCash + gratuity) * cfg.skillsDevelopmentLevy.rate,
  );
  // WCF is opt-in — 0 unless an industry rate is supplied.
  const wcf = r2((grossPay + irregularCash) * Math.max(0, input.wcfRate || 0));

  const pensionEmployee = r2(Math.max(0, input.pensionEmployeePerPeriod || 0));
  const pensionEmployer = r2(Math.max(0, input.pensionEmployerPerPeriod || 0));

  const totalDeductions = r2(paye + napsaEmployee + nhimaEmployee + pensionEmployee);
  const netPay = r2(grossPay + irregularCash + gratuity - totalDeductions);

  const totalEmployerContributions = r2(
    napsaEmployer + nhimaEmployer + skillsDevelopmentLevy + wcf + pensionEmployer,
  );
  const employerCost = r2(grossPay + irregularCash + gratuity + totalEmployerContributions);

  const taxableForRate = grossPay + irregularCash + gratuity;

  return {
    grossPay: r2(grossPay),
    basicSalary: r2(basic),
    payeBase: r2(recurringPayeBase),
    payeBaseKind,
    paye,
    napsaEmployee,
    napsaEmployer,
    napsaCapped,
    nhimaEmployee,
    nhimaEmployer,
    nhimaBase: r2(nhimaBase),
    pensionEmployee,
    pensionEmployer,
    skillsDevelopmentLevy,
    wcf,
    totalDeductions,
    netPay,
    totalEmployerContributions,
    employerCost,
    annualTaxableIncome: r2(annualRecurringTaxable),
    annualTax: r2(taxRecurringAnnual),
    irregularTax: r2(irregularTax),
    effectiveTaxRate: taxableForRate > 0 ? paye / taxableForRate : 0,
    chargeYear: cfg.chargeYear,
  };
}

export class ZambiaTaxEngine {
  private config: ZmTaxConfig;

  constructor(config: ZmTaxConfig = ZM_TAX_CONFIG_2026) {
    this.config = config;
  }

  getConfig(): ZmTaxConfig { return this.config; }
  getBands(): ZmTaxBand[] { return this.config.bands; }

  /**
   * Matches ZATaxEngine.calculate's positional contract. `levyLiable` is accepted
   * for signature-parity but unused — Zambia's SDL has no entity-level payroll
   * threshold, it applies to all employers.
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
    const zm = employee?.taxInfo?.zm ?? {};

    const basicSalary = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const housingAllowance = Number(comp.housingAllowance) || 0;
    const transportAllowance = Number(comp.transportAllowance) || 0;
    const mealAllowance = Number(comp.mealAllowance ?? comp.lunchAllowance) || 0;
    const otherAllowances = Number(comp.otherAllowances) || 0;
    const allowances = housingAllowance + transportAllowance + mealAllowance + otherAllowances;

    const freq = comp.payFrequency || 'monthly';

    // Pension is stored on the model as deductions.pension.{employeePercent,
    // employerPercent} (a percentage). Normalise (accepts 5 or 0.05) → amount.
    const pcfg = ded.pension ?? {};
    const pensionOff = pcfg.enabled === false;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const pensionEmp = pensionOff ? 0 : basicSalary * norm(Number(pcfg.employeePercent ?? 0));
    const pensionEr = pensionOff ? 0 : basicSalary * norm(Number(pcfg.employerPercent ?? 0));

    // Pick the config by the pay date's charge year so a run dated into a new
    // year picks up that year's table rather than whatever is newest in code.
    const chargeYear = payDate ? new Date(payDate).getUTCFullYear() : this.config.chargeYear;
    const cfg = payDate ? zmConfigForYear(chargeYear) : this.config;

    const r = calculateZmPayslip({
      basicSalary,
      allowances,
      overtime: Number(comp.overtimePay) || 0,
      freq,
      pensionEmployeePerPeriod: pensionEmp,
      pensionEmployerPerPeriod: pensionEr,
      napsaExempt: !!zm.napsaExempt,
      nhimaExempt: !!zm.nhimaExempt,
      wcfRate: Number(zm.wcfRate) || 0,
      config: cfg,
    });

    const yt = employee?.ytdTotals ?? {};

    return {
      employeeId: employee?._id,
      employee,
      earnings: {
        basicSalary,
        housingAllowance,
        transportAllowance,
        mealAllowance,
        otherAllowances,
        overtimePay: Number(comp.overtimePay) || 0,
        bonus: 0,
        grossPay: r.grossPay,
        taxableIncome: r.payeBase,
      },
      deductions: {
        // `paye` is the name toPayslipEntry maps onto deductions.incomeTax.
        paye: r.paye,
        uif: 0,
        // NAPSA is the social-security line; surfaced under both the generic
        // schema name and its local name so neither reader sees a zero.
        socialSecurity: r.napsaEmployee,
        napsa: r.napsaEmployee,
        nhima: r.nhimaEmployee,
        pensionFund: r.pensionEmployee,
        medicalAid: 0,
        totalDeductions: r.totalDeductions,
      },
      netPay: r.netPay,
      employerCosts: {
        uif: 0,
        sdl: r.skillsDevelopmentLevy,
        socialSecurity: r.napsaEmployer,
        napsa: r.napsaEmployer,
        nhima: r.nhimaEmployer,
        wcf: r.wcf,
        employerPension: r.pensionEmployer,
        totalEmployerCost: r.employerCost,
      },
      ytd: {
        grossPay: (Number(yt.grossPay) || 0) + r.grossPay,
        paye: (Number(yt.paye) || 0) + r.paye,
        uif: 0,
        netPay: (Number(yt.netPay) || 0) + r.netPay,
      },
      taxDetail: {
        annualTaxableIncome: r.annualTaxableIncome,
        annualTax: r.annualTax,
        primaryRebate: 0,
        secondaryRebate: 0,
        tertiaryRebate: 0,
        medicalTaxCredit: 0,
        effectiveTaxRate: r.effectiveTaxRate,
        marginalRate: 0,
      },
      payeBasis: {
        recurringRemuneration: r.grossPay,
        irregularIncome: 0,
        taxWithheld: r.paye,
      },
      // Surfaced so the run page and the P11 can show WHICH base was used
      // without re-deriving it — this is the contested decision.
      zmDetail: {
        payeBase: r.payeBase,
        payeBaseKind: r.payeBaseKind,
        nhimaBase: r.nhimaBase,
        napsaCapped: r.napsaCapped,
        chargeYear: r.chargeYear,
      },
    };
  }
}

export default ZambiaTaxEngine;
