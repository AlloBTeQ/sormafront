'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { APP_LIVE, APP_ORIGIN } from '@/lib/site';

const NAVY = '#143152';
const DEEP = '#0E2540';
const CARD = '#183A5F';
const TEXT = '#FBF7EA';
const BODY = '#ADC4DC';
const MUTED = '#8FA9C8';
const RULE = '#2B4A70';
const EDGE = '#4B71A0';
const GOLD = '#C9A227';
const GOLD_WASH = 'rgba(201,162,39,0.10)';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-dm-mono), ui-monospace, monospace' };
const WRAP = 'max-w-[1240px] mx-auto px-4 sm:px-8 lg:px-12';

type Intent = { eyebrow: string; title: string; line: string; subject: string };

function intentFor(target: string): Intent {
  const p = target.split('?')[0];
  if (p.startsWith('/auth/login') || p === '/fisi/login')
    return { eyebrow: 'SIGN IN', title: 'Sign-in opens at launch.', line: 'Accounts are not open yet, so there is nothing to sign in to — but we can put your name at the front of the queue.', subject: 'Early access' };
  if (p.startsWith('/fisi'))
    return { eyebrow: 'FISI', title: 'FISI is almost ready.', line: 'Payslips and proof of income for the people you pay. Tell us who you pay and we will bring you on first.', subject: 'FISI early access' };
  if (p.startsWith('/pricing')) {
    const plan = new URLSearchParams(target.split('?')[1] ?? '').get('plan');
    const name = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'your plan';
    return { eyebrow: 'CHECKOUT', title: `${name} opens at launch.`, line: 'Payment is not switched on yet. Ask for early access and we will hold launch pricing for you.', subject: `Early access — ${name}` };
  }
  if (p.startsWith('/store'))
    return { eyebrow: 'DOCUMENT STORE', title: 'Purchases open at launch.', line: 'Browse every template now; buying and downloading switch on when the app goes live.', subject: 'Document store — notify me' };
  return { eyebrow: 'START FREE', title: 'We are putting on the finishing touches.', line: 'SORMALITICS opens shortly. Leave your email and you will be among the first in.', subject: 'Early access' };
}

export default function InDevelopment() {
  const [intent, setIntent] = useState<Intent>(intentFor(''));
  // Once the app is open, an old "early access" link goes where it was headed:
  // /in-development#/auth/register → the app's registration page.
  useEffect(() => {
    if (!APP_LIVE) return;
    const target = decodeURIComponent(window.location.hash.slice(1));
    const path = target.startsWith('/') ? target : '/auth/register';
    window.location.replace(`${APP_ORIGIN}${path}`);
  }, []);

  useEffect(() => {
    const read = () => setIntent(intentFor(decodeURIComponent(window.location.hash.slice(1))));
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);

  const mail = `mailto:hello@sormalitics.com?subject=${encodeURIComponent(intent.subject)}&body=${encodeURIComponent('Hi SORMALITICS team,\n\nPlease let me know when I can get in.\n\nName:\nCompany:\nWhat I need it for (finance / payroll / practice):\n')}`;

  return (
    <div style={{ color: TEXT, background: NAVY, fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' }}>
      <section className={`${WRAP} pt-16 pb-20 lg:pt-28 lg:pb-28`}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-7 text-xs"
          style={{ ...MONO, border: `1px solid ${GOLD}`, background: GOLD_WASH, color: GOLD }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GOLD }} />
          {intent.eyebrow} · OPENING SOON
        </div>
        <h1 className="font-extrabold mb-6 max-w-[900px]"
          style={{ fontSize: 'clamp(38px, 6vw, 80px)', lineHeight: 1, letterSpacing: '-0.03em' }}>
          {intent.title}
        </h1>
        <p className="text-lg leading-relaxed mb-9 max-w-[600px]" style={{ color: BODY }}>{intent.line}</p>
        <div className="flex flex-wrap gap-3">
          <a href={mail} className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-semibold"
            style={{ background: GOLD, color: NAVY }}>
            <Mail className="w-4 h-4" /> Get early access
          </a>
          <a href="/contact" className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-medium"
            style={{ border: `1px solid ${EDGE}`, color: TEXT }}>
            Book a walkthrough <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <section style={{ background: DEEP, borderTop: `1px solid ${RULE}` }}>
        <div className={`${WRAP} py-12 grid grid-cols-1 sm:grid-cols-3 gap-px`} style={{ background: RULE }}>
          {[
            ['01', 'Look around', 'Pricing, services, the store and help are all open now.', '/pricing'],
            ['02', 'Ask us anything', 'A real person answers — sales, a demo, or how it fits your team.', '/contact'],
            ['03', 'Read the fine print', 'Terms, privacy and refunds are published and final.', '/legal/terms'],
          ].map(([n, t, b, href]) => (
            <a key={n} href={href} className="p-6 block transition-colors hover:bg-[#1F3D57]" style={{ background: CARD }}>
              <p className="text-xs mb-4" style={{ ...MONO, color: GOLD }}>{n}</p>
              <p className="text-lg font-semibold mb-1.5">{t}</p>
              <p className="text-sm" style={{ color: MUTED }}>{b}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
