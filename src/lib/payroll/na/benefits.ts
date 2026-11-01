// src/lib/payroll/na/benefits.ts
// ─────────────────────────────────────────────────────────────────────────────
// Namibian fringe benefits and the approved-housing-scheme reduction. Pure.
//
// Checked at source 2026-10-23 (memos/NA-RECON-1.md, Part E):
//   • Company vehicle: 1.5% p.m. of the vehicle's cost price where the employer
//     bears all costs; 1.4% p.m. where the employee bears all the fuel.
//     (PwC Namibia Tax Reference & Rate Card 2026, and 2017: "1.5% p.m.";
//     NamRA, Tax on Individuals brochure.)
//   • Free or subsidised housing: a fixed value by location and number of rooms
//     (PwC rate card 2026). The table carries no period label; it is used as a
//     MONTHLY value — the only reading consistent with what housing costs
//     (N$4,000 a year for an 8-room Windhoek house is not plausible). Practitioner
//     to confirm. Rent the employee pays comes off.
//   • Loans: 12% p.a. of the loan less interest actually paid. Exempt when used
//     for further study, or when the loan does not exceed N$3,000. A HOUSING loan
//     is taxable to the extent its rate is below 12% p.a. — it is a mortgage
//     subsidy, and so a housing benefit.
//   • Approved housing scheme (employer-level, approved by NamRA): the taxable
//     housing benefit — housing allowance, free housing or mortgage subsidy — is
//     reduced by ONE THIRD (PwC Worldwide Tax Summaries). The exempt third is
//     reported on ITAS but kept off the PAYE 5 (CR van Wyk). The reduction is
//     larger below N$30,000 a year of remuneration (PwC rate card 2017); that pay
//     is already inside the N$100,000 nil band, so it changes no PAYE and is not
//     modelled.
//
// What the ETX template wants from this: one housing line per employee (type
// Free Housing / Housing Allowance / Mortgage Bond Subsidies, tax value, exempt,
// taxable portion), loans (L), vehicles (M).
// ─────────────────────────────────────────────────────────────────────────────

const r2 = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export const NA_FRINGE_2026 = {
  vehicle: { employerBearsAll: 0.015, employeeBearsFuel: 0.014 },
  loan: { benchmarkRate: 0.12, exemptUpTo: 3_000 },
  housingSchemeExemptFraction: 1 / 3,
  /** Monthly value of free / subsidised housing, by location and rooms (index 0 = 1 room … 8 = more than 8). */
  housing: {
    windhoek:   [500, 750, 1_000, 1_400, 1_800, 2_200, 2_800, 3_400, 4_000],
    walvisBay:  [350, 550,   750, 1_000, 1_300, 1_700, 2_100, 2_550, 3_000],
    largeTown:  [250, 375,   500,   700,   900, 1_100, 1_400, 1_700, 2_000],
    smallTown:  [125, 175,   250,   300,   450,   550,   700,   850, 1_000],
  },
} as const;

export type NaHousingLocation = keyof typeof NA_FRINGE_2026.housing;
export const NA_HOUSING_LOCATIONS: Record<NaHousingLocation, string> = {
  windhoek: 'Windhoek', walvisBay: 'Walvis Bay', largeTown: 'Another large town', smallTown: 'A small town',
};

/** The benefit details kept on an employee (taxInfo.na). All optional. */
export interface NaBenefitInputs {
  carCostPrice?: number;
  /** true = the employee pays all the fuel (1.4%); otherwise the employer bears all costs (1.5%). */
  carEmployeePaysFuel?: boolean;
  housingLocation?: NaHousingLocation;
  /** Rooms in the house provided: 1..8, or 9 for more than eight. */
  housingRooms?: number;
  housingRentPaidMonthly?: number;
  loanBalance?: number;
  /** Interest the employee pays, % a year (e.g. 4 for 4%). */
  loanRatePercent?: number;
  loanPurpose?: 'housing' | 'study' | 'other';
}

export type NaBenefitCode = 'vehicle' | 'free-housing' | 'mortgage-subsidy' | 'loan' | 'housing-allowance';

/**
 * One benefit on a payslip. `value` is the full taxable value before any scheme
 * reduction; `exempt` the scheme's third; `inCash` marks the housing allowance,
 * which is already in gross pay (it is listed so the ETX housing columns and the
 * exemption have one home).
 */
export interface NaBenefitLine {
  code: NaBenefitCode;
  name: string;
  value: number;
  exempt: number;
  inCash: boolean;
}

