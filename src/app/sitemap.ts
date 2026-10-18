import type { MetadataRoute } from 'next';
import { articles } from '@/lib/help/content';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

// Every public page on this origin. App routes are not listed — they live on
// app.sormalitics.com and need a session.
const PAGES: [string, number][] = [
  ['/', 1.0], ['/pricing', 0.9], ['/services', 0.8], ['/store', 0.8], ['/fisi', 0.8],
  ['/about', 0.6], ['/contact', 0.6], ['/careers', 0.4], ['/help', 0.7],
  ['/legal/privacy', 0.3], ['/legal/terms', 0.3], ['/legal/cookies', 0.3],
  ['/legal/refunds', 0.3], ['/legal/dpa', 0.3], ['/legal/paia', 0.3],
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...PAGES.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, priority })),
    ...articles.map(a => ({ url: `${SITE_URL}/help/${a.slug}`, priority: 0.5 })),
  ];
}
