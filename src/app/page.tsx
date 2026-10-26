
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { JURISDICTIONS } from '@/lib/payroll/jurisdictionStatus';
import { app } from '@/lib/site';
import { PricingSection } from '@/components/PricingSection';
import { LedgerFlow } from '@/components/LedgerFlow';
import { softwareLd, ld } from '@/lib/seo';

const NAVY = '#143152';
const DEEP = '#0E2540';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const EDGE = '#4B71A0';
const GOLD = '#C9A227';
const GOLD_SOFT = '#E5C55E';
const GOLD_WASH = 'rgba(201,162,39,0.10)';
const SHADOW = `12px 12px 0 ${DEEP}`;

const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };

const CHAIN = [
  { step: '01 · PREPARED', who: 'Payroll officer',                  meta: '14 Oct · 09:12' },
  { step: '02 · REVIEWED', who: 'Variance check',                   meta: '2 changes vs Sept · flagged' },
  { step: '03 · APPROVED', who: 'Finance manager',                  meta: '14 Oct · 15:40 · not the preparer' },
  { step: '04 · RELEASED', who: 'Payslips sent · journals posted',  meta: 'Filing schedule generated' },
];

const MODULES = [
  { title: 'Invoicing',  body: 'Quotes, invoices, credit notes, recurring schedules.' },
  { title: 'Payroll',    body: 'Runs, payslips and the schedules behind your employer filings — run ≠ release.' },
  { title: 'Accounting', body: 'Double entry, VAT and sales tax, trial balance with approval to post.' },
  { title: 'Agreements', body: 'Templates, e-signature, tamper-evident record.' },
  { title: 'Reporting',  body: 'Annual financial statements in PDF and Word.' },
];

const FINANCE_NAV = ['Dashboard', 'Invoices', 'Bills', 'Journals', 'Trial balance', 'Financial statements', 'Agreements'];

const KPIS = [
  { label: 'Receivables',       value: '312 840.00' },
  { label: 'VAT due',           value: '46 210.00' },
  { label: 'Unposted journals', value: '7' },
];

const PENDING = [
  { ref: 'JNL-0388 · Accruals October', by: 'A. Petersen' },
  { ref: 'BILL-1204 · Eskom',           by: 'M. Dlamini' },
];

const AUDIT = [
  { t: '09:12', ev: 'payroll.run.created',  meta: 'by t.nkosi' },
  { t: '11:03', ev: 'invoice.raised',       meta: 'INV-0412 · 18 400.00' },
  { t: '14:27', ev: 'journal.reviewed',     meta: 'by a.petersen' },
  { t: '15:40', ev: 'journal.approved',     meta: 'by finance.manager', key: true },
  { t: '15:41', ev: 'payroll.run.released', meta: 'by finance.manager', key: true },
  { t: '15:41', ev: 'payslips.sent',        meta: '14 of 14' },
];

const AUDIT_FILE = [
  { doc: 'Quotation → invoice', ref: 'QUO-0098 · INV-0412', proof: 'Converted, not re-typed', who: 'Accountant · 09 Oct' },
  { doc: 'Service agreement',   ref: 'A Ltd ⇄ B Ltd',        proof: 'Signed by both parties',  who: 'E-signed · 10 Oct' },
  { doc: 'Payroll run',         ref: 'PR-2026-10-004',        proof: 'Released by a second person', who: 'Finance manager · 14 Oct' },
  { doc: 'Budget vs actual',    ref: 'FY2027 · October',      proof: 'Variance explained',      who: 'Finance manager · 31 Oct' },
  { doc: 'Annual financial statements', ref: 'IFRS for SMEs', proof: 'Engagement report attached', who: 'Approved · 28 Feb' },
];

const WRAP = 'max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12';

