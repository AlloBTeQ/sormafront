import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { app } from '@/lib/site';
import { JURISDICTIONS, codeList } from '@/lib/payroll/jurisdictionStatus';
import { getProductsByCategory, type ProductCategory } from '@/lib/store/product-catalog';

// ─────────────────────────────────────────────────────────────────────────────
// /services — rebuilt 18 Oct 2026 around the modules, the way they're sold:
// Accounting {quotations, invoicing, budgets, ledger & VAT, financial reporting,
// AFS}, Payroll, Agreements, Exco, Teams & controls, Practices, and the
// pay-per-document store.
//
// Every capability listed here exists in the app (checked against
// SORMALITICS/src/app/dashboard and app/api on 18 Oct 2026). The previous page
// claimed 25+ currencies, a mobile app, an API, HMRC P45s and £ prices — none
// of which a buyer could actually get. Keep it that way: if it isn't in the app,
// it isn't on this page.
//
// Server component — no state. Jurisdictions and store prices are derived.
// ─────────────────────────────────────────────────────────────────────────────

const NAVY = '#143152';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const GOLD = '#C9A227';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };
const WRAP = 'max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12';

type Capability = { name: string; body: string; tag?: string };
type Module = { id: string; n: string; name: string; line: string; usedBy: string; items: Capability[]; note?: string };

const liveCodes = JURISDICTIONS.filter(j => j.status === 'live').map(j => j.code).join(' · ');
const devCodes = codeList('in-development');

const MODULES: Module[] = [
  {
    id: 'accounting',
    n: '01',
    name: 'Accounting',
    line: 'From the first quote to signed financial statements, on one double-entry ledger.',
    usedBy: 'Finance team · finance manager approves posting',
    items: [
      { name: 'Quotations', body: 'Quotes to customers that convert to an invoice in one step — nothing re-typed.' },
      { name: 'Invoicing', body: 'Invoices, credit notes and recurring schedules, with customer statements and an accounts-receivable schedule.', tag: 'Posts itself' },
      { name: 'Budgets', body: 'The year set by account and month, then actual against budget with the variance shown.' },
      { name: 'Ledger & VAT', body: 'Chart of accounts, journals and a trial balance. Accountants prepare and review; the finance manager approves before anything posts. VAT schedules to help you complete your VAT return.' },
      { name: 'Financial reporting', body: 'Income statement, balance sheet, cash flow and changes in equity — straight from the ledger, for any period.' },
      { name: 'AFS generation', body: 'Annual financial statements under IFRS for SMEs, with notes that only show what exists and the engagement report for compiled, reviewed or audited sets. Export to PDF or Word, and work in a separate AFS workspace without touching the books.', tag: 'IFRS for SMEs' },
    ],
  },
  {
    id: 'payroll',
    n: '02',
    name: 'Payroll',
    line: 'Run it, review it, release it — and the journals post themselves.',
    usedBy: 'Payroll team · a different person releases',
    items: [
      { name: 'Employees', body: 'Employee records, with bulk upload from a template for take-on.' },
      { name: 'Payroll runs', body: 'Monthly runs with bonus and commission, a review step, and release by someone other than the person who ran it.', tag: 'Run ≠ release' },
      { name: 'Payslips', body: 'Payslips generated for every employee and sent by email when the run is released.' },
      { name: 'Filing schedules', body: 'Monthly and year-end schedules with the figures you need for your employer filings — in South Africa the EMP201, EMP501 and IRP5; the equivalents in Botswana and Zambia.', tag: liveCodes },
    ],
    note: `Payroll is live in ${liveCodes}. ${devCodes} are in development. Our reports and schedules support your filings — you review them and submit to the authority yourself.`,
  },
  {
    id: 'agreements',
    n: '03',
    name: 'Agreements',
    line: 'Contracts that sit next to the books they affect.',
    usedBy: 'Finance and payroll teams',
    items: [
      { name: 'Templates', body: 'Employment contracts, NDAs, leases and service agreements, ready to edit.' },
      { name: 'Clause builder', body: 'Write your own clauses once and reuse them across agreements.' },
      { name: 'E-signature', body: 'Multi-party signing with a time-stamped, tamper-evident record of who signed what, and when.', tag: 'Audit trail' },
    ],
  },
  {
    id: 'exco',
    n: '04',
    name: 'Exco dashboard',
    line: 'The same numbers, for the people who answer for them.',
    usedBy: 'Exco · read-only',
    items: [
      { name: 'Executive view', body: 'Revenue against budget, payroll cost and cash — updated the moment a posting is approved.' },
      { name: 'Ratios', body: 'Liquidity, profitability and efficiency ratios from the same ledger the accountants keep.' },
      { name: 'Read-only by design', body: 'Exco sees everything and can change nothing — no accidental postings from the boardroom.' },
    ],
  },
  {
    id: 'controls',
    n: '05',
    name: 'Teams & controls',
    line: 'Access follows the job, not the org chart.',
    usedBy: 'Business and Practitioner plans',
    items: [
      { name: 'Finance, Payroll and Exco teams', body: 'Invite each team after sign-up. Each gets its own dashboard and sees only its modules — payroll cannot post a supplier invoice, accounting never sees a payslip.' },
      { name: 'Segregation of duties', body: 'Preparer and approver are different people, enforced by the app rather than by policy documents.' },
      { name: 'Audit trail', body: 'Who raised it, who checked it, who approved it, and when — carried into the trial balance and the AFS.' },
    ],
  },
  {
    id: 'practices',
    n: '06',
    name: 'For practices',
    line: 'Your clients’ books, from your own login.',
    usedBy: 'Accountants and bookkeepers · Practitioner plan',
    items: [
      { name: 'Client books', body: 'Add a client, switch into their books, and run their invoicing, payroll and statements without a second login.' },
      { name: 'Priced per client', body: 'Billed per active client rather than per seat, with lower rates as the practice grows.' },
      { name: 'Processing agreement first', body: 'A written data processing agreement is in place before any client data arrives.' },
    ],
  },
];

