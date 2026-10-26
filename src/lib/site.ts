
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sormalitics.com').replace(/\/$/, '');
export const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sormalitics.com').replace(/\/$/, '');

// The app is open (2026-10-27): every link goes straight into it. Set
// NEXT_PUBLIC_APP_LIVE=false to send links back to the /in-development holding
// page — the switch is kept for an emergency, but on is now the default, so a
// missing variable can never hide the product again.
export const APP_LIVE = process.env.NEXT_PUBLIC_APP_LIVE !== 'false';

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
