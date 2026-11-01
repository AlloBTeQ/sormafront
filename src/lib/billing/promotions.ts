// src/lib/billing/promotions.ts
// ─────────────────────────────────────────────────────────────────────────────
// Marketing promotions for NEW sign-ups (owner, 2026-10-31).
//
// A promotion is a dated marketing special, not a permanent feature of a plan.
// Whether one runs, what it gives, who qualifies and when it ends are at
// SORMALITICS' discretion (Terms §5.3A). Ending or changing one affects only
// sign-ups from then on — never a free month someone has already been given.
//
// Today there is one: FIRST MONTH FREE on monthly plans, for new subscribers
// who sign up on or before 31 December 2026 (South African time). To end it
// early, extend it, or turn it off without a deploy-time code change, set
// NEXT_PUBLIC_PROMO_FIRST_MONTH_FREE_ENDS to an ISO date-time, or to "off".
// (NEXT_PUBLIC_ so the pricing page and the checkout route read the SAME
// answer — an offer shown that checkout then refuses is a misleading claim.)
// ─────────────────────────────────────────────────────────────────────────────

import type { BillingCycle } from '@/lib/plans';

export interface TrialPromotion {
  key: string;
  /** Shown to customers. */
  label: string;
  cycles: BillingCycle[];
  /** Last moment a sign-up qualifies. */
  endsAt: Date;
}

const FIRST_MONTH_FREE_DEFAULT_END = '2026-12-31T23:59:59+02:00';

function firstMonthFreeEnd(): Date | null {
  const raw = (process.env.NEXT_PUBLIC_PROMO_FIRST_MONTH_FREE_ENDS ?? '').trim();
  if (raw.toLowerCase() === 'off') return null;
  const d = new Date(raw || FIRST_MONTH_FREE_DEFAULT_END);
  return Number.isFinite(d.getTime()) ? d : new Date(FIRST_MONTH_FREE_DEFAULT_END);
}

/** The free-month promotion running at `now`, or null when none is. */
export function activeTrialPromotion(now: Date = new Date()): TrialPromotion | null {
  const endsAt = firstMonthFreeEnd();
  if (!endsAt || now.getTime() > endsAt.getTime()) return null;
  return {
    key: 'first-month-free-2026',
    label: 'First month free',
    cycles: ['monthly'],
    endsAt,
  };
}

/** "31 December 2026" — the end date as customers read it (SA time). */
export function promotionEndLabel(p: TrialPromotion): string {
  return p.endsAt.toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg',
  });
}
