/**
 * Regional payroll tax calculations
 * All amounts are monthly (salaries assumed to be monthly basic)
 */

import { toPayrollRegion, toStoreRegion } from '@/lib/regions';
import { calculateZaPayslip } from '@/lib/payroll/za/engine';
import { calculateBwPayslip } from '@/lib/services/payroll/engine/BOTSTaxEngine';
import { bwMonthlyTaxableBenefits } from '@/lib/payroll/bw/benefits';
import { calculateZmPayslip } from '@/lib/services/payroll/engine/ZAMTaxEngine';
import { calculateZwPayslip } from '@/lib/services/payroll/engine/ZWTaxEngine';
import { calculateNaPayslip, naConfigForPayDate, naPeriodsInYear } from '@/lib/services/payroll/engine/NAMTaxEngine';
import { naBenefitsForPeriod } from '@/lib/payroll/na/benefits';
import { calculateSzPayslip, szConfigForPayDate } from '@/lib/services/payroll/engine/SZTaxEngine';
import { calculateLsPayslip } from '@/lib/services/payroll/engine/LSTaxEngine';
import { calculateKePayslip } from '@/lib/services/payroll/engine/KENTaxEngine';
import { calculateRwPayslip } from '@/lib/services/payroll/engine/RWTaxEngine';
import { calculateAoPayslip } from '@/lib/services/payroll/engine/AOTaxEngine';
import { calculateMzPayslip } from '@/lib/services/payroll/engine/MZTaxEngine';
import { zwMonthlyTaxableBenefits } from '@/lib/payroll/zw/benefits';
import { ZW_PERIODS_PER_YEAR, type ZwPeriodicity } from '@/lib/payroll/zw/config';
import { taxYearOf } from '@/lib/services/tax/irp5/accumulate';
import { UKTaxEngine } from '@/lib/services/payroll/engine/UKTaxEngine';

export interface TaxInfo {
  uifExempt?: boolean;
  medicalAidMembers?: number;
  pensionScheme?: boolean;
  /** Employer's retirement contribution as a % of pensionable pay. */
  employerPensionPercent?: number;
  pensionContribution?: number;
  studentLoan?: string;
  niNumber?: string;
  federalFilingStatus?: string;
  allowances?: number;
  nhifRate?: string;
  nssfTier?: string;
}

export interface PayslipCalcResult {
  grossPay: number;
  incomeTax: number;
  nationalInsurance?: number;
  uif?: number;
  studentLoan?: number;
  pension?: number;
  /**
   * Generic social-security slot — ZW NSSA POBS, ZM NAPSA, KE NSSF, US OASDI.
   *
   * It exists because a statutory line that reaches the caller ONLY inside
   * `deductionItems` cannot be persisted: POST /api/payroll/runs maps named
   * fields onto the schema's named paths, and Mongoose (strict) drops what it
   * does not recognise. NSSA was therefore computed, subtracted from net pay,
   * counted in `totalDeductions` — and then stored as nothing, so the payslip
   * breakdown was 4.5% of gross short of the total printed beside it.
   */
  socialSecurity?: number;
  /** Zimbabwe NEC (National Employment Council) dues, employee side. */
  nec?: number;
  /** Kenya SHIF and Affordable Housing Levy (employee); employer AHL below. */
  shif?: number;
  housingLevy?: number;
  employerHousingLevy?: number;
  /** Kenya P9A columns (see IPayslip.keP9). */
  keP9?: { retirement: number; ownerOccupiedInterest: number; taxCharged: number; personalRelief: number; insuranceRelief: number };
  /** Rwanda RSSB: maternity 0.3%, CBHI 0.5% of net, RAMA medical 7.5% of basic (employee). */
  maternity?: number;
  cbhi?: number;
  medical?: number;
  totalDeductions: number;
  netPay: number;
  // Employer costs
  employerNI?: number;
  employerUIF?: number;
  employerPension?: number;
  /** Employer side of the generic social-security slot (ZW NSSA POBS). */
  employerSocialSecurity?: number;
  /**
   * Zambia NHIMA, employee and employer (1% of basic each). Same reason as
   * `socialSecurity`: a line that only rides in `deductionItems` is computed,
   * taken off net pay, and then persisted as nothing — the P11 read K0.
   */
  nhima?: number;
  employerNhima?: number;
  /** Employer side of ZW NEC dues. */
  employerNec?: number;
  /** Zimbabwe NSSA APWCS (workers' compensation) — industry-rated, opt-in. */
  apwcs?: number;
  /** Rwanda employer side: maternity 0.3%, RAMA medical 7.5%, occupational hazards 2% (→ employerCosts.wcf). */
  employerMaternity?: number;
  employerMedical?: number;
  occupationalHazards?: number;
  sdl?: number;
  apprenticeshipLevy?: number;
  totalEmployerCost: number;
  deductionItems: Array<{ description: string; amount: number; preTax: boolean }>;
  /**
   * NA: fringe benefits on this payslip (na/benefits.ts) — non-cash values that
   * are taxed but never paid, and the housing allowance with its scheme-exempt
   * third. Persisted so the monthly schedule, PAYE 5 and ETX can read them.
   */
  benefits?: Array<{ code: string; name: string; value: number; exempt: number; inCash: boolean }>;
  /** Taxable income for the period where it differs from gross (NA benefits and exemptions). */
  taxableIncome?: number;
  /** ZA only — this period's PAYE-averaging basis (PAYROLL-FIX-2), for YTD accumulation. */
  payeBasis?: {
    recurringRemuneration: number;
    irregularIncome: number;
    taxWithheld: number;
    periodsWorked: number;
  };
}

/**
 * Partial-period share (lib/payroll/proration.ts) a caller attaches when an
 * employee started or left inside the cycle. Basic salary and stored allowances
 * arrive already prorated; adapters use this for the monthly figures they keep
 * elsewhere on the employee (benefits in kind, per-country allowance fields).
 */
