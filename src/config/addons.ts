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

const LEASE_10: PerCurrency = { ZAR: 1250, GBP: 54, USD: 52, KES: 4499, ZMW: 1069 };
const LEASE_25: PerCurrency = { ZAR: 2750, GBP: 119, USD: 115, KES: 9799, ZMW: 2349 };

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
    name: 'IFRS 16 Leases',
    amount: LEASE_10, from: true, per: 'per month',
    blurb: 'Lessee lease register with IFRS 16 schedules, monthly balances and journals.',
    points: cur => [`Up to 10 leases ${addonMoney(LEASE_10[cur], cur)} · 11 to 25 leases ${addonMoney(LEASE_25[cur], cur)}`, 'More than 25 leases: enterprise pricing', 'Reported months are never rewritten'],
    onSale: false,
  },
];
