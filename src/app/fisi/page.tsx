'use client';

import { APP_URL } from '@/lib/site';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BUSINESS_TYPES } from '@/lib/fisi/config';
import './FisiLanding.css';

/**
 * FISI — public marketing landing.
 *
 * Replaces the 1255-line self-contained prototype that previously lived here.
 * That page carried its own copy of BUSINESS_TYPES, its own NAV, ~280 lines of
 * inline CSS and a client-side mock of registration, imported nothing from
 * @/lib/fisi, and had no links out at all -- so /fisi was a dead end.
 *
 * The design is harvested from FisiLanding.css, which already described this
 * page in full (nav, hero, record panel, problem, tools, benefits, trust,
 * final, footer). Only the markup was missing.
 *
 * Employer types render from lib/fisi/config -- one source of truth, so the
 * landing can never drift from what signup actually offers.
 */

type AuthState = 'checking' | 'anon' | 'no-profile' | 'ready';

interface Cta {
  href: string;
  label: string;
}

const CTA_FOR: Record<AuthState, Cta> = {
  checking: { href: `${APP_URL}/fisi/signup`, label: 'Get started' },
  anon: { href: `${APP_URL}/fisi/signup`, label: 'Create your account' },
  'no-profile': { href: `${APP_URL}/fisi/signup`, label: 'Set up FISI' },
  ready: { href: `${APP_URL}/fisi/hub`, label: 'Go to your dashboard' },
};

const TOOLS = [
  {
    idx: '01',
    name: 'Payslips',
    role: 'For the people you pay',
    body: 'Issue a proper payslip for every worker, every period. They get the document and an SMS; they never need an account.',
  },
  {
    idx: '02',
    name: 'Proof of income',
    role: 'For the bank',
    body: 'A statement that shows what came in, what went out and what is left, in a shape a lender will actually read.',
  },
  {
    idx: '03',
    name: 'Running record',
    role: 'For you',
    body: 'Every amount is a dated line. Nothing is a lump sum at month end, so any period can be rebuilt exactly.',
  },
  {
    idx: '04',
    name: 'Reminders',
    role: 'For the deadlines',
    body: 'UIF and EMP201 dates surface where they matter, filtered to the ones your kind of business actually has.',
  },
];

const BENEFITS = [
  {
    num: '01',
    title: 'Only what fits you',
    body: 'Answer one question at signup and the dashboard is built around it. A freelancer never sees a vehicle register; a fleet owner never loses payroll behind it.',
  },
  {
    num: '02',
    title: 'Records, not transactions',
    body: 'FISI never holds or moves money. It is the record that sits next to your bank statement and agrees with it.',
  },
  {
    num: '03',
    title: 'Built for the phone',
    body: 'Captured standing next to the car, in the kitchen, between jobs. Not a spreadsheet you promise to fill in on Sunday.',
  },
  {
    num: '04',
    title: 'Proof that compounds',
    body: 'Every recorded month is another month of history. Six of them is the difference between a declined application and a funded one.',
  },
];

