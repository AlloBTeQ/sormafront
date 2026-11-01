// src/lib/payroll/bw/benefits.ts
// Botswana taxable benefits-in-kind & gratuity — valued per the Income Tax Act
// (CAP 52:01). Pure and deterministic. Amounts ANNUAL BWP unless noted.
//
//  Housing benefit        — s32(3): 10% of the property's rateable value; or 8%
//                           of the current capital valuation where not rateable;
//                           pro-rated for part-years; less rent paid by the employee;
//                           optionally capped at a Minister-prescribed % of pay.
//  Loan benefit           — s32(1)(e): (commercial rate − preferential rate) × balance.
//  Gratuity/severance to a CITIZEN — s32(7): wholly tax-free if directly invested in an
//                           approved pension/retirement annuity fund; otherwise only
//                           ONE THIRD is exempt (two thirds taxable).
//  Fixed-term CONTRACT gratuity — 50% taxable (contracts on/after 1 Jul 1999),
//                           accruing at 25% (1st) / 27.5% (2nd) / 30% (3rd+) of gross salary.
//  Medical  — s32(2)(a): free / employer-paid medical is EXEMPT (never a benefit).
//  Passage  — s32(2)(b): free passage for employee/spouse/children is EXEMPT.

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export interface BwHousingInput {
  rateableValue?: number;                     // annual rateable value (Townships Act roll)
  capitalValue?: number;                      // "current capital valuation" if not rateable
  monthsProvided?: number;                    // default 12
  rentPaidByEmployeeAnnual?: number;
  employmentIncomeExclHousingAnnual?: number; // for the s32(3) proviso (ii) cap
  cappedPercent?: number;                     // Minister-prescribed relevant % (e.g. 0.25); omit = uncapped
}
/** Annual taxable value of employer-provided housing — s32(3). */
export function bwHousingBenefitAnnual(i: BwHousingInput): number {
  const months = Math.min(12, Math.max(0, i.monthsProvided ?? 12));
  let value = 0;
  if (i.rateableValue && i.rateableValue > 0) value = 0.10 * i.rateableValue;      // s32(3)(a)
  else if (i.capitalValue && i.capitalValue > 0) value = 0.08 * i.capitalValue;    // s32(3)(c)
  value = value * (months / 12);                                                   // s32(3)(d) pro-rata
  value = Math.max(0, value - (i.rentPaidByEmployeeAnnual ?? 0));                   // less rent paid
  if (i.cappedPercent && i.employmentIncomeExclHousingAnnual) {                     // s32(3) proviso (ii)
    const cap = Math.max(0, i.cappedPercent * i.employmentIncomeExclHousingAnnual - (i.rentPaidByEmployeeAnnual ?? 0));
    value = Math.min(value, cap);
  }
  return r2(value);
}

/** Annual taxable value of a low-interest employer loan — s32(1)(e). Rates as decimals. */
export function bwLoanBenefitAnnual(loanBalance: number, commercialRate: number, preferentialRate: number): number {
  const diff = Math.max(0, (commercialRate || 0) - (preferentialRate || 0));
  return r2(Math.max(0, loanBalance || 0) * diff);
}

export type BwGratuityRegime = 'citizen_service' | 'contract';
export interface BwGratuityInput {
  amount: number;
  investedInApprovedFund?: boolean;  // s32(7): wholly exempt if true
  regime?: BwGratuityRegime;         // default 'citizen_service'
}
/** Taxable portion of a gratuity/severance payment. */
export function bwGratuityTaxableAmount(i: BwGratuityInput): number {
  const amt = Math.max(0, i.amount || 0);
  if (i.investedInApprovedFund) return 0;                       // s32(7) fully exempt
  if (i.regime === 'contract') return r2(amt * 0.50);           // contract regime: 50% taxable
  return r2(amt * (2 / 3));                                     // s32(7): 1/3 exempt → 2/3 taxable
}
/** Contract gratuity accrual rate by contract sequence number (25% / 27.5% / 30%). */
export function bwContractGratuityRate(contractNumber: number): number {
  if (contractNumber >= 3) return 0.30;
  if (contractNumber === 2) return 0.275;
  return 0.25;
}

// ── Motor vehicle benefit ─────────────────────────────────────────────────────
// STANDARD PUBLISHED SCALE (as used across BW tax guides). The precise figures are
// set by subsidiary legislation (a Statutory Instrument), NOT in CAP 52:01 itself —
// confirm against the current BURS SI and override BW_CAR_BENEFIT_SCALE if it moves.
export interface BwCarBand { maxCost: number; benefit: number; fuel: number; }
export const BW_CAR_BENEFIT_SCALE: BwCarBand[] = [
  { maxCost: 50000,    benefit: 2500,  fuel: 1000 },
  { maxCost: 100000,   benefit: 5000,  fuel: 2000 },
  { maxCost: 150000,   benefit: 7500,  fuel: 3000 },
  { maxCost: 200000,   benefit: 10000, fuel: 4000 },
  { maxCost: Infinity, benefit: 10000, fuel: 5000 }, // + 15% of cost over 200,000
];
/** Annual taxable motor-vehicle benefit for a company car costing `cost` (BWP). */
export function bwCarBenefitAnnual(cost: number, employerProvidesFuel = false): number {
  const c = Math.max(0, cost || 0);
  if (c === 0) return 0;
  const band = BW_CAR_BENEFIT_SCALE.find(b => c <= b.maxCost) ?? BW_CAR_BENEFIT_SCALE[BW_CAR_BENEFIT_SCALE.length - 1];
  let benefit = band.benefit;
  if (!isFinite(band.maxCost) && c > 200000) benefit += 0.15 * (c - 200000);
  if (employerProvidesFuel) benefit += band.fuel;
  return r2(benefit);
}

// ── Aggregate recurring taxable benefits from an employee's BW tax profile ─────
// Returns the PER-PERIOD taxable benefit-in-kind (housing + car + loan + other).
export function bwMonthlyTaxableBenefits(bw: any, periods = 12): number {
  if (!bw) return 0;
  let annual = 0;
  annual += bwHousingBenefitAnnual({
    rateableValue: bw.housingRateableValue,
    capitalValue: bw.housingCapitalValue,
    rentPaidByEmployeeAnnual: (bw.housingRentPaidMonthly || 0) * periods,
  });
  if (bw.carBenefitOverride && bw.carBenefitOverride > 0) annual += Math.max(0, bw.carBenefitOverride);
  else if (bw.carCost) annual += bwCarBenefitAnnual(bw.carCost, !!bw.carEmployerFuel);
  if (bw.loanBalance) annual += bwLoanBenefitAnnual(bw.loanBalance, bw.loanCommercialRate || 0, bw.loanPreferentialRate || 0);
  annual += Math.max(0, (bw.otherTaxableBenefitMonthly || 0) * periods);
  return r2(annual / periods);
}