function periodShare(t: any): number {
  const f = Number(t?.periodFraction);
  return Number.isFinite(f) && f > 0 && f < 1 ? f : 1;
}
const scaled = (n: number, f: number) => (f === 1 ? n : Math.round(n * f * 100) / 100);

// ─── SOUTH AFRICA (ZA) ───────────────────────────────────────────────────────
// ZA is computed by the SINGLE source of truth (src/lib/payroll/za/engine.ts, table-driven
// from src/config/za-tax-tables.ts). This adapter keeps the PayslipCalcResult shape but
// defers all maths so runs/preview never diverge from the run breakdown / payslip / IRP5.
// It accepts either the flat TaxInfo above or a nested employee taxInfo ({ za: {...} }),
// and reads optional `age` / `sdlLiable` / `payDate` a caller may attach (see runs/route.ts).
function calcZA(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const za = t.za ?? t;
  const members = za.medicalAidMembers ?? t.medicalAidMembers ?? 0;
  const pensionPct = (t.pensionScheme && (t.pensionContribution ?? 0) > 0) ? (t.pensionContribution as number) : 0;
  const uifContributor = za.uifContributor !== undefined
    ? za.uifContributor !== false
    : !(za.uifExempt ?? t.uifExempt ?? false);

  // The year of assessment follows the run's pay date, which callers smuggle through
  // taxInfo (same convention as sdlLiable / additionalIncome) rather than widening the
  // shared multi-region signature. Absent a date, fall through to the engine's default.
  const payDate: string | undefined = za.payDate ?? t.payDate;

  // Cumulative YTD state for SARS Fourth-Schedule averaging (PAYROLL-FIX-2). Smuggled
  // through taxInfo (same convention as above) — the caller reads the employee's per-YOA
  // ytdByYear bucket and shapes it via ytdCumulativeFromBucket(). Absent ⇒ period 1.
  const ytdCumulative = t.ytdCumulative ?? za.ytdCumulative;
  const periodsInYear: number | undefined = t.periodsInYear ?? za.periodsInYear;
  // Partial period (mid-month starter/leaver): salary arrives already prorated;
  // the fraction tells the PAYE averaging the period was partial.
  const periodFraction: number | undefined = t.periodFraction ?? za.periodFraction;

  const r = calculateZaPayslip({
    basicSalary: grossMonthly,
    age: t.age,
    medicalAid: members > 0 ? { members } : null,
    pension: pensionPct > 0 ? { percent: pensionPct } : null,
    // Forwarded so employerCosts.pension is real. Without it the engine returned 0
    // and the employer's contribution was invisible to the payslip and the ledger.
    employerPensionPercent: (t.employerPensionPercent ?? (za as any).employerPensionPercent) || 0,
    uifContributor,
    additionalIncome: t.additionalIncome ?? [],
    additionalDeductions: t.additionalDeductions ?? [],
    // SDL is entity-gated; callers that know total payroll attach `sdlLiable`. Default
    // true preserves prior behaviour where SDL was always charged.
    entity: { sdlLiable: t.sdlLiable ?? true },
    yearOfAssessment: payDate ? taxYearOf(payDate) : undefined,
    ytdCumulative,
    periodsInYear,
    periodFraction,
  });

  return {
    grossPay: r.grossPay,
    incomeTax: r.paye,
    uif: r.uif,
    pension: r.pension,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerUIF: r.employerUif,
    employerPension: r.employerPension,
    sdl: r.sdl,
    totalEmployerCost: Math.round((r.grossPay + r.employerCosts.total) * 100) / 100,
    deductionItems: [
      { description: 'PAYE Income Tax', amount: r.paye, preTax: false },
      ...(r.uif > 0 ? [{ description: 'UIF', amount: r.uif, preTax: false }] : []),
      ...(r.pension > 0 ? [{ description: 'Pension Contribution', amount: r.pension, preTax: true }] : []),
    ],
    payeBasis: r.payeBasis,
  };
}

// ─── UNITED KINGDOM (UK) ─────────────────────────────────────────────────────
// UK is computed by the SINGLE source of truth (UKTaxEngine), the same way ZA,
// BW and ZM are. This adapter keeps the PayslipCalcResult shape but defers all
// maths, so runs / preview / store fulfilment can no longer disagree.
//
// What this replaced, and why it mattered
// ───────────────────────────────────────
// The old body here was a fourth hand-written copy of UK PAYE, frozen at
// 2024/25, and it was WRONG in ways that moved real money:
//
//   • Employer NI at 13.8% above £758/month. From 6 April 2025 the rate is 15%
//     and the secondary threshold fell to £96/week (~£416/month). Every UK
//     employer cost quoted here was understated.
//   • Apprenticeship Levy at 0.5% of EVERY employer's payroll, with no £3m pay
//     bill threshold and no £15,000 allowance. Almost every SORMALITICS user is
//     nowhere near £3m, so this invented a charge they do not owe.
//   • Tax codes were ignored entirely — every employee got the full £12,570
//     allowance regardless of their code, so K codes, reduced codes and BR/D0/NT
//     all produced the wrong tax.
//   • Scottish rates did not exist; an S-prefixed employee was taxed at rUK.
//   • Pension silently defaulted to 5% whenever `pensionScheme` was falsy —
//     i.e. an employee who had OPTED OUT was still deducted 5%. That is why
//     lib/store/payslipFulfilment.ts carries a comment about re-deriving the
//     pension itself; that workaround can now go.
//
// Employment Allowance and the Apprenticeship Levy are EMPLOYER-level, not
// employee-level: they depend on the employer's remaining allowance and total
// pay bill, which a per-employee call cannot know. Callers that know them pass
// them through taxInfo (the same smuggling convention calcZA uses for payDate
// and sdlLiable). Absent them the adapter claims no allowance and charges no
// levy — the safe direction for both.
/**
 * The run's variable-pay lines for one employee, split the way every engine
 * needs them: RECURRING (commission, overtime — part of this period's pay) and
 * IRREGULAR (a once-off bonus — taxed at the margin, never annualised).
 * buildRunPayslips passes them as `additionalIncome`; before 2026-10-19 only
 * the ZA adapter read it, so a bonus on a BW/ZM/ZW/UK run was silently dropped.
 */
