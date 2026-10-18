// src/lib/billing/practitionerBillingMath.ts
// Dependency-free billing math for the Practitioner plan, kept separate from the
// Stripe/Mongo side-effecting code (practitionerBilling.ts) so it can be unit
// tested in isolation and imported anywhere without loading the Stripe SDK.

/**
 * Practitioner is billed per client slot, with a floor. The founder decision at
 * launch: a firm pays for a minimum of 2 slots even if it currently uses 0 or 1
 * — this anchors the per-client price to a viable subscription and matches how
 * the plan is sold ("priced per client, min 2").
 */
export const PRACTITIONER_MIN_CLIENTS = 2;

/**
 * The quantity to bill on the Stripe subscription item.
 *
 * ── READ THIS BEFORE CHANGING THE CALLER ────────────────────────────────────
 * The argument is PURCHASED SLOTS — capacity the practitioner has paid for —
 * NOT a count of client rows. The distinction is the whole billing model:
 * slots are prepaid capacity, and "paying for 10 and adding only 2" is a
 * choice the practitioner is entitled to make.
 *
 * This used to be `computeBillableClients(activeClientCount)`, derived from
 * `PractitionerClient.countDocuments({ status: 'active' })`. Under prepaid
 * slots that was actively destructive: a practitioner who bought 10 slots and
 * named 2 clients would be recomputed to `max(2, 2) = 2` by the nightly cron,
 * silently downgraded, and issued a proration credit for capacity they had
 * deliberately bought. It would have hit every practitioner who bought ahead,
 * on the first night.
 *
 * The rename is the guard. This function is pure `max(2, floor(max(0, n)))`, so
 * every assertion in its test file passes identically whichever meaning `n`
 * carries — the unit test cannot catch the inversion, and never could. Only the
 * parameter name and the caller test stand between the two readings.
 */
export function computeBillableSlots(purchasedSlots: number): number {
  const n = Number.isFinite(purchasedSlots)
    ? Math.max(0, Math.floor(purchasedSlots))
    : 0;
  return Math.max(PRACTITIONER_MIN_CLIENTS, n);
}

/**
 * @deprecated Renamed to `computeBillableSlots`, because the argument now means
 * purchased capacity rather than a live client count. Kept as an alias only so
 * an unnoticed import cannot silently break; delete once nothing references it.
 */
export const computeBillableClients = computeBillableSlots;

/**
 * How many slots a roster occupies.
 *
 * `suspended` HOLDS its slot — a suspended client keeps its books, its data and
 * its storage, and goes read-only rather than disappearing. Only `archived`
 * frees capacity. Without this rule a practitioner could park fifty suspended
 * clients on two slots and flip whichever one they needed to active.
 */
export function occupiesSlot(status: string): boolean {
  // Only these two hold capacity. `archived` (and its legacy alias `removed`)
  // release the slot — that is the whole point of archiving, and it is how a
  // practitioner reduces what they pay without deleting anyone's books.
  return status === 'active' || status === 'suspended';
}

/**
 * One graduated price break: every unit up to and including `upTo` costs `rate`.
 * `upTo: null` means "and everything above", and must be the last entry.
 *
 * Deliberately a plain number rather than a currency map. This module is
 * dependency-free — `plans.ts` imports IT, not the other way round — so the
 * caller resolves the currency and passes the resulting ladder in.
 */
export interface RateBreak {
  upTo: number | null;
  rate: number;
}

/**
 * Total monthly charge for `units` under a GRADUATED ladder.
 *
 * Graduated, not a cliff. At 10 clients on [1-5 @ 29.99, 6-20 @ 24.99] the first
 * five cost 29.99 each and the next five cost 24.99 each — 274.90, not
 * 10 x 24.99. The cliff reading is the tempting one and it is wrong in a way
 * that costs money in both directions: it makes the 21st client reduce the bill
 * for the first twenty, so a practitioner adding one client gets an invoice
 * SMALLER than last month's, and Stripe raises a credit note for the difference.
 *
 * Returns 0 for an empty ladder rather than throwing — a plan with no
 * `volumeTiers` is a flat plan, and its caller should not be asking this
 * function. `plans.ts` guards that; this stays total.
 *
 * Rounded to 2dp at the END, once. Rounding each tier and summing drifts by up
 * to a cent per tier, which is small until it is the difference between the
 * quote a customer clicked and the invoice Stripe issued.
 */
