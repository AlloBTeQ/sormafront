// src/config/addons.ts
// ─────────────────────────────────────────────────────────────────────────────
// ADD-ON PLANS — bought on their own, with or without a main plan
// (decided by Mvelase, 2026-11-09).
//
//   AFS Workspace   For accountants and bookkeepers who only need to prepare
//                   annual financial statements: upload a trial balance, adjust,
//                   generate the AFS. No ledger, payroll or invoicing needed.
//                     • one workspace  — one entity, one financial year, once-off;
//                     • unlimited      — every IFRS for SMEs workspace for a year;
//                     • full IFRS      — priced above SMEs (owner, 2026-11-09):
//                       a full-IFRS workspace always takes a full-IFRS credit.
//                   A main plan that already includes Reporting needs neither.
//
//   IFRS 16 Leases  The Leases module, charged from the day it is taken
//                   (2026-11-05). Not on sale until its price is set.
//
// Prices are in code, like the store: Checkout is built with inline price_data,
// so no Stripe dashboard Price has to be kept in step. ZAR only for now; the
// seller is not VAT-registered, so no VAT is charged or shown (2026-11-03).
//
// Market reference (read 2026-11-09): Draftworx Cloud R330 per IFRS for SMEs
// set and R3 325 per full-IFRS set, once-off per entity per year, excl. VAT;
// Draftworx Desktop R8 800 per user, unlimited clients; KaiLux R500 per seat
// per month. See the project doc "Add-On Plans" for the pricing case.
// ─────────────────────────────────────────────────────────────────────────────

export type AddonKey = 'afs_workspace' | 'afs_workspace_ifrs' | 'afs_unlimited' | 'leases';

/**
 * The currencies add-ons are sold in (owner, 2026-11-10): each customer is
 * charged in its billing currency, as for the plans (billingCurrencyFor) — no
 * EUR; an EU client is billed in GBP. Major units. The Stripe Prices carry the
 * same figures as currency options, and are checked against these before any
 * checkout (lib/billing/addonPriceIds.ts).
 */
export const ADDON_CURRENCIES = ['ZAR', 'GBP', 'USD', 'KES', 'ZMW'] as const;
export type AddonCurrency = (typeof ADDON_CURRENCIES)[number];
export type PerCurrency = Record<AddonCurrency, number>;

export function isAddonCurrency(c: string | null | undefined): c is AddonCurrency {
  return (ADDON_CURRENCIES as readonly string[]).includes(String(c ?? '').toUpperCase());
}

export interface LeaseTier {
  units: number;
  amountZar: number;
  label: string;
  /**
   * Monthly price in each billing currency, major units. A practice is billed
   * in its own subscription's currency and Stripe will not mix currencies on
   * one subscription, so a client add-on for a Kenyan practice is a KES line.
   */
  monthly: Record<'ZAR' | 'GBP' | 'USD' | 'KES' | 'ZMW', number>;
}

/**
 * Which currencies' lease prices are decided. Owner, 2026-11-10: "set prices
 * per currency". ZAR is decided; the rest are PROPOSED (derived from rand at the
 * Practitioner plan's own currency ratios, rounded) and are not on sale until
 * the owner confirms them. Annual billing is ten months, as on the plans.
 */
// No EUR (owner, 2026-11-10): clients are not expected in the euro zone; an EU
// client is billed in GBP. A EUR-billed subscription sees client add-ons as not on sale.
// 2026-11-10: the owner set these as currency options on the Stripe price, so
// they are decided in every currency.
export const LEASE_PRICE_DECIDED: Record<'ZAR' | 'GBP' | 'USD' | 'KES' | 'ZMW', boolean> = {
  ZAR: true, GBP: true, USD: true, KES: true, ZMW: true,
};

export interface AddonDefinition {
  key: AddonKey;
  name: string;
  summary: string;
  /** 'credits' = once-off, quantity bought = workspaces; 'subscription' = recurring. */
  billing: { kind: 'credits'; unitZar: number; maxQuantity: number; amounts: PerCurrency }
         | { kind: 'subscription'; interval: 'month' | 'year'; amountZar: number | null; amounts: PerCurrency }
         /** Monthly tiers by lease units; above the top tier is quoted. */
         | { kind: 'tiered'; interval: 'month'; tiers: LeaseTier[]; quoteAbove: number; longLeaseYears: number };
  features: string[];
  /** A price awaiting the owner's sign-off is shown with that label and can still be reviewed on a branch. */
  priceStatus: 'decided' | 'proposed' | 'not_set';
}

