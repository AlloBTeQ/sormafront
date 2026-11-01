import {
  KE_RELIEF, KE_DEDUCTION_CAPS, KE_SHIF, KE_AHL, KE_NSSF_RATE, KE_NITA_MONTHLY,
  keNssfLimitsAt, keMonthlyTax,
} from '@/lib/payroll/ke/config';


// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Employee residence status
 */
export type ResidenceStatus = 'resident' | 'non_resident';

/**
 * Employee disability status (affects tax relief)
 */
export type DisabilityStatus = 'none' | 'disabled';

/**
 * Pay frequency
 */
export type PayFrequency = 'weekly' | 'fortnightly' | 'monthly';

/**
 * NSSF Contribution Tier
 */
export type NSSFTier = 'tier1' | 'tier2' | 'both' | 'old_rates';

/**
 * HELB Loan deduction type
 */
export interface HELBDeduction {
  hasLoan: boolean;
  monthlyDeduction?: number;      // Fixed monthly amount
  percentageDeduction?: number;   // Or percentage of gross
  loanBalance?: number;           // For tracking
}

/**
 * Employee tax configuration
 */
export interface KenyaEmployeeConfig {
  // Personal Information
  residenceStatus: ResidenceStatus;
  disabilityStatus?: DisabilityStatus;
  kraPin: string;                 // KRA PIN number
  
  // Tax Relief & Exemptions
  hasInsuranceRelief?: boolean;
  monthlyInsurancePremium?: number;       // Life/education policy premiums
  hasMortgageInterestRelief?: boolean;
  monthlyMortgageInterest?: number;       // Interest paid on mortgage
  hasHomeOwnershipSavings?: boolean;      // HOSP
  monthlyHOSPContribution?: number;
  
  // NHIF
  nhifExempt?: boolean;
  nhifNumber?: string;
  
  // NSSF
  nssfExempt?: boolean;
  nssfNumber?: string;
  nssfTier?: NSSFTier;            // Which tier calculation to use
  voluntaryNSSF?: number;         // Additional voluntary contribution
  
  // Housing Levy
  housingLevyExempt?: boolean;
  
  // HELB (Higher Education Loans Board)
  helb?: HELBDeduction;
  
  // Other Deductions
  sacco?: number;                 // SACCO contribution
  unionDues?: number;             // Trade union dues
  otherDeductions?: number;
  
  // YTD Information
  ytdGrossIncome?: number;
  ytdTaxPaid?: number;
  ytdNHIF?: number;
  ytdNSSF?: number;
  ytdHousingLevy?: number;
}

/**
 * Employer configuration
 */
export interface KenyaEmployerConfig {
  kraPin: string;                 // Employer KRA PIN
  nssfNumber?: string;            // Employer NSSF number
  
  // Employer contributions
  includeEmployerNSSF?: boolean;  // Track employer NSSF contribution
}

/**
 * Gross pay breakdown
 */
export interface KenyaGrossPayInput {
  basicSalary: number;
  houseAllowance?: number;
  transportAllowance?: number;
  otherAllowances?: number;
  overtime?: number;
  bonus?: number;
  commission?: number;
  
  // Benefits in Kind (taxable)
  carBenefit?: number;
  houseBenefit?: number;          // If employer-provided housing
  otherBenefits?: number;
  
  // Non-taxable (for reference)
  reimbursements?: number;
  medicalAllowance?: number;      // Up to limits
}

/**
 * Complete payroll calculation result
 */
export interface KenyaPayrollResult {
  // Gross Pay
  grossPay: number;
  taxableIncome: number;
  
  // Tax Reliefs
  reliefs: {
    personalRelief: number;
    insuranceRelief: number;
    mortgageRelief: number;
    hospRelief: number;
    disabilityRelief: number;
    totalRelief: number;
  };
  
  // Employee Deductions
  employeeDeductions: {
    paye: number;                 // Pay As You Earn
    nhif: number;                 // NHIF — replaced by SHIF on 1 Oct 2024; always 0
    shif: number;                 // Social Health Insurance Fund (2.75%, min 300)
    nssfTier1: number;            // NSSF Tier I
    nssfTier2: number;            // NSSF Tier II
    nssfTotal: number;
    housingLevy: number;          // Affordable Housing Levy
    helb: number;                 // HELB loan repayment
    total: number;
  };
  
