# sorma_frontendmark

The public marketing site for SORMALITICS, served at **sormalitics.com**.
The product lives at **app.sormalitics.com** (the `SORMALITICS` repo).

- Static export (`next build` → `out/`). No server, no API, no cookies, no analytics.
- Every public page lives here: home, pricing, services, store, FISI, about, contact, careers, help (+ articles) and the legal pages.
- Only **Sign in**, **Start free** and the paid plans' **Get started** go to the app. Every app link goes through `app()` / `APP_URL` in `src/lib/site.ts`.
- Contact and Careers forms post to the app (`/api/contact/submit`, `/api/careers`), which allows this origin via `lib/http/marketingCors.ts` in the app.
- Store purchases and FISI sign-up/sign-in hand off to the app.
- Pricing buttons hand off to `app.sormalitics.com/pricing?plan=…&cycle=…&currency=…`;
  the app's pricing page resumes checkout from those params.
- Old app URLs that hit this domain (`/dashboard/*`, `/auth/*`, `/api/*`, `/legal/*`, …)
  are 308-redirected to the app by `vercel.json`, so emailed links and bookmarks keep working.
- Plans, prices and live jurisdictions are copied from the app. After changing them there,
  run `pnpm sync` here (copies from `../SORMALITICS`), then `pnpm type-check && pnpm build`, then push.

```
pnpm install
pnpm dev          # http://localhost:3001
pnpm build        # writes out/
```

## Before the app is live (today)

`NEXT_PUBLIC_APP_LIVE` is unset, so every app link (Sign in, Start free, Get started,
store checkout, FISI sign-up) lands on **/in-development** — a "launching soon" page
that says what the visitor tried to do and offers early access by email. Old app URLs
(`/dashboard`, `/auth/…`) redirect there too. Contact and Careers open the visitor's
email client (hello@ / careers@) instead of posting to the app.

**At launch** (once app.sormalitics.com is up and tested):
1. `pnpm app-live on` → commit → push (switches the old-URL redirects to the app)
2. Vercel → this project → Environment Variables → `NEXT_PUBLIC_APP_LIVE=true` → redeploy
Both, or links and redirects disagree. `pnpm app-live off` + removing the variable reverses it.

## Go-live runbook (order matters)

**1. Ship this site to a preview**
1. `git init`, commit, push to a new **public** repo `AlloBTeQ/sorma_frontendmark`.
2. Vercel → Add New → Project → import `sorma_frontendmark`. Framework: Next.js. No env vars needed.
3. Open the `*.vercel.app` URL and check the page, mobile included.

**2. Give the app its subdomain (no downtime; the root keeps serving the app)**
1. Vercel → the `sormalitics` (app) project → Settings → Domains → add `app.sormalitics.com`.
   If DNS is not on Vercel, add `CNAME app → cname.vercel-dns.com` at the DNS host.
2. App project → Settings → Environment Variables (Production):
   - `NEXTAUTH_URL` → `https://app.sormalitics.com/api/oauth` (NextAuth is mounted at `/api/oauth`)
   - `APP_URL` → `https://app.sormalitics.com`, plus any `NEXT_PUBLIC_*_URL` pointing at the root
   - `CANONICAL_HOST` → `app.sormalitics.com` (**required**: left as `sormalitics.com` it bounces every app request back to the marketing site and refuses POSTs. The staff portal stays at `support.sormalitics.com`.)
   - `CONTACT_EMAIL` → the inbox for the Contact form (defaults to hello@sormalitics.com)
   - `MARKETING_ORIGINS` only when testing forms from a vercel.app preview of this site
   - While there: confirm `STORAGE_PROVIDER=s3`
   - Redeploy.
3. Google Cloud Console → OAuth client → add origin `https://app.sormalitics.com`
   and redirect URI `https://app.sormalitics.com/api/oauth/callback/google`. Keep the old ones until cutover is done.
4. Stripe → Developers → Webhooks → edit the endpoint URL to `https://app.sormalitics.com/api/webhooks/stripe`
   (`/api/webhooks/stripe`, same path as today). Editing keeps the signing secret. **Stripe does not follow redirects**,
   so this must be done before step 3.
5. AWS S3 `sormalitics-documents-prod` → Permissions → CORS → add `https://app.sormalitics.com`.
6. Test on app.sormalitics.com: sign in, open a document, start a test checkout.

**3. Cut over the root domain**
1. App project → Domains → remove `sormalitics.com` and `www.sormalitics.com`.
2. Web project → Domains → add `sormalitics.com`, and `www.sormalitics.com` redirecting to the apex.
3. Check: `sormalitics.com` shows the landing; `sormalitics.com/dashboard` lands on
   `app.sormalitics.com/dashboard`; a pricing card opens Stripe checkout; Stripe shows webhook deliveries succeeding.

Users signed in on the old domain will need to sign in once more on app.sormalitics.com (cookies don't move between hosts).

## Follow-ups (not needed for today)
- App: make `app.sormalitics.com/` go to `/dashboard` (or login) instead of rendering the old landing; set `noindex` on the app.
- The app still has its own copies of the public pages; once this site is live, have the app redirect those paths to sormalitics.com.
- The Store page still offers GBP/USD/EUR for one-off document purchases — check Stripe can charge those, or cut it to ZAR like the plans.
- Footer social links (Twitter, GitHub) point at handles that may not exist yet — check or remove.