function variablePayOf(t: any): { recurring: number; irregular: number } {
  let recurring = 0, irregular = 0;
  for (const l of (t?.additionalIncome ?? []) as any[]) {
    const amt = Math.max(0, Number(l?.amount) || 0);
    if (!amt || l?.taxable === false) continue;
    if (l?.irregular) irregular += amt; else recurring += amt;
  }
  return { recurring, irregular };
}

function calcUK(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const uk = t.uk ?? {};

  // Percent may arrive as 5 or 0.05 depending on the caller; the engine wants 5.
  const pct = (x: unknown) => {
    const n = Number(x ?? 0);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return n <= 1 ? n * 100 : n;
  };

  // Pension is a scheme choice, not statute. If the employee is not in a
  // scheme, the contribution is ZERO — no silent default.
  const employeePensionPercent = t.pensionScheme === false
    ? 0
    : pct(t.pensionContribution ?? uk.pensionContribution);
  const employerPensionPercent = pct(t.employerPensionPercent ?? uk.employerPensionPercent);

  const vp = variablePayOf(t);
  const extra = vp.recurring + vp.irregular;
  const r = new UKTaxEngine().calculate({
    annualSalary: grossMonthly * 12,
    periodExtra: extra,
    taxCode: uk.taxCode ?? t.taxCode,
    studentLoanPlan: ukStudentLoanPlan(uk.studentLoanPlan ?? t.studentLoan),
    pensionContribution: {
      employeePercent: employeePensionPercent,
      employerPercent: employerPensionPercent,
    },
    // Employer-level; only a caller that tracks the employer's claim can supply it.
    employmentAllowanceRemaining: Number(t.employmentAllowanceRemaining ?? 0) || 0,
  });

  // Levy is charged on the employer's ANNUAL pay bill, not one employee's pay.
  // Without that figure the honest answer is £0, not 0.5% of this payslip.
  const apprenticeshipLevy = new UKTaxEngine().calculateApprenticeshipLevy(
    Number(t.annualPayrollBill ?? 0) || 0,
    grossMonthly,
  );

  const incomeTax = r.deductions.incomeTax;
  const ni = r.deductions.nationalInsurance;
  const studentLoan = r.deductions.studentLoan;
  const pension = r.deductions.pension;
  const employerNI = r.employerCosts.nationalInsurance;
  const employerPension = r.employerCosts.pension;

  return {
    grossPay: grossMonthly + extra,
    incomeTax,
    nationalInsurance: ni,
    studentLoan,
    pension,
    totalDeductions: r.deductions.total,
    netPay: r.netPay,
    employerNI,
    employerPension,
    apprenticeshipLevy,
    totalEmployerCost: grossMonthly + extra + employerNI + employerPension + apprenticeshipLevy,
    deductionItems: [
      { description: 'Income Tax', amount: incomeTax, preTax: false },
      { description: 'National Insurance', amount: ni, preTax: false },
      ...(studentLoan > 0 ? [{ description: 'Student Loan', amount: studentLoan, preTax: false }] : []),
      ...(pension > 0 ? [{ description: 'Pension', amount: pension, preTax: true }] : []),
    ],
  };
}

/**
 * Normalise the several student-loan spellings this codebase uses onto the
 * engine's union. `postgraduate` (stored on employees) and `postgrad` (the
 * engine's name) are the same plan; anything unrecognised deducts nothing
 * rather than guessing a plan and taking 9% of someone's pay.
 */
function ukStudentLoanPlan(
  raw: unknown,
): 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad' | 'none' {
  const v = String(raw ?? '').trim().toLowerCase().replace(/[\s_-]/g, '');
  switch (v) {
    case 'plan1': return 'plan1';
    case 'plan2': return 'plan2';
    case 'plan4': return 'plan4';
    case 'plan5': return 'plan5';
    case 'postgrad':
    case 'postgraduate':
    case 'pgl': return 'postgrad';
    default: return 'none';
  }
}

// ─── UNITED STATES (US) ──────────────────────────────────────────────────────
function calcUS(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const annualSalary = grossMonthly * 12;
  const filingStatus = taxInfo.federalFilingStatus ?? 'single';

  // Federal income tax 2024 (simplified, married brackets are doubled)
  const standardDeduction = filingStatus === 'married-filing-jointly' ? 29200 : 14600;
  const taxable = Math.max(0, annualSalary - standardDeduction);

  let annualFedTax = 0;
  if (filingStatus === 'married-filing-jointly') {
    if (taxable <= 23200) annualFedTax = taxable * 0.1;
    else if (taxable <= 94300) annualFedTax = 2320 + (taxable - 23200) * 0.12;
    else if (taxable <= 201050) annualFedTax = 10780 + (taxable - 94300) * 0.22;
    else if (taxable <= 383900) annualFedTax = 34332 + (taxable - 201050) * 0.24;
    else if (taxable <= 487450) annualFedTax = 78221 + (taxable - 383900) * 0.32;
    else if (taxable <= 731200) annualFedTax = 111357 + (taxable - 487450) * 0.35;
    else annualFedTax = 196670 + (taxable - 731200) * 0.37;
  } else {
    if (taxable <= 11600) annualFedTax = taxable * 0.1;
    else if (taxable <= 47150) annualFedTax = 1160 + (taxable - 11600) * 0.12;
    else if (taxable <= 100525) annualFedTax = 5426 + (taxable - 47150) * 0.22;
    else if (taxable <= 191950) annualFedTax = 17168 + (taxable - 100525) * 0.24;
    else if (taxable <= 243725) annualFedTax = 39110 + (taxable - 191950) * 0.32;
    else if (taxable <= 609350) annualFedTax = 55678 + (taxable - 243725) * 0.35;
    else annualFedTax = 183647 + (taxable - 609350) * 0.37;
  }
  const incomeTax = annualFedTax / 12;

  // Social Security: 6.2% up to $168,600 annual wage base
  const ssCap = 168600 / 12;
  const socialSecurity = Math.min(grossMonthly, ssCap) * 0.062;
  const employerSS = Math.min(grossMonthly, ssCap) * 0.062;

  // Medicare: 1.45% (additional 0.9% over $200k annual - skip for simplicity)
  const medicare = grossMonthly * 0.0145;
  const employerMedicare = grossMonthly * 0.0145;

  const totalDeductions = incomeTax + socialSecurity + medicare;
  const netPay = grossMonthly - totalDeductions;
  const totalEmployerCost = grossMonthly + employerSS + employerMedicare;

  const deductionItems = [
    { description: 'Federal Income Tax', amount: incomeTax, preTax: false },
    { description: 'Social Security', amount: socialSecurity, preTax: false },
    { description: 'Medicare', amount: medicare, preTax: false },
  ];

  return {
    grossPay: grossMonthly,
    incomeTax,
    totalDeductions,
    netPay,
    employerNI: employerSS + employerMedicare,
    totalEmployerCost,
    deductionItems,
  };
}

