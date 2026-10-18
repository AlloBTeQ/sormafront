'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { TIERS, CURRENCIES } from '@/config/plans';
import { OFFERED_CURRENCIES } from '@/lib/plans';
import type { SupportedCurrency } from '@/config/plans';
import { checkoutHref } from '@/lib/site';

// The pricing block, shared by / (as a section) and /pricing (as the page).
// Prices come from config/plans.ts (synced from the app) — never typed here.

const NAVY = '#143152';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const EDGE = '#4B71A0';
const GOLD = '#C9A227';
const GOLD_WASH = 'rgba(201,162,39,0.10)';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };
const WRAP = 'max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12';
type BillingPeriod = 'monthly' | 'yearly';

export function PricingSection({ asPage = false }: { asPage?: boolean }) {
  const [currency, setCurrency] = useState<SupportedCurrency>('ZAR');
  const [period, setPeriod] = useState<BillingPeriod>('yearly');
  const sym = CURRENCIES[currency].symbol;

  return (
      <section id="pricing" className={asPage ? 'pt-16 pb-24 lg:pt-24' : 'py-16 lg:py-24'}>
        <div className={WRAP}>
          <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
            {React.createElement(asPage ? 'h1' : 'h2', { className: 'font-extrabold', style: { fontSize: 'clamp(30px, 3.8vw, 50px)', letterSpacing: '-0.025em' } }, 'Priced by what you run.')}
            <div className="flex flex-wrap gap-2 text-xs" style={MONO}>
              {OFFERED_CURRENCIES.length > 1 && <div className="flex" style={{ border: `1px solid ${RULE}` }}>
                {/* OFFERED_CURRENCIES, not a hand-typed list — see lib/plans.ts. */}
                {OFFERED_CURRENCIES.map(c => (
                  <button key={c} type="button" onClick={() => setCurrency(c)} aria-pressed={currency === c}
                    className="px-3 py-2.5 transition-colors"
                    style={currency === c ? { background: TEXT, color: NAVY } : { color: BODY }}>
                    {CURRENCIES[c].symbol} {c}
                  </button>
                ))}
              </div>}
              <div className="flex" style={{ border: `1px solid ${RULE}` }}>
                {(['monthly', 'yearly'] as BillingPeriod[]).map(p => (
                  <button key={p} type="button" onClick={() => setPeriod(p)} aria-pressed={period === p}
                    className="px-3 py-2.5 transition-colors"
                    style={period === p ? { background: TEXT, color: NAVY } : { color: BODY }}>
                    {p === 'monthly' ? 'Monthly' : 'Yearly −17%'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {TIERS.map(tier => {
              const isFree = tier.id === 'free';
              const featured = tier.id === 'professional';
              const price = period === 'yearly' ? tier.price.annual[currency] : tier.price.monthly[currency];
              const unit = tier.perSeat ? `/${tier.perSeat.unit}` : '';
              const per = period === 'yearly' ? '/yr' : '/mo';
              return (
                <div key={tier.id} className="p-6 flex flex-col gap-3"
                  style={{ border: `1px solid ${featured ? GOLD : RULE}`, background: featured ? GOLD_WASH : CARD }}>
                  <span className="text-xs" style={{ ...MONO, color: featured ? GOLD : MUTED }}>{tier.name.toUpperCase()}</span>
                  <span className="text-[34px] font-extrabold leading-none">
                    {isFree ? 'Free' : <>{sym}{price.toFixed(2)}<span className="text-sm font-normal" style={{ color: MUTED }}>{unit}{per}</span></>}
                  </span>
                  <span className="text-sm" style={{ color: BODY }}>{tier.tagline}</span>
                  <ul className="flex flex-col gap-1.5 my-2 text-[13px]" style={{ color: BODY }}>
                    {tier.features.slice(0, 4).map(f => (
                      <li key={f} className="flex gap-2 items-start">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />{f}
                      </li>
                    ))}
                  </ul>
                  {/* Checkout runs on the app origin — see checkoutHref in lib/site.ts. */}
                  <a href={checkoutHref(tier.id, period, currency)}
                    className="mt-auto text-center text-sm py-3.5 transition-colors"
                    style={featured
                      ? { background: GOLD, color: NAVY, fontWeight: 600 }
                      : { border: `1px solid ${EDGE}`, color: TEXT, fontWeight: 500 }}>
                    {isFree ? 'Start free' : 'Get started'}
                  </a>
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-xs" style={{ ...MONO, color: MUTED }}>
            We prepare and reconcile your returns. You submit them to the authority yourself.
          </p>
        </div>
      </section>

  );
}
