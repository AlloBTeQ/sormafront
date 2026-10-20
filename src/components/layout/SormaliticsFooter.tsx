'use client';

import React from 'react';
import { Mail, ArrowUpRight } from 'lucide-react';

// Brand marks are drawn here, not imported: lucide-react 1.x removed every brand
// icon, which broke the build on the 0.468 -> 1.59 bump. Simple Icons paths (CC0),
// same 24x24 box and sizing as the lucide icons, so either lucide version builds.
type IconProps = { className?: string };
const brand = (d: string) => function BrandIcon({ className }: IconProps) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d={d} /></svg>;
};
const XIcon = brand('M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z');
const LinkedInIcon = brand('M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z');
const GitHubIcon = brand('M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12');
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
  { icon: XIcon,        href: 'https://x.com/sormalitics',                   label: 'X (Twitter)' },
  { icon: LinkedInIcon, href: 'https://linkedin.com/company/sormalitics',     label: 'LinkedIn' },
  { icon: GitHubIcon,   href: 'https://github.com/sormalitics',               label: 'GitHub' },
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
