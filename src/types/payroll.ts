

import { type PayrollStoreRegion } from '@/lib/regions';
import { ObjectId } from 'mongodb';

// =============================================================================
// ENUMS
// =============================================================================

/** Stored payroll codes, plus legacy 'EU'. */
export type Region = PayrollStoreRegion | 'EU';
export type Currency = 'GBP' | 'ZAR' | 'USD' | 'KES' | 'BWP' | 'UGX' | 'ZMW' | 'EUR';
export type PayFrequency = 'weekly' | 'bi_weekly' | 'monthly';
export type SalaryType = 'hourly' | 'salary' | 'commission';
export type EmploymentType = 'full_time' | 'part_time' | 'contractor' | 'temporary';
export type EmployeeStatus = 'active' | 'on_leave' | 'terminated' | 'suspended';
export type PayrollRunStatus = 'draft' | 'calculating' | 'review' | 'approved' | 'processing' | 'paid' | 'cancelled';
export type PayslipStatus = 'pending' | 'generated' | 'sent' | 'viewed';
export type TaxSubmissionType = 'EMP201' | 'P32' | 'P35' | 'Form941' | 'IRP5' | 'P60';
export type TaxSubmissionStatus = 'draft' | 'generated' | 'submitted' | 'accepted' | 'rejected';
// Plan 5 covers English/Welsh undergraduates who started on or after 1 August
// 2023 and became repayable from April 2026. UKTaxEngine has always priced it;
// this union, the Mongoose enum and the two API validators did not carry it, so
// a Plan 5 borrower could not be SAVED — Mongoose would reject the value — and
// the engine's support was unreachable in practice.
export type StudentLoanPlan = 'plan1' | 'plan2' | 'plan4' | 'plan5' | 'postgrad' | 'none';

// =============================================================================
// EMPLOYEE TYPES
// =============================================================================

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

export interface Employment {
  department?: string;
  jobTitle: string;
  employmentType: EmploymentType;
  startDate: string;
  endDate?: string;
  status: EmployeeStatus;
}

export interface Compensation {
  payFrequency: PayFrequency;
  salaryType: SalaryType;
  baseSalary: number;
  currency: Currency;
}

export interface UKTaxInfo {
  niNumber: string;
  taxCode: string;
  studentLoanPlan?: StudentLoanPlan;
  postgraduateLoan?: boolean;
}

export interface ZATaxInfo {
  idNumber: string;
  taxNumber: string;
  uifContributor: boolean;
  medicalAidMembers?: number;
}

export interface USTaxInfo {
  ssn?: string;
  filingStatus?: 'single' | 'married' | 'head_of_household';
  workState?: string;
  residentState?: string;
  allowances?: number;
  multipleJobsOrSpouseWorks?: boolean;
  dependentCredit?: number;
  otherIncome?: number;
  deductions?: number;
  extraWithholding?: number;
  sutaRate?: number;
  /** @deprecated use filingStatus */
  federalFilingStatus?: 'single' | 'married' | 'head_of_household';
  federalAllowances?: number;
  stateAllowances?: number;
}

export interface KETaxInfo {
  kraPin?: string;
  residenceStatus?: 'resident' | 'non-resident';
  disabilityStatus?: boolean;
  hasInsuranceRelief?: boolean;
  monthlyInsurancePremium?: number;
  hasMortgageInterestRelief?: boolean;
  monthlyMortgageInterest?: number;
  hasHomeOwnershipSavings?: boolean;
  monthlyHOSPContribution?: number;
  nhifExempt?: boolean;
  nhifNumber?: string;
  nssfExempt?: boolean;
  nssfNumber?: string;
  nssfTier?: 'both' | 'tier1' | 'tier2';
  housingLevyExempt?: boolean;
  helb?: number;
  employerKraPin?: string;
}

export interface TaxInfo {
  region: Region;
  taxNumber?: string;
  uk?: UKTaxInfo;
  za?: ZATaxInfo;
  us?: USTaxInfo;
  ke?: KETaxInfo;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  sortCode?: string;
  branchCode?: string;
  routingNumber?: string;
  iban?: string;
}

export interface PensionDeduction {
  enabled: boolean;
  employeePercent: number;
  employerPercent: number;
}

export interface OtherDeduction {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
  preTax: boolean;
}

export interface Deductions {
  pension: PensionDeduction;
  healthInsurance?: {
    enabled: boolean;
    amount: number;
    frequency: 'per_pay' | 'monthly' | 'annual';
  };
  other: OtherDeduction[];
}

export interface Allowance {
  name: string;
  amount: number;
  frequency: 'per_pay' | 'monthly' | 'annual';
  taxable: boolean;
}

export interface YTDTotals {
  grossPay: number;
  netPay: number;
  incomeTax: number;
  nationalInsurance?: number;
  uif?: number;
  socialSecurity?: number;
  socialSecurityWages?: number;
  medicareWages?: number;
  stateIncomeTax?: number;
  nhif?: number;
  nssf?: number;
  housingLevy?: number;
  pension: number;
  studentLoan?: number;
  year: number;
  lastUpdated: string;
}

