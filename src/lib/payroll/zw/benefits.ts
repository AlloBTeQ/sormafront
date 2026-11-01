// src/lib/payroll/zw/benefits.ts
// ─────────────────────────────────────────────────────────────────────────────
// Zimbabwe taxable benefits — Income Tax Act, THIRTEENTH SCHEDULE.
//
// Pure and DB-free, mirroring src/lib/payroll/bw/benefits.ts.
//
// This is a richer benefits surface than Botswana's, and after the currency
// dimension it is the largest chunk of Zimbabwean engine work. Benefits are
// TAXABLE but NON-CASH: they raise PAYE, they never reduce take-home pay. The
// engine treats them that way, and the tests pin it.
//
// All values are USD per year unless stated. Under the ZWG regime they convert
// at the day's rate, the same as every other USD-denominated limit.
// ─────────────────────────────────────────────────────────────────────────────

const r2 = (n: number) => Math.round(((n || 0) + Number.EPSILON) * 100) / 100;

/**
 * Deemed motor-vehicle benefit, by ENGINE CAPACITY. USD per year, pro-rated for
 * part-years.
 *
 * ⚠ SIGN-OFF GATE: ZIMRA's published table for these values is labelled 2024.
 *   Confirm whether a later SI has moved them before a live filing. The figures
 *   are here rather than inline precisely so that check is a one-line diff.
 */
export const ZW_VEHICLE_BENEFIT_ANNUAL_USD: Array<{ maxCc: number; annual: number }> = [
  { maxCc: 1500, annual: 625 },
  { maxCc: 2000, annual: 830 },
  { maxCc: 3000, annual: 1250 },
  { maxCc: Number.POSITIVE_INFINITY, annual: 1660 },
];

/**
 * Deemed vehicle benefit for a year.
 *
 * `monthsAvailable` pro-rates a vehicle held for part of the year — a car
 * provided in October is not a full year's benefit.
 */
export function zwVehicleBenefitAnnual(engineCc: number, monthsAvailable = 12): number {
  if (!engineCc || engineCc <= 0) return 0;
  const band = ZW_VEHICLE_BENEFIT_ANNUAL_USD.find(b => engineCc <= b.maxCc)
    ?? ZW_VEHICLE_BENEFIT_ANNUAL_USD[ZW_VEHICLE_BENEFIT_ANNUAL_USD.length - 1];
  const months = Math.min(12, Math.max(0, monthsAvailable));
  return r2(band.annual * (months / 12));
}

/**
 * Data and airtime benefit — 30% of the cost to the employer.
 *
 * The exemption for 100% business use is NOT assumed: the onus is on the
 * EMPLOYER to prove it with call-log evidence. So the default is that the
 * benefit applies, and `provenBusinessUse` must be set deliberately.
 */
export const ZW_DATA_AIRTIME_RATE = 0.30;

export function zwDataAirtimeBenefit(costToEmployer: number, provenBusinessUse = false): number {
  if (provenBusinessUse) return 0;
  return r2(Math.max(0, costToEmployer) * ZW_DATA_AIRTIME_RATE);
}

/**
 * Occupation of quarters / residence — open market rental value, LESS any rent
 * the employee actually pays.
 */
export function zwResidenceBenefit(openMarketRental: number, rentPaidByEmployee = 0): number {
  return r2(Math.max(0, Math.max(0, openMarketRental) - Math.max(0, rentPaidByEmployee)));
}

/**
 * School fees benefit — the full cost to the employer.
 *
 * EXCEPTION: for teaching and non-teaching staff AT THE SCHOOL, the benefit is
 * HALF the value, for a maximum of THREE children. That exception is the part
 * most often missed, so it is modelled rather than left to the caller.
 */
export function zwSchoolFeesBenefit(params: {
  totalFees: number;
  /** Employee is teaching or non-teaching staff at the school providing them. */
  isSchoolStaff?: boolean;
  /** Number of children the fees cover. */
  children?: number;
}): number {
  const fees = Math.max(0, params.totalFees || 0);
  if (fees <= 0) return 0;
  if (!params.isSchoolStaff) return r2(fees);

  const children = Math.max(0, params.children ?? 1);
  if (children === 0) return 0;
  // Half value, capped at three children — pro-rate the fees across the
  // children actually covered so a fourth child's fees stay fully taxable.
  const covered = Math.min(3, children);
  const perChild = fees / children;
  const concessional = perChild * covered * 0.5;
  const remainder = perChild * Math.max(0, children - covered);
  return r2(concessional + remainder);
}