// ─── KENYA (KE) ──────────────────────────────────────────────────────────────
// KRA PAYE, NSSF, SHIF and the Affordable Housing Levy through the one shared
// calculation (KENTaxEngine.calculateKePayslip), so runs / preview / process
// cannot drift. Checked at source 2026-10-23 — lib/payroll/ke/config.ts.
function calcKE(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const ke = t.ke ?? {};
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const vp = variablePayOf(t);
  const r = calculateKePayslip({
    grossPay: grossMonthly + vp.recurring,
    irregularCashThisPeriod: vp.irregular,
    freq: t.payFrequency ?? 'monthly',
    payDate: t.payDate ? new Date(t.payDate) : undefined,
    pensionEmployeePerPeriod: grossMonthly * norm(Number(t.pensionContribution ?? 0)),
    pensionEmployerPerPeriod: grossMonthly * norm(Number(t.employerPensionPercent ?? 0)),
    monthlyInsurancePremium: ke.hasInsuranceRelief ? Number(ke.monthlyInsurancePremium) || 0 : 0,
    monthlyMortgageInterest: ke.hasMortgageInterestRelief ? Number(ke.monthlyMortgageInterest) || 0 : 0,
    nssfExempt: !!ke.nssfExempt || t.nssfTier === 'exempt',
    shifExempt: !!(ke.shifExempt ?? ke.nhifExempt) || t.nhifRate === 'exempt',
    ahlExempt: !!ke.housingLevyExempt,
    nonResident: ke.residenceStatus === 'non-resident' || ke.residenceStatus === 'non_resident',
  });
  return {
    grossPay: r.grossPay,
    taxableIncome: r.taxableIncome,
    incomeTax: r.paye,
    pension: r.pensionEmployee,
    socialSecurity: r.nssfEmployee,
    shif: r.shif,
    housingLevy: r.ahlEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    employerSocialSecurity: r.nssfEmployer,
    employerHousingLevy: r.ahlEmployer,
    sdl: r.nita,   // NITA — the generic training-levy slot
    totalEmployerCost: r.employerCost,
    keP9: {
      retirement: r.pensionDeductible,
      ownerOccupiedInterest: r.mortgageDeductible,
      taxCharged: r.taxBeforeRelief,
      personalRelief: r.personalRelief,
      insuranceRelief: r.insuranceRelief,
    },
    deductionItems: [
      { description: 'PAYE (KRA)', amount: r.paye, preTax: false },
      ...(r.nssfEmployee ? [{ description: 'NSSF (Tier I + II)', amount: r.nssfEmployee, preTax: true }] : []),
      ...(r.shif ? [{ description: 'SHIF (2.75%)', amount: r.shif, preTax: true }] : []),
      ...(r.ahlEmployee ? [{ description: 'Affordable Housing Levy (1.5%)', amount: r.ahlEmployee, preTax: true }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: r.pensionDeductible > r.nssfEmployee }] : []),
    ],
  };
}