export function computeGraduatedTotal(units: number, breaks: readonly RateBreak[]): number {
  const n = Number.isFinite(units) ? Math.max(0, Math.floor(units)) : 0;
  if (n === 0 || breaks.length === 0) return 0;

  let total = 0;
  let charged = 0;

  for (const b of breaks) {
    if (charged >= n) break;
    // `upTo` is inclusive and counts from unit 1, so the width of this band is
    // its ceiling minus everything already charged. A null ceiling takes the
    // remainder, which is why an unbounded tier must come last.
    const ceiling = b.upTo === null ? n : Math.min(b.upTo, n);
    const inBand  = ceiling - charged;
    if (inBand <= 0) continue;
    total   += inBand * b.rate;
    charged += inBand;
  }

  // A ladder whose last tier is bounded below `n` leaves units uncharged. That
  // is a misconfiguration, not an input error, and silently under-billing is the
  // worst possible response to it — so charge the remainder at the last rate.
  if (charged < n && breaks.length > 0) {
    total += (n - charged) * breaks[breaks.length - 1].rate;
  }

  return Math.round((total + Number.EPSILON) * 100) / 100;
}

/**
 * What a practitioner actually pays this month: the graduated total over the
 * slots they have PURCHASED, never below the floor.
 *
 * Composed from the two functions above rather than reimplementing either,
 * because the floor and the ladder are separate rules that both have to hold:
 * a practitioner who bought one slot pays for two, at tier-one rate.
 */
export function computePractitionerMonthly(
  purchasedSlots: number,
  breaks: readonly RateBreak[],
): number {
  return computeGraduatedTotal(computeBillableSlots(purchasedSlots), breaks);
}

/** Statuses whose data is still reachable — archived clients stay readable. */
export function isVisibleTenancy(status: string): boolean {
  return status !== 'deleted';
}

/**
 * Is a client already paid for this period?
 *
 * PER-CLIENT BILLING (2026-10-16, Mvelase): a practitioner has as many clients
 * as they like and pays for the clients they have, minimum two. A client inside
 * what is already paid for this period (the minimum, or a seat freed by an
 * archive earlier in the period) costs nothing more. Beyond it, adding the
 * client is a purchase: the pro-rata amount for the rest of the period is
 * charged NOW (POST /api/practice/slots, proration_behavior: always_invoice),
 * shown to the practitioner first, and the new total is billed in full from
 * the next renewal. Never let in free until month-end.
 *
 * `purchasedSlots` is the Stripe quantity (floored at the minimum); `occupied`
 * counts active and suspended clients (see occupiesSlot).
 */
export function slotAvailable(occupied: number, purchasedSlots: number): boolean {
  return Math.max(0, Math.floor(occupied)) < computeBillableSlots(purchasedSlots);
}

/** How close to renewal the nightly job settles the quantity down to the client count. */
export const RENEWAL_SETTLE_WINDOW_SECONDS = 36 * 3600;

/**
 * The quantity a practitioner should renew on, or null to leave it alone.
 *
 * Per-client billing lowers the bill when clients are archived — but only AT
 * RENEWAL. Lowering the moment a client is archived would give no refund (it
 * runs with proration off) yet would make restoring that client the same month
 * a second pro-rata charge for a period already paid. So the paid quantity
 * stands until the period is about to end, then settles to what is on the
 * roster: max(minimum, occupied). This only ever LOWERS. Raising a quantity
 * charges money and happens solely through a purchase the practitioner saw.
 */
export function quantityAtRenewal(args: {
  quantity: number;
  occupied: number;
  periodEnd: number | null;   // unix seconds
  now: number;                // unix seconds
  windowSeconds?: number;
}): number | null {
  const { quantity, occupied, periodEnd, now } = args;
  const window = args.windowSeconds ?? RENEWAL_SETTLE_WINDOW_SECONDS;
  if (!periodEnd || !Number.isFinite(periodEnd)) return null;
  if (periodEnd - now > window || periodEnd <= now) return null;
  const target = computeBillableSlots(occupied);
  return target < computeBillableSlots(quantity) ? target : null;
}