export default function FisiLandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // On the marketing origin there is no session to read (cookies belong to
  // app.sormalitics.com), so the CTA is always the signup. The app's own
  // /fisi/signup forwards an operator who is already set up to their hub.
  const auth: AuthState = 'anon';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // .reveal / .reveal.in is defined in the stylesheet but needs an observer.
  useEffect(() => {
    const nodes = rootRef.current?.querySelectorAll('.reveal');
    if (!nodes?.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const cta = CTA_FOR[auth];

  return (
    <div className="fisi" ref={rootRef}>
      {/* ---------- NAV ---------- */}
      <header className={scrolled ? 'nav scrolled' : 'nav'}>
        <div className="wrap nav-inner">
          <Link href="/fisi" className="brand" aria-label="FISI home">
            <span className="mark">FI<b>SI</b></span>
            <span className="sub">by SORMALITICS</span>
          </Link>

          <button
            className="nav-toggle"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            onClick={() => setNavOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {navOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>

          <nav className={navOpen ? 'nav-links open' : 'nav-links'}>
            <a href="#what" onClick={() => setNavOpen(false)}>What it does</a>
            <a href="#who" onClick={() => setNavOpen(false)}>Who it is for</a>
            <a href="#why" onClick={() => setNavOpen(false)}>Why it works</a>
            <Link href={`${APP_URL}/fisi/login`} onClick={() => setNavOpen(false)}>Sign in</Link>
            <Link className="nav-cta" href={cta.href} onClick={() => setNavOpen(false)}>
              {cta.label}
            </Link>
          </nav>
        </div>
      </header>

      {/* ---------- HERO ---------- */}
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Proof of income, formalised</span>
            <h1>
              You already earn it.<br />
              Now <em>prove it</em>.
            </h1>
            <p className="lead">
              Taxi takings, household wages, client invoices, trip earnings — real money that leaves no
              paper trail a bank will accept. FISI turns what you already do into a record that stands up
              to a lender.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href={cta.href}>
                {cta.label} <span className="arr">-&gt;</span>
              </Link>
              <Link className="btn btn-ghost" href={`${APP_URL}/fisi/login`}>
                Sign in
              </Link>
            </div>
            <p className="hero-note">
              No money moves through FISI. It records what happened,
              <br />
              so your bank statement has something to agree with.
            </p>
          </div>

          {/* signature panel */}
          <div className="record" aria-hidden="true">
            <div className="record-bar">
              <span className="dot live" />
              <span className="url">fisi — running record</span>
            </div>
            <div className="record-head">
              <span>Date</span>
              <span>Source</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {[
              ['03 Aug', 'Daily takings', 'R 1 240', 'Recorded'],
              ['05 Aug', 'Wages — G. Mthembu', 'R 2 800', 'Payslip'],
              ['11 Aug', 'Invoice #0142', 'R 6 500', 'Recorded'],
            ].map((r) => (
              <div className="record-row" key={r[0] + r[1]}>
                <span>{r[0]}</span>
                <span>{r[1]}</span>
                <span className="amt">{r[2]}</span>
                <span className="tag">
                  <span className="tick">+</span>
                  {r[3]}
                </span>
              </div>
            ))}
            <div className="record-foot">
              <span className="mtd">
                Month to date
                <b>R 10 540</b>
              </span>
              <div className="reminders">
                <span className="chip due">UIF due 7 Sep</span>
                <span className="chip">3 payslips issued</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PROBLEM ---------- */}
      <section className="section problem">
        <div className="wrap">
          <p className="problem-lead reveal">
            The income is real.<br />
            <span className="strike">The paperwork is not.</span>
          </p>
          <div className="problem-body reveal">
            <p>
              A funder cannot lend against cash they cannot see. Not because the money is not there —
              because nothing records it in a shape they are allowed to accept.
            </p>
            <p>
              So the taxi owner with eight vehicles, the household paying two staff every month and the
              freelancer billing steadily all end up in the same place: <strong>declined for a lack of
              evidence, not a lack of income.</strong>
            </p>
            <p>
              FISI closes that gap. Record it as it happens, and the proof builds itself.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- TOOLS ---------- */}
      <section className="section" id="what">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">What it does</span>
            <h2>Four things, done properly.</h2>
            <p>
              Not an accounting package. The specific set of documents that turn informal income into
              something a bank, a landlord or SARS will read.
            </p>
          </div>
          <div className="tools-grid reveal">
            {TOOLS.map((t) => (
              <article className="tool" key={t.idx}>
                <div className="tname">
                  <span className="idx">{t.idx}</span>
                  <h3>{t.name}</h3>
                </div>
                <p className="role">{t.role}</p>
                <p>{t.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- WHO IT IS FOR ---------- */}
      <section className="section" id="who">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Who it is for</span>
            <h2>One question at signup. The rest follows.</h2>
            <p>
              Tell FISI what kind of employer you are and it builds the dashboard around that answer —
              so you only ever see what fits your tax, and nothing you do not need.
            </p>
          </div>
          <div className="reg-grid reveal">
            {Object.values(BUSINESS_TYPES).map((t) => (
              <Link className="type-card" key={t.id} href={cta.href}>
                <span className="type-body">
                  <span className="type-label">{t.label}</span>
                  <span className="type-blurb">{t.blurb}</span>
                </span>
                <span className="type-radio" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- BENEFITS ---------- */}
      <section className="section" id="why">
        <div className="wrap">
          <div className="section-head reveal">
            <span className="eyebrow">Why it works</span>
            <h2>Built around the record, not the transaction.</h2>
          </div>
          <div className="benefits-grid reveal">
            {BENEFITS.map((b) => (
              <article className="benefit" key={b.num}>
                <span className="num">{b.num}</span>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TRUST ---------- */}
      <section className="section trust">
        <div className="wrap">
          <div className="trust-card reveal">
            <span className="eyebrow">The line we do not cross</span>
            <h2>
              FISI never holds, moves or touches <em>your money</em>.
            </h2>
            <p>
              It is a record, not a wallet and not a payment rail. Your money stays where it already is.
              What FISI produces is the evidence that it was there — dated, itemised and easy to
              check against your own bank statement.
            </p>
            <div className="trust-tags">
              <span className="chip">No payments held</span>
              <span className="chip">Your data, your account</span>
              <span className="chip">Check it against your bank</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FINAL ---------- */}
      <section className="final">
        <div className="wrap final-inner">
          <h2>
            Start the record <em>this month</em>.
          </h2>
          <Link className="btn btn-primary" href={cta.href}>
            {cta.label} <span className="arr">-&gt;</span>
          </Link>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer>
        <div className="wrap foot-inner">
          <div className="foot-brand">
            <span className="mark">FI<b>SI</b></span>
            <p>Proof of income for the people the paperwork forgot. A module of SORMALITICS.</p>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h4>Product</h4>
              <a href="#what">What it does</a>
              <a href="#who">Who it is for</a>
              <a href="#why">Why it works</a>
            </div>
            <div className="foot-col">
              <h4>Account</h4>
              <Link href={cta.href}>{cta.label}</Link>
              <Link href={`${APP_URL}/fisi/login`}>Sign in</Link>
            </div>
            <div className="foot-col">
              <h4>SORMALITICS</h4>
              <Link href="/">Main site</Link>
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="wrap foot-base">
          <span>&copy; {new Date().getFullYear()} SORMALITICS</span>
          <span>FISI records income. It does not move money.</span>
        </div>
      </footer>
    </div>
  );
}
