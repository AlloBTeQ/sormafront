// src/lib/seo.ts
// ─────────────────────────────────────────────────────────────────────────────
// One place for page metadata and structured data (18 Oct 2026).
//
// Why a helper: Next.js does NOT deep-merge `openGraph`/`twitter`. A page that
// sets only `title` inherits the ROOT layout's openGraph whole — so every shared
// link to /pricing, /services, /about… previewed as the home page. pageMeta()
// gives each page its own card.
//
// Structured data is built from config/plans.ts so prices can't drift. No
// ratings or reviews are emitted: we have none, and inventing them is against
// Google's guidelines (and the law).
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from 'next';
import { TIERS } from '@/config/plans';
import { SITE_URL } from '@/lib/site';

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
      locale: 'en_ZA',
      siteName: BRAND,
      url: path,
      title: full,
      description,
      images: [OG_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: full, description, images: ['/twitter-image.jpg'] },
  };
}

// ── JSON-LD ──────────────────────────────────────────────────────────────────

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: BRAND,
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
  email: 'hello@sormalitics.com',
  address: { '@type': 'PostalAddress', addressCountry: 'ZA' },
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: 'support@sormalitics.com', areaServed: 'ZA' }],
};

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: BRAND,
  inLanguage: 'en-ZA',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

/** The product, with one Offer per purchasable plan — monthly ZAR from config/plans.ts. */
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

/** Serialise for a <script type="application/ld+json">; `<` escaped so no tag can close early. */
export function ld(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
