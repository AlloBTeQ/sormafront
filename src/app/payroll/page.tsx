// /payroll — the hub for the country pages.
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { COUNTRY_PAGES } from '@/lib/payroll/countryPages';
import { pageMeta } from '@/lib/seo';

const NAVY = '#143152';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const RULE = '#2B4A70';
const GOLD = '#C9A227';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };

export const metadata: Metadata = pageMeta({
  path: '/payroll',
  title: 'Payroll Software for Southern & East Africa — 10 Countries',
  description: 'Payroll for South Africa, Botswana, Namibia, Eswatini, Lesotho, Zambia, Zimbabwe, Angola, Mozambique and Kenya — each country’s taxes on every payslip and the schedules for its filings. Free take-home pay calculators.',
});

const GROUPS: { key: 'sadc' | 'east-africa'; title: string }[] = [
  { key: 'sadc', title: 'Southern Africa (SADC)' },
  { key: 'east-africa', title: 'East Africa' },
];

export default function PayrollHub() {
  return (
    <div style={{ background: NAVY, color: TEXT, fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' }}>
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 pt-14 pb-20">
        <h1 className="text-[40px] sm:text-[52px] leading-[1.02] font-extrabold tracking-[-0.02em] mb-4">Payroll, country by country</h1>
        <p className="text-lg max-w-2xl mb-12" style={{ color: BODY }}>
          Each country’s taxes on every payslip, the schedules for its filings from the approved run, and a free calculator to see the numbers first.
        </p>
        {GROUPS.map(g => (
          <div key={g.key} className="mb-12">
            <h2 className="text-xs tracking-[0.12em] mb-4" style={{ ...MONO, color: GOLD }}>{g.title.toUpperCase()}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COUNTRY_PAGES.filter(c => c.group === g.key).map(c => (
                <Link key={c.slug} href={`/payroll/${c.slug}`} className="group rounded-xl p-5 transition-transform hover:-translate-y-0.5" style={{ background: CARD, border: `1px solid ${RULE}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg font-bold">{c.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100" style={{ color: GOLD }} />
                  </div>
                  <span className="text-sm" style={{ color: BODY }}>{c.strapline}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