// ─── PUBLIC ENTRY POINT ───────────────────────────────────────────────────────
// ─── BOTSWANA (BW) ───────────────────────────────────────────────────────────
// BURS PAYE via the single shared engine (BOTSTaxEngine.calculateBwPayslip) so
// runs / preview / process never diverge. PAYE-only (no UIF/SDL analogue); pension
// is tax-deductible (capped 15% / P60k); medical aid is post-tax. Non-residents
// supported via taxInfo.isResident === false (5% from the first Pula).
function calcBW(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const bw = t.bw ?? {};
  const isResident = (bw.isResident ?? t.isResident) !== false;
  const freq: string = t.payFrequency ?? bw.payFrequency ?? 'monthly';
  const periods = freq === 'weekly' ? 52 : (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') ? 26 : 12;
  // Pension arrives as a PERCENT via runs/route (t.pensionContribution). Normalise
  // (accepts 5 or 0.05) → a per-period amount; the ZA path passes it the same way.
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const pension = grossMonthly * norm(Number(t.pensionContribution ?? 0));
  const employerPension = grossMonthly * norm(Number(t.employerPensionPercent ?? 0));
  const medical = Number(t.medicalAidContribution ?? 0) || 0;

  const vp = variablePayOf(t);
  const r = calculateBwPayslip({
    // Commission / overtime are this period's remuneration; a bonus is the
    // engine's irregular slot — marginal tax on the annual base, not annualised.
    monthlyGross: grossMonthly + vp.recurring,
    irregularCashThisPeriod: vp.irregular,
    irregularTaxableThisPeriod: vp.irregular,
    isResident,
    pensionEmployeePerPeriod: pension,
    pensionEmployerPerPeriod: employerPension,
    medicalAidPerPeriod: medical,
    freq,
    taxableBenefitsPerPeriod: scaled(bwMonthlyTaxableBenefits(bw, periods), periodShare(t)),
  });

  // The engine's grossPay is recurring cash only; the bonus is in net pay, so
  // it must be in gross too or the payslip stops adding up.
  const bwGross = r.grossPay + vp.irregular;
  return {
    grossPay: bwGross,
    incomeTax: r.paye,
    pension: r.pension,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.employerPension,
    totalEmployerCost: bwGross + r.employerPension,
    deductionItems: [
      { description: 'PAYE (BURS)', amount: r.paye, preTax: false },
      ...(r.taxableBenefits ? [{ description: 'Taxable benefits (non-cash)', amount: r.taxableBenefits, preTax: false }] : []),
      ...(r.pension ? [{ description: 'Pension', amount: r.pension, preTax: true }] : []),
      ...(r.medicalAid ? [{ description: 'Medical aid', amount: r.medicalAid, preTax: false }] : []),
    ],
  };
}

// ─── ZAMBIA (ZM) ─────────────────────────────────────────────────────────────
// ZRA PAYE via the single shared engine (ZAMTaxEngine.calculateZmPayslip) so
// runs / preview / process never diverge.
//
// This region previously had NO case at all and fell through to the default
// branch below — a FLAT 25% ESTIMATE. Every Zambian payroll preview quoted a
// number that had nothing to do with ZRA's tables, and looked entirely
// plausible while doing it.
//
// NHIMA is charged on BASIC salary (SI 63 of 2019), so basic is passed
// separately from allowances rather than folded into one gross figure.
function calcZM(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const zm = t.zm ?? {};
  const freq: string = t.payFrequency ?? zm.payFrequency ?? 'monthly';

  // Pension arrives as a PERCENT via runs/route (t.pensionContribution).
  // Normalise (accepts 5 or 0.05) → a per-period amount, as the ZA/BW paths do.
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const pension = grossMonthly * norm(Number(t.pensionContribution ?? 0));
  const employerPension = grossMonthly * norm(Number(t.employerPensionPercent ?? 0));

  // Where the caller has split basic from allowances, honour it — that split is
  // what makes NHIMA correct. Where it has not, the whole figure is treated as
  // basic, which is the conservative reading (it cannot understate NHIMA).
  const allowances = Number(t.allowances ?? 0) || 0;
  const basicSalary = Math.max(0, grossMonthly - allowances);

  const vp = variablePayOf(t);
  const r = calculateZmPayslip({
    basicSalary,
    allowances,
    // Commission / overtime: the engine's recurring `overtime` (in gross and the
    // NAPSA base). Bonus: its irregular slot, taxed at the margin.
    overtime: vp.recurring,
    irregularCashThisPeriod: vp.irregular,
    freq,
    pensionEmployeePerPeriod: pension,
    pensionEmployerPerPeriod: employerPension,
    napsaExempt: !!zm.napsaExempt,
    nhimaExempt: !!zm.nhimaExempt,
    wcfRate: Number(zm.wcfRate) || 0,
  });

  return {
    // Engine grossPay excludes the one-off cash it adds to net; put it back.
    grossPay: r.grossPay + vp.irregular,
    incomeTax: r.paye,
    pension: r.pensionEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    sdl: r.skillsDevelopmentLevy,
    // NAPSA and NHIMA were in totalDeductions and net pay but on no named field,
    // so the run stored 0 / nothing and every ZRA P11 declared NAPSA and NHIMA
    // as K0 (found live 2026-10-19). Named here so the run can persist them.
    socialSecurity: r.napsaEmployee,
    employerSocialSecurity: r.napsaEmployer,
    nhima: r.nhimaEmployee,
    employerNhima: r.nhimaEmployer,
    totalEmployerCost: r.employerCost,
    deductionItems: [
      { description: 'PAYE (ZRA)', amount: r.paye, preTax: false },
      ...(r.napsaEmployee ? [{ description: 'NAPSA (5%)', amount: r.napsaEmployee, preTax: false }] : []),
      ...(r.nhimaEmployee ? [{ description: 'NHIMA (1% of basic)', amount: r.nhimaEmployee, preTax: false }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: false }] : []),
    ],
  };
}

