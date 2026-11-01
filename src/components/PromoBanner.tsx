'use client';

// The current marketing special, shown site-wide above the navbar.
//
// It DISAPPEARS ON ITS OWN: whether a promotion is running is decided in the
// visitor's browser from lib/billing/promotions.ts (synced from the app), so
// the banner goes at 00:00 SAST on 1 January 2027 with no rebuild — the same
// moment the app stops giving the free month. This site is a static export;
// a server-side check would freeze the banner into the HTML until the next
// deploy, and an offer advertised after it has ended is a misleading claim.
//
// Rendered only after mount for the same reason: the static HTML never
// carries the banner, so a page cached past the end date cannot show it.

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { activeTrialPromotion, promotionEndLabel, type TrialPromotion } from '@/lib/billing/promotions';

const INK = '#143152';
const GOLD = '#C9A227';
const DISMISS_KEY = 'sorma-promo-dismissed';

export function PromoBanner() {
  const [promo, setPromo] = useState<TrialPromotion | null>(null);

  useEffect(() => {
    const p = activeTrialPromotion();
    if (!p) return;
    let dismissed = false;
    try { dismissed = window.sessionStorage.getItem(DISMISS_KEY) === p.key; } catch { /* storage blocked */ }
    if (!dismissed) setPromo(p);
  }, []);

  if (!promo) return null;

  const dismiss = () => {
    try { window.sessionStorage.setItem(DISMISS_KEY, promo.key); } catch { /* storage blocked */ }
    setPromo(null);
  };

  return (
    <div role="region" aria-label="Current offer" style={{ background: INK, color: '#FFFFFF' }}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-2.5 flex items-center gap-3 text-[13px]">
        <p className="flex-1 text-center">
          <span className="font-semibold" style={{ color: GOLD }}>First month free</span>{' '}
          on monthly plans for new subscribers who sign up by {promotionEndLabel(promo)}.{' '}
          <span className="hidden sm:inline">Card required, cancel before the month ends and you pay nothing.{' '}</span>
          <a href="/pricing" className="underline underline-offset-2 font-semibold whitespace-nowrap" style={{ color: GOLD }}>
            See pricing →
          </a>
        </p>
        <button type="button" onClick={dismiss} aria-label="Hide this offer"
          className="shrink-0 p-1 rounded opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default PromoBanner;
