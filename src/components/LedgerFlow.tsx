import React from 'react';
import { ArrowRight } from 'lucide-react';
import { app } from '@/lib/site';

// ─────────────────────────────────────────────────────────────────────────────
// LedgerFlow — "SORM … ALITICS". Board G on the design canvas (18 Oct 2026),
// drawn from Mvelase's sketch: the brand name split around the whole cycle,
// budget → quote → agreement → invoice → payroll → Exco, on one gold spine.
//
// Figures are ILLUSTRATIVE and must balance — an accountant will check:
//   sale:    18 400.00 = 16 000.00 revenue + 2 400.00 VAT output (15%)
//   payroll: 412 880.00 = 334 432.80 net payable + 78 447.20 PAYE
// The agreement step sits before the invoice on purpose: revenue is recognised
// when the IFRS 15 performance obligation is satisfied, not when billed.
// ─────────────────────────────────────────────────────────────────────────────

const NAVY = '#143152';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const EDGE = '#4B71A0';
const GOLD = '#C9A227';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };
const WORD: React.CSSProperties = { fontSize: 'clamp(72px, 13vw, 184px)', fontWeight: 800, lineHeight: 0.85, letterSpacing: '-0.04em' };

type Line = { side: 'Dr' | 'Cr'; account: string; amount: string };

const SALE: Line[] = [
  { side: 'Dr', account: 'Trade receivables — B Ltd', amount: '18 400.00' },
  { side: 'Cr', account: 'Revenue',                   amount: '16 000.00' },
  { side: 'Cr', account: 'VAT output',                amount: '2 400.00' },
];

const PAYROLL: Line[] = [
  { side: 'Dr', account: 'Salaries & wages',  amount: '412 880.00' },
  { side: 'Cr', account: 'Salaries payable',  amount: '334 432.80' },
  { side: 'Cr', account: 'Employee tax payable', amount: '78 447.20' },
];

const EXCO = [
  { label: 'Revenue vs budget · YTD', value: '94%', bar: 94 },
  { label: 'Payroll cost · October',  value: '412 880.00' },
  { label: 'Receivables outstanding', value: '312 840.00' },
];

// The dot on the spine. Offset matches the list's padding-left so it sits on the line.
function Node({ filled = false }: { filled?: boolean }) {
  return (
    <span aria-hidden="true" className="absolute top-7 w-3.5 h-3.5 rounded-full"
      style={{
        left: 'calc(-1 * clamp(20px, 3.4vw, 52px) - 8px)',
        background: filled ? GOLD : NAVY,
        border: `2px solid ${GOLD}`,
      }} />
  );
}

function StepHead({ n, title, sub, who, onLight = false }: { n: string; title: string; sub: string; who?: string; onLight?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between items-baseline gap-4">
      <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1">
        <span className="text-xs" style={{ ...MONO, color: onLight ? '#8A6A34' : GOLD }}>{n}</span>
        <h3 className="text-[26px] font-bold">{title}</h3>
        <span className="text-[15px]" style={{ color: onLight ? '#4A5562' : BODY }}>{sub}</span>
      </div>
      {who && (
        <span className="text-xs px-2.5 py-1.5" style={{ ...MONO, border: `1px solid ${onLight ? '#D9CFB3' : RULE}`, color: onLight ? '#4A5562' : '#C3D4E6' }}>
          {who}
        </span>
      )}
    </div>
  );
}

