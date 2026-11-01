// src/lib/geo/likelyCountry.ts
// ─────────────────────────────────────────────────────────────────────────────
// Where is this visitor PROBABLY running payroll? Used only to SUGGEST — the
// country strip on the home, hub and pricing pages, and the currency the
// pricing section opens in. Nothing is ever redirected or hidden.
//
// The signal is the time zone the visitor's own browser reports
// (Intl.DateTimeFormat().resolvedOptions().timeZone). No IP lookup, no
// third-party call, nothing sent anywhere: it is read and used on the page.
//
// Time zones are shared, so a zone maps to a PRIMARY country and the others
// that use it. Browsers differ in whether they report a country's own zone
// (Africa/Harare) or the canonical one it links to (Africa/Maputo), so both
// spellings are listed. A zone we do not serve answers null — no suggestion.
// ─────────────────────────────────────────────────────────────────────────────

import { COUNTRY_PAGES, type CountryPage } from '@/lib/payroll/countryPages';

/** zone → [primary slug, ...others that share it]. */
const ZONES: Record<string, string[]> = {
  'Africa/Johannesburg': ['south-africa', 'lesotho', 'eswatini'],
  'Africa/Maseru':       ['lesotho', 'south-africa'],
  'Africa/Mbabane':      ['eswatini', 'south-africa'],
  'Africa/Gaborone':     ['botswana'],
  'Africa/Windhoek':     ['namibia'],
  'Africa/Lusaka':       ['zambia'],
  'Africa/Harare':       ['zimbabwe'],
  // Canonical zone for much of Southern and Central Africa (UTC+2, no DST).
  'Africa/Maputo':       ['mozambique', 'zimbabwe', 'zambia', 'botswana'],
  'Africa/Luanda':       ['angola'],
  'Africa/Nairobi':      ['kenya'],
};

export interface LikelyCountry {
  primary: CountryPage;
  others: CountryPage[];
  timeZone: string;
}

export function likelyCountry(): LikelyCountry | null {
  let tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''; } catch { return null; }
  const slugs = ZONES[tz];
  if (!slugs) return null;
  const pages = slugs
    .map(s => COUNTRY_PAGES.find(c => c.slug === s))
    .filter((c): c is CountryPage => Boolean(c));
  if (pages.length === 0) return null;
  return { primary: pages[0], others: pages.slice(1), timeZone: tz };
}
