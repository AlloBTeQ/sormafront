'use client';

import React from 'react';
import { Twitter, Linkedin, Github, Mail, ArrowUpRight } from 'lucide-react';
import { SormaliticsMark } from '@/components/brand/SormaliticsMark';

// Restyled 16 Oct 2026 to the landing's direction F: brand ink #143152 ground,
// parchment type, one aurum accent, Outfit + DM Mono.
//
// Removed: the trust bar. It claimed "7 Jurisdictions · Global tax compliance"
// beside seven flag pills, while lib/payroll/jurisdictionStatus.ts has three
// live — the landing's own "live means live" line contradicted it one scroll
// up. Emoji flags also render as bare letters on Windows. If a jurisdiction
// line is wanted here again, derive it from JURISDICTIONS; never hand-type it.

const NAVY = '#143152';
const TEXT = '#FBF7EA';
const RULE = '#2B4A70';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const GOLD_TEXT = '#C9A227';
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };

const SERVICES = [
  { name: 'Invoicing',            href: '/services' },
  { name: 'Payroll & Payslips',   href: '/services' },
  { name: 'Legal Agreements',     href: '/services' },
  { name: 'Accounting Suite',     href: '/services' },
  { name: 'Document Store',       href: '/store' },
];

const COMPANY = [
  { name: 'About',   href: '/about' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Store',   href: '/store' },
  { name: 'Contact', href: '/contact' },
  { name: 'Careers', href: '/careers' },
];

const SUPPORT = [
  { name: 'Help Center',               href: '/help' },
  { name: 'Privacy Policy',            href: '/legal/privacy' },
  { name: 'Terms of Service',          href: '/legal/terms' },
  { name: 'Cookie Policy',             href: '/legal/cookies' },
  { name: 'Refund Policy',             href: '/legal/refunds' },
  { name: 'Data Processing Agreement', href: '/legal/dpa' },
  { name: 'PAIA Manual',               href: '/legal/paia' },
  { name: 'Security',                  href: '/help#security-data' },
];

const SOCIAL = [
  { icon: Twitter,  href: 'https://twitter.com/sormalitics',              label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/sormalitics',     label: 'LinkedIn' },
  { icon: Github,   href: 'https://github.com/sormalitics',               label: 'GitHub' },
  { icon: Mail,     href: 'mailto:hello@sormalitics.com',                 label: 'Email' },
];

const LEGAL = [
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Terms',   href: '/legal/terms' },
  { label: 'Cookies', href: '/legal/cookies' },
  { label: 'Refunds', href: '/legal/refunds' },
  { label: 'DPA',     href: '/legal/dpa' },
  { label: 'PAIA',    href: '/legal/paia' },
];

function Column({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.1em] mb-4" style={{ ...MONO, color: MUTED }}>{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ name, href }) => (
          <li key={name}>
            <a href={href} className="text-sm transition-colors hover:text-[#E5C55E]" style={{ color: BODY }}>{name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const SormaliticsFooter: React.FC = () => {
  return (
    <footer style={{ ...DISPLAY, color: TEXT, background: NAVY, borderTop: `1px solid ${RULE}` }}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-14">
        {/* Brand row */}
        <div className="flex flex-wrap justify-between gap-6 pb-8 mb-10" style={{ borderBottom: `1px solid ${RULE}` }}>
          <div className="max-w-[360px]">
            <a href="/" className="flex items-center gap-2.5 mb-4 w-fit" aria-label="SORMALITICS home">
              <SormaliticsMark className="w-9 h-9 shrink-0" tone="onDark" />
              <div className="leading-none">
                <div className="font-bold tracking-[0.06em]">SORMALITICS</div>
                <div className="text-[11px] mt-1" style={{ ...MONO, color: GOLD_TEXT }}>Summa de Arithmetica</div>
              </div>
            </a>
            <p className="text-sm leading-relaxed" style={{ color: BODY }}>
              Professional financial tools for businesses and practitioners. Invoices, payroll, legal
              agreements, and full accounting — in one platform.
            </p>
          </div>
          <div className="flex items-start gap-2">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="w-11 h-11 flex items-center justify-center transition-colors hover:bg-[rgba(251,247,234,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
                style={{ border: `1px solid ${RULE}`, color: BODY }}>
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <Column title="SERVICES" links={SERVICES} />
          <Column title="COMPANY" links={COMPANY} />
          <Column title="SUPPORT" links={SUPPORT} />
          <div className="p-5 self-start" style={{ background: '#183A5F', border: `1px solid ${RULE}` }}>
            <p className="text-sm font-semibold mb-1">Need help?</p>
            <p className="text-[13px] mb-3.5" style={{ color: BODY }}>Our support team is here for you.</p>
            <a href="mailto:support@sormalitics.com" className="inline-flex items-center gap-1 text-xs"
              style={{ ...MONO, color: GOLD_TEXT }}>
              support@sormalitics.com <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: `1px solid ${RULE}` }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12 py-5 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 text-xs" style={{ color: MUTED }}>
          {/* SORMALITICS is the product, not a legal person. The companies are
              AlloBTeQ (Pty) Ltd and Polompa Investments Limited — see
              lib/legal/entities.ts and Terms §1.2. Do not append Ltd or
              (Pty) Ltd to the product name. */}
          <p>© {new Date().getFullYear()} SORMALITICS. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            {LEGAL.map(({ label, href }) => (
              <a key={label} href={href} className="hover:text-[#FBF7EA] transition-colors">{label}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SormaliticsFooter;
