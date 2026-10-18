// src/config/plans.ts
// ─────────────────────────────────────────────────────────────────────────────
// ADAPTER ONLY — do not put plan data in this file.
//
// This used to be one of five competing definitions of what a plan allows, and
// the one the pricing page read. It disagreed with the enforcement tables on the
// invoice ceiling and on whether Professional includes payroll, which is exactly
// the kind of gap that turns into a support ticket the day someone pays.
//
// It now projects `src/lib/plans.ts` into the shape the pricing UI already
// expects, so the page keeps working unchanged while the numbers can only come
// from one place. Add plans, prices, features and limits in lib/plans.ts.
// ─────────────────────────────────────────────────────────────────────────────

import {
  PRICING_PLANS,
  SUPPORTED_CURRENCIES,
  CURRENCY_META,
  monthlyPrice,
  annualPrice,
  totalPriceFor,
  type SupportedCurrency,
  type PlanLimits as CanonicalPlanLimits,
  type ModuleKey,
  type PerSeatPricing,
} from '@/lib/plans';

export type { SupportedCurrency };

export type Limit = number | 'unlimited';

/** Pricing-card view of a plan's limits. `-1` becomes `'unlimited'` for display. */
export interface PlanLimits {
  invoices:      Limit;
  payslips:      Limit;
  employees:     Limit;
  jurisdictions: Limit;
  teamMembers:   Limit;
  issuers:       Limit;
}

export interface PricingTier {
  id:         string;
  name:       string;
  tagline:    string;
  badge:      string;
  priceLabel: string;
  price: {
    monthly: Record<SupportedCurrency, number>;
    annual:  Record<SupportedCurrency, number>;
  };
  features:     string[];
  highlighted?: boolean;
  cta:          string;
  accent:       string;
  limits:       PlanLimits;
  access:       string[];
  /** Present when the price is per unit — Practitioner is per client. */
  perSeat?:     PerSeatPricing;
  /**
   * What the minimum purchase actually costs, per currency and per cycle.
   *
   * Precomputed here rather than left to the page, because the page used to do
   * `price * perSeat.minQuantity` — a flat multiplication that silently
   * OVERCHARGES the moment volume tiers exist and the floor crosses a break.
   * It happened to be right at a 2-client floor on a 5-client first tier, which
   * is the worst kind of wrong: correct today, wrong the day someone edits a
   * number in a different file.
   */
  seatFloor?: {
    monthly: Record<SupportedCurrency, number>;
    annual:  Record<SupportedCurrency, number>;
  };
}

export const CURRENCIES: Record<SupportedCurrency, { symbol: string; name: string }> = CURRENCY_META;

const display = (n: number): Limit => (n === -1 ? 'unlimited' : n);

/**
 * The graduated cost of the minimum purchase, per currency.
 *
 * `totalPriceFor` owns the tier arithmetic — this only spreads it across the
 * currency list so the page never multiplies a unit rate by a quantity again.
 */
function seatFloorMap(
  planKey: Parameters<typeof totalPriceFor>[0],
  cycle: 'monthly' | 'annual',
): Record<SupportedCurrency, number> {
  return Object.fromEntries(
    SUPPORTED_CURRENCIES.map(c => [c, totalPriceFor(planKey, c, cycle, 1) ?? 0]),
  ) as Record<SupportedCurrency, number>;
}

function priceMap(
  planKey: Parameters<typeof monthlyPrice>[0],
  fn: typeof monthlyPrice,
): Record<SupportedCurrency, number> {
  return Object.fromEntries(
    SUPPORTED_CURRENCIES.map(c => [c, fn(planKey, c) ?? 0]),
  ) as Record<SupportedCurrency, number>;
}

function toTier(plan: (typeof PRICING_PLANS)[number]): PricingTier {
  const l: CanonicalPlanLimits = plan.limits;
  const isFree = plan.key === 'free';

  return {
    id:      plan.key,
    name:    plan.name,
    tagline: plan.tagline,
    badge:   plan.badge,
    // Per-unit plans (Practitioner) price per client, so their label differs.
    priceLabel: isFree
      ? ''
      : plan.perSeat
        ? `/${plan.perSeat.unit}/month`
        : '/month',
    price: {
      monthly: priceMap(plan.key, monthlyPrice),
      annual:  priceMap(plan.key, annualPrice),
    },
    features:    plan.features,
    highlighted: plan.highlighted,
    cta:         plan.cta,
    accent:      plan.accent,
    limits: {
      invoices:      display(l.invoices),
      payslips:      display(l.payslips),
      employees:     display(l.employees),
      // Multi-jurisdiction tracks payroll access rather than being its own
      // limit — a plan with the payroll module can file in any region it supports.
      jurisdictions: plan.access.includes('payroll' as ModuleKey) ? 'unlimited' : 1,
      teamMembers:   display(l.teamMembers),
      issuers:       display(l.issuers),
    },
    access:  plan.access,
    perSeat: plan.perSeat,
    seatFloor: plan.perSeat && {
      monthly: seatFloorMap(plan.key, 'monthly'),
      annual:  seatFloorMap(plan.key, 'annual'),
    },
  };
}

/** Plans shown on /pricing, in ladder order. Derived — never edit here. */
export const TIERS: PricingTier[] = PRICING_PLANS.map(toTier);

export const getPlan    = (id: string) => TIERS.find(t => t.id === id);
export const planLimits = (id: string) => getPlan(id)?.limits;
export const planAccess = (id: string) => getPlan(id)?.access ?? [];
