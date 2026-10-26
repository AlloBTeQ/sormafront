
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sormalitics.com').replace(/\/$/, '');
export const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sormalitics.com').replace(/\/$/, '');

// Until NEXT_PUBLIC_APP_LIVE=true, links into the app land on /in-development.
export const APP_LIVE = process.env.NEXT_PUBLIC_APP_LIVE === 'true';

export const APP_URL = APP_LIVE ? APP_ORIGIN : '/in-development#';

export function app(path: string): string {
  return `${APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function checkoutHref(tierId: string, period: 'monthly' | 'yearly', currency: string): string {
  if (tierId === 'free' || tierId === 'starter') return app('/auth/register');
  const cycle = period === 'yearly' ? 'annual' : 'monthly';
  const q = new URLSearchParams({ plan: tierId, cycle, currency });
  return app(`/pricing?${q.toString()}`);
}
