'use client';

// The current marketing special — the first thing a visitor sees on landing.
//
// It DISAPPEARS ON ITS OWN: whether a promotion is running is decided in the
// visitor's browser from lib/billing/promotions.ts (synced from the app), so
// the banner goes at 00:00 SAST on 1 January 2027 with no rebuild — the same
// moment the app stops giving the free month. This site is a static export;
// a server-side check would freeze the banner into the HTML until the next
// deploy, and an offer advertised after it has ended is a misleading claim.
// Rendered only after mount for the same reason.
//
// Prominent on purpose (owner, 2026-11-01: "a marketing tool that must catch
// the eye as you land"): a full gold band against the white navbar and navy
// hero, a big headline, a days-left counter and one clear button. The price,
// renewal and cancellation terms stay in the band (CPA s41) — smaller, never
// removed.

import React, { useEffect, useState } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { activeTrialPromotion, promotionEndLabel, type TrialPromotion } from '@/lib/billing/promotions';

const NAVY = '#143152';
const GOLD = '#C9A227';
const GOLD_LIGHT = '#E5C55E';
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };
const DISMISS_KEY = 'sorma-promo-dismissed';
const DAY_MS = 24 * 60 * 60 * 1000;

function daysLeft(p: TrialPromotion, now = Date.now()): number {
  return Math.max(0, Math.ceil((p.endsAt.getTime() - now) / DAY_MS));
}

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

  const left = daysLeft(promo);
  const endShort = promo.endsAt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', timeZone: 'Africa/Johannesburg' });

  return (
    <div
      role="region"
      aria-label="Current offer"
      className="promo-band relative overflow-hidden"
      style={{ background: `linear-gradient(100deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`, color: NAVY }}
    >
      {/* A slow sheen across the band — off for reduced motion (globals via the style below). */}
      <span aria-hidden="true" className="promo-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3" />

      <div className="relative max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 pr-12 md:pr-14">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className="text-[11px] tracking-[0.12em] px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ ...MONO, background: NAVY, color: GOLD_LIGHT }}
          >
            LIMITED OFFER · {left} {left === 1 ? 'DAY' : 'DAYS'} LEFT
          </span>
          <p className="text-[22px] sm:text-[26px] leading-none font-extrabold tracking-[-0.01em]" style={DISPLAY}>
            Your first month is free.
          </p>
        </div>

        <p className="text-[13px] sm:text-sm leading-snug md:flex-1" style={{ color: NAVY }}>
          <span className="font-semibold">On every monthly plan, for new subscribers who sign up by {promotionEndLabel(promo)}.</span>{' '}
          <span className="opacity-80">Card required; billing starts in month two at the plan price and renews monthly. Cancel before then and you pay nothing.</span>
        </p>

        <a
          href="/pricing"
          className="inline-flex items-center justify-center gap-2 self-start md:self-auto whitespace-nowrap rounded-lg px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-px shadow-[0_8px_20px_-8px_rgba(20,49,82,0.6)]"
          style={{ background: NAVY, color: '#FFFFFF' }}
        >
          Claim your free month <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label={`Hide this offer (ends ${endShort})`}
        className="absolute right-2 top-2 md:top-1/2 md:-translate-y-1/2 p-2 rounded-full transition-colors hover:bg-black/10"
        style={{ color: NAVY }}
      >
        <X className="w-4 h-4" />
      </button>

      <style>{`
        .promo-sheen {
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent);
          animation: promo-sheen 5.5s ease-in-out 1s infinite;
        }
        @keyframes promo-sheen {
          0%   { transform: translateX(0); }
          45%  { transform: translateX(450%); }
          100% { transform: translateX(450%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .promo-sheen { animation: none; display: none; }
        }
      `}</style>
    </div>
  );
}

export default PromoBanner;
