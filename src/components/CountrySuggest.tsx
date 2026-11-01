'use client';

// "Running payroll in Kenya? → Kenya payroll and a free calculator."
//
// A suggestion, never a redirect: Google indexes every country page and
// sends searchers to the right one itself; forcing location redirects would
// hide pages from the crawler and annoy anyone looking at another country
// (an accountant in Johannesburg checking a Zambian client's payroll).
// Shown on the home, hub and pricing pages; dismissible for the session.
// Rendered after mount — the static HTML never carries it.

import React, { useEffect, useState } from 'react';
import { ArrowRight, MapPin, X } from 'lucide-react';
import { likelyCountry, type LikelyCountry } from '@/lib/geo/likelyCountry';

const DEEP = '#0E2540';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const RULE = '#2B4A70';
const GOLD = '#C9A227';
const KEY = 'sorma-country-suggest-dismissed';

export function CountrySuggest() {
  const [guess, setGuess] = useState<LikelyCountry | null>(null);

  useEffect(() => {
    let dismissed = false;
    try { dismissed = window.sessionStorage.getItem(KEY) === '1'; } catch { /* storage blocked */ }
    if (!dismissed) setGuess(likelyCountry());
  }, []);

  if (!guess) return null;
  const { primary, others } = guess;

  const dismiss = () => {
    try { window.sessionStorage.setItem(KEY, '1'); } catch { /* storage blocked */ }
    setGuess(null);
  };

  return (
    <div role="complementary" aria-label="Payroll for your country" style={{ background: DEEP, borderBottom: `1px solid ${RULE}`, color: TEXT }}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-2.5 pr-12 relative flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <MapPin className="w-4 h-4 shrink-0" style={{ color: GOLD }} aria-hidden="true" />
        <span style={{ color: BODY }}>Running payroll in {primary.name}?</span>
        <a href={`/payroll/${primary.slug}`} className="inline-flex items-center gap-1.5 font-semibold hover:underline" style={{ color: GOLD }}>
          {primary.name} payroll and a free take-home pay calculator <ArrowRight className="w-3.5 h-3.5" />
        </a>
        {others.length > 0 && (
          <span className="text-xs" style={{ color: BODY }}>
            Also:{' '}
            {others.map((o, i) => (
              <React.Fragment key={o.slug}>
                {i > 0 && ', '}
                <a href={`/payroll/${o.slug}`} className="underline underline-offset-2 hover:text-white">{o.name}</a>
              </React.Fragment>
            ))}
          </span>
        )}
        <button type="button" onClick={dismiss} aria-label="Hide this suggestion"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10" style={{ color: BODY }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default CountrySuggest;