// ─── NAMIBIA (NA) ────────────────────────────────────────────────────────────
// NamRA PAYE, SSC and the VET levy through the one shared calc
// (NAMTaxEngine.calculateNaPayslip), so the run, the preview and the process
// route cannot disagree. The VET levy is employer-gated on annual payroll;
// buildRunPayslips decides it for the whole run and attaches `sdlLiable`.
function calcNA(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const na = t.na ?? {};
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const pension = grossMonthly * norm(Number(t.pensionContribution ?? 0));
  const employerPension = grossMonthly * norm(Number(t.employerPensionPercent ?? 0));

  // Allowances split from basic where the caller provides it: SSC is on the
  // basic wage only. Absent a split, the whole figure is basic — which can only
  // overstate SSC up to the ceiling, never understate it.
  const allowances = Number(t.allowances ?? 0) || 0;
  const basicSalary = Math.max(0, grossMonthly - allowances);
  const vp = variablePayOf(t);
  const payDate = t.payDate ? new Date(t.payDate) : undefined;

  // Fringe benefits and the approved-housing-scheme third (na/benefits.ts).
  const n = naPeriodsInYear(t.payFrequency ?? 'monthly');
  const housingAllowance = ((t.additionalIncome ?? []) as any[])
    .filter(l => !l?.irregular && l?.taxable !== false && /housing/i.test(String(l?.description ?? '')))
    .reduce((sum, l) => sum + (Math.max(0, Number(l?.amount) || 0)), 0);
  const bens = naBenefitsForPeriod(na, {
    housingScheme: t.naHousingScheme === true,
    housingAllowance,
    periodFactor: (12 / n) * periodShare(t),
  });

  const r = calculateNaPayslip({
    basicSalary,
    allowances,
    recurringExtra: vp.recurring,
    irregularCashThisPeriod: vp.irregular,
    freq: t.payFrequency ?? 'monthly',
    pensionEmployeePerPeriod: pension,
    pensionEmployerPerPeriod: employerPension,
    otherRetirementPerPeriod: Number(na.retirementAnnuityPerPeriod) || 0,
    payDate,
    vetLiable: t.sdlLiable === true,
    sscExempt: !!na.sscExempt,
    config: naConfigForPayDate(payDate),
    benefitsInKindTaxable: bens.inKindTaxable,
    cashHousingExempt: bens.cashExempt,
    inKindForSsc: bens.inKindForSsc,
  });

  return {
    grossPay: r.grossPay + (vp.irregular || 0),
    incomeTax: r.paye,
    pension: r.pensionEmployee + r.otherRetirement,
    socialSecurity: r.sscEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    employerSocialSecurity: r.sscEmployer,
    sdl: r.vetLevy,
    totalEmployerCost: r.employerCost,
    benefits: bens.lines,
    taxableIncome: r.taxableIncome,
    deductionItems: [
      { description: 'PAYE (NamRA)', amount: r.paye, preTax: false },
      ...(r.sscEmployee ? [{ description: 'Social Security (0.9%)', amount: r.sscEmployee, preTax: false }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: true }] : []),
      ...(r.otherRetirement ? [{ description: 'Retirement annuity / education policy', amount: r.otherRetirement, preTax: true }] : []),
    ],
  };
}

// ─── ESWATINI (SZ) ───────────────────────────────────────────────────────────
// ERS PAYE (annualised, less the rebate) and ENPF, through calculateSzPayslip.
function calcSZ(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const sz = t.sz ?? {};
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const vp = variablePayOf(t);
  const payDate = t.payDate ? new Date(t.payDate) : undefined;
  const r = calculateSzPayslip({
    grossPay: grossMonthly + vp.recurring,
    irregularCashThisPeriod: vp.irregular,
    freq: t.payFrequency ?? 'monthly',
    over60: !!sz.over60,
    enpfExempt: !!sz.enpfExempt,
    pensionEmployeePerPeriod: grossMonthly * norm(Number(t.pensionContribution ?? 0)),
    pensionEmployerPerPeriod: grossMonthly * norm(Number(t.employerPensionPercent ?? 0)),
    pensionableSalaryPerPeriod: grossMonthly,
    payDate,
    config: szConfigForPayDate(payDate),
  });
  return {
    grossPay: r.grossPay + vp.irregular,
    incomeTax: r.paye,
    pension: r.pensionEmployee,
    socialSecurity: r.enpfEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    employerSocialSecurity: r.enpfEmployer,
    totalEmployerCost: r.employerCost,
    // What PAYE was charged on: pay less ENPF and the deductible pension.
    // Left out, the run saved gross as "taxable" (walk of 2026-10-25).
    taxableIncome: Math.round((r.grossPay + vp.irregular - r.enpfEmployee - r.pensionDeductible) * 100) / 100,
    deductionItems: [
      { description: 'PAYE (ERS)', amount: r.paye, preTax: false },
      ...(r.enpfEmployee ? [{ description: 'ENPF (5%)', amount: r.enpfEmployee, preTax: true }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: r.pensionDeductible > 0 }] : []),
    ],
  };
}

// ─── LESOTHO (LS) ────────────────────────────────────────────────────────────
// RSL PAYE, computed monthly less the credit. No statutory social security.
function calcLS(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const vp = variablePayOf(t);
  const r = calculateLsPayslip({
    grossPay: grossMonthly + vp.recurring,
    irregularCashThisPeriod: vp.irregular,
    freq: t.payFrequency ?? 'monthly',
    pensionEmployeePerPeriod: grossMonthly * norm(Number(t.pensionContribution ?? 0)),
    pensionEmployerPerPeriod: grossMonthly * norm(Number(t.employerPensionPercent ?? 0)),
    payDate: t.payDate ? new Date(t.payDate) : undefined,
  });
  return {
    grossPay: r.grossPay + vp.irregular,
    incomeTax: r.paye,
    pension: r.pensionEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    totalEmployerCost: r.employerCost,
    // What PAYE was charged on: pay less the deductible pension (ITO s95).
    taxableIncome: Math.round((r.grossPay + vp.irregular - r.pensionDeductible) * 100) / 100,
    deductionItems: [
      { description: 'PAYE (RSL)', amount: r.paye, preTax: false },
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: r.pensionDeductible > 0 }] : []),
    ],
  };
}