  // Employer Contributions
  employerContributions: {
    nssfTier1: number;
    nssfTier2: number;
    nssfTotal: number;
    housingLevy: number;
    nita: number;                 // National Industrial Training Authority
    total: number;
  };
  
  // Other Deductions (voluntary/contractual)
  otherDeductions: {
    sacco: number;
    unionDues: number;
    other: number;
    total: number;
  };
  
  // Summary
  totalDeductions: number;
  netPay: number;
  totalEmployerCost: number;
  
  // For P9/P10 Reporting
  reportingData: {
    grossPay: number;
    taxableIncome: number;
    taxBeforeRelief: number;
    totalRelief: number;
    taxPayable: number;
    effectiveTaxRate: number;
  };
  
  // YTD Updates
  ytdUpdates: {
    grossIncome: number;
    taxPaid: number;
    nhif: number;
    nssf: number;
    housingLevy: number;
  };
  
  // Warnings
  warnings: string[];
}

// =============================================================================
// 2024 TAX CONSTANTS (KRA)
// =============================================================================

// Rates, reliefs, NSSF, SHIF and AHL live in lib/payroll/ke/config.ts (checked at source).

/**
 * HELB Standard Deduction Rate
 */
const HELB_RATES = {
  defaultMonthly: 1500,     // Default deduction if no specific amount
  minimumGross: 50000,      // Minimum gross for percentage calculation
  percentageRate: 0.04,     // 4% of gross for higher earners
};


// =============================================================================
// THE ONE KENYA CALCULATION — checked at source 2026-10-23 (lib/payroll/ke/config.ts)
// =============================================================================
// Used by the run path (taxCalculations.calcKE), the process route
// (KenyaTaxEngine.calculate) and calculatePayroll, so the three cannot drift.
//
//   gross → NSSF (6% between the limits in force on the pay date), SHIF (2.75%,
//   min 300), AHL (1.5%) → taxable = gross − allowable pension (NSSF + fund,
//   s22A cap) − SHIF (s15(2)(ae)) − AHL (s15(2)(ac)) − mortgage interest
//   (s15(3)(b)) → monthly bands → less personal and insurance relief.
//   A bonus is taxed in the month paid, on top of that month's pay.


const r2ke = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;

export interface KeCalcInput {
  /** Recurring gross pay for the period (basic + allowances + benefits). */
  grossPay: number;
  irregularCashThisPeriod?: number;
  freq?: string;
  payDate?: Date;
  /** Employee contribution to a registered pension / provident fund, per period. */
  pensionEmployeePerPeriod?: number;
  pensionEmployerPerPeriod?: number;
  monthlyInsurancePremium?: number;
  monthlyMortgageInterest?: number;
  nssfExempt?: boolean;
  shifExempt?: boolean;
  ahlExempt?: boolean;
  nonResident?: boolean;
}

export interface KeCalcResult {
  grossPay: number;
  nssfTier1: number; nssfTier2: number; nssfEmployee: number; nssfEmployer: number;
  nssfLel: number; nssfUel: number; nssfLimitsAssumed: boolean;
  shif: number;
  ahlEmployee: number; ahlEmployer: number;
  pensionEmployee: number; pensionEmployer: number;
  pensionDeductible: number; mortgageDeductible: number;
  taxableIncome: number;
  taxBeforeRelief: number; personalRelief: number; insuranceRelief: number;
  paye: number;
  nita: number;
  totalDeductions: number; netPay: number; employerCost: number;
}

export function kePeriodsInYear(freq?: string): number {
  if (freq === 'weekly') return 52;
  if (freq === 'fortnightly' || freq === 'bi_weekly' || freq === 'bi-weekly') return 26;
  return 12;
}

