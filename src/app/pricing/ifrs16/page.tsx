'use client';

// The IFRS 16 Module, chosen by side (owner, 2026-11-22): Lessee, Lessor, or
// both. Each side has its own tier by the leases held on that side, so "both"
// is two pickers and the sum of the two — never a fixed double price.
//
// The same page as the app's /pricing/ifrs16 (sormalitics: src/app/pricing/
// ifrs16/page.tsx); prices from config/addons.ts, which mirrors the app's
// catalogue. Buying hands off to the app; a side that is not on sale yet takes
// a "tell me when" instead of money (LEASE_SIDE_ON_SALE).
import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { app } from '@/lib/site';
import {
  LEASE_SIDE_ON_SALE, LEASE_TIERS, addonMoney, isAddonCurrency, leaseSidePrice,
  type AddonCurrency, type LeaseSide, type LeaseTier,
} from '@/config/addons';

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
const CARD: React.CSSProperties = { border: `1px solid ${RULE}`, background: 'rgba(255,255,255,0.03)' };
const SUPPORT = 'support@sormalitics.com';

type Choice = 'lessee' | 'lessor' | 'both';
const CURRENCIES: AddonCurrency[] = ['ZAR', 'USD', 'KES', 'ZMW', 'GBP'];

const OPTIONS: { id: Choice; title: string; blurb: string }[] = [
  { id: 'lessee', title: 'Lessee', blurb: 'You rent the asset. Right-of-use assets, lease liabilities, depreciation and interest.' },
  { id: 'lessor', title: 'Lessor', blurb: 'You let the asset out. Finance and operating leases, lease income and expected credit losses.' },
  { id: 'both', title: 'Both', blurb: 'You rent and you let out — and the only way to account for a sublease.' },
];

const LESSEE_POINTS = [
  'Lessee leases: rent escalations, CPI, rate, term and payment changes',
  'Monthly journals to the trial balance with a plan; balance report and trend on its own',
  'Remeasured going forward — reported months are never rewritten',
  'Take-on balances as at the day the module is taken',
  'Every change kept with who made it and when',
];
const LESSOR_POINTS = [
  'Finance leases: net investment, finance income at the rate implicit in the lease',
  'Operating leases: straight-line income through rent-free periods and escalations',
  'Manufacturer and dealer leases: selling profit at commencement',
  'Expected credit losses on lease receivables (IFRS 9 simplified approach)',
  'Monthly journals to the trial balance with a plan; leased-out depreciation in its own sub-accounts',
  'Subleases, when you also hold the Lessee side',
];

const tierLabel = (t: LeaseTier) => LEASE_TIERS.find(x => x.value === t)!.label;

function TierPicker({ side, value, onChange, cur }: { side: LeaseSide; value: LeaseTier; onChange: (t: LeaseTier) => void; cur: AddonCurrency }) {
  const price = leaseSidePrice(value, cur);
  return (
    <fieldset className="rounded-2xl p-6" style={CARD}>
      <legend className="px-2 text-xs tracking-[0.08em]" style={{ ...MONO, color: GOLD }}>
        {side === 'lessee' ? 'LEASES YOU HOLD AS LESSEE' : 'LEASES YOU HOLD AS LESSOR'}
      </legend>
      <div className="grid grid-cols-3 text-sm" style={{ border: `1px solid ${RULE}` }}>
        {LEASE_TIERS.map(t => (
          <label key={t.value} className="cursor-pointer px-2 py-3 text-center font-semibold transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-[#E5C55E]"
            style={value === t.value ? { background: TEXT, color: NAVY } : { color: BODY }}>
            <input type="radio" name={`tier-${side}`} value={t.value} checked={value === t.value} onChange={() => onChange(t.value)} className="sr-only" />
            {t.label}
          </label>
        ))}
      </div>
      <p className="mt-4 text-sm" style={{ color: BODY }}>
        {price == null
          ? 'Quoted — we price this with you.'
          : <><span className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: TEXT }}>{addonMoney(price, cur)}</span> per month</>}
      </p>
    </fieldset>
  );
}