// ─── RWANDA (RW) ─────────────────────────────────────────────────────────────
// RRA PAYE + RSSB through the single shared engine (RWTaxEngine.calculateRwPayslip).
// RSSB pension rides the generic social-security slot (as NSSA / NAPSA / NSSF);
// maternity, CBHI and medical have their own persisted paths. Nothing here is
// pre-tax: Rwanda gives no PAYE relief for any contribution. memos/RW-RECON-1.md.
function calcRW(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const rw = t.rw ?? {};
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const vp = variablePayOf(t);
  const r = calculateRwPayslip({
    grossPay: grossMonthly + vp.recurring,
    basicPay: grossMonthly,
    irregularCashThisPeriod: vp.irregular,
    freq: t.payFrequency ?? 'monthly',
    payDate: t.payDate ? new Date(t.payDate) : undefined,
    employeeType: rw.employeeType,
    companyCar: !!rw.companyCar,
    employerHousing: !!rw.employerHousing,
    otherBenefitsAtCost: scaled(Number(rw.otherBenefitsMonthly) || 0, periodShare(t)),
    medicalScheme: !!rw.medicalScheme,
    rssbExempt: !!rw.rssbExempt,
    pensionEmployeePerPeriod: grossMonthly * norm(Number(t.pensionContribution ?? 0)),
    pensionEmployerPerPeriod: grossMonthly * norm(Number(t.employerPensionPercent ?? 0)),
  });
  return {
    grossPay: r.cashPay,
    taxableIncome: r.taxableIncome,
    incomeTax: r.paye,
    pension: r.pensionEmployee,
    socialSecurity: r.rssbPensionEmployee,
    maternity: r.maternityEmployee,
    cbhi: r.cbhi,
    medical: r.medicalEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    employerSocialSecurity: r.rssbPensionEmployer,
    employerMaternity: r.maternityEmployer,
    employerMedical: r.medicalEmployer,
    occupationalHazards: r.occupationalHazards,
    totalEmployerCost: r.employerCost,
    ...(r.benefitsInKind ? { benefits: [{ code: 'RW-BIK', name: 'Benefits in kind', value: r.benefitsInKind, exempt: 0, inCash: false }] } : {}),
    deductionItems: [
      { description: 'PAYE (RRA)', amount: r.paye, preTax: false },
      ...(r.rssbPensionEmployee ? [{ description: 'RSSB pension', amount: r.rssbPensionEmployee, preTax: false }] : []),
      ...(r.maternityEmployee ? [{ description: 'RSSB maternity (0.3%)', amount: r.maternityEmployee, preTax: false }] : []),
      ...(r.cbhi ? [{ description: 'CBHI (0.5% of net)', amount: r.cbhi, preTax: false }] : []),
      ...(r.medicalEmployee ? [{ description: 'RAMA medical (7.5%)', amount: r.medicalEmployee, preTax: false }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: false }] : []),
    ],
  };
}

// ─── ANGOLA (AO) ─────────────────────────────────────────────────────────────
// AGT IRT (Grupo A) + INSS through the single shared engine (AOTaxEngine).
// INSS rides `socialSecurity`; the employee's 3% comes off before IRT, so it is
// pre-tax. memos/AO-RECON-1.md.
function calcAO(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const ao = t.ao ?? {};
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const vp = variablePayOf(t);
  const r = calculateAoPayslip({
    grossPay: grossMonthly + vp.recurring,
    basicPay: grossMonthly,
    irregularCashThisPeriod: vp.irregular,
    mealAllowance: scaled(Number(ao.mealAllowanceMonthly) || 0, periodShare(t)),
    transportAllowance: scaled(Number(ao.transportAllowanceMonthly) || 0, periodShare(t)),
    familyAllowance: scaled(Number(ao.familyAllowanceMonthly) || 0, periodShare(t)),
    retiredWorking: !!ao.retiredWorking,
    inssExempt: !!ao.inssExempt,
    freq: t.payFrequency ?? 'monthly',
    payDate: t.payDate ? new Date(t.payDate) : undefined,
    pensionEmployeePerPeriod: grossMonthly * norm(Number(t.pensionContribution ?? 0)),
    pensionEmployerPerPeriod: grossMonthly * norm(Number(t.employerPensionPercent ?? 0)),
  });
  return {
    grossPay: r.grossPay,
    taxableIncome: r.taxableIncome,
    incomeTax: r.irt,
    pension: r.pensionEmployee,
    socialSecurity: r.inssEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    employerSocialSecurity: r.inssEmployer,
    totalEmployerCost: r.employerCost,
    deductionItems: [
      { description: 'IRT (AGT)', amount: r.irt, preTax: false },
      ...(r.inssEmployee ? [{ description: 'INSS (3%)', amount: r.inssEmployee, preTax: true }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: false }] : []),
    ],
  };
}

// ─── MOZAMBIQUE (MZ) ─────────────────────────────────────────────────────────
// AT IRPS withholding + INSS through the single shared engine (MZTaxEngine).
// The table runs on GROSS: INSS is not deducted first. memos/MZ-RECON-1.md.
function calcMZ(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const mz = t.mz ?? {};
  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const vp = variablePayOf(t);
  const r = calculateMzPayslip({
    grossPay: grossMonthly + vp.recurring,
    irregularCashThisPeriod: vp.irregular,
    dependants: Number(mz.dependants) || 0,
    nonResident: !!mz.nonResident,
    inssExempt: !!mz.inssExempt,
    freq: t.payFrequency ?? 'monthly',
    payDate: t.payDate ? new Date(t.payDate) : undefined,
    pensionEmployeePerPeriod: grossMonthly * norm(Number(t.pensionContribution ?? 0)),
    pensionEmployerPerPeriod: grossMonthly * norm(Number(t.employerPensionPercent ?? 0)),
  });
  return {
    grossPay: r.grossPay,
    taxableIncome: r.taxableIncome,
    incomeTax: r.irps,
    pension: r.pensionEmployee,
    socialSecurity: r.inssEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    employerSocialSecurity: r.inssEmployer,
    totalEmployerCost: r.employerCost,
    deductionItems: [
      { description: 'IRPS (AT)', amount: r.irps, preTax: false },
      ...(r.inssEmployee ? [{ description: 'INSS (3%)', amount: r.inssEmployee, preTax: false }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: false }] : []),
    ],
  };
}