export function calculateKePayslip(input: KeCalcInput): KeCalcResult {
  const n = kePeriodsInYear(input.freq);
  const toMonth = (x: number) => x * n / 12;      // period amount → monthly
  const toPeriod = (x: number) => x * 12 / n;     // monthly amount → period
  const payDate = input.payDate ?? new Date();
  const recurring = Math.max(0, input.grossPay || 0);
  const irregular = Math.max(0, input.irregularCashThisPeriod || 0);
  const gross = recurring + irregular;
  const grossMonthly = toMonth(recurring) + irregular;

  // NSSF on monthly pensionable earnings.
  const lim = keNssfLimitsAt(payDate);
  const t1m = input.nssfExempt ? 0 : Math.min(grossMonthly, lim.lel) * KE_NSSF_RATE;
  const t2m = input.nssfExempt ? 0 : Math.max(0, Math.min(grossMonthly, lim.uel) - lim.lel) * KE_NSSF_RATE;
  const shifM = input.shifExempt ? 0 : Math.max(KE_SHIF.minimumMonthly, grossMonthly * KE_SHIF.rate);
  const ahlM = input.ahlExempt ? 0 : grossMonthly * KE_AHL.employeeRate;
  const ahlErM = input.ahlExempt ? 0 : grossMonthly * KE_AHL.employerRate;

  const pensionEeM = toMonth(Math.max(0, input.pensionEmployeePerPeriod || 0));
  const pensionErM = toMonth(Math.max(0, input.pensionEmployerPerPeriod || 0));
  const pensionDedM = Math.min(
    t1m + t2m + pensionEeM,
    grossMonthly * KE_DEDUCTION_CAPS.pensionShareOfPensionable,
    KE_DEDUCTION_CAPS.pensionAnnual / 12,
  );
  const mortgageDedM = Math.min(Math.max(0, input.monthlyMortgageInterest || 0), KE_DEDUCTION_CAPS.mortgageInterestAnnual / 12);

  const taxableM = Math.max(0, grossMonthly - pensionDedM - shifM - ahlM - mortgageDedM);
  let taxBeforeM: number;
  let personalM = 0;
  let insuranceM = 0;
  if (input.nonResident) {
    taxBeforeM = taxableM * 0.30;   // non-resident employment income: no reliefs
  } else {
    taxBeforeM = keMonthlyTax(taxableM);
    personalM = KE_RELIEF.personalAnnual / 12;
    insuranceM = Math.min(Math.max(0, input.monthlyInsurancePremium || 0) * KE_RELIEF.insuranceRate, KE_RELIEF.insuranceCapAnnual / 12);
  }
  const payeM = Math.max(0, taxBeforeM - personalM - insuranceM);

  // Back to the period. The bonus sits in this period whole, so only the
  // recurring share is rescaled — for monthly pay the two are the same.
  const scale = grossMonthly > 0 ? gross / grossMonthly : 1;
  const per = (m: number) => r2ke(m * scale);
  const nssfTier1 = per(t1m), nssfTier2 = per(t2m);
  const nssfEmployee = r2ke(nssfTier1 + nssfTier2);
  const shif = per(shifM), ahlEmployee = per(ahlM), ahlEmployer = per(ahlErM);
  const paye = per(payeM);
  const pensionEmployee = r2ke(toPeriod(pensionEeM)), pensionEmployer = r2ke(toPeriod(pensionErM));
  const nita = r2ke(toPeriod(KE_NITA_MONTHLY));
  const totalDeductions = r2ke(paye + nssfEmployee + shif + ahlEmployee + pensionEmployee);
  return {
    grossPay: r2ke(gross),
    nssfTier1, nssfTier2, nssfEmployee, nssfEmployer: nssfEmployee,
    nssfLel: lim.lel, nssfUel: lim.uel, nssfLimitsAssumed: lim.assumed,
    shif, ahlEmployee, ahlEmployer,
    pensionEmployee, pensionEmployer,
    pensionDeductible: per(pensionDedM), mortgageDeductible: per(mortgageDedM),
    taxableIncome: per(taxableM),
    taxBeforeRelief: per(taxBeforeM), personalRelief: per(personalM), insuranceRelief: per(insuranceM),
    paye, nita,
    totalDeductions,
    netPay: r2ke(gross - totalDeductions),
    employerCost: r2ke(gross + nssfEmployee + ahlEmployer + pensionEmployer + nita),
  };
}

// =============================================================================
// KENYA TAX ENGINE CLASS
// =============================================================================

export class KenyaTaxEngine {
  private taxYear: number;
  
  constructor(taxYear: number = 2024) {
    this.taxYear = taxYear;
  }
  

