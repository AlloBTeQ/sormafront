'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu, X,
} from 'lucide-react';
import { SormaliticsFooter } from './SormaliticsFooter';
import { app } from '@/lib/site';
import { SormaliticsMark } from '@/components/brand/SormaliticsMark';

const INK = '#143152';
const NAV_BG = '#FFFFFF';
const GOLD = '#C9A227';
const BODY = '#2C4667';
const RULE = '#D7D9DD';
const CREAM = '#FDF6DE';
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' };
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };

const NAV_LINKS = [
  { name: 'Services', href: '/services' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Store', href: '/store' },
  { name: 'About', href: '/about' },
  { name: 'Help', href: '/help' },
  { name: 'Fisi', href: '/fisi' },
];

function Brand() {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label="SORMALITICS home">
      <SormaliticsMark className="w-8 h-8 shrink-0" />
      <span className="text-base font-bold tracking-[0.06em]" style={{ color: INK }}>SORMALITICS</span>
    </a>
  );
}

function SormaliticsNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50" style={{ ...DISPLAY, background: NAV_BG, borderBottom: `1px solid ${RULE}` }}>
      <nav className="max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12" aria-label="Main">
        <div className="flex items-center justify-between gap-4 h-16">
          <Brand />

          <div className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className="text-sm py-2 transition-colors hover:text-[#8A6A34] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#143152]"
                style={isActive(href)
                  ? { color: INK, fontWeight: 600, boxShadow: `inset 0 -2px 0 ${GOLD}` }
                  : { color: BODY }}
              >
                {name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <a href={app('/auth/login')} className="px-3.5 py-3 text-sm font-medium transition-colors hover:text-[#8A6A34]" style={{ color: INK }}>
              Sign in
            </a>
            <a href={app('/auth/register')}
              className="px-[18px] py-3 text-sm font-semibold transition-transform hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-[#143152]"
              style={{ background: GOLD, color: INK }}>
              Start free
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden w-11 h-11 flex items-center justify-center transition-colors hover:bg-[#F4F6F9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#143152]"
            style={{ color: INK, border: `1px solid ${RULE}` }}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="lg:hidden" style={{ background: NAV_BG, borderTop: `1px solid ${RULE}` }}>
          <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ name, href }) => (
              <a
                key={name}
                href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(href) ? 'page' : undefined}
                className="block px-3 py-3 text-sm transition-colors"
                style={isActive(href)
                  ? { color: INK, fontWeight: 600, background: CREAM, borderLeft: `2px solid ${GOLD}` }
                  : { color: BODY }}
              >
                {name}
              </a>
            ))}

            <div className="pt-3 mt-3 flex flex-col gap-2" style={{ borderTop: `1px solid ${RULE}` }}>
              <a href={app('/auth/login')} className="w-full text-center px-4 py-3 text-sm font-medium"
                style={{ color: INK, border: `1px solid ${INK}` }}>
                Sign in
              </a>
              <a href={app('/auth/register')} className="w-full text-center px-4 py-3 text-sm font-semibold"
                style={{ background: GOLD, color: INK }}>
                Start free
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function SormaliticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/fisi' || pathname?.startsWith('/fisi/')) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SormaliticsNavbar />
      <main className="flex-1">{children}</main>
      <SormaliticsFooter />
    </div>
  );
}

export default SormaliticsLayout;
