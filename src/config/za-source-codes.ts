// src/config/za-source-codes.ts
// Curated SARS IRP5/IT3(a) source codes for USER-SELECTABLE custom pay line items
// (additional income & deductions). Every custom line an employer adds MUST carry one
// of these codes so the generated IRP5 is accurate and SARS-acceptable.
//
// This is the UI-facing catalogue; it feeds both the source-code picker and the
// payslip→IRP5 PayComponent mapping. Statutory/computed codes (PAYE 4102, UIF 4141,
// SDL 4142, gross totals 3696/3699) are produced by the engine/derivation, NOT picked
// here. Reconcile against the SARS PAYE BRS / PAYE-AE-06-G06 guide before shipping.

export type SourceCodeSide = 'income' | 'deduction';

export interface ZaSourceCodeOption {
  code: string;
  label: string;
  side: SourceCodeSide;
  /** Income: does it enter TAXABLE gross (3699) vs non-taxable (3696)? Deduction: n/a. */
  taxable: boolean;
  /** Income: does it enter the PAYE calculation? Deduction: n/a. */
  payeBearing: boolean;
  /** Deduction: does it reduce taxable income BEFORE PAYE (pre-tax)? Income: n/a. */
  preTax: boolean;
  /**
   * Income: is this an IRREGULAR (once-off / annual) payment — e.g. a bonus — rather than
   * recurring monthly pay? Irregular income is taxed in full but NOT annualised (scaled
   * ×periods) by the Fourth-Schedule averaging in the payroll engine. Absent ⇒ recurring.
   * Deduction: n/a.
   */
  irregular?: boolean;
}

// ── Income codes (earnings / allowances / fringe benefits) ───────────────────
export const ZA_INCOME_CODES: ZaSourceCodeOption[] = [
  { code: '3601', label: 'Income — salary/wages (taxable)',        side: 'income', taxable: true,  payeBearing: true,  preTax: false },
  { code: '3605', label: 'Annual payment / bonus (taxable)',       side: 'income', taxable: true,  payeBearing: true,  preTax: false, irregular: true },
  { code: '3606', label: 'Commission (taxable)',                   side: 'income', taxable: true,  payeBearing: true,  preTax: false },
  { code: '3607', label: 'Overtime (taxable)',                     side: 'income', taxable: true,  payeBearing: true,  preTax: false },
  { code: '3615', label: "Director's remuneration (taxable)",      side: 'income', taxable: true,  payeBearing: true,  preTax: false },
  { code: '3701', label: 'Travel allowance (taxable)',             side: 'income', taxable: true,  payeBearing: true,  preTax: false },
  { code: '3703', label: 'Reimbursive travel (non-taxable)',       side: 'income', taxable: false, payeBearing: false, preTax: false },
  { code: '3713', label: 'Other allowance (taxable)',              side: 'income', taxable: true,  payeBearing: true,  preTax: false },
  { code: '3714', label: 'Other allowance (non-taxable)',          side: 'income', taxable: false, payeBearing: false, preTax: false },
  { code: '3801', label: 'Fringe benefit — general (taxable)',     side: 'income', taxable: true,  payeBearing: true,  preTax: false },
  { code: '3810', label: 'Fringe benefit — medical aid (taxable)', side: 'income', taxable: true,  payeBearing: true,  preTax: false },
];

// ── Deduction codes ──────────────────────────────────────────────────────────
export const ZA_DEDUCTION_CODES: ZaSourceCodeOption[] = [
  { code: '4001', label: 'Pension fund contribution (employee)',        side: 'deduction', taxable: false, payeBearing: false, preTax: true  },
  { code: '4003', label: 'Provident fund contribution (employee)',      side: 'deduction', taxable: false, payeBearing: false, preTax: true  },
  { code: '4006', label: 'Retirement annuity fund contribution',        side: 'deduction', taxable: false, payeBearing: false, preTax: true  },
  { code: '4005', label: 'Medical scheme contribution (employee)',      side: 'deduction', taxable: false, payeBearing: false, preTax: false },
  { code: '4024', label: 'Medical services costs (out of pocket)',      side: 'deduction', taxable: false, payeBearing: false, preTax: false },
  { code: '4030', label: 'Donations (S18A) via employer',               side: 'deduction', taxable: false, payeBearing: false, preTax: true  },
  { code: '4007', label: 'Other post-tax deduction',                    side: 'deduction', taxable: false, payeBearing: false, preTax: false },
];

export const ZA_SOURCE_CODES: ZaSourceCodeOption[] = [...ZA_INCOME_CODES, ...ZA_DEDUCTION_CODES];

const BY_CODE: Record<string, ZaSourceCodeOption> =
  Object.fromEntries(ZA_SOURCE_CODES.map((c) => [c.code, c]));

/** Look up a curated source code (undefined if not in the picker catalogue). */
export function getZaSourceCode(code: string): ZaSourceCodeOption | undefined {
  return BY_CODE[code];
}

/** True if `code` is a known custom line-item code for the given side. */
export function isValidSourceCode(code: string, side: SourceCodeSide): boolean {
  const def = BY_CODE[code];
  return !!def && def.side === side;
}

/**
 * True if `code` is a known IRREGULAR (once-off / annual) income code — currently only
 * 3605 (annual payment / bonus). Used by the ZA payroll engine's Fourth-Schedule
 * averaging to exclude such income from the recurring-pay annualisation. Unknown codes
 * default to recurring (false), so a caller may still force it via `ZaLineItem.irregular`.
 */
export function isIrregularIncomeCode(code: string | undefined | null): boolean {
  if (!code) return false;
  return BY_CODE[code]?.irregular === true;
}
