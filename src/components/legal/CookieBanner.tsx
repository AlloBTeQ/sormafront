'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X, ChevronDown, ChevronUp, Shield, BarChart3, Settings2, Target } from 'lucide-react';
import {
  hasConsented,
  persistConsent,
  subscribeToConsent,
  ALLOW_ALL,
  DENY_ALL,
  type Consent,
} from '@/lib/legal/consent';

// ─── Consent state ────────────────────────────────────────────
//
// The read/write helpers used to live in this file, which is how they came to
// have no readers: the banner wrote a choice nobody consulted, while analytics
// loaded regardless. They now live in lib/legal/consent.ts (imported above),
// which is also what components/legal/Analytics.tsx reads before loading any
// third-party tag.
//
// Do not reintroduce a local copy. One writer and one reader of the same
// storage key, in two files that never met, is exactly the bug this had.

// ─── Mini toggle ──────────────────────────────────────────────

function MiniToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={e => { e.stopPropagation(); onChange(); }}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 cursor-pointer
        ${checked ? 'bg-blue-500' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200
        ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [consent, setConsent] = useState<Consent>({
    analytics: false,
    marketing: false,
    preferences: true,
  });

  // Show only if no prior consent stored.
  //
  // The subscription is registered UNCONDITIONALLY. Previously it sat in the
  // `else` branch, so a first-time visitor — the only person who ever sees this
  // banner — had no listener at all: choosing from the cookies page in another
  // tab left the banner sitting there contradicting the choice just made.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (!hasConsented()) {
      // Slight delay so it doesn't clash with page load animation
      timer = setTimeout(() => setVisible(true), 800);
    }

    const unsubscribe = subscribeToConsent(() => dismiss());

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => setVisible(false), 350);
  };

  const handleAcceptAll = () => {
    persistConsent(ALLOW_ALL);
    dismiss();
  };

  // Both the "Essential only" button and the X record an explicit refusal
  // rather than just hiding the banner. Dismissing without a decision would
  // leave consent undecided, and the banner would reappear on every page load —
  // which is how "consent fatigue" turns into a click on Accept all.
  const handleEssentialOnly = () => {
    persistConsent(DENY_ALL);
    dismiss();
  };

  const handleSaveCustom = () => {
    persistConsent(consent);
    dismiss();
  };

  const toggle = (key: keyof Consent) =>
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));

  if (!visible) return null;

  const categories: { id: keyof Consent; label: string; icon: React.ElementType; desc: string }[] = [
    // Descriptions name the actual processors. "Anonymised usage data" was not
    // true of Clarity, which records how you move through a page — describing
    // that as anonymised is the kind of detail a regulator reads closely.
    { id: 'analytics',   label: 'Analytics',    icon: BarChart3, desc: 'Google Analytics, and Microsoft Clarity on public pages' },
    { id: 'preferences', label: 'Preferences',  icon: Settings2, desc: 'Theme, currency, and locale settings'                    },
    { id: 'marketing',   label: 'Marketing',    icon: Target,    desc: 'Conversion tracking for ad campaigns'                    },
  ];

  return (
    <>
      {/* Backdrop blur overlay when expanded */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Banner */}
      <div
        className={`fixed bottom-4 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4 transition-all duration-350
          ${leaving
            ? 'opacity-0 translate-y-6 pointer-events-none'
            : 'opacity-100 translate-y-0'
          }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="true"
      >
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl shadow-slate-300/40 overflow-hidden">

          {/* ── Compact view ── */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-3">

              {/* Icon */}
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex flex-wrap items-center justify-center flex-shrink-0 mt-0.5">
                <Cookie className="w-4.5 h-4.5 text-blue-500 w-[18px] h-[18px]" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 mb-0.5"
                  style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                  We use cookies
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Essential cookies are always on. You can choose what else to allow.{' '}
                  <Link href="/legal/cookies" className="text-blue-500 hover:underline">
                    Cookie policy
                  </Link>
                </p>
              </div>

              {/* Dismiss (essential only) */}
              <button
                onClick={handleEssentialOnly}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex flex-wrap items-center justify-center transition-colors flex-shrink-0 text-slate-400 hover:text-slate-600"
                aria-label="Accept essential cookies only and close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-y-2 items-center justify-between mt-4 gap-3">
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? 'Fewer options' : 'Customise'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleEssentialOnly}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-all"
                >
                  Essential only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white text-xs font-semibold shadow-sm shadow-blue-500/25 transition-all hover:-translate-y-px"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>

          {/* ── Expanded customise panel ── */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out`}
            style={{ maxHeight: expanded ? '260px' : '0px' }}
          >
            <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">

              {/* Essential — always on */}
              <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 mb-1">
                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700">Essential</p>
                  <p className="text-[12px] md:text-[11px] text-slate-400">Login, security, and session management</p>
                </div>
                <span className="text-[12px] md:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Always on
                </span>
              </div>

              {/* Toggleable categories */}
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0"
                  >
                    <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700">{cat.label}</p>
                      <p className="text-[12px] md:text-[11px] text-slate-400">{cat.desc}</p>
                    </div>
                    <MiniToggle checked={consent[cat.id]} onChange={() => toggle(cat.id)} />
                  </div>
                );
              })}

              {/* Save custom */}
              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleSaveCustom}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all"
                >
                  Save my choices
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}