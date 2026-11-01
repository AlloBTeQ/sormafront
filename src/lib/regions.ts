// src/lib/regions.ts
// ─────────────────────────────────────────────────────────────────────────────
// THE LIST OF COUNTRIES. Adding a jurisdiction starts here, and only here.
//
// Before 2026-10-20 the region list was typed out by hand in about 27 places:
// two `PayrollRegion` unions, seven Mongoose enums, seven zod enums and a
// handful of UI arrays. Several had already drifted (no Zimbabwe), and a missed
// list did not fail loudly. Every one of them now derives from the three tuples
// below.
//
// ── Three vocabularies, on purpose ───────────────────────────────────────────
// They predate this file and live in stored documents, so they are kept rather
// than migrated:
//   • PAYROLL_REGIONS        company setting, signup, engine keys:  RSA, UK, …
//   • PAYROLL_STORE_REGIONS  Employee / PayrollRun / TaxSubmission: ZA,  UK, …
//   • ISO_REGIONS            Invoice / Quote / reports / chart:     ZA,  GB, …
// REGION_CODES ties them together, and its Record type makes a country missing
// from any one of them a compile error rather than a quiet gap.
//
// No imports. This file is read by Mongoose models, API routes and client
// components alike, so it must never pull in anything server-only.
// ─────────────────────────────────────────────────────────────────────────────

/** Company / engine vocabulary. Order is the display order. */
export const PAYROLL_REGIONS = ['RSA', 'UK', 'US', 'KE', 'UG', 'BW', 'ZM', 'ZW', 'NA', 'SZ', 'LS', 'RW', 'AO', 'MZ'] as const;
export type PayrollRegion = typeof PAYROLL_REGIONS[number];

/** What Employee.region, PayrollRun.region and TaxSubmission.region store. */
export const PAYROLL_STORE_REGIONS = ['UK', 'ZA', 'US', 'KE', 'UG', 'BW', 'ZM', 'ZW', 'NA', 'SZ', 'LS', 'RW', 'AO', 'MZ'] as const;
export type PayrollStoreRegion = typeof PAYROLL_STORE_REGIONS[number];

/** ISO-3166 alpha-2, as used by invoices, quotes, reports and the chart of accounts. */
export const ISO_REGIONS = ['ZA', 'GB', 'US', 'KE', 'UG', 'BW', 'ZM', 'ZW', 'NA', 'SZ', 'LS', 'RW', 'AO', 'MZ'] as const;
export type IsoRegion = typeof ISO_REGIONS[number];

/** One row per country. Exhaustive by type: add a region above and this must grow. */
export const REGION_CODES: Record<PayrollRegion, { store: PayrollStoreRegion; iso: IsoRegion }> = {
  RSA: { store: 'ZA', iso: 'ZA' },
  UK:  { store: 'UK', iso: 'GB' },
  US:  { store: 'US', iso: 'US' },
  KE:  { store: 'KE', iso: 'KE' },
  UG:  { store: 'UG', iso: 'UG' },
  BW:  { store: 'BW', iso: 'BW' },
  ZM:  { store: 'ZM', iso: 'ZM' },
  ZW:  { store: 'ZW', iso: 'ZW' },
  // Namibia. 'NA' is the ISO code; watch for code that reads 'NA' as "n/a".
  NA:  { store: 'NA', iso: 'NA' },
  SZ:  { store: 'SZ', iso: 'SZ' },
  LS:  { store: 'LS', iso: 'LS' },
  RW:  { store: 'RW', iso: 'RW' },
  AO:  { store: 'AO', iso: 'AO' },
  MZ:  { store: 'MZ', iso: 'MZ' },
};

/** Company code → stored payroll code ('RSA' → 'ZA'). */
export const toStoreRegion = (r: PayrollRegion): PayrollStoreRegion => REGION_CODES[r].store;

/** Company code → ISO code ('UK' → 'GB'). */
export const toIsoRegion = (r: PayrollRegion): IsoRegion => REGION_CODES[r].iso;

/** Stored payroll code → company code ('ZA' → 'RSA'). */
export function fromStoreRegion(s: PayrollStoreRegion): PayrollRegion {
  return PAYROLL_REGIONS.find(r => REGION_CODES[r].store === s)!;
}

