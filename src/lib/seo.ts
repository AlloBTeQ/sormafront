
import type { Metadata } from 'next';
import { TIERS } from '@/config/plans';
import { SITE_URL } from '@/lib/site';
import { JURISDICTIONS } from '@/lib/payroll/jurisdictionStatus';

const LIVE_CODES = JURISDICTIONS.filter(j => j.status === 'live').map(j => j.code);

export const BRAND = 'SORMALITICS';
const OG_IMAGE = { url: '/og-image.jpg', width: 1200, height: 630, alt: BRAND };

export function pageMeta({ path, title, description }: { path: string; title: string; description: string }): Metadata {
  const full = `${title} | ${BRAND}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      alternateLocale: ['en_US', 'en_ZA'],
      siteName: BRAND,
      url: path,
      title: full,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: full, description, images: ['/twitter-image.jpg'] },
  };
}

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  email: 'hello@sormalitics.com',
  address: { '@type': 'PostalAddress', addressCountry: 'ZA' },
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: 'support@sormalitics.com', areaServed: LIVE_CODES }],
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: BRAND,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

// Offers are built from config/plans.ts. No ratings or reviews: we have none, and inventing them breaks Google's rules.
export const softwareLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: BRAND,
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Accounting & payroll',
  operatingSystem: 'Web',
  description:
    'Payroll, invoicing, accounting and annual financial statements on one ledger, with segregation of duties and a full audit trail.',
  publisher: { '@id': `${SITE_URL}/#organization` },
  offers: TIERS.map(t => ({
    '@type': 'Offer',
    name: t.name,
    price: (t.price.monthly.ZAR ?? 0).toFixed(2),
    priceCurrency: 'ZAR',
    url: `${SITE_URL}/pricing`,
    ...(t.perSeat ? { description: `Per ${t.perSeat.unit}, per month` } : { description: 'Per month' }),
  })),
};

// Escapes < so the JSON cannot close its <script> tag early.
export function ld(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