function Journal({ lines }: { lines: Line[] }) {
  const cols = 'grid grid-cols-[44px_minmax(0,1fr)_150px_150px] gap-3 py-2.5';
  return (
    <div className="overflow-x-auto mt-[18px]" style={{ borderTop: `1px solid ${RULE}` }}>
      <div className="min-w-[520px] text-sm" style={MONO} role="table" aria-label="Journal entry">
        <div role="row" className={`${cols} text-[11px] tracking-[0.1em]`} style={{ color: MUTED, borderBottom: `1px solid ${RULE}` }}>
          <span role="columnheader" />
          <span role="columnheader">ACCOUNT</span>
          <span role="columnheader" className="text-right">DEBIT</span>
          <span role="columnheader" className="text-right">CREDIT</span>
        </div>
        {lines.map((l, i) => {
          const cr = l.side === 'Cr';
          const last = i === lines.length - 1;
          return (
            <div role="row" key={l.account} className={cols} style={last ? { borderBottom: `3px double ${EDGE}` } : undefined}>
              <span role="cell" style={{ color: GOLD, paddingLeft: cr ? 20 : 0 }}>{l.side}</span>
              <span role="cell" style={{ paddingLeft: cr ? 32 : 0 }}>{l.account}</span>
              <span role="cell" className="text-right">{cr ? '' : l.amount}</span>
              <span role="cell" className="text-right">{cr ? l.amount : ''}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LedgerFlow() {
  const card: React.CSSProperties = { background: CARD, border: `1px solid ${RULE}` };

  return (
    <section id="flow" aria-labelledby="flow-heading" style={{ background: NAVY, color: TEXT, borderTop: `1px solid ${RULE}` }}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-16 lg:py-24">

        {/* SORM */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div aria-hidden="true" style={WORD}>SORM</div>
          <div className="max-w-[420px] pb-3">
            <h2 id="flow-heading" className="text-xs tracking-[0.18em] mb-2.5 font-normal" style={{ ...MONO, color: GOLD }}>HOW IT FLOWS</h2>
            <p className="text-[19px] leading-relaxed" style={{ color: BODY }}>
              Everything between the first budget and the board pack happens in one ledger — and every
              step ends in a journal someone signed for.
            </p>
          </div>
        </div>

        {/* The spine */}
        <ol className="my-10 flex flex-col gap-5 list-none"
          style={{
            marginLeft: 'clamp(8px, 2.4vw, 36px)',
            borderLeft: `2px solid ${GOLD}`,
            paddingLeft: 'clamp(20px, 3.4vw, 52px)',
          }}>

          <li className="relative rounded-[14px] px-[26px] py-[22px]" style={card}>
            <Node />
            <StepHead n="01" title="Budgeting" sub="The year set by account and month" who="Finance manager" />
          </li>

          <li className="relative rounded-[14px] px-[26px] py-[22px]" style={card}>
            <Node />
            <StepHead n="02" title="Quotation" sub="QUO-0098 to B Ltd · 18 400.00" who="Accountant" />
          </li>

          <li className="relative rounded-[14px] px-[26px] py-6" style={{ background: CARD, border: `1px solid ${GOLD}` }}>
            <Node filled />
            <StepHead n="03" title="Agreement" sub="e-signed by both parties, kept with its audit trail" />
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3.5 items-center mt-[18px]">
              {[['SUPPLIER', 'A Ltd'], null, ['CUSTOMER', 'B Ltd']].map((p, i) =>
                p ? (
                  <div key={p[1]} className="p-4 rounded-[10px] text-center" style={{ border: `1px solid ${RULE}` }}>
                    <div className="text-[11px] mb-1" style={{ ...MONO, color: MUTED }}>{p[0]}</div>
                    <div className="text-xl font-bold">{p[1]}</div>
                  </div>
                ) : (
                  <span key={i} aria-label="contracts with" className="text-lg" style={{ ...MONO, color: GOLD }}>⇄</span>
                ),
              )}
            </div>
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5 px-4 py-3 rounded-[10px]" style={{ background: 'rgba(201,162,39,0.12)' }}>
              <span className="text-xs font-medium px-2 py-1" style={{ ...MONO, background: GOLD, color: NAVY }}>IFRS 15</span>
              <span className="text-[15px]">Performance obligation satisfied — revenue is recognised, not before.</span>
            </div>
          </li>

          <li className="relative rounded-[14px] px-[26px] py-6" style={card}>
            <Node />
            <StepHead n="04" title="Invoice" sub="INV-0412 raised to B Ltd · posts itself" who="Posted on approval" />
            <Journal lines={SALE} />
          </li>

          <li className="relative rounded-[14px] px-[26px] py-6" style={card}>
            <Node />
            <StepHead n="05" title="Payroll · A Ltd" sub="October run · 14 employees" who="Run by payroll · released by finance" />
            <Journal lines={PAYROLL} />
            <p className="mt-3.5 text-xs" style={{ ...MONO, color: MUTED }}>
              A filing schedule is generated from the approved run — you review it and submit to the tax authority yourself.
            </p>
          </li>

          <li className="relative rounded-[14px] px-[26px] py-6" style={{ background: TEXT, color: NAVY }}>
            <Node filled />
            <StepHead n="06" title="Exco dashboard" sub="the same numbers, read-only, the moment they post" who="Exco · read-only" onLight />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-[18px]">
              {EXCO.map(k => (
                <div key={k.label} className="p-4 rounded-[10px] bg-white" style={{ border: '1px solid #E4DCC6' }}>
                  <div className="text-[13px]" style={{ color: '#5F6670' }}>{k.label}</div>
                  <div className="text-2xl mt-1.5" style={MONO}>{k.value}</div>
                  {k.bar !== undefined && (
                    <div className="h-1.5 mt-2.5 rounded-full" style={{ background: '#EFE8D6' }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${k.bar}%`, background: GOLD }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </li>
        </ol>

        {/* ALITICS */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div aria-hidden="true" style={{ ...WORD, color: GOLD }}>ALITICS</div>
          <div className="max-w-[420px] pt-3">
            <p className="text-[19px] leading-relaxed mb-5" style={{ color: BODY }}>
              Budget, quote, agree, invoice, pay, report. Six steps, one set of books — and nothing
              re-typed between them.
            </p>
            <a href={app('/auth/register')} className="inline-flex items-center gap-2 px-[26px] py-[15px] text-[15px] font-semibold"
              style={{ background: GOLD, color: NAVY }}>
              Start free — no card <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LedgerFlow;