  /**
   * The process-route adapter (MultiRegionPayrollService calls engine.calculate).
   * There was none — a Kenya run through /process would have thrown.
   */
  calculate(employee: any, _ps: string, _pe: string, payDate?: string) {
    const comp = employee?.compensation ?? {};
    const ke = employee?.taxInfo?.ke ?? {};
    const pcfg = employee?.deductions?.pension ?? {};
    const basic = Number(comp.basicSalary ?? comp.baseSalary) || 0;
    const norm = (x: number) => (x > 1 ? x / 100 : x);
    const off = pcfg.enabled === false;
    const r = calculateKePayslip({
      grossPay: basic + (Number(comp.overtimePay) || 0),
      freq: comp.payFrequency || 'monthly',
      payDate: payDate ? new Date(payDate) : undefined,
      pensionEmployeePerPeriod: off ? 0 : basic * norm(Number(pcfg.employeePercent ?? 0)),
      pensionEmployerPerPeriod: off ? 0 : basic * norm(Number(pcfg.employerPercent ?? 0)),
      nssfExempt: !!ke.nssfExempt,
      shifExempt: !!(ke.shifExempt ?? ke.nhifExempt),
      ahlExempt: !!ke.housingLevyExempt,
      nonResident: ke.residenceStatus === 'non-resident' || ke.residenceStatus === 'non_resident',
    });
    const yt = employee?.ytdTotals ?? {};
    return {
      employeeId: employee?._id, employee,
      earnings: { basicSalary: basic, overtimePay: Number(comp.overtimePay) || 0, bonus: 0, grossPay: r.grossPay, taxableIncome: r.taxableIncome },
      deductions: { paye: r.paye, uif: 0, socialSecurity: r.nssfEmployee, pensionFund: r.pensionEmployee, medicalAid: r.shif, housingLevy: r.ahlEmployee, totalDeductions: r.totalDeductions },
      netPay: r.netPay,
      employerCosts: { uif: 0, sdl: r.nita, socialSecurity: r.nssfEmployer, housingLevy: r.ahlEmployer, employerPension: r.pensionEmployer, totalEmployerCost: r.employerCost },
      ytd: { grossPay: (Number(yt.grossPay) || 0) + r.grossPay, paye: (Number(yt.paye) || 0) + r.paye, uif: 0, netPay: (Number(yt.netPay) || 0) + r.netPay },
      taxDetail: { annualTaxableIncome: r.taxableIncome * kePeriodsInYear(comp.payFrequency), annualTax: 0, primaryRebate: r.personalRelief, secondaryRebate: 0, tertiaryRebate: 0, medicalTaxCredit: 0, effectiveTaxRate: r.grossPay > 0 ? r.paye / r.grossPay : 0, marginalRate: 0 },
      payeBasis: { recurringRemuneration: r.grossPay, irregularIncome: 0, taxWithheld: r.paye },
      keDetail: { nssfLel: r.nssfLel, nssfUel: r.nssfUel, nssfLimitsAssumed: r.nssfLimitsAssumed, shif: r.shif, ahl: r.ahlEmployee },
    };
  }

  // ---------------------------------------------------------------------------
  // MAIN CALCULATION METHOD
  // ---------------------------------------------------------------------------
  