// Server component: PricingSection is the only client island.
export default function SORMALITICSLanding() {

  const live = JURISDICTIONS.filter(j => j.status === 'live');

  return (
    <div style={{ ...DISPLAY, color: TEXT, background: NAVY }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(softwareLd) }} />

      <section aria-labelledby="intro-h">
        <div className={`${WRAP} pt-14 pb-16 lg:pt-24 lg:pb-24 grid lg:grid-cols-12 gap-12 items-center`}>
          <div className="lg:col-span-7">
            <p className="mb-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm font-bold tracking-[0.14em]">SORMALITICS</span>
              <span className="text-xs tracking-[0.06em]" style={{ ...MONO, color: GOLD }}>
                Invoicing <span style={{ color: MUTED }}>|</span> Contracting <span style={{ color: MUTED }}>|</span> Payroll <span style={{ color: MUTED }}>|</span> Financial Reporting
              </span>
            </p>
            <h1 id="intro-h" className="font-extrabold mb-7"
              style={{ fontSize: 'clamp(38px, 5.4vw, 76px)', lineHeight: 1.02, letterSpacing: '-0.03em' }}>
              Everyone&rsquo;s chasing the next R,&nbsp;$, £ and&nbsp;KSh.{' '}
              <span style={{ color: GOLD }}>We keep the records that survive scrutiny.</span>
            </h1>
            <p className="text-lg sm:text-[19px] leading-relaxed mb-5 max-w-[620px]" style={{ color: BODY }}>
              In the rush to earn, the paperwork is what gets skipped — until a quality assurer, a counterparty
              or SARS asks for it. SORMALITICS keeps invoicing, contracts, budgets, financial reporting and payroll
              connected on one ledger, with the audit trail intact from the first quote to the signed statements.
            </p>
            <p className="text-xs mb-9" style={{ ...MONO, color: MUTED }}>
              For finance teams — and for the business owner who means to keep clean books.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={app('/auth/register')} className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-semibold transition-transform hover:-translate-y-px"
                style={{ background: GOLD, color: NAVY }}>
                Start free — no card <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#flow" className="inline-flex items-center px-6 py-4 text-[15px] font-medium transition-colors hover:bg-[rgba(251,247,234,0.06)]"
                style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
                See how it flows
              </a>
            </div>
          </div>

          <div className="lg:col-span-5" style={{ background: CARD, border: `1px solid ${EDGE}`, boxShadow: SHADOW }}>
            <div className="flex justify-between gap-3 px-5 py-4 text-[11px] tracking-[0.12em]"
              style={{ ...MONO, color: MUTED, borderBottom: `1px solid ${RULE}` }}>
              <span>THE AUDIT FILE</span><span style={{ color: GOLD }}>Ready when they ask</span>
            </div>
            <ul>
              {AUDIT_FILE.map((r, i) => (
                <li key={r.doc} className="px-5 py-4 grid grid-cols-[18px_minmax(0,1fr)] gap-3"
                  style={{ borderTop: i ? `1px solid ${RULE}` : undefined }}>
                  <span aria-hidden="true" className="mt-1 w-[18px] h-[18px] rounded-full grid place-items-center text-[11px] font-bold"
                    style={{ background: GOLD, color: NAVY }}>✓</span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap justify-between gap-x-3">
                      <span className="font-semibold text-[15px]">{r.doc}</span>
                      <span className="text-[11px]" style={{ ...MONO, color: MUTED }}>{r.ref}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-x-3 mt-0.5 text-[13px]">
                      <span style={{ color: BODY }}>{r.proof}</span>
                      <span className="text-[11px]" style={{ ...MONO, color: GOLD_SOFT }}>{r.who}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ borderTop: `1px solid ${RULE}` }}>
        <div className={`${WRAP} pt-16 pb-14 lg:pt-24`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-7 text-xs"
            style={{ ...MONO, border: `1px solid ${GOLD}`, background: GOLD_WASH, color: GOLD_SOFT }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            Segregation of duties, built in
          </div>
          <h2 className="font-extrabold mb-6 max-w-[1000px]"
            style={{ fontSize: 'clamp(40px, 6vw, 84px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}>
            Nothing posts until<br />someone <span style={{ color: GOLD }}>signs for it.</span>
          </h2>
          <p className="text-lg sm:text-[19px] leading-relaxed mb-2 max-w-[600px]" style={{ color: BODY }}>
            The finance stack for teams that get audited, wherever they operate. Accountants prepare, the finance manager
            approves, payroll is run by one person and released by another — and every step is on the record.
          </p>
        </div>

        <div id="controls" className={`${WRAP} pb-16 lg:pb-24`}>
          <div style={{ border: `1px solid ${EDGE}`, background: CARD, boxShadow: SHADOW }}>
            <div className="flex flex-wrap justify-between gap-3 px-6 py-4 text-xs"
              style={{ ...MONO, borderBottom: `1px solid ${RULE}`, color: MUTED }}>
              <span>PAYROLL · PR-2026-10-004 · 14 employees · 412 880.00</span>
              <span style={{ color: GOLD }}>● Released</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {CHAIN.map((c, i) => {
                const last = i === CHAIN.length - 1;
                return (
                  <div key={c.step} className={`px-6 py-7 ${last ? '' : 'border-b lg:border-b-0 lg:border-r'}`}
                    style={{ borderColor: RULE, background: last ? GOLD_WASH : undefined }}>
                    <p className="text-[11px] tracking-[0.1em] mb-4" style={{ ...MONO, color: last ? GOLD_SOFT : MUTED }}>{c.step}</p>
                    <p className="font-semibold text-[17px] mb-1">{c.who}</p>
                    <p className="text-xs" style={{ ...MONO, color: last ? BODY : MUTED }}>{c.meta}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <LedgerFlow />

      <section id="modules" className="py-16 lg:py-24" style={{ borderTop: `1px solid ${RULE}` }}>
        <div className={WRAP}>
          <div className="flex flex-wrap justify-between items-end gap-6 mb-11">
            <h2 className="font-extrabold max-w-[620px]" style={{ fontSize: 'clamp(30px, 3.8vw, 50px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}>
              Five modules. One ledger. Each team sees its own.
            </h2>
            <p className="text-[15px] leading-relaxed max-w-[380px]" style={{ color: BODY }}>
              Payroll can&rsquo;t post a supplier invoice. Accounting never sees a payslip.
              Exco gets the executive view and nothing to break.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-px mb-10"
            style={{ background: RULE, border: `1px solid ${RULE}` }}>
            {MODULES.map((m, i) => {
              const last = i === MODULES.length - 1;
              return (
                <div key={m.title} className="px-6 py-7 min-h-[160px]"
                  style={{ background: last ? '#1F3D57' : CARD }}>
                  <p className="text-xs mb-5" style={{ ...MONO, color: GOLD }}>{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="text-xl font-semibold mb-2">{m.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: BODY }}>{m.body}</p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap" style={{ background: CARD, border: `1px solid ${EDGE}`, boxShadow: SHADOW }}>
            <div className="flex-[1_1_200px] p-5 flex flex-col gap-1 text-sm" style={{ background: '#16365A', borderRight: `1px solid ${RULE}` }}>
              <div className="text-[11px] tracking-[0.08em] px-2.5 pb-2.5" style={{ ...MONO, color: MUTED }}>FINANCE TEAM</div>
              {FINANCE_NAV.map((n, i) => (
                <div key={n} className="px-2.5 py-2"
                  style={i === 0
                    ? { background: GOLD_WASH, borderLeft: `2px solid ${GOLD}`, fontWeight: 600 }
                    : { color: BODY }}>
                  {n}
                </div>
              ))}
            </div>
            <div className="flex-[999_1_560px] min-w-0 p-6 flex flex-col gap-4">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-xl font-semibold">Good morning, Lerato</span>
                <span className="text-xs" style={{ ...MONO, color: MUTED }}>October 2026 · open period</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {KPIS.map(k => (
                  <div key={k.label} className="p-4" style={{ border: `1px solid ${RULE}` }}>
                    <div className="text-xs" style={{ color: MUTED }}>{k.label}</div>
                    <div className="text-[22px] mt-1.5" style={MONO}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ border: `1px solid ${RULE}` }}>
                <div className="px-4 py-3 text-[13px] font-semibold" style={{ background: '#16365A', borderBottom: `1px solid ${RULE}` }}>
                  Waiting for your approval
                </div>
                {PENDING.map((p, i) => (
                  <div key={p.ref} className="flex flex-wrap justify-between items-center gap-3 px-4 py-3 text-sm"
                    style={{ borderTop: i ? `1px solid ${RULE}` : undefined }}>
                    <span>{p.ref}</span>
                    <span className="text-xs" style={{ color: MUTED }}>prepared by {p.by}</span>
                    <span className="text-xs font-semibold px-3 py-1.5" style={{ background: GOLD, color: NAVY }}>Approve</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="audit" className="py-16 lg:py-24" style={{ background: DEEP }}>
        <div className={`${WRAP} grid lg:grid-cols-2 gap-12 items-center`}>
          <div>
            <p className="text-xs tracking-[0.12em] mb-3" style={{ ...MONO, color: GOLD }}>AUDIT TRAIL</p>
            <h2 className="font-extrabold mb-4" style={{ fontSize: 'clamp(30px, 3.6vw, 46px)', letterSpacing: '-0.025em', lineHeight: 1.08 }}>
              Your auditor&rsquo;s first question, already answered.
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: BODY }}>
              Who raised it, who checked it, who approved it, when. Every posting carries its trail
              into the trial balance and the financial statements.
            </p>
          </div>
          <div className="p-5 sm:p-6 text-[13px] leading-8 overflow-x-auto"
            style={{ ...MONO, background: NAVY, border: `1px solid ${RULE}` }}>
            {AUDIT.map((a, i) => (
              <div key={i} className="whitespace-nowrap grid grid-cols-[48px_200px_auto] gap-4">
                <span style={{ color: MUTED }}>{a.t}</span>
                <span style={{ color: a.key ? GOLD_SOFT : TEXT }}>{a.ev}</span>
                <span style={{ color: BODY }}>{a.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="jurisdictions" style={{ borderBottom: `1px solid ${RULE}` }}>
        <div className={`${WRAP} py-[18px] flex flex-wrap items-center justify-between gap-3 text-xs`} style={MONO}>
          <span className="tracking-[0.1em]" style={{ color: MUTED }}>PAYROLL LIVE IN</span>
          <div className="flex flex-wrap items-center gap-2">
            {live.map(j => (
              <span key={j.code} title={`${j.name} · ${j.taxAuthority}`} className="px-2.5 py-1" style={{ border: `1px solid ${GOLD}`, color: TEXT }}>
                {j.code}
              </span>
            ))}
          </div>
        </div>
      </section>

      <PricingSection />

      <section className="py-16 lg:py-24" style={{ borderTop: `1px solid ${RULE}` }}>
        <div className={WRAP}>
          <h2 className="font-extrabold mb-7" style={{ fontSize: 'clamp(36px, 5.4vw, 76px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Run it. Approve it.<br /><span style={{ color: GOLD }}>Sleep through the audit.</span>
          </h2>
          <a href={app('/auth/register')} className="inline-flex items-center gap-2 px-7 py-4 text-[15px] font-semibold"
            style={{ background: GOLD, color: NAVY }}>
            Create an account <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
