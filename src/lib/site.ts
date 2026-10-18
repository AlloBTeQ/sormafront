// src/lib/site.ts
// ─────────────────────────────────────────────────────────────────────────────
// The marketing site and the app live on different origins:
//
//   sormalitics.com        → this project (static, public, indexed)
//   app.sormalitics.com    → the SORMALITICS app (login, dashboard, billing)
//
// Every link that leaves the marketing surface goes through `app()` so the app
// origin is decided in ONE place. Override per environment with
// NEXT_PUBLIC_APP_URL (e.g. a Vercel preview of the app).
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sormalitics.com').replace(/\/$/, '');
/** The real app origin. Used for API calls, which only run when APP_LIVE. */
export const APP_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.sormalitics.com').replace(/\/$/, '');

/**
 * Is app.sormalitics.com taking visitors yet?
 *
 * Until it is, every link that would leave for the app lands on this site's
 * /in-development page instead of a browser "site can't be reached" error. The
 * original destination rides along in the hash (/in-development#/auth/register)
 * so that page can say what the visitor was trying to do.
 *
 * Go live: set NEXT_PUBLIC_APP_LIVE=true in the Vercel project, run
 * `pnpm app-live on` (switches the old-URL redirects in vercel.json), redeploy.
 */
export const APP_LIVE = process.env.NEXT_PUBLIC_APP_LIVE === 'true';

/** Base for app links. Pages build links as `${APP_URL}/auth/login`. */
export const APP_URL = APP_LIVE ? APP_ORIGIN : '/in-development#';

/** Link to a path in the app (or to /in-development while it is not live). */
export function app(path: string): string {
  return `${APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Where a pricing card's button sends the buyer.
 *
 * Checkout needs the app's session and its billing APIs, so it cannot start on
 * this origin. Free goes to register; paid tiers hand off to the app's /pricing
 * with the selection in the query string, and the app's pricing page resumes
 * the checkout (see the `?plan=` handler in SORMALITICS src/app/pricing/page.tsx).
 */
export function checkoutHref(tierId: string, period: 'monthly' | 'yearly', currency: string): string {
  if (tierId === 'free' || tierId === 'starter') return app('/auth/register');
  const cycle = period === 'yearly' ? 'annual' : 'monthly';
  const q = new URLSearchParams({ plan: tierId, cycle, currency });
  return app(`/pricing?${q.toString()}`);
}
