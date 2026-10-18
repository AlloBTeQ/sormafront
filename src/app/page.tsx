'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { JURISDICTIONS, codeList } from '@/lib/payroll/jurisdictionStatus';
import { app } from '@/lib/site';
import { PricingSection } from '@/components/PricingSection';
import { LedgerFlow } from '@/components/LedgerFlow';

// ─────────────────────────────────────────────────────────────────────────────
// Landing — direction F, chosen 16 Oct 2026 from five proposals.
//
//   Content & nav:  "Control Room" (B) — segregation of duties is the pitch.
//   Ground:         brand ink #143152, full bleed. Parchment type, aurum accent.
//   Type:           Outfit (--font-syne) + DM Mono (--font-dm-mono), as A.
//   Dashboard:      the Finance-team panel from "The Workspace" (E).
//
// Everything that is a public CLAIM is derived, not typed: jurisdictions from
// lib/payroll/jurisdictionStatus.ts, plans and prices from config/plans.ts.
// The approval chain, dashboard and audit log are illustrative product shots.
// ─────────────────────────────────────────────────────────────────────────────

const NAVY = '#143152';        // page ground
const DEEP = '#0E2540';        // the one deeper band (audit trail) + offset shadow
const CARD = '#183A5F';        // raised surfaces
const TEXT = '#FBF7EA';        // parchment
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const EDGE = '#4B71A0';        // strong border (the old ink rule)
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
  { step: '04 · RELEASED', who: 'Payslips sent · journals posted',  meta: 'EMP201 prepared for eFiling' },
];

const MODULES = [
  { title: 'Invoicing',  body: 'Quotes, invoices, credit notes, recurring schedules.' },
  { title: 'Payroll',    body: 'Runs, payslips, EMP201 and IRP5 — run ≠ release.' },
  { title: 'Accounting', body: 'Double entry, VAT, trial balance with approval to post.' },
  { title: 'Agreements', body: 'Templates, e-signature, tamper-evident record.' },
  { title: 'Reporting',  body: 'Annual financial statements in PDF and Word.' },
];

const FINANCE_NAV = ['Dashboard', 'Invoices', 'Bills', 'Journals', 'Trial balance', 'Financial statements', 'Agreements'];

const KPIS = [
  { label: 'Receivables',       value: 'R 312 840' },
  { label: 'VAT201 due',        value: 'R 46 210' },
  { label: 'Unposted journals', value: '7' },
];

const PENDING = [
  { ref: 'JNL-0388 · Accruals October', by: 'A. Petersen' },
  { ref: 'BILL-1204 · Eskom',           by: 'M. Dlamini' },
];

// `key` flags the approve/release events, which the log picks out in aurum.
const AUDIT = [
  { t: '09:12', ev: 'payroll.run.created',  meta: 'by t.nkosi' },
  { t: '11:03', ev: 'invoice.raised',       meta: 'INV-0412 · R 18 400.00' },
  { t: '14:27', ev: 'journal.reviewed',     meta: 'by a.petersen' },
  { t: '15:40', ev: 'journal.approved',     meta: 'by finance.manager', key: true },
  { t: '15:41', ev: 'payroll.run.released', meta: 'by finance.manager', key: true },
  { t: '15:41', ev: 'payslips.sent',        meta: '14 of 14' },
];

const WRAP = 'max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12';

export default function SORMALITICSLanding() {


  const live = JURISDICTIONS.filter(j => j.status === 'live');
  const inDev = codeList('in-development');

  return (
    <div style={{ ...DISPLAY, color: TEXT, background: NAVY }}>

      {/* ── HERO ── */}
      <section>
        <div className={`${WRAP} pt-16 pb-14 lg:pt-28`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-7 text-xs"
            style={{ ...MONO, border: `1px solid ${GOLD}`, background: GOLD_WASH, color: GOLD_SOFT }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
            Segregation of duties, built in
          </div>
          <h1 className="font-extrabold mb-6 max-w-[1000px]"
            style={{ fontSize: 'clamp(42px, 6.6vw, 92px)', lineHeight: 0.98, letterSpacing: '-0.03em' }}>
            Nothing posts until<br />someone <span style={{ color: GOLD }}>signs for it.</span>
          </h1>
          <p className="text-lg sm:text-[19px] leading-relaxed mb-9 max-w-[600px]" style={{ color: BODY }}>
            The finance stack for teams that get audited. Accountants prepare, the finance manager
            approves, payroll is run by one person and released by another — and every step is on the record.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={app('/auth/register')} className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-semibold transition-transform hover:-translate-y-px"
              style={{ background: GOLD, color: NAVY }}>
              Start free — no card <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/contact" className="inline-flex items-center px-6 py-4 text-[15px] font-medium transition-colors hover:bg-[rgba(251,247,234,0.06)]"
              style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
              Book a walkthrough
            </a>
          </div>
        </div>

        {/* Approval chain */}
        <div id="controls" className={`${WRAP} pb-16 lg:pb-24`}>
          <div style={{ border: `1px solid ${EDGE}`, background: CARD, boxShadow: SHADOW }}>
            <div className="flex flex-wrap justify-between gap-3 px-6 py-4 text-xs"
              style={{ ...MONO, borderBottom: `1px solid ${RULE}`, color: MUTED }}>
              <span>PAYROLL · PR-2026-10-004 · 14 employees · R 412 880.00</span>
              <span style={{ color: GOLD }}>● Released</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {CHAIN.map((c, i) => {
                const last = i === CHAIN.length - 1;
                return (
                  <div key={c.step} className={`px-6 py-7 ${last ? '' : 'border-b lg:border-b-0 lg:border-r'}`}
                    style={{ borderColor: RULE, background: last ? GOLD_WASH : undefined }}>
                    <p className="text-[11px] tracking-[0.1em] mb-4" style={{ ...MONO, color: last ? GOLD : MUTED }}>{c.step}</p>
                    <p className="font-semibold text-[17px] mb-1">{c.who}</p>
                    <p className="text-xs" style={{ ...MONO, color: MUTED }}>{c.meta}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── SORM … ALITICS — the whole cycle on one spine (board G) ── */}
      <LedgerFlow />

      {/* ── MODULES + FINANCE-TEAM DASHBOARD ── */}
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

          {/* Illustrative Finance-team dashboard */}
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

      {/* ── AUDIT TRAIL — the one deeper band ── */}
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

      {/* ── JURISDICTIONS — one quiet line. Derived; do not hand-type. ── */}
      <section id="jurisdictions" style={{ borderBottom: `1px solid ${RULE}` }}>
        <div className={`${WRAP} py-[18px] flex flex-wrap items-center justify-between gap-3 text-xs`} style={MONO}>
          <span className="tracking-[0.1em]" style={{ color: MUTED }}>PAYROLL LIVE IN</span>
          <div className="flex flex-wrap items-center gap-2">
            {live.map(j => (
              <span key={j.code} title={`${j.name} · ${j.taxAuthority}`} className="px-2.5 py-1" style={{ border: `1px solid ${GOLD}`, color: TEXT }}>
                {j.code}
              </span>
            ))}
            {inDev && (
              <span className="pl-1.5" style={{ color: MUTED }}>· {inDev.split(' · ').join(', ')} in development</span>
            )}
          </div>
        </div>
      </section>

      <PricingSection />

      {/* ── CLOSER ── */}
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
