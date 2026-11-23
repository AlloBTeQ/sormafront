// Add-ons shown on the pricing page. The app is the source of truth
// (sormalitics: src/config/addons.ts) — keep these figures in step with it.
//
// Charged in the company's billing currency, like the plans (2026-11-10): the
// selector shows the price in each. Not sold in EUR. IFRS 16 Leases is listed
// but not on sale until its screens ship — the app refuses that checkout too.
export type AddonCurrency = 'ZAR' | 'GBP' | 'USD' | 'KES' | 'ZMW';
type PerCurrency = Record<AddonCurrency, number>;

export interface AddonCard {
  key: string;
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
export const isAddonCurrency = (c: string): c is AddonCurrency => ['ZAR', 'GBP', 'USD', 'KES', 'ZMW'].includes(c);

export const LEASE_10: PerCurrency = { ZAR: 1250, GBP: 54, USD: 52, KES: 4499, ZMW: 1069 };
export const LEASE_25: PerCurrency = { ZAR: 2750, GBP: 119, USD: 115, KES: 9799, ZMW: 2349 };

// ── IFRS 16 Module: Lessee, Lessor, or both ──────────────────────────────────
// Owner, 2026-11-22: each side is its own tier by the leases held on that side
// (same prices), and Both is the two added together — two pickers, never a fixed
// double price. More than 25 leases on a side is quoted.
export type LeaseSide = 'lessee' | 'lessor';
/** A tier as a lease count: 10, 25, or 26 for "more than 25" (quoted). */
export type LeaseTier = 10 | 25 | 26;
export const LEASE_TIERS: { value: LeaseTier; label: string }[] = [
  { value: 10, label: 'Up to 10' },
  { value: 25, label: '11 to 25' },
  { value: 26, label: 'More than 25' },
];
/** Monthly price of one side's tier; null when it is quoted. */
export function leaseSidePrice(tier: LeaseTier, cur: AddonCurrency): number | null {
  return tier === 10 ? LEASE_10[cur] : tier === 25 ? LEASE_25[cur] : null;
}
/**
 * Whether each side can be bought in the app TODAY. The app is the source of
 * truth (LEASES_SCREENS_READY and LESSOR_SCREENS_READY in its config/addons.ts)
 * and refuses the checkout itself; these only decide what the button says.
 *   lessee — flip when the app release with the lease screens AND the
 *            /pricing?addon=leases&leases=N hand-off is live on app.sormalitics.com.
 *   lessor — flip when the lessor screens and its checkout are live.
 */
export const LEASE_SIDE_ON_SALE: Record<LeaseSide, boolean> = { lessee: false, lessor: false };

export const ADDON_CARDS: AddonCard[] = [
  {
    key: 'afs_workspace',
    name: 'AFS Workspace',
    amount: { ZAR: 450, GBP: 19, USD: 19, KES: 1599, ZMW: 389 }, per: 'per workspace',
    blurb: 'One set of annual financial statements under IFRS for SMEs: one entity, one financial year.',
    points: () => ['Upload a trial balance from any system', 'Reporting adjustments with review and approval', 'Notes, policies and compilation report', 'PDF and Word'],
    onSale: true,
  },
  {
    key: 'afs_workspace_ifrs',
    name: 'AFS Workspace — Full IFRS',
    amount: { ZAR: 1950, GBP: 84, USD: 81, KES: 6999, ZMW: 1669 }, per: 'per workspace',
    blurb: 'One full-IFRS set: one entity, one financial year.',
    points: () => ['Everything in AFS Workspace, under IFRS Accounting Standards', 'Financial risk, capital management, standards not yet effective'],
    onSale: true,
  },
  {
    key: 'afs_unlimited',
    name: 'AFS Workspace — Unlimited',
    amount: { ZAR: 4950, GBP: 212, USD: 205, KES: 17699, ZMW: 4249 }, per: 'per year',
    blurb: 'Every IFRS for SMEs workspace you need for twelve months.',
    points: () => ['Unlimited IFRS for SMEs workspaces', 'Pays for itself from the 12th set in a year'],
    onSale: true,
  },
  {
    key: 'leases',
    name: 'IFRS 16 Module',
    amount: LEASE_10, from: true, per: 'per month',
    blurb: 'Lessee, lessor, or both — priced per side. Lease register, IFRS 16 schedules, monthly balances and journals.',
    points: cur => [`Up to 10 leases ${addonMoney(LEASE_10[cur], cur)} · 11 to 25 leases ${addonMoney(LEASE_25[cur], cur)}`, 'More than 25 leases: enterprise pricing', 'Reported months are never rewritten'],
    onSale: false,
  },
];