export const ADDONS: Record<AddonKey, AddonDefinition> = {
  afs_workspace: {
    key: 'afs_workspace',
    name: 'AFS Workspace',
    summary: 'One set of annual financial statements: one entity, one financial year.',
    billing: { kind: 'credits', unitZar: 450, maxQuantity: 50, amounts: { ZAR: 450, GBP: 19, USD: 19, KES: 1599, ZMW: 389 } },
    features: [
      'Upload a trial balance from any system (.csv or .xlsx)',
      'Reporting adjustments with review and approval',
      'IFRS for SMEs AFS with notes, policies and compilation report',
      'Industry packs (general, mining, co-operatives)',
      'Regenerate as often as you need until the AFS is final',
      'PDF and Word',
    ],
    priceStatus: 'decided',
  },
  afs_workspace_ifrs: {
    key: 'afs_workspace_ifrs',
    name: 'AFS Workspace — Full IFRS',
    summary: 'One full-IFRS set of annual financial statements: one entity, one financial year.',
    billing: { kind: 'credits', unitZar: 1950, maxQuantity: 50, amounts: { ZAR: 1950, GBP: 84, USD: 81, KES: 6999, ZMW: 1669 } },
    features: [
      'Everything in AFS Workspace, under IFRS Accounting Standards',
      'Full-IFRS notes: financial risk, capital management, standards not yet effective',
      'IFRS 16 lease figures from the Leases add-on',
    ],
    priceStatus: 'decided',
  },
  afs_unlimited: {
    key: 'afs_unlimited',
    name: 'AFS Workspace — Unlimited',
    summary: 'Every IFRS for SMEs workspace you need for a year.',
    billing: { kind: 'subscription', interval: 'year', amountZar: 4950, amounts: { ZAR: 4950, GBP: 212, USD: 205, KES: 17699, ZMW: 4249 } },
    features: [
      'Unlimited IFRS for SMEs workspaces for 12 months',
      'Everything in AFS Workspace',
      'Pays for itself from the 12th set in a year',
    ],
    priceStatus: 'decided',
  },
  leases: {
    key: 'leases',
    name: 'IFRS 16 Leases',
    summary: 'Lessee lease register with IFRS 16 schedules, monthly balances and journals.',
    // Owner, 2026-11-09: tiered by leases managed, quoted from 26. A lease with
    // more than 20 years still to run counts as two (lib/leases/units.ts) —
    // nobody in the market prices by duration; this is the simple form of it.
    billing: {
      kind: 'tiered', interval: 'month', quoteAbove: 25, longLeaseYears: 20,
      tiers: [
        { units: 10, amountZar: 1250, label: 'Up to 10 leases',
          monthly: { ZAR: 1250, GBP: 54, USD: 52, KES: 4499, ZMW: 1069 } },
        { units: 25, amountZar: 2750, label: '11 to 25 leases',
          monthly: { ZAR: 2750, GBP: 119, USD: 115, KES: 9799, ZMW: 2349 } },
      ],
    },
    features: [
      // Only what is built. Lessor leases, the notes, deferred tax and the
      // SARS add-back go on this list the day they ship, not before.
      'Lessee leases: rent escalations, CPI, rate, term and payment changes',
      'Monthly journals to the trial balance with a plan; balance report and trend on its own',
      'Prospective remeasurement — reported months are never rewritten',
      'Take-on balances as at the day the add-on is taken',
      'Every change kept with who made it and when',
    ],
    priceStatus: 'decided',
  },
};

/**
 * What one unit of this add-on costs in `currency`, major units: a workspace,
 * a year of Unlimited, or a month of the leases band for `leases` (pass the
 * declared count). Null when it is not sold in that currency.
 */
export function addonPrice(a: AddonDefinition, currency: string, leaseCount = 1): number | null {
  const c = String(currency).toUpperCase();
  if (!isAddonCurrency(c)) return null;
  if (a.billing.kind === 'credits' || a.billing.kind === 'subscription') return a.billing.amounts[c] ?? null;
  const tier = a.billing.tiers.find(t => leaseCount <= t.units);
  return tier && LEASE_PRICE_DECIDED[c] ? tier.monthly[c] : null;
}

export function getAddon(key: string): AddonDefinition | null {
  return (ADDONS as Record<string, AddonDefinition>)[key] ?? null;
}

/** Whether an add-on can be bought right now. */
/**
 * The lease screens (register, capture, report, audit trail) are the next
 * LEASE-1 phase. Until they ship, IFRS 16 Leases is not sold: the engine,
 * records and journals work, but a customer would have nowhere to use them.
 * One switch: flip when /dashboard/leases lands — it also opens the nav module.
 */
export const LEASES_SCREENS_READY = false;

export function isOnSale(a: AddonDefinition): boolean {
  if (a.key === 'leases' && !LEASES_SCREENS_READY) return false;
  if (a.billing.kind === 'credits') return a.billing.unitZar > 0;
  if (a.billing.kind === 'tiered') return a.billing.tiers.length > 0;
  return a.billing.amountZar !== null && a.billing.amountZar > 0;
}

/** The leases tier for a number of lease units, or null when it is above the self-serve tiers (quote). */
/**
 * The band for a declared lease count, or 'enterprise' above the self-serve
 * ceiling (owner, 2026-11-10: above 25 the cart sends you to support, and the
 * app never sends that quantity to Stripe even though the Price has the bands).
 */
export function leaseBandFor(count: number): LeaseTier | 'enterprise' | null {
  const b = ADDONS.leases.billing;
  if (b.kind !== 'tiered' || !Number.isInteger(count) || count < 1) return null;
  if (count > b.quoteAbove) return 'enterprise';
  return b.tiers.find(t => count <= t.units) ?? 'enterprise';
}

export const ENTERPRISE_LEASES_MESSAGE =
  'More than 25 leases is enterprise pricing. Contact support@sormalitics.com and we will set it up for you.';

export function leaseTierFor(units: number): LeaseTier | null {
  const b = ADDONS.leases.billing;
  if (b.kind !== 'tiered') return null;
  return b.tiers.find(t => units <= t.units) ?? null;
}