// ── Spellings ───────────────────────────────────────────────────────────────
// Every spelling that reaches the app, from stored documents, query strings and
// people typing, mapped to the company code. Was two partial tables
// (jurisdictionLock NORMALISE, MultiRegionPayrollService REGION_ALIASES) that
// accepted different sets; this is their union.
const REGION_ALIASES: Record<string, PayrollRegion> = {
  RSA: 'RSA', ZA: 'RSA', ZAF: 'RSA', 'SOUTH AFRICA': 'RSA',
  UK: 'UK', GB: 'UK', GBR: 'UK',
  US: 'US', USA: 'US',
  KE: 'KE', KEN: 'KE',
  UG: 'UG', UGA: 'UG',
  BW: 'BW', BWA: 'BW',
  ZM: 'ZM', ZAM: 'ZM', ZMB: 'ZM',
  ZW: 'ZW', ZWE: 'ZW', ZIM: 'ZW', ZIMBABWE: 'ZW',
  NA: 'NA', NAM: 'NA', NAMIBIA: 'NA',
  SZ: 'SZ', SWZ: 'SZ', ESWATINI: 'SZ', SWAZILAND: 'SZ',
  LS: 'LS', LSO: 'LS', LESOTHO: 'LS',
  RW: 'RW', RWA: 'RW', RWANDA: 'RW',
  AO: 'AO', AGO: 'AO', ANGOLA: 'AO',
  MZ: 'MZ', MOZ: 'MZ', MOZAMBIQUE: 'MZ', 'MOÇAMBIQUE': 'MZ',
};

/** Any spelling → company code, or null. Never guesses. */
export function toPayrollRegion(v: unknown): PayrollRegion | null {
  return REGION_ALIASES[String(v ?? '').trim().toUpperCase()] ?? null;
}

/** Every accepted spelling, for error messages. */
export const REGION_SPELLINGS: readonly string[] = Object.keys(REGION_ALIASES);

// ── Currency ────────────────────────────────────────────────────────────────
/**
 * The region's default pay currency. Was seven separate maps, three of which had
 * no Zimbabwe entry and fell through to a `|| 'USD'` default.
 *
 * Zimbabwe is the exception that makes this a DEFAULT, not a fact: ZIMRA gazettes
 * USD and ZWG tables and the run decides. Use `runCurrencyFor` wherever a run is
 * in hand.
 */
export const REGION_CURRENCY: Record<PayrollRegion, string> = {
  RSA: 'ZAR', UK: 'GBP', US: 'USD', KE: 'KES', UG: 'UGX', BW: 'BWP', ZM: 'ZMW', ZW: 'USD', NA: 'NAD', SZ: 'SZL', LS: 'LSL', RW: 'RWF', AO: 'AOA', MZ: 'MZN',
};

/** Prefix symbols for compact UI amounts. */
export const REGION_CURRENCY_SYMBOL: Record<PayrollRegion, string> = {
  RSA: 'R', UK: '£', US: '$', KE: 'KSh', UG: 'USh', BW: 'P', ZM: 'K', ZW: '$', NA: 'N$', SZ: 'E', LS: 'M', RW: 'FRW ', AO: 'Kz ', MZ: 'MT ',
};

/**
 * Money as people in that country write it: N$2,925.00, E2,925.00, M2,925.00.
 *
 * Not Intl's locale data: for 'en-NA' it renders NAD as a bare "$" — which reads
 * as US dollars on a Namibian tax page — and for 'en-LS' it renders "LSL 2,925.00".
 * Found walking the Namibian returns page, 2026-10-22. Unknown currencies fall
 * back to Intl with the ISO code.
 */
export function formatMoney(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const code = String(currency || '').toUpperCase();
  const region = (Object.keys(REGION_CURRENCY) as PayrollRegion[]).find(r => REGION_CURRENCY[r] === code && r !== 'ZW' && r !== 'US');
  const symbol = region ? REGION_CURRENCY_SYMBOL[region] : null;
  if (!symbol) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code || 'USD', currencyDisplay: 'code', minimumFractionDigits: 2 }).format(n);
  }
  // The Rwandan franc is written and paid in whole francs (FRW 352,727).
  const dp = code === 'RWF' ? 0 : 2;
  const body = new Intl.NumberFormat('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp }).format(Math.abs(n));
  return `${n < 0 ? '-' : ''}${symbol}${body}`;
}

/** Regions whose run, not the region, decides the currency. */
const RUN_DECIDES_CURRENCY: Partial<Record<PayrollRegion, readonly string[]>> = {
  ZW: ['USD', 'ZWG'],
};

/**
 * The currency a run's figures are in.
 *
 * `run.currency` is consulted ONLY for regions listed in RUN_DECIDES_CURRENCY:
 * PayrollRun.currency carries a schema default of 'GBP', and trusting it
 * everywhere would re-denominate every South African run that predates the field.
 */
export function runCurrencyFor(region: unknown, runCurrency?: unknown, fallback = 'USD'): string {
  const r = toPayrollRegion(region);
  if (!r) return fallback;
  const allowed = RUN_DECIDES_CURRENCY[r];
  const c = String(runCurrency ?? '').toUpperCase();
  if (allowed && allowed.includes(c)) return c;
  return REGION_CURRENCY[r];
}
