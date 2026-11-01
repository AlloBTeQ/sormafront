'use client';

// src/components/legal/Analytics.tsx
// ─────────────────────────────────────────────────────────────────────────────
// The ONLY place Google Analytics and Microsoft Clarity may be loaded.
//
// Two rules, both of which were previously broken in app/layout.tsx:
//
//   1. NOTHING loads without analytics consent. The old code gated on
//      NODE_ENV and the env var only, so both trackers ran regardless of what
//      the cookie banner had been told.
//
//   2. Clarity NEVER loads on an authenticated route. Clarity records session
//      replays and heatmaps. On /dashboard that means recording someone's
//      payroll register, employee tax numbers and bank details, and shipping
//      the replay to a third party. Masking settings are not a defence we can
//      rely on for special personal information under POPIA s26, so the answer
//      is that it does not run there at all.
//
// Revocation is best-effort by design. Once a third-party tag is in the
// document it cannot be un-injected; what we can do is set the documented kill
// switches and stop feeding it. A full page load after revocation is clean.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { getConsent, subscribeToConsent, type Consent } from '@/lib/legal/consent';

const GA_ID      = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

/**
 * Route prefixes where session recording is forbidden.
 *
 * Everything behind authentication, plus the checkout and auth flows — the
 * first because it holds client financial data, the second two because they
 * carry payment context and credentials being typed.
 */
const NO_REPLAY_PREFIXES = [
  '/dashboard',
  '/fisi',
  '/checkout',
  '/subscribe',
  '/auth',
  '/team',
  '/invite',
  '/verify',
] as const;

function isPrivateRoute(pathname: string | null): boolean {
  if (!pathname) return true; // unknown route → assume private, fail closed
  return NO_REPLAY_PREFIXES.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

export function Analytics() {
  const pathname = usePathname();

  // Start denied on the server and on first client paint. Reading localStorage
  // during render would desynchronise hydration, so the real value arrives in
  // the effect below — one frame later, with nothing loaded in the meantime.
  const [consent, setConsent] = useState<Consent>({
    analytics:   false,
    marketing:   false,
    preferences: false,
  });

  useEffect(() => {
    setConsent(getConsent());
    return subscribeToConsent(setConsent);
  }, []);

  // Honour revocation on tags that are already in the document.
  useEffect(() => {
    if (consent.analytics) return;

    if (GA_ID) {
      // Documented GA opt-out flag; gtag checks it on every hit.
      window[`ga-disable-${GA_ID}`] = true;
    }
    if (typeof window.clarity === 'function') {
      try {
        window.clarity('consent', false);
      } catch {
        /* Clarity not ready, or an API version without `consent` — nothing to do. */
      }
    }
  }, [consent.analytics]);

  // Production only, consent granted, and the id actually configured.
  const enabled = process.env.NODE_ENV === 'production' && consent.analytics;

  const loadGA      = enabled && !!GA_ID;
  const loadClarity = enabled && !!CLARITY_ID && !isPrivateRoute(pathname);

  return (
    <>
      {loadGA && (
        <>
          <Script
            id="ga-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            window['ga-disable-${GA_ID}']=false;
            gtag('js',new Date());
            gtag('consent','default',{
              ad_storage:'denied',
              ad_user_data:'denied',
              ad_personalization:'denied',
              analytics_storage:'granted'
            });
            gtag('config','${GA_ID}',{anonymize_ip:true});
          `}</Script>
        </>
      )}

      {loadClarity && (
        <Script id="clarity-init" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window,document,"clarity","script","${CLARITY_ID}");
        `}</Script>
      )}
    </>
  );
}

export default Analytics;
