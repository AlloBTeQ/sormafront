// How the add-ons are presented on this site. NOTHING HERE IS A PRICE.
//
// Prices, tiers, currencies and what is on sale come from ./addons.ts, which is
// the app's catalogue copied verbatim by `pnpm sync` (sormalitics:
// src/config/addons.ts — the same file the app's checkout charges from). Change
// a price in the app, run `pnpm sync` here, and this site follows. Only the
// words on the cards are written here.
import * as catalogue from './addons';
import {
  ADDONS, ADDON_CURRENCIES, addonPrice, isOnSale, leaseBandFor,
  type AddonCurrency, type AddonKey, type PerCurrency,
} from './addons';

export { isAddonCurrency, type AddonCurrency } from './addons';

export interface AddonCard {
  key: AddonKey;
  name: string;
  amount: PerCurrency;
  from?: boolean;
  per: string;
  blurb: string;
  points: (cur: AddonCurrency) => string[];
  onSale: boolean;
}

const SYMBOL: Record<AddonCurrency, string> = { ZAR: 'R', GBP: '£', USD: '$', KES: 'KSh ', ZMW: 'K' };
export const addonMoney = (n: number, cur: AddonCurrency) =>
  `${SYMBOL[cur]}${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

/** The catalogue's price for `key` in every currency (the first lease tier for leases). */
function amounts(key: AddonKey, leaseCount = 1): PerCurrency {
  const out = {} as PerCurrency;
  for (const c of ADDON_CURRENCIES) out[c] = addonPrice(ADDONS[key], c, leaseCount) ?? 0;
  return out;
}

const PER: Record<AddonKey, string> = {
  afs_workspace: 'per workspace', afs_workspace_ifrs: 'per workspace', afs_unlimited: 'per year', leases: 'per month',
};

// ── IFRS 16 Module: Lessee, Lessor, or both ──────────────────────────────────
// Owner, 2026-11-22: each side is its own tier by the leases held on that side
// (same prices), and Both is the two added together — two pickers, never a fixed
// double price. Above the catalogue's top tier a side is quoted.
export type LeaseSide = 'lessee' | 'lessor';
const leaseBilling = ADDONS.leases.billing;
const leaseTiers = leaseBilling.kind === 'tiered' ? leaseBilling.tiers : [];
/** Above this many leases on a side, the side is quoted. */
export const LEASE_QUOTE_ABOVE = leaseBilling.kind === 'tiered' ? leaseBilling.quoteAbove : 25;
/** A lease with more than this many years still to run counts as two. */
export const LONG_LEASE_YEARS = leaseBilling.kind === 'tiered' ? leaseBilling.longLeaseYears : 20;

/** The tiers to pick from, as lease counts: each catalogue tier, then one past the top for "quoted". */
export const LEASE_TIERS: { value: number; label: string }[] = [
  ...leaseTiers.map((t, i) => ({ value: t.units, label: i === 0 ? `Up to ${t.units}` : `${leaseTiers[i - 1].units + 1} to ${t.units}` })),
  { value: LEASE_QUOTE_ABOVE + 1, label: `More than ${LEASE_QUOTE_ABOVE}` },
];

/** Monthly price of one side's tier for a lease count; null when it is quoted. */
export function leaseSidePrice(leaseCount: number, cur: AddonCurrency): number | null {
  if (leaseBandFor(leaseCount) === 'enterprise') return null;
  return addonPrice(ADDONS.leases, cur, leaseCount);
}

export const LEASE_10: PerCurrency = amounts('leases', leaseTiers[0]?.units ?? 10);
export const LEASE_25: PerCurrency = amounts('leases', leaseTiers[1]?.units ?? 25);

/**
 * Whether each side can be bought in the app, read from the synced catalogue —
 * so this site opens a side when the app does, and never before:
 *   lessee — the add-on is on sale (LEASES_SCREENS_READY) AND the app's pricing
 *            page takes the tier from /pricing?addon=leases&leases=N
 *            (LEASE_TIER_HANDOFF). Without the second, a visitor who picked
 *            11 to 25 here would be sold the first tier there.
 *   lessor — the lessor screens and checkout are live (LESSOR_SCREENS_READY).
 * A flag the synced catalogue does not have yet reads as "not yet".
 */
const flag = (name: string) => (catalogue as Record<string, unknown>)[name] === true;
const leasesOnSale = isOnSale(ADDONS.leases);
export const LEASE_SIDE_ON_SALE: Record<LeaseSide, boolean> = {
  lessee: leasesOnSale && flag('LEASE_TIER_HANDOFF'),
  lessor: leasesOnSale && flag('LESSOR_SCREENS_READY'),
};

export const ADDON_CARDS: AddonCard[] = [
  {
    key: 'afs_workspace',
    name: ADDONS.afs_workspace.name,
    amount: amounts('afs_workspace'), per: PER.afs_workspace,
    blurb: 'One set of annual financial statements under IFRS for SMEs: one entity, one financial year.',
    points: () => ['Upload a trial balance from any system', 'Reporting adjustments with review and approval', 'Notes, policies and compilation report', 'PDF and Word'],
    onSale: isOnSale(ADDONS.afs_workspace),
  },
  {
    key: 'afs_workspace_ifrs',
    name: ADDONS.afs_workspace_ifrs.name,
    amount: amounts('afs_workspace_ifrs'), per: PER.afs_workspace_ifrs,
    blurb: 'One full-IFRS set: one entity, one financial year.',
    points: () => ['Everything in AFS Workspace, under IFRS Accounting Standards', 'Financial risk, capital management, standards not yet effective'],
    onSale: isOnSale(ADDONS.afs_workspace_ifrs),
  },
  {
    key: 'afs_unlimited',
    name: ADDONS.afs_unlimited.name,
    amount: amounts('afs_unlimited'), per: PER.afs_unlimited,
    blurb: 'Every IFRS for SMEs workspace you need for twelve months.',
    points: () => ['Unlimited IFRS for SMEs workspaces', 'Pays for itself from the 12th set in a year'],
    onSale: isOnSale(ADDONS.afs_unlimited),
  },
  {
    // Shown by its own card and page (components/PricingSection.tsx, app/pricing/ifrs16).
    key: 'leases',
    name: 'IFRS 16 Module',
    amount: LEASE_10, from: true, per: PER.leases,
    blurb: 'Lessee, lessor, or both — priced per side. Lease register, IFRS 16 schedules, monthly balances and journals.',
    points: cur => [`Up to 10 leases ${addonMoney(LEASE_10[cur], cur)} · 11 to 25 leases ${addonMoney(LEASE_25[cur], cur)}`, `More than ${LEASE_QUOTE_ABOVE} leases: enterprise pricing`, 'Reported months are never rewritten'],
    onSale: leasesOnSale,
  },
];