  /**
   * Calculate complete payroll for a Kenya employee
   */
  calculatePayroll(
    grossPayInput: KenyaGrossPayInput,
    employeeConfig: KenyaEmployeeConfig,
    _employerConfig: KenyaEmployerConfig,
    payFrequency: PayFrequency = 'monthly',
    payDate?: Date,
  ): KenyaPayrollResult {
    const warnings: string[] = [];
    const grossPay = this.calculateGrossPay(grossPayInput);
    const bonus = (grossPayInput.bonus || 0);
    const r = calculateKePayslip({
      grossPay: grossPay - bonus,
      irregularCashThisPeriod: bonus,
      freq: payFrequency,
      payDate,
      monthlyInsurancePremium: employeeConfig.hasInsuranceRelief ? employeeConfig.monthlyInsurancePremium : 0,
      monthlyMortgageInterest: employeeConfig.hasMortgageInterestRelief ? employeeConfig.monthlyMortgageInterest : 0,
      nssfExempt: employeeConfig.nssfExempt,
      shifExempt: employeeConfig.nhifExempt,
      ahlExempt: employeeConfig.housingLevyExempt,
      nonResident: employeeConfig.residenceStatus === 'non_resident',
    });
    const helb = this.calculateHELB(grossPay, employeeConfig.helb);
    const otherDeductions = {
      sacco: employeeConfig.sacco || 0,
      unionDues: employeeConfig.unionDues || 0,
      other: employeeConfig.otherDeductions || 0,
      total: (employeeConfig.sacco || 0) + (employeeConfig.unionDues || 0) + (employeeConfig.otherDeductions || 0),
    };
    const totalEmployeeDeductions = r.totalDeductions + helb + otherDeductions.total;
    const netPay = grossPay - totalEmployeeDeductions;
    if (netPay < 0) warnings.push('Net pay is negative - verify deductions');
    if (employeeConfig.residenceStatus === 'non_resident') warnings.push('Non-resident tax rate applied - no personal relief');
    if (employeeConfig.disabilityStatus === 'disabled') {
      warnings.push('Disability exemption not applied — not found in the Income Tax Act consolidation of 1 July 2026; confirm with KRA.');
    }
    const employerTotal = r.nssfEmployer + r.ahlEmployer + r.nita;
    return {
      grossPay: this.round(grossPay),
      taxableIncome: r.taxableIncome,
      reliefs: {
        personalRelief: r.personalRelief,
        insuranceRelief: r.insuranceRelief,
        mortgageRelief: 0,          // a deduction now (s15(3)(b)), not a relief — see taxableIncome
        hospRelief: 0,
        disabilityRelief: 0,
        totalRelief: this.round(r.personalRelief + r.insuranceRelief),
      },
      employeeDeductions: {
        paye: r.paye,
        nhif: 0,                    // replaced by SHIF from 1 October 2024
        shif: r.shif,
        nssfTier1: r.nssfTier1,
        nssfTier2: r.nssfTier2,
        nssfTotal: r.nssfEmployee,
        housingLevy: r.ahlEmployee,
        helb: this.round(helb),
        total: this.round(totalEmployeeDeductions),
      },
      employerContributions: {
        nssfTier1: r.nssfTier1,
        nssfTier2: r.nssfTier2,
        nssfTotal: r.nssfEmployer,
        housingLevy: r.ahlEmployer,
        nita: r.nita,
        total: this.round(employerTotal),
      },
      otherDeductions: {
        sacco: this.round(otherDeductions.sacco),
        unionDues: this.round(otherDeductions.unionDues),
        other: this.round(otherDeductions.other),
        total: this.round(otherDeductions.total),
      },
      totalDeductions: this.round(totalEmployeeDeductions),
      netPay: this.round(netPay),
      totalEmployerCost: this.round(grossPay + employerTotal),
      reportingData: {
        grossPay: this.round(grossPay),
        taxableIncome: r.taxableIncome,
        taxBeforeRelief: r.taxBeforeRelief,
        totalRelief: this.round(r.personalRelief + r.insuranceRelief),
        taxPayable: r.paye,
        effectiveTaxRate: grossPay > 0 ? this.round((r.paye / grossPay) * 100) / 100 : 0,
      },
      ytdUpdates: {
        grossIncome: this.round((employeeConfig.ytdGrossIncome || 0) + grossPay),
        taxPaid: this.round((employeeConfig.ytdTaxPaid || 0) + r.paye),
        nhif: this.round(employeeConfig.ytdNHIF || 0),
        nssf: this.round((employeeConfig.ytdNSSF || 0) + r.nssfEmployee),
        housingLevy: this.round((employeeConfig.ytdHousingLevy || 0) + r.ahlEmployee),
      },
      warnings,
    };
  }

  // ---------------------------------------------------------------------------
  // GROSS PAY CALCULATION
  // ---------------------------------------------------------------------------
  
  private calculateGrossPay(input: KenyaGrossPayInput): number {
    return (input.basicSalary || 0) +
           (input.houseAllowance || 0) +
           (input.transportAllowance || 0) +
           (input.otherAllowances || 0) +
           (input.overtime || 0) +
           (input.bonus || 0) +
           (input.commission || 0) +
           (input.carBenefit || 0) +
           (input.houseBenefit || 0) +
           (input.otherBenefits || 0);
  }
  
  // ---------------------------------------------------------------------------
  // HELB CALCULATION
  // ---------------------------------------------------------------------------
  
