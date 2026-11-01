// src/lib/services/tax/irp5/types.ts
// Domain types for the IRP5/IT3(a) certificate derivation core (build spec §2–§6).
// These are plain, ORM-free types so the engine/derivation/validation stay pure and
// unit-testable; persistence (EmployerTaxProfile, PayrollRun) maps onto them.

/** Pay frequencies that determine the number of periods in a year of assessment. */
export type PayFrequency = 'monthly' | 'weekly' | 'fortnightly' | 'annual' | 'daily';

/** SARS nature-of-person codes (build spec §2.2; phase-1 subset — extend from BRS). */
export type NatureOfPerson = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'M' | 'N' | 'R';

/** SARS IRP5 source code, e.g. '3601', '4102'. */
export type SourceCode = string;

/**
 * One accumulated pay line for an employee within a year of assessment, keyed by the
 * IRP5 source code it maps to. The certificate is the sum of these grouped by code.
 */
export interface PayComponent {
  /** IRP5 source code this component contributes to (before folding). */
  sourceCode: SourceCode;
  /** Rand amount (period amount, not annualised). */
  amount: number;
  /** Whether the component is taxable (enters 3699 vs 3696). */
  taxable: boolean;
  /** Whether the component enters the PAYE calculation. */
  payeBearing: boolean;
  /**
   * True for regular recurring pay (annualised by ×periods); false for a one-off /
   * irregular payment (annual bonus, once-off tranche) added as a lump sum instead.
   * Build spec §4.2 — the source of the "spurious withholding" bug.
   */
  recurring: boolean;
  /** ISO date (YYYY-MM-DD) the payment was made — used to place it in a YOA (§10). */
  paymentDate: string;
}

/** Employer attributes the engine/derivation need (subset of EmployerTaxProfile). */
export interface EmployerContext {
  /** SARS PAYE reference (starts '7'); null until registered → certificate is draft. */
  payeRef: string | null;
  /** True if the employer is registered for SDL (annual payroll > threshold). */
  sdlRegistered: boolean;
  /** Total annual leviable payroll across all employees — decides SDL applicability. */
  annualPayroll: number;
  softwareToken?: string; // e.g. 'SORMALIT'
}

/** Employee attributes needed to compute tax and validate a certificate. */
export interface EmployeeContext {
  natureOfPerson: NatureOfPerson;
  /** 13-digit RSA ID number, if the person has one (nature 'A'). */
  idNumber?: string | null;
  passportNo?: string | null;
  /** ISO date (YYYY-MM-DD). */
  dateOfBirth?: string | null;
  /** 10-digit SARS income tax reference. */
  incomeTaxRef?: string | null;
  /** Hours worked per month for this employer — < table.uif.minHoursPerMonth ⇒ no UIF. */
  hoursPerMonth?: number;
  /** UIF contributor flag (defaults to true). False ⇒ excluded from UIF (e.g. certain directors). */
  uifContributor?: boolean;
  employedFrom: string; // ISO date
  employedTo: string;   // ISO date
  payFrequency: PayFrequency;
  /** Periods actually worked in the YOA (≤ periods in year). */
  periodsWorked: number;
}

/**
 * Per-employee accumulation for one (employer, employee, year of assessment):
 * the components that fall in the YOA plus the employee attributes.
 */
export interface Accumulation {
  yearOfAssessment: number;
  employee: EmployeeContext;
  components: PayComponent[];
}

/** Result of the pure tax engine for one certificate. */
export interface PayeResult {
  /** Annual taxable income used for the bracket calculation. */
  taxableAnnual: number;
  /** Annual PAYE after rebates (≥ 0). */
  annualPaye: number;
  /** PAYE for the certificate (period-summed / annual for a full year). */
  paye: number;
  uifEmployee: number;
  uifEmployer: number;
  /** SDL (0 / omitted-upstream when the employer is not SDL-registered). */
  sdl: number;
  /** Reason code for non-deduction (build spec §4.3), present iff paye rounds to 0. */
  reason4150?: string;
}

/** A derived IRP5 certificate: source-code line map + computed tax + draft state. */
export interface Certificate {
  yearOfAssessment: number;
  employee: EmployeeContext;
  /** Source code → Rand amount. 4149 is computed; 4150 present iff 4102 == 0. */
  lines: Record<SourceCode, number>;
  /** The 4150 reason code, if emitted. */
  reason4150?: string;
  /** True when the employer has no PAYE ref yet — not submittable, cert_no blank. */
  draft: boolean;
  tax: PayeResult;
}

export type Severity = 'error' | 'warning';

/** A single structured validation finding (build spec §6). */
export interface ValidationFinding {
  /** Stable machine code, e.g. 'BALANCE_4149', 'ID_CHECKSUM'. */
  code: string;
  severity: Severity;
  /** Field / source code the finding relates to. */
  field: string;
  message: string;
}

/** Outcome of validating a certificate — fail-closed: not exportable if any error. */
export interface ValidationReport {
  /** True only when there are zero `error`-severity findings. */
  valid: boolean;
  findings: ValidationFinding[];
}