export default function Ifrs16ModulePage() {
  const [cur, setCur] = useState<AddonCurrency>('ZAR');
  const [choice, setChoice] = useState<Choice>('lessee');
  const [lessee, setLessee] = useState<LeaseTier>(10);
  const [lessor, setLessor] = useState<LeaseTier>(10);

  // /pricing/ifrs16?side=both&currency=KES — handed on from the pricing page. Read after mount (static export).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = (q.get('currency') ?? '').toUpperCase();
    if (isAddonCurrency(c)) setCur(c);
    const s = q.get('side');
    if (s === 'lessee' || s === 'lessor' || s === 'both') setChoice(s);
  }, []);

  const hasLessee = choice !== 'lessor';
  const hasLessor = choice !== 'lessee';
  const pLessee = hasLessee ? leaseSidePrice(lessee, cur) : 0;
  const pLessor = hasLessor ? leaseSidePrice(lessor, cur) : 0;
  const quoted = pLessee == null || pLessor == null;
  const total = quoted ? null : (pLessee ?? 0) + (pLessor ?? 0);
  const from = leaseSidePrice(10, cur)!;

  const picked = [hasLessee ? `Lessee: ${tierLabel(lessee)} leases` : '', hasLessor ? `Lessor: ${tierLabel(lessor)} leases` : ''].filter(Boolean).join('; ');
  const mail = (subject: string) => `mailto:${SUPPORT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${picked}. Billing currency: ${cur}.`)}`;
  // The app's /pricing opens the pay-first dialog with this tier: no account needed.
  const buyLessee = app(`/pricing?addon=leases&leases=${lessee}&currency=${cur}`);
  const lesseeBuyable = LEASE_SIDE_ON_SALE.lessee && lessee !== 26;
  const waiting = [hasLessee && !LEASE_SIDE_ON_SALE.lessee ? 'Lessee' : '', hasLessor && !LEASE_SIDE_ON_SALE.lessor ? 'Lessor' : ''].filter(Boolean);
  const canBuyAll = !quoted && waiting.length === 0 && !hasLessor; // both sides in one hand-off comes with the lessor checkout

  const primary = 'mt-5 inline-flex w-full items-center justify-center gap-2 py-3 px-4 text-sm font-bold rounded-lg transition-opacity hover:opacity-90';
  const secondary = 'mt-5 inline-flex w-full items-center justify-center gap-2 py-3 px-4 text-sm font-semibold rounded-lg transition-colors hover:bg-white/5 hover:text-[#E5C55E]';

  return (
    <div style={{ color: TEXT, background: NAVY, fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' }}>
      <section className={`${WRAP} py-16 md:py-20`}>
        <a href={`/pricing?currency=${cur}`} className="text-xs tracking-[0.08em] hover:text-[#E5C55E]" style={{ ...MONO, color: MUTED }}>← ALL PLANS AND ADD-ONS</a>
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs tracking-[0.08em]" style={{ ...MONO, color: GOLD }}>ADD-ON</span>
            <h1 className="mt-2 text-[40px] md:text-[52px] font-extrabold leading-[1.05] tracking-[-0.03em]">IFRS 16 Module</h1>
            <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed" style={{ color: BODY }}>
              Lease accounting an auditor can follow: every figure traced to the contract, every change kept, reported months never rewritten.
              Take the side you need. On its own or with any plan.
            </p>
          </div>
          <div className="flex text-xs self-start md:self-auto" role="group" aria-label="Currency" style={{ ...MONO, border: `1px solid ${RULE}` }}>
            {CURRENCIES.map(c => (
              <button key={c} type="button" aria-pressed={cur === c} onClick={() => setCur(c)} className="px-3 py-2 transition-colors"
                style={cur === c ? { background: TEXT, color: NAVY } : { color: BODY }}>{c}</button>
            ))}
          </div>
        </div>

        <div role="radiogroup" aria-label="Which side of the lease are you on?" className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {OPTIONS.map(o => {
            const on = choice === o.id;
            const soon = (o.id !== 'lessor' && !LEASE_SIDE_ON_SALE.lessee) || (o.id !== 'lessee' && !LEASE_SIDE_ON_SALE.lessor);
            return (
              <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => setChoice(o.id)}
                className="rounded-2xl p-6 flex flex-col gap-2 text-left transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E5C55E]"
                style={on ? { border: `1px solid ${GOLD}`, background: GOLD_WASH } : CARD}>
                <span className="flex items-center justify-between gap-3">
                  <span className="text-lg font-bold">{o.title}</span>
                  {soon && <span className="text-[10px] tracking-[0.08em] px-2 py-1 rounded" style={{ ...MONO, color: MUTED, border: `1px solid ${RULE}` }}>COMING SOON</span>}
                </span>
                <span className="text-[13px] flex-1" style={{ color: BODY }}>{o.blurb}</span>
                <span className="mt-2 text-[13px]" style={{ color: MUTED }}>
                  From <span className="font-bold" style={{ color: TEXT }}>{addonMoney(o.id === 'both' ? from * 2 : from, cur)}</span> per month
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="flex flex-col gap-4">
            {hasLessee && <TierPicker side="lessee" value={lessee} onChange={setLessee} cur={cur} />}
            {hasLessor && <TierPicker side="lessor" value={lessor} onChange={setLessor} cur={cur} />}
            <ul className="flex flex-col gap-1.5 text-[13px]" style={{ color: BODY }}>
              <li>Each side is counted on its own: leases you hold as lessee never use up your lessor tier, or the other way round.</li>
              <li>A lease with more than 20 years still to run counts as two. Ended leases stop counting.</li>
              {choice === 'lessor' && <li>A sublease is carved from a lease you hold as lessee, so it needs both sides.</li>}
              <li>Charged monthly in your company&apos;s billing currency, from the day you take it. Move tier at any time in Billing.</li>
            </ul>
          </div>

          <aside className="rounded-2xl p-6 h-fit" style={CARD}>
            <span className="text-xs tracking-[0.08em]" style={{ ...MONO, color: GOLD }}>YOUR MODULE</span>
            <dl className="mt-4 flex flex-col gap-2 text-sm">
              {hasLessee && <div className="flex justify-between gap-4"><dt style={{ color: BODY }}>Lessee · {tierLabel(lessee)}</dt><dd className="font-semibold">{pLessee == null ? 'Quoted' : addonMoney(pLessee, cur)}</dd></div>}
              {hasLessor && <div className="flex justify-between gap-4"><dt style={{ color: BODY }}>Lessor · {tierLabel(lessor)}</dt><dd className="font-semibold">{pLessor == null ? 'Quoted' : addonMoney(pLessor, cur)}</dd></div>}
            </dl>
            <p className="mt-4 pt-4 text-[34px] font-extrabold leading-none tracking-[-0.02em]" style={{ borderTop: `1px solid ${RULE}` }} aria-live="polite">
              {total == null ? 'Quoted' : addonMoney(total, cur)}
              {total != null && <span className="text-sm font-normal tracking-normal" style={{ color: MUTED }}> per month</span>}
            </p>

            {quoted ? (
              <a href={mail('IFRS 16 Module — more than 25 leases')} className={primary} style={{ background: GOLD, color: NAVY }}>Talk to us <span aria-hidden="true">→</span></a>
            ) : canBuyAll ? (
              <a href={buyLessee} className={primary} style={{ background: GOLD, color: NAVY }}>Get the module <span aria-hidden="true">→</span></a>
            ) : (
              <>
                <a href={mail(`IFRS 16 Module — tell me when ${waiting.join(' and ') || 'Lessor'} ${waiting.length === 2 ? 'open' : 'opens'}`)} className={secondary} style={{ color: TEXT, border: `1px solid ${EDGE}` }}>
                  Tell me when {waiting.join(' and ') || 'Lessor'} {waiting.length === 2 ? 'open' : 'opens'}
                </a>
                <p className="mt-3 text-[11px]" style={{ ...MONO, color: MUTED }}>
                  {waiting.length === 2 ? 'Both sides are being finished and are not on sale yet.' : `The ${waiting[0] ?? 'Lessor'} side is being finished and is not on sale yet.`}
                </p>
                {choice === 'both' && lesseeBuyable && (
                  <>
                    <a href={buyLessee} className={primary} style={{ background: GOLD, color: NAVY }}>Start with Lessee now <span aria-hidden="true">→</span></a>
                    <p className="mt-2 text-[11px]" style={{ ...MONO, color: MUTED }}>The two sides are separate tiers, so adding Lessor later costs the same as taking both together.</p>
                  </>
                )}
              </>
            )}
          </aside>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
          {hasLessee && (
            <div>
              <h2 className="text-lg font-bold">Lessee</h2>
              <ul className="mt-3 flex flex-col gap-2 text-[13px]" style={{ color: BODY }}>
                {LESSEE_POINTS.map(p => <li key={p} className="flex gap-2.5 items-start"><Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />{p}</li>)}
              </ul>
            </div>
          )}
          {hasLessor && (
            <div>
              <h2 className="text-lg font-bold">Lessor{!LEASE_SIDE_ON_SALE.lessor && <span className="ml-2 text-sm font-normal" style={{ color: MUTED }}>— what it will cover</span>}</h2>
              <ul className="mt-3 flex flex-col gap-2 text-[13px]" style={{ color: BODY }}>
                {LESSOR_POINTS.map(p => <li key={p} className="flex gap-2.5 items-start"><Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: GOLD }} />{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