  private calculateHELB(grossPay: number, helb?: HELBDeduction): number {
    if (!helb?.hasLoan) {
      return 0;
    }
    
    // Fixed monthly deduction
    if (helb.monthlyDeduction) {
      return helb.monthlyDeduction;
    }
    
    // Percentage deduction
    if (helb.percentageDeduction) {
      return grossPay * (helb.percentageDeduction / 100);
    }
    
    // Default calculation based on income
    if (grossPay >= HELB_RATES.minimumGross) {
      return grossPay * HELB_RATES.percentageRate;
    }
    
    return HELB_RATES.defaultMonthly;
  }
  
  // ---------------------------------------------------------------------------
  // UTILITY METHODS
  // ---------------------------------------------------------------------------
  
  /**
   * Round to 2 decimal places
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
  
  // ---------------------------------------------------------------------------
  // STATIC HELPER METHODS
  // ---------------------------------------------------------------------------
  
  /**
   * Format currency in KES
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  }
  
  /**
   * Calculate annual tax from monthly figures
   */
  static annualize(monthlyAmount: number): number {
    return monthlyAmount * 12;
  }
  
  /**
   * Validate KRA PIN format
   */
  static validateKRAPin(pin: string): boolean {
    // KRA PIN format: A123456789B (letter, 9 digits, letter)
    const pattern = /^[A-Z]\d{9}[A-Z]$/;
    return pattern.test(pin);
  }
  
}

// =============================================================================
// P9 TAX DEDUCTION CARD GENERATOR
// =============================================================================

export interface P9Data {
  year: number;
  employer: {
    name: string;
    kraPin: string;
  };
  employee: {
    name: string;
    kraPin: string;
  };
  monthly: Array<{
    month: string;
    grossPay: number;
    benefits: number;
    totalGross: number;
    pensionContribution: number;  // NSSF
    ownerOccupierInterest: number;
    taxableIncome: number;
    taxCharged: number;
    personalRelief: number;
    insuranceRelief: number;
    paye: number;
  }>;
  totals: {
    grossPay: number;
    benefits: number;
    totalGross: number;
    pensionContribution: number;
    taxableIncome: number;
    taxCharged: number;
    totalRelief: number;
    paye: number;
  };
}

/**
 * Generate P9 Tax Deduction Card data
 */
export function generateP9Data(
  year: number,
  employer: { name: string; kraPin: string },
  employee: { name: string; kraPin: string },
  monthlyData: Array<{
    grossPay: number;
    benefits?: number;
    nssfContribution: number;
    mortgageInterest?: number;
    paye: number;
    personalRelief: number;
    insuranceRelief?: number;
  }>
): P9Data {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const monthly = monthlyData.map((data, index) => {
    const benefits = data.benefits || 0;
    const totalGross = data.grossPay + benefits;
    const mortgageInterest = data.mortgageInterest || 0;
    const taxableIncome = totalGross - data.nssfContribution - mortgageInterest;
    const totalRelief = data.personalRelief + (data.insuranceRelief || 0);
    const taxCharged = data.paye + totalRelief;
    
    return {
      month: months[index] || `Month ${index + 1}`,
      grossPay: data.grossPay,
      benefits,
      totalGross,
      pensionContribution: data.nssfContribution,
      ownerOccupierInterest: mortgageInterest,
      taxableIncome,
      taxCharged,
      personalRelief: data.personalRelief,
      insuranceRelief: data.insuranceRelief || 0,
      paye: data.paye,
    };
  });
  
  const totals = monthly.reduce(
    (acc, m) => ({
      grossPay: acc.grossPay + m.grossPay,
      benefits: acc.benefits + m.benefits,
      totalGross: acc.totalGross + m.totalGross,
      pensionContribution: acc.pensionContribution + m.pensionContribution,
      taxableIncome: acc.taxableIncome + m.taxableIncome,
      taxCharged: acc.taxCharged + m.taxCharged,
      totalRelief: acc.totalRelief + m.personalRelief + m.insuranceRelief,
      paye: acc.paye + m.paye,
    }),
    {
      grossPay: 0,
      benefits: 0,
      totalGross: 0,
      pensionContribution: 0,
      taxableIncome: 0,
      taxCharged: 0,
      totalRelief: 0,
      paye: 0,
    }
  );
  
  return { year, employer, employee, monthly, totals };
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createKenyaTaxEngine(taxYear: number = 2024): KenyaTaxEngine {
  return new KenyaTaxEngine(taxYear);
}

export default KenyaTaxEngine;