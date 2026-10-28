'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { TIERS, CURRENCIES } from '@/config/plans';
import { OFFERED_CURRENCIES, formatPrice, planFeatures } from '@/lib/plans';
import type { SupportedCurrency } from '@/config/plans';
import { checkoutHref } from '@/lib/site';

const NAVY = '#143152';
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

const CURRENCY_NOTE: Record<SupportedCurrency, string> = {
  ZAR: 'Prices are in South African rand (ZAR).',
  USD: 'Prices are in US dollars (USD).',
  KES: 'Prices are in Kenyan shillings (KES).',
  ZMW: 'Prices are in Zambian kwacha (ZMW).',
  GBP: 'Prices are in pounds sterling (GBP).',
  EUR: 'Prices are in euros (EUR).',
};

// Prices come from config/plans.ts — never type them here.
export function PricingSection({ asPage = false }: { asPage?: boolean }) {
  const [currency, setCurrency] = useState<SupportedCurrency>('ZAR');
  const [period, setPeriod] = useState<BillingPeriod>('monthly');

  return (
      <section id="pricing" className={asPage ? 'pt-16 pb-24 lg:pt-24' : 'py-16 lg:py-24'}>
        <div className={WRAP}>
          <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
            {React.createElement(asPage ? 'h1' : 'h2', { className: 'font-extrabold', style: { fontSize: 'clamp(30px, 3.8vw, 50px)', letterSpacing: '-0.025em' } }, 'Priced by what you run.')}
            <div className="flex flex-wrap gap-2 text-xs" style={MONO}>
              {OFFERED_CURRENCIES.length > 1 && <div className="flex" style={{ border: `1px solid ${RULE}` }}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {TIERS.map((tier) => {
              const isFree = tier.id === 'free';
              const featured = tier.id === 'professional';
              const price = period === 'yearly' ? tier.price.annual[currency] : tier.price.monthly[currency];
              const unit = tier.perSeat ? `/${tier.perSeat.unit}` : '';
              const per = period === 'yearly' ? '/yr' : '/mo';
              return (
                <div key={tier.id}
                  className={`relative rounded-2xl p-7 flex flex-col gap-3 overflow-hidden transition-transform duration-200 hover:-translate-y-1 ${featured ? 'lg:-translate-y-2 hover:lg:-translate-y-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]' : ''}`}
                  style={{
                    border: `1px solid ${featured ? GOLD : RULE}`,
                    background: featured ? `linear-gradient(180deg, ${GOLD_WASH}, rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.03)',
                  }}>
                  {featured && (
                    <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-1" style={{ background: GOLD }} />
                  )}
                  <div className="flex items-center justify-between gap-3 min-h-[20px]">
                    <span className="text-xs tracking-[0.08em]" style={{ ...MONO, color: featured ? GOLD : MUTED }}>{tier.name.toUpperCase()}</span>
                    {featured && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ ...MONO, color: NAVY, background: GOLD }}>Most chosen</span>}
                  </div>
                  <span className="text-[38px] font-extrabold leading-none tracking-[-0.02em]">
                    {isFree ? 'Free' : <>{formatPrice(price, currency)}<span className="text-sm font-normal tracking-normal" style={{ color: MUTED }}>{unit}{per}</span></>}
                  </span>
                  {/* Starter is a once-off trial, not a free monthly tier (owner's rule,
                      2026-10-26). Said on the card, beside the price, so nobody reads
                      "Free" next to "3 invoices" and assumes three a month. */}
                  {isFree && (
                    <span className="text-[11px] tracking-[0.06em]" style={{ ...MONO, color: GOLD }}>
                      ONCE-OFF TRIAL · PER COMPANY · NO CARD
                    </span>
                  )}
                  <span className="text-sm" style={{ color: BODY }}>{tier.tagline}</span>
                  <ul className="flex flex-col gap-2 my-3 text-[13px]" style={{ color: BODY }}>
                    {planFeatures(tier.id, currency).slice(0, 4).map(f => (
                      <li key={f} className="flex gap-2.5 items-start">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />{f}
                      </li>
                    ))}
                  </ul>
                  {featured ? (
                    <a href={checkoutHref(tier.id, period, currency)}
                      className="mt-auto text-center text-sm font-semibold py-3.5 rounded-lg transition-transform hover:-translate-y-px"
                      style={{ background: GOLD, color: NAVY }}>
                      Get started
                    </a>
                  ) : (
                    <a href={checkoutHref(tier.id, period, currency)}
                      className="mt-auto inline-flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg transition-colors hover:bg-white/5 hover:text-[#E5C55E]"
                      style={{ color: TEXT, border: `1px solid ${EDGE}` }}>
                      {isFree ? 'Start free' : 'Get started'} <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-6 text-xs" style={{ ...MONO, color: MUTED }}>
            {CURRENCY_NOTE[currency]} {OFFERED_CURRENCIES.length > 1 ? 'Your company is billed in the currency of the country it is registered in; the selector is for comparison. ' : ''}Cards in other currencies are converted by your card provider, who may charge a fee. SORMALITICS produces reports and schedules to support your tax filings — you review them, and you remain responsible for what you submit.
          </p>
        </div>
      </section>

  );
}
