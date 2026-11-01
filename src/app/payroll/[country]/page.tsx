// /payroll/<country> — one landing page per live payroll country.
// Content: lib/payroll/countryPages.ts (every claim checked against the app).
// Calculator: the app's own engine, in the browser (components/payroll/PayCalculator).

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { COUNTRY_PAGES, countryBySlug } from '@/lib/payroll/countryPages';
import { filingNoteFor } from '@/lib/payroll/jurisdictionStatus';
import { billingCurrencyFor, formatPrice, priceFor } from '@/lib/plans';
import { PayCalculator } from '@/components/payroll/PayCalculator';
import { pageMeta, ld, BRAND } from '@/lib/seo';
import { SITE_URL, app } from '@/lib/site';

type Props = { params: Promise<{ country: string }> };

const NAVY = '#143152';
const DEEP = '#0E2540';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const GOLD = '#C9A227';
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };

export const dynamicParams = false;

export async function generateStaticParams() {
  return COUNTRY_PAGES.map(c => ({ country: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const c = countryBySlug(country);
  if (!c) return {};
  const meta = pageMeta({ path: `/payroll/${c.slug}`, title: c.title, description: c.description });
  return { ...meta, openGraph: { ...meta.openGraph, locale: `en_${c.iso}` } };
}

export default async function CountryPayrollPage({ params }: Props) {
  const { country } = await params;
  const c = countryBySlug(country);
  if (!c) notFound();

  // Billing follows the company's payroll country (app rule, 2026-10-28).
  const billing = billingCurrencyFor(c.iso === 'ZA' ? 'RSA' : c.iso);
  const proPrice = priceFor('professional', billing, 'monthly');
  const others = COUNTRY_PAGES.filter(o => o.slug !== c.slug);
  const filing = filingNoteFor(c.region);

  const faqs = [
    {
      q: `Does SORMALITICS file my ${c.name} returns?`,
      a: `No. ${filing} That keeps you in control of what is submitted in your company's name.`,
    },
    {
      q: `What does payroll software cost in ${c.name}?`,
      a: proPrice != null
        ? `Plans start at ${formatPrice(proPrice, billing)} a month on Professional, billed in ${billing}. There is a free once-off trial with no card, and a Practitioner plan for accountants running payroll for clients.`
        : `See the pricing page for current plans. There is a free once-off trial with no card.`,
    },
    {
      q: `Can an accountant run ${c.name} payroll for several clients?`,
      a: `Yes. The Practitioner plan manages each client's books and payroll separately, priced per client by the country that client's payroll runs in.`,
    },
  ];

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `${BRAND} payroll for ${c.name}`,
      url: `${SITE_URL}/payroll/${c.slug}`,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Payroll',
      operatingSystem: 'Web',
      areaServed: c.iso,
      description: c.description,
      publisher: { '@id': `${SITE_URL}/#organization` },
      ...(proPrice != null ? { offers: { '@type': 'Offer', price: proPrice.toFixed(2), priceCurrency: billing, url: `${SITE_URL}/pricing` } } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Payroll', item: `${SITE_URL}/payroll` },
        { '@type': 'ListItem', position: 2, name: c.name, item: `${SITE_URL}/payroll/${c.slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];

  return (
    <div style={{ background: NAVY, color: TEXT, ...DISPLAY }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(jsonLd) }} />

      {/* Hero + calculator */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 pt-14 pb-16 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <nav aria-label="Breadcrumb" className="text-xs mb-6" style={{ ...MONO, color: MUTED }}>
            <Link href="/payroll" className="hover:underline">Payroll</Link> <span aria-hidden="true">/</span> {c.name}
          </nav>
          <p className="text-xs tracking-[0.12em] mb-3" style={{ ...MONO, color: GOLD }}>
            {c.authority} · {c.payCurrency} · LIVE
          </p>
          <h1 className="text-[40px] sm:text-[52px] leading-[1.02] font-extrabold tracking-[-0.02em] mb-5">
            Payroll software for {c.name}
          </h1>
          <p className="text-lg leading-relaxed mb-6" style={{ color: BODY }}>{c.strapline}</p>
          <p className="text-sm leading-relaxed mb-8" style={{ color: BODY }}>
            Every run is prepared by one person and approved by another before payslips go out, with the
            schedules for your {c.authority} filings generated from the approved run.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={app('/auth/register')} className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold" style={{ background: GOLD, color: NAVY }}>
              Start free <ArrowRight className="w-4 h-4" />
            </a>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold" style={{ color: TEXT, border: `1px solid ${RULE}` }}>
              See pricing{proPrice != null ? ` — from ${formatPrice(proPrice, billing)}/mo` : ''}
            </Link>
          </div>
        </div>
        <PayCalculator region={c.region} country={c.name} currency={c.payCurrency} sampleGross={c.sampleGross} />
      </section>

      {/* What it handles */}
      <section style={{ background: DEEP }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
          <h2 className="text-3xl font-extrabold mb-10">What SORMALITICS handles for {c.name} payroll</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Panel title="On every payslip" items={c.employee} />
            {c.employer.length > 0 && <Panel title="Employer contributions and levies" items={c.employer} />}
            <Panel title="Every month" items={c.monthly} />
            {c.yearEnd.length > 0 && <Panel title="At year-end" items={c.yearEnd} />}
          </div>
          {c.localNote && <p className="mt-8 text-sm leading-relaxed max-w-3xl" style={{ color: BODY }}>{c.localNote}</p>}
          <p className="mt-4 text-sm leading-relaxed max-w-3xl" style={{ color: MUTED }}>{filing}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-16">
        <h2 className="text-3xl font-extrabold mb-8">Questions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {faqs.map(f => (
            <div key={f.q} className="rounded-xl p-6" style={{ background: CARD, border: `1px solid ${RULE}` }}>
              <h3 className="font-bold mb-2">{f.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: BODY }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other countries */}
      <section style={{ borderTop: `1px solid ${RULE}` }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-12">
          <h2 className="text-lg font-bold mb-4">Payroll in other countries</h2>
          <ul className="flex flex-wrap gap-2">
            {others.map(o => (
              <li key={o.slug}>
                <Link href={`/payroll/${o.slug}`} className="inline-block rounded-full px-3 py-1.5 text-sm hover:underline" style={{ border: `1px solid ${RULE}`, color: BODY }}>
                  {o.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl p-6" style={{ background: CARD, border: `1px solid ${RULE}` }}>
      <h3 className="text-xs tracking-[0.12em] mb-4" style={{ ...MONO, color: GOLD }}>{title.toUpperCase()}</h3>
      <ul className="space-y-2.5">
        {items.map(i => (
          <li key={i} className="flex gap-2.5 items-start text-[15px]" style={{ color: TEXT }}>
            <Check className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: GOLD }} />{i}
          </li>
        ))}
      </ul>
    </div>
  );
}
