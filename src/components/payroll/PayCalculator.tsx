'use client';

// Free take-home-pay calculator for one country — the lead magnet on each
// /payroll/<country> page ("PAYE calculator South Africa" is among the most
// searched payroll terms there is).
//
// It runs the APP'S OWN ENGINE (lib/payroll/taxCalculations.ts, synced from
// the SORMALITICS repo by scripts/sync-from-app.mjs), in the browser, so the
// figure here is the figure a payslip in the product would show for the same
// basic salary. Loaded on demand: the engine is not in any page's first paint.
//
// Deliberately narrow: basic monthly salary only, resident employee, no
// pension, medical aid, benefits, allowances or age rebates. Said under the
// result. It is an estimate to show what the product does, not tax advice.

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { app } from '@/lib/site';

type Calc = typeof import('@/lib/payroll/taxCalculations');
type Result = ReturnType<Calc['calculatePayslip']>;

const NAVY = '#143152';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const GOLD = '#C9A227';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };

// Each country's own way of writing money: R 25 000,00 in South Africa,
// KSh 100,000.00 in Kenya, K15,000.00 in Zambia.
const LOCALE: Record<string, string> = {
  ZAR: 'en-ZA', NAD: 'en-NA', BWP: 'en-BW', SZL: 'en-SZ', LSL: 'en-LS',
  ZMW: 'en-ZM', USD: 'en-ZW', KES: 'en-KE', AOA: 'pt-AO', MZN: 'pt-MZ',
};

function money(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat(LOCALE[currency] ?? 'en-GB', { style: 'currency', currency, maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function PayCalculator({ region, country, currency, sampleGross }: {
  region: string; country: string; currency: string; sampleGross: number;
}) {
  const [engine, setEngine] = useState<Calc | null>(null);
  const [failed, setFailed] = useState(false);
  const [raw, setRaw] = useState(String(sampleGross));

  useEffect(() => {
    let live = true;
    import('@/lib/payroll/taxCalculations')
      .then(m => { if (live) setEngine(m); })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []);

  const gross = Number(String(raw).replace(/[^\d.]/g, ''));
  const result: Result | null = useMemo(() => {
    if (!engine || !Number.isFinite(gross) || gross <= 0) return null;
    try { return engine.calculatePayslip(gross, region, {}); } catch { return null; }
  }, [engine, gross, region]);

  const employerExtra = result ? Math.max(0, result.totalEmployerCost - result.grossPay) : 0;

  return (
    <div className="rounded-2xl p-6 sm:p-8" style={{ background: CARD, border: `1px solid ${RULE}`, color: TEXT }}>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-xl sm:text-2xl font-extrabold">{country} take-home pay calculator</h2>
        <span className="text-[11px] tracking-[0.1em] px-2 py-1 rounded-full" style={{ ...MONO, background: NAVY, color: GOLD }}>FREE</span>
      </div>

      <label htmlFor="gross" className="block text-sm mb-2" style={{ color: BODY }}>
        Monthly basic salary ({currency})
      </label>
      <input
        id="gross"
        inputMode="decimal"
        value={raw}
        onChange={e => setRaw(e.target.value)}
        className="w-full rounded-lg px-4 py-3 text-lg font-semibold outline-none focus:ring-2"
        style={{ background: NAVY, color: TEXT, border: `1px solid ${RULE}`, ...MONO }}
        aria-describedby="calc-note"
      />

      <div className="mt-6" aria-live="polite">
        {failed && <p style={{ color: BODY }}>The calculator could not load. Please refresh the page.</p>}
        {!failed && !engine && <p style={{ color: MUTED }}>Loading the {country} tax tables…</p>}
        {engine && !result && <p style={{ color: MUTED }}>Enter a monthly salary above zero.</p>}
        {result && (
          <>
            <dl className="divide-y" style={{ borderColor: RULE }}>
              <Row label="Gross pay" value={money(result.grossPay, currency)} />
              {result.deductionItems.map(d => (
                <Row key={d.description} label={d.description} value={`− ${money(d.amount, currency)}`} muted />
              ))}
              <Row label="Take-home pay" value={money(result.netPay, currency)} strong />
            </dl>
            {employerExtra > 0 && (
              <p className="mt-3 text-sm" style={{ color: BODY }}>
                Your cost as employer: <strong style={{ color: TEXT }}>{money(result.totalEmployerCost, currency)}</strong>{' '}
                ({money(employerExtra, currency)} in employer contributions and levies on top of gross).
              </p>
            )}
          </>
        )}
      </div>

      <p id="calc-note" className="mt-5 text-xs leading-relaxed" style={{ color: MUTED }}>
        An estimate for one resident employee on a monthly basic salary, using the current tables built into SORMALITICS.
        It leaves out pension, medical aid, benefits, allowances, age-related rebates and other reliefs. Not tax advice.
      </p>

      <a
        href={app('/auth/register')}
        className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-transform hover:-translate-y-px"
        style={{ background: GOLD, color: NAVY }}
      >
        Run this for your whole team <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

function Row({ label, value, muted, strong }: { label: string; value: string; muted?: boolean; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5" style={{ borderColor: RULE }}>
      <dt className={strong ? 'font-bold' : ''} style={{ color: muted ? BODY : TEXT }}>{label}</dt>
      <dd className={`whitespace-nowrap ${strong ? 'text-xl font-extrabold' : 'font-semibold'}`} style={{ ...MONO, color: strong ? GOLD : TEXT }}>{value}</dd>
    </div>
  );
}

export default PayCalculator;