// ─── ZIMBABWE (ZW) ───────────────────────────────────────────────────────────
// ZIMRA PAYE via the single shared engine (ZWTaxEngine.calculateZwPayslip) so
// runs / preview / process never diverge.
//
// `incomeTax` carries tax payable PLUS the 3% AIDS levy, because that is ONE
// payment to ZIMRA. Reporting them separately here would understate the PAYE
// liability on every downstream report that reads this field.
function calcZW(grossMonthly: number, taxInfo: TaxInfo): PayslipCalcResult {
  const t = taxInfo as any;
  const zw = t.zw ?? {};
  const freq: string = t.payFrequency ?? zw.payFrequency ?? 'monthly';
  const periodicity: ZwPeriodicity =
    freq === 'weekly' ? 'weekly'
    : (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') ? 'fortnightly'
    : freq === 'daily' ? 'daily'
    : 'monthly';
  const n = ZW_PERIODS_PER_YEAR[periodicity];

  const norm = (x: number) => (x > 1 ? x / 100 : x);
  const pension = grossMonthly * norm(Number(t.pensionContribution ?? 0));
  const employerPension = grossMonthly * norm(Number(t.employerPensionPercent ?? 0));

  // Where the employee record splits pay across the two currencies, honour it —
  // that split is what decides WHICH gazetted table applies.
  const payCurrency = zw.payCurrency === 'ZWG' ? 'ZWG' : 'USD';
  // An explicit split is a full month's pay; grossMonthly arrives already prorated.
  const share = periodShare(t);
  const usdPayBase = zw.usdPay != null ? scaled(Number(zw.usdPay) || 0, share) : (payCurrency === 'USD' ? grossMonthly : 0);
  const zwgPayBase = zw.zwgPay != null ? scaled(Number(zw.zwgPay) || 0, share) : (payCurrency === 'ZWG' ? grossMonthly : 0);
  // Commission / overtime are recurring cash in the pay currency; a bonus goes
  // to the engine's own slot, where the annual USD 700 exemption applies.
  const vp = variablePayOf(t);
  const usdPay = usdPayBase + (payCurrency === 'USD' ? vp.recurring : 0);
  const zwgPay = zwgPayBase + (payCurrency === 'ZWG' ? vp.recurring : 0);

  const r = calculateZwPayslip({
    usdPay,
    zwgPay,
    bonusThisPeriod: vp.irregular,
    bonusExemptUsedYtd: Number(t.zwBonusExemptUsedYtd) || 0,
    interbankRate: Number(zw.interbankRate) || undefined,
    freq,
    taxableBenefitsPerPeriod: scaled(zwMonthlyTaxableBenefits(zw, n), share),
    pensionEmployeePerPeriod: pension,
    pensionEmployerPerPeriod: employerPension,
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
    payDate: t.payDate ? new Date(t.payDate) : undefined,
  });

  return {
    grossPay: r.grossPay,
    incomeTax: r.totalToZimra,
    // NSSA POBS rides on the generic social-security slot, as it does in
    // ZWTaxEngine.toPayslip — same figure, same name, so both run-creation
    // paths persist it to the same schema path instead of one of them losing it.
    socialSecurity: r.nssaEmployee,
    nec: r.necEmployee,
    pension: r.pensionEmployee,
    totalDeductions: r.totalDeductions,
    netPay: r.netPay,
    employerPension: r.pensionEmployer,
    employerSocialSecurity: r.nssaEmployer,
    employerNec: r.necEmployer,
    apwcs: r.apwcs,
    sdl: r.zimdef,
    totalEmployerCost: r.employerCost,
    deductionItems: [
      { description: 'PAYE (ZIMRA)', amount: r.taxPayable, preTax: false },
      { description: 'AIDS Levy (3%)', amount: r.aidsLevy, preTax: false },
      ...(r.nssaEmployee ? [{ description: 'NSSA POBS (4.5%)', amount: r.nssaEmployee, preTax: false }] : []),
      ...(r.necEmployee ? [{ description: 'NEC dues', amount: r.necEmployee, preTax: false }] : []),
      ...(r.pensionEmployee ? [{ description: 'Pension', amount: r.pensionEmployee, preTax: true }] : []),
      ...(r.taxableBenefits ? [{ description: 'Taxable benefits (non-cash)', amount: r.taxableBenefits, preTax: false }] : []),
    ],
  };
}

export function calculatePayslip(
  grossMonthly: number,
  region: string,
  taxInfo: TaxInfo
): PayslipCalcResult {
  // Accept any spelling ('RSA', 'ZAM', …) and switch on the stored code.
  const known = toPayrollRegion(region);
  const code: string = known ? toStoreRegion(known) : region;
  switch (code) {
    case 'ZA':
      return calcZA(grossMonthly, taxInfo);
    case 'UK':
      return calcUK(grossMonthly, taxInfo);
    case 'US':
      return calcUS(grossMonthly, taxInfo);
    case 'KE':
      return calcKE(grossMonthly, taxInfo);
    case 'BW':
      return calcBW(grossMonthly, taxInfo);
    case 'ZM':
      return calcZM(grossMonthly, taxInfo);
    case 'ZW':
      return calcZW(grossMonthly, taxInfo);
    case 'NA':
      return calcNA(grossMonthly, taxInfo);
    case 'SZ':
      return calcSZ(grossMonthly, taxInfo);
    case 'LS':
      return calcLS(grossMonthly, taxInfo);
    case 'RW':
      return calcRW(grossMonthly, taxInfo);
    case 'AO':
      return calcAO(grossMonthly, taxInfo);
    case 'MZ':
      return calcMZ(grossMonthly, taxInfo);
    default:
      // Until 2026-10-20 this returned a flat 25% "estimate": a fabricated
      // figure on a real payslip, with no error. A region added to lib/regions.ts
      // but forgotten here would have shipped that way. It now refuses.
      // Uganda (tables, no engine) lands here by design; see UNIMPLEMENTED_REGIONS.
      throw new UnsupportedPayrollRegionError(region);
  }
}

/** Thrown when no engine exists for a region, instead of inventing a number. */
export class UnsupportedPayrollRegionError extends Error {
  constructor(public readonly region: string) {
    super(`No payroll engine for region "${region}". Payslips are not calculated for regions without one.`);
    this.name = 'UnsupportedPayrollRegionError';
  }
}