// Pay-per-document: cheapest ZAR price per shelf, read from the store catalogue.
const SHELVES: { category: ProductCategory; label: string }[] = [
  { category: 'payslip', label: 'Payslips' },
  { category: 'invoice', label: 'Invoices' },
  { category: 'agreement', label: 'Agreements' },
  { category: 'schedule', label: 'Schedules' },
];
const fromPrice = (c: ProductCategory) => {
  const prices = getProductsByCategory(c).map(p => p.price.ZAR).filter(n => n > 0);
  return prices.length ? `from R${Math.min(...prices).toFixed(2)}` : '';
};

export default function ServicesPage() {
  return (
    <div style={{ fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif', color: TEXT, background: NAVY }}>

      {/* ── HERO ── */}
      <section>
        <div className={`${WRAP} pt-16 pb-12 lg:pt-24`}>
          <p className="text-xs tracking-[0.18em] mb-6" style={{ ...MONO, color: GOLD }}>SERVICES</p>
          <h1 className="font-extrabold mb-6 max-w-[900px]" style={{ fontSize: 'clamp(40px, 6vw, 80px)', lineHeight: 1, letterSpacing: '-0.03em' }}>
            Every module.<br /><span style={{ color: GOLD }}>One ledger.</span>
          </h1>
          <p className="text-lg sm:text-[19px] leading-relaxed max-w-[620px] mb-10" style={{ color: BODY }}>
            Accounting, payroll and agreements for the whole finance department — each team in its own
            workspace, every posting approved, every figure traceable from the invoice to the AFS.
          </p>
          {/* Jump list — also gives Google the page's structure up front */}
          <nav aria-label="Modules" className="flex flex-wrap gap-x-6 gap-y-3 text-sm" style={MONO}>
            {MODULES.map(m => (
              <a key={m.id} href={`#${m.id}`} className="py-1 transition-colors hover:text-[#E5C55E]" style={{ color: BODY }}>
                <span style={{ color: GOLD }}>{m.n}</span> {m.name}
              </a>
            ))}
            <a href="#pay-per-document" className="py-1 transition-colors hover:text-[#E5C55E]" style={{ color: BODY }}>
              <span style={{ color: GOLD }}>07</span> Pay per document
            </a>
          </nav>
        </div>
      </section>

      {/* ── MODULES ── */}
      {MODULES.map(m => (
        <section key={m.id} id={m.id} aria-labelledby={`${m.id}-h`} className="scroll-mt-20" style={{ borderTop: `1px solid ${RULE}` }}>
          <div className={`${WRAP} py-14 lg:py-20 grid lg:grid-cols-12 gap-10`}>
            <div className="lg:col-span-4">
              <p className="text-xs mb-4" style={{ ...MONO, color: GOLD }}>{m.n}</p>
              <h2 id={`${m.id}-h`} className="font-extrabold mb-4" style={{ fontSize: 'clamp(32px, 3.6vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
                {m.name}
              </h2>
              <p className="text-[17px] leading-relaxed mb-5" style={{ color: BODY }}>{m.line}</p>
              <p className="text-xs" style={{ ...MONO, color: MUTED }}>{m.usedBy}</p>
            </div>

            <div className="lg:col-span-8">
              <ul style={{ borderTop: `2px solid ${GOLD}` }}>
                {m.items.map(c => (
                  <li key={c.name} className="grid sm:grid-cols-[220px_minmax(0,1fr)] gap-x-8 gap-y-2 py-5" style={{ borderBottom: `1px solid ${RULE}` }}>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      {c.tag && <span className="text-[11px]" style={{ ...MONO, color: GOLD }}>{c.tag}</span>}
                    </div>
                    <p className="text-[15px] leading-relaxed" style={{ color: BODY }}>{c.body}</p>
                  </li>
                ))}
              </ul>
              {m.note && <p className="mt-5 text-xs leading-relaxed" style={{ ...MONO, color: MUTED }}>{m.note}</p>}
            </div>
          </div>
        </section>
      ))}

      {/* ── PAY PER DOCUMENT ── */}
      <section id="pay-per-document" aria-labelledby="ppd-h" className="scroll-mt-20" style={{ background: CARD, borderTop: `1px solid ${RULE}` }}>
        <div className={`${WRAP} py-14 lg:py-20 grid lg:grid-cols-12 gap-10`}>
          <div className="lg:col-span-4">
            <p className="text-xs mb-4" style={{ ...MONO, color: GOLD }}>07</p>
            <h2 id="ppd-h" className="font-extrabold mb-4" style={{ fontSize: 'clamp(32px, 3.6vw, 48px)', letterSpacing: '-0.025em', lineHeight: 1.05 }}>
              Pay per document
            </h2>
            <p className="text-[17px] leading-relaxed" style={{ color: BODY }}>
              Need one payslip or one invoice, not a subscription? Fill it in, preview it, pay once and download.
            </p>
          </div>
          <div className="lg:col-span-8">
            <ul style={{ borderTop: `2px solid ${GOLD}` }}>
              {SHELVES.map(s => (
                <li key={s.category} style={{ borderBottom: `1px solid ${RULE}` }}>
                  <Link href={`/store?category=${s.category}`} className="flex items-baseline justify-between gap-4 py-5 group">
                    <span className="text-lg font-semibold group-hover:text-[#E5C55E] transition-colors">{s.label}</span>
                    <span className="flex items-baseline gap-3 text-sm" style={{ ...MONO, color: BODY }}>
                      {fromPrice(s.category)} <ArrowRight className="w-4 h-4 self-center" style={{ color: GOLD }} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CLOSER ── */}
      <section style={{ borderTop: `1px solid ${RULE}` }}>
        <div className={`${WRAP} py-16 lg:py-24 flex flex-wrap items-end justify-between gap-8`}>
          <h2 className="font-extrabold max-w-[700px]" style={{ fontSize: 'clamp(32px, 4.6vw, 64px)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Bring the whole finance department in.
          </h2>
          <div className="flex flex-wrap gap-3">
            <a href={app('/auth/register')} className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-semibold" style={{ background: GOLD, color: NAVY }}>
              Start free — no card <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/pricing" className="inline-flex items-center px-6 py-4 text-[15px] font-medium underline underline-offset-[6px] decoration-1" style={{ color: TEXT, textDecorationColor: GOLD }}>
              See pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