export interface Employee {
  _id: string;
  organizationId: string;
  employeeId: string;
  personalInfo: PersonalInfo;
  employment: Employment;
  compensation: Compensation;
  taxInfo: TaxInfo;
  bankDetails?: BankDetails;
  deductions: Deductions;
  allowances: Allowance[];
  ytdTotals: YTDTotals;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// PAYSLIP TYPES
// =============================================================================

export interface PayslipEarnings {
  basicPay: number;
  overtime: number;
  bonus: number;
  allowances: number;
  commission: number;
  grossPay: number;
  itemized: Array<{
    description: string;
    amount: number;
    taxable: boolean;
  }>;
}

export interface PayslipDeductions {
  incomeTax: number;
  nationalInsurance: number;
  uif: number;
  studentLoan: number;
  pension: number;
  other: number;
  totalDeductions: number;
  itemized: Array<{
    description: string;
    amount: number;
    preTax: boolean;
  }>;
}

export interface EmployerCosts {
  employerNI: number;
  employerUIF: number;
  employerPension: number;
  sdl: number;
  apprenticeshipLevy: number;
  totalEmployerCost: number;
}

export interface PayslipYTD {
  grossPay: number;
  incomeTax: number;
  nationalInsurance: number;
  uif: number;
  pension: number;
  studentLoan: number;
  netPay: number;
}

export interface Payslip {
  employeeId: string;
  employeeRef: string;
  employeeName: string;
  employee: Employee;
  earnings: PayslipEarnings;
  deductions: PayslipDeductions;
  netPay: number;
  employerCosts: EmployerCosts;
  ytd: PayslipYTD;
  status: PayslipStatus;
  pdfUrl?: string;
  sentAt?: string;
  viewedAt?: string;
}

// =============================================================================
// PAYROLL RUN TYPES
// =============================================================================

export interface PayrollPeriod {
  startDate: string;
  endDate: string;
  taxYear: string;
  taxMonth?: number;
  taxWeek?: number;
}

export interface PayrollSummary {
  employeeCount: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalIncomeTax: number;
  totalNationalInsurance: number;
  totalUIF: number;
  totalEmployerNI: number;
  totalEmployerUIF: number;
  totalPension: number;
  totalEmployerPension: number;
  totalStudentLoans: number;
  totalSDL: number;
  totalEmployerCost: number;
  currency: Currency;
}

export interface PayrollRun {
  _id: string;
  organizationId: string;
  runId: string;
  name: string;
  region: Region;
  period: PayrollPeriod;
  payDate: string;
  status: PayrollRunStatus;
  summary: PayrollSummary;
  payslips: Payslip[];
  taxSubmissions: Array<{
    type: TaxSubmissionType;
    generatedAt: string;
    fileUrl?: string;
  }>;
  approvedBy?: string;
  approvedAt?: string;
  paidBy?: string;
  paidAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// TAX SUBMISSION TYPES
// =============================================================================

export interface EMP201Data {
  totalPaye: number;
  totalSdl: number;
  totalUif: number;
  employeeUif: number;
  employerUif: number;
  totalLiability: number;
  penalties: number;
  interest: number;
  totalPayable: number;
  employeeCount: number;
}

export interface P32Data {
  totalPaye: number;
  totalNic: number;
  employeeNic: number;
  employerNic: number;
  studentLoans: number;
  apprenticeshipLevy: number;
  totalDue: number;
  employeeCount: number;
}

export interface Form941Data {
  totalWages: number;
  federalIncomeTax: number;
  socialSecurityWages: number;
  socialSecurityTax: number;
  medicareWages: number;
  medicareTax: number;
  totalTaxLiability: number;
  employeeCount: number;
}

export interface TaxSubmission {
  _id: string;
  organizationId: string;
  type: TaxSubmissionType;
  period: {
    month?: number;
    quarter?: number;
    year: number;
  };
  status: TaxSubmissionStatus;
  data: {
    emp201?: EMP201Data;
    p32?: P32Data;
    form941?: Form941Data;
  };
  files: {
    pdf?: string;
    csv?: string;
    xml?: string;
  };
  referenceNumber?: string;
  paymentReference?: string;
  generatedBy: string;
  submittedBy?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// TAX CALCULATION TYPES
// =============================================================================

export interface TaxCalculationInput {
  employee: Employee;
  period: PayrollPeriod;
  overtime?: {
    hours: number;
    rate: number;
  };
  bonus?: number;
  commission?: number;
  additionalAllowances?: Array<{
    name: string;
    amount: number;
    taxable: boolean;
  }>;
  additionalDeductions?: Array<{
    name: string;
    amount: number;
    preTax: boolean;
  }>;
}

export interface TaxCalculationResult {
  grossPay: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  uif: number;
  studentLoan: number;
  pensionEmployee: number;
  pensionEmployer: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  employerNI: number;
  employerUIF: number;
  employerSDL: number;
  apprenticeshipLevy: number;
  totalEmployerCost: number;
  breakdown: {
    tax: any;
    ni?: any;
    uif?: any;
    pension: any;
  };
}

// =============================================================================
// API TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BulkImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface NewPayrollRunForm {
  name?: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  selectedEmployees: string[];
}

export interface EmployeeFormData {
  employeeId: string;
  personalInfo: PersonalInfo;
  employment: Employment;
  compensation: Compensation;
  taxInfo: TaxInfo;
  bankDetails?: BankDetails;
  deductions: Deductions;
  allowances: Allowance[];
}