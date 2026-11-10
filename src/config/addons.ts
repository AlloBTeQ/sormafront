// Add-ons shown on the pricing page. The app is the source of truth
// (sormalitics: src/config/addons.ts) — keep these figures in step with it.
//
// Billed in rand whatever the currency selector says: the app's add-on
// checkout charges ZAR only (2026-11-10). IFRS 16 Leases is listed but not on
// sale until its screens ship — the app refuses the checkout until then.
export interface AddonCard {
  key: string;
  name: string;
  price: string;
  per: string;
  blurb: string;
  points: string[];
  onSale: boolean;
}

export const ADDON_CARDS: AddonCard[] = [
  {
    key: 'afs_workspace',
    name: 'AFS Workspace',
    price: 'R450', per: 'per workspace',
    blurb: 'One set of annual financial statements under IFRS for SMEs: one entity, one financial year.',
    points: ['Upload a trial balance from any system', 'Reporting adjustments with review and approval', 'Notes, policies and compilation report', 'PDF and Word'],
    onSale: true,
  },
  {
    key: 'afs_workspace_ifrs',
    name: 'AFS Workspace — Full IFRS',
    price: 'R1,950', per: 'per workspace',
    blurb: 'One full-IFRS set: one entity, one financial year.',
    points: ['Everything in AFS Workspace, under IFRS Accounting Standards', 'Financial risk, capital management, standards not yet effective'],
    onSale: true,
  },
  {
    key: 'afs_unlimited',
    name: 'AFS Workspace — Unlimited',
    price: 'R4,950', per: 'per year',
    blurb: 'Every IFRS for SMEs workspace you need for twelve months.',
    points: ['Unlimited IFRS for SMEs workspaces', 'Pays for itself from the 12th set in a year'],
    onSale: true,
  },
  {
    key: 'leases',
    name: 'IFRS 16 Leases',
    price: 'From R1,250', per: 'per month',
    blurb: 'Lessee lease register with IFRS 16 schedules, monthly balances and journals.',
    points: ['Up to 10 leases R1,250 · 11 to 25 leases R2,750', 'More than 25 leases: enterprise pricing', 'Reported months are never rewritten'],
    onSale: false,
  },
];