export interface NaBenefitsResult {
  lines: NaBenefitLine[];
  /** Non-cash value added to taxable income, after the scheme's reduction. */
  inKindTaxable: number;
  /** Exempt third of the CASH housing allowance — comes off taxable income. */
  cashExempt: number;
  /** Payment in kind for the SSC basic wage (vehicle + housing, full value). */
  inKindForSsc: number;
}

/**
 * This period's fringe benefits. `periodFactor` scales monthly values to the pay
 * period (12 / periods-in-year); `housingAllowance` is the period's cash housing
 * allowance, if any.
 */
export function naBenefitsForPeriod(
  na: NaBenefitInputs,
  opts: { housingScheme?: boolean; housingAllowance?: number; periodFactor?: number } = {},
): NaBenefitsResult {
  const f = opts.periodFactor ?? 1;
  const scheme = !!opts.housingScheme;
  const third = NA_FRINGE_2026.housingSchemeExemptFraction;
  const lines: NaBenefitLine[] = [];

  // Vehicle
  const cost = Math.max(0, Number(na.carCostPrice) || 0);
  if (cost > 0) {
    const rate = na.carEmployeePaysFuel ? NA_FRINGE_2026.vehicle.employeeBearsFuel : NA_FRINGE_2026.vehicle.employerBearsAll;
    lines.push({ code: 'vehicle', name: `Company vehicle (${(rate * 100).toFixed(1)}% of cost)`, value: r2(cost * rate * f), exempt: 0, inCash: false });
  }

  // Free / subsidised housing
  if (na.housingLocation && NA_FRINGE_2026.housing[na.housingLocation] && (Number(na.housingRooms) || 0) > 0) {
    const rooms = Math.min(9, Math.max(1, Math.floor(Number(na.housingRooms))));
    const table = NA_FRINGE_2026.housing[na.housingLocation][rooms - 1];
    const value = r2(Math.max(0, table - Math.max(0, Number(na.housingRentPaidMonthly) || 0)) * f);
    if (value > 0) {
      lines.push({ code: 'free-housing', name: 'Free or subsidised housing', value, exempt: scheme ? r2(value * third) : 0, inCash: false });
    }
  }

  // Loans
  const bal = Math.max(0, Number(na.loanBalance) || 0);
  if (bal > 0) {
    const gap = Math.max(0, NA_FRINGE_2026.loan.benchmarkRate - (Number(na.loanRatePercent) || 0) / 100);
    const value = r2(bal * gap / 12 * f);
    if (na.loanPurpose === 'housing') {
      if (value > 0) lines.push({ code: 'mortgage-subsidy', name: 'Housing loan below 12%', value, exempt: scheme ? r2(value * third) : 0, inCash: false });
    } else if (na.loanPurpose !== 'study' && bal > NA_FRINGE_2026.loan.exemptUpTo && value > 0) {
      lines.push({ code: 'loan', name: 'Low-interest loan', value, exempt: 0, inCash: false });
    }
  }

  // Cash housing allowance — already in gross; listed for the scheme's third and the ETX.
  const allowance = Math.max(0, Number(opts.housingAllowance) || 0);
  if (allowance > 0) {
    lines.push({ code: 'housing-allowance', name: 'Housing allowance', value: r2(allowance), exempt: scheme ? r2(allowance * third) : 0, inCash: true });
  }

  const nonCash = lines.filter(l => !l.inCash);
  return {
    lines,
    inKindTaxable: r2(nonCash.reduce((s, l) => s + l.value - l.exempt, 0)),
    cashExempt: r2(lines.filter(l => l.inCash).reduce((s, l) => s + l.exempt, 0)),
    inKindForSsc: r2(nonCash.filter(l => l.code === 'vehicle' || l.code === 'free-housing').reduce((s, l) => s + l.value, 0)),
  };
}

/**
 * What a payslip counts as remuneration for NamRA (monthly schedule, PAYE 5,
 * ETX gross): cash gross + taxable non-cash benefits − the exempt third of a
 * cash housing allowance. The exempt part is kept off the PAYE 5.
 */
export function naRemunerationOf(p: { grossPay?: number; benefits?: Array<{ code?: string; value?: number; exempt?: number; inCash?: boolean }> }): number {
  const gross = Number(p.grossPay) || 0;
  const b = p.benefits ?? [];
  const inKind = b.filter(l => !l.inCash).reduce((s, l) => s + (Number(l.value) || 0) - (Number(l.exempt) || 0), 0);
  const cashExempt = b.filter(l => l.inCash).reduce((s, l) => s + (Number(l.exempt) || 0), 0);
  return r2(gross + inKind - cashExempt);
}
