// src/lib/services/tax/irp5/accumulate.ts
// Year-of-assessment boundary handling and accumulation (build spec §10).
// A payment lands in a YOA strictly by its payment date, independent of any company
// financial year. The YOA runs 1 March – end February and is named by the calendar
// year of its February end (e.g. Dec-2025 → YOA 2026; Apr-2026 → YOA 2027).

import type { PayComponent, EmployeeContext, Accumulation } from './types';

/**
 * The year of assessment a payment date falls in.
 * Jan/Feb belong to the YOA named by the same calendar year; Mar–Dec belong to the
 * next calendar year's YOA.
 * @param paymentDate ISO date (YYYY-MM-DD) or any Date-parsable string.
 */
export function taxYearOf(paymentDate: string): number {
  const d = new Date(paymentDate);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid payment date: ${paymentDate}`);
  }
  const month = d.getUTCMonth(); // 0 = Jan
  const year = d.getUTCFullYear();
  // Jan (0) and Feb (1) → YOA = year; Mar (2) … Dec (11) → YOA = year + 1.
  return month <= 1 ? year : year + 1;
}

/** True if a payment date falls within the given year of assessment. */
export function isInYearOfAssessment(paymentDate: string, yearOfAssessment: number): boolean {
  return taxYearOf(paymentDate) === yearOfAssessment;
}

/**
 * Build the per-employee accumulation for one year of assessment: keep only the
 * components whose payment date falls in the YOA (grouped strictly by payment date).
 */
export function accumulate(
  yearOfAssessment: number,
  employee: EmployeeContext,
  components: PayComponent[],
): Accumulation {
  const inYear = components.filter((c) => isInYearOfAssessment(c.paymentDate, yearOfAssessment));
  return { yearOfAssessment, employee, components: inYear };
}
