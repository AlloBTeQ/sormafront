// lib/payroll/regionRouter.ts
// ─── Payroll Region → Engine Route resolver ───────────────────────────────
//
// Usage:
//   import { getPayrollRunRoute, saveLastRegion, getLastRegion } from '@/lib/payroll/regionRouter';
//   router.push(getPayrollRunRoute('RSA'));

export type PayrollRegion = 'RSA' | 'UK' | 'US' | 'KE' | 'UG' | 'BW' | 'ZM' | 'ZW';

const STORAGE_KEY = 'sormalitics:lastPayrollRegion';

/** Maps a region key to its payroll engine route segment */
const REGION_ROUTE_MAP: Record<PayrollRegion, string> = {
  RSA: 'zaprun',
  UK:  'ukrun',
  US:  'usrun',
  KE:  'kenrun',
  UG:  'ugarun',
  BW:  'botrun',
  ZM:  'zambrun',
  ZW:  'zimrun',
};

/**
 * Returns the absolute Next.js route for a region's payroll engine.
 * e.g. getPayrollRunRoute('RSA') → '/dashboard/payroll/payrollRun/zaprun'
 */
export function getPayrollRunRoute(region: PayrollRegion): string {
  return `/dashboard/payroll/payrollRun/${REGION_ROUTE_MAP[region]}`;
}

/**
 * Returns the route for the new-run picker with region pre-selected.
 * Used by the payroll hub "Run Payroll" button so it skips the picker.
 * e.g. getDirectRunRoute('UK') → '/dashboard/payroll/runs/new?region=UK'
 */
export function getDirectRunRoute(region: PayrollRegion): string {
  return `/dashboard/payroll/runs/new?region=${region}`;
}

/**
 * Returns the route for the new-run picker WITHOUT a pre-selected region.
 * Used by the dashboard quick action when no region context is available.
 */
export function getRunPickerRoute(region?: PayrollRegion | null): string {
  if (region) return getDirectRunRoute(region);
  return '/dashboard/payroll/runs/new';
}

/** Save the last used region to localStorage (client-only) */
export function saveLastRegion(region: PayrollRegion): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, region);
  }
}

/** Read the last used region from localStorage (client-only) */
export function getLastRegion(): PayrollRegion | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored in REGION_ROUTE_MAP) {
    return stored as PayrollRegion;
  }
  return null;
}

/** All region metadata, used for display purposes */
export const REGION_META: Record<PayrollRegion, {
  name: string;
  flag: string;
  currency: string;
  taxAuthority: string;
  color: string;
}> = {
  RSA: { name: 'South Africa',   flag: '🇿🇦', currency: 'ZAR', taxAuthority: 'SARS',  color: '#4B71A0' },
  UK:  { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', taxAuthority: 'HMRC',  color: '#ADC4DC' },
  US:  { name: 'United States',  flag: '🇺🇸', currency: 'USD', taxAuthority: 'IRS',   color: '#38bdf8' },
  KE:  { name: 'Kenya',          flag: '🇰🇪', currency: 'KES', taxAuthority: 'KRA',   color: '#D9B441' },
  UG:  { name: 'Uganda',         flag: '🇺🇬', currency: 'UGX', taxAuthority: 'URA',   color: '#C9A227' },
  BW:  { name: 'Botswana',       flag: '🇧🇼', currency: 'BWP', taxAuthority: 'BURS',  color: '#4B71A0' },
  ZM:  { name: 'Zambia',         flag: '🇿🇲', currency: 'ZMW', taxAuthority: 'ZRA',   color: '#D9B441' },
  // Zimbabwe's currency is a RUN-LEVEL property, not a region constant: ZIMRA
  // gazettes separate USD and ZWG tables and the employer picks. 'USD' here is
  // the display default only — never read it as the run's actual currency.
  ZW:  { name: 'Zimbabwe',       flag: '🇿🇼', currency: 'USD', taxAuthority: 'ZIMRA', color: '#4B71A0' },
};