/** Passage benefit — the employer's cost for NON-BUSINESS travel of the
 *  employee, spouse or children. Business travel is not a benefit. */
export function zwPassageBenefit(employerCostNonBusiness: number): number {
  return r2(Math.max(0, employerCostNonBusiness));
}

/**
 * Loan benefit — the value to the employee of a concessionary loan.
 *
 * Modelled as the interest forgone: balance × (market rate − rate charged).
 * Rates are fractions (0.10 = 10%).
 */
export function zwLoanBenefitAnnual(balance: number, marketRate: number, rateCharged: number): number {
  const spread = Math.max(0, (marketRate || 0) - (rateCharged || 0));
  return r2(Math.max(0, balance) * spread);
}

/** Use of furniture — value to the employee, supplied directly. */
export function zwFurnitureBenefit(valueToEmployee: number): number {
  return r2(Math.max(0, valueToEmployee));
}

/**
 * The shape stored on `Employee.taxInfo.zw` that drives benefits.
 * Every field optional; absent or zero means no benefit.
 */
export interface ZwBenefitInputs {
  vehicleEngineCc?: number;
  vehicleMonthsAvailable?: number;
  /** Overrides the deemed table entirely, where a practitioner has directed it. */
  vehicleBenefitOverrideAnnual?: number;

  dataAirtimeCostAnnual?: number;
  dataAirtimeProvenBusinessUse?: boolean;

  residenceOpenMarketRentalAnnual?: number;
  residenceRentPaidAnnual?: number;

  schoolFeesAnnual?: number;
  schoolFeesIsSchoolStaff?: boolean;
  schoolFeesChildren?: number;

  passageBenefitAnnual?: number;

  loanBalance?: number;
  loanMarketRate?: number;
  loanRateCharged?: number;

  furnitureBenefitAnnual?: number;
  otherTaxableBenefitAnnual?: number;
}

/**
 * Total ANNUAL taxable benefits, USD.
 *
 * Kept annual because that is how the Thirteenth Schedule states every value;
 * the engine divides by the periodicity.
 */
export function zwAnnualTaxableBenefits(zw: ZwBenefitInputs | undefined): number {
  if (!zw) return 0;
  const vehicle = zw.vehicleBenefitOverrideAnnual != null
    ? Math.max(0, zw.vehicleBenefitOverrideAnnual)
    : zwVehicleBenefitAnnual(zw.vehicleEngineCc ?? 0, zw.vehicleMonthsAvailable ?? 12);

  return r2(
    vehicle
    + zwDataAirtimeBenefit(zw.dataAirtimeCostAnnual ?? 0, zw.dataAirtimeProvenBusinessUse)
    + zwResidenceBenefit(zw.residenceOpenMarketRentalAnnual ?? 0, zw.residenceRentPaidAnnual ?? 0)
    + zwSchoolFeesBenefit({
        totalFees: zw.schoolFeesAnnual ?? 0,
        isSchoolStaff: zw.schoolFeesIsSchoolStaff,
        children: zw.schoolFeesChildren,
      })
    + zwPassageBenefit(zw.passageBenefitAnnual ?? 0)
    + zwLoanBenefitAnnual(zw.loanBalance ?? 0, zw.loanMarketRate ?? 0, zw.loanRateCharged ?? 0)
    + zwFurnitureBenefit(zw.furnitureBenefitAnnual ?? 0)
    + Math.max(0, zw.otherTaxableBenefitAnnual ?? 0),
  );
}

/**
 * Taxable benefits for ONE pay period.
 *
 * `periodsPerYear` comes from the engine's periodicity, so a weekly payroll
 * spreads the annual deemed values across 52 periods rather than 12.
 */
export function zwMonthlyTaxableBenefits(zw: ZwBenefitInputs | undefined, periodsPerYear = 12): number {
  const annual = zwAnnualTaxableBenefits(zw);
  if (!annual) return 0;
  return r2(annual / Math.max(1, periodsPerYear));
}
