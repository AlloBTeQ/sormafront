"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, BarChart3, Target, Settings2,
  CheckCircle, ChevronDown, Save, RotateCcw,
  ExternalLink, Clock, Database, Globe, HardDrive,
} from 'lucide-react';
import {
  getConsent, persistConsent, consentDate as readConsentDate,
  ALLOW_ALL, DENY_ALL, type Consent,
} from '@/lib/legal/consent';
import { LEGAL_VERSIONS } from '@/lib/legal/versions';

interface CookieCategory {
  id: 'essential' | 'analytics' | 'marketing' | 'preferences';
  label: string;
  description: string;
  icon: React.ElementType;
  accent: string;
  bg: string;
  required: boolean;
  cookies: {
    name: string;
    purpose: string;
    duration: string;
    provider: string;
  }[];
}

const CATEGORIES: CookieCategory[] = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Required to sign you in and keep the session secure. These cannot be turned off, and no consent is required for them under UK/EU or South African law.',
    icon: Shield,
    accent: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    required: true,
    cookies: [
      { name: 'auth-token',    purpose: 'Signed authentication token — keeps you logged in. HTTP-only, so page scripts cannot read it.', duration: '7 days, or 30 with "Remember me"', provider: 'SORMALITICS' },
      { name: 'refresh-token', purpose: 'Renews your session without making you log in again. HTTP-only, and sent only to the refresh endpoint.', duration: '7 days, or 30 with "Remember me"', provider: 'SORMALITICS' },
      { name: 'session-info',  purpose: 'Basic session details the interface reads to show who is signed in. Readable by page scripts, and contains your user ID and email address.', duration: 'Same as your session', provider: 'SORMALITICS' },
      { name: 'active-client', purpose: 'For practitioners: which client profile you are currently working in. HTTP-only.', duration: 'Until you switch or sign out', provider: 'SORMALITICS' },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Help us see which features are used and where the product is confusing. Nothing here loads unless you turn it on.',
    icon: BarChart3,
    accent: 'text-teal-600',
    bg: 'bg-teal-50 border-teal-200',
    required: false,
    cookies: [
      { name: '_ga',    purpose: 'Google Analytics — distinguishes one visitor from another. We enable IP anonymisation.', duration: '2 years', provider: 'Google' },
      { name: '_ga_*',  purpose: 'Google Analytics — session state',                                                     duration: '2 years', provider: 'Google' },
      { name: '_clck',  purpose: 'Microsoft Clarity — identifies a returning visitor. Public marketing pages only.',      duration: '1 year',  provider: 'Microsoft' },
      { name: '_clsk',  purpose: 'Microsoft Clarity — joins several page views into one session. Public pages only.',     duration: '1 day',   provider: 'Microsoft' },
    ],
  },
  {
    id: 'preferences',
    label: 'Preferences',
    description: 'Remember your currency, language and region so you do not have to set them again. Stored in your browser rather than as cookies — see the note below the categories.',
    icon: Settings2,
    accent: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    required: false,
    cookies: [],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'We do not currently run any advertising or conversion tracking. This category exists so that your choice is already recorded if we ever do — and we would tell you before that changed.',
    icon: Target,
    accent: 'text-amber-600',
    bg: 'bg-amber-50 border-amber-200',
    required: false,
    cookies: [],
  },
];

const LOCAL_STORAGE_ITEMS: { name: string; purpose: string; category: string }[] = [
  { name: 'fk:cookie-consent',            purpose: 'Your choices on this page',                     category: 'Essential' },
  { name: 'fk:cookie-consent-date',       purpose: 'When you last made those choices',              category: 'Essential' },
  { name: 'fk:currency',                  purpose: 'Your default currency',                         category: 'Preferences' },
  { name: 'fk:locale',                    purpose: 'Your language setting',                         category: 'Preferences' },
  { name: 'fk:country',                   purpose: 'Default jurisdiction for tax calculations',     category: 'Preferences' },
  { name: 'fk:company',                   purpose: 'Company details remembered between documents',  category: 'Preferences' },
  { name: 'fk:vat',                       purpose: 'Your default VAT setting',                      category: 'Preferences' },
  { name: 'sorm-sidebar-collapsed',       purpose: 'Whether the sidebar is collapsed',              category: 'Preferences' },
  { name: 'sormalitics:lastPayrollRegion', purpose: 'The payroll region you last used',             category: 'Preferences' },
  { name: '*_draft',                      purpose: 'Unsent document drafts, kept so you do not lose work', category: 'Preferences' },
  { name: 'sentryReplaySession',          purpose: 'Ties the pieces of one error recording together. Session storage — cleared when you close the tab. Set by our error tracking, which is not part of analytics consent; see "Error recordings" below.', category: 'Diagnostics' },
];

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${checked ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
          ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

function CookieTable({ cookies }: { cookies: CookieCategory['cookies'] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200/80">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-1/4">Name</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600">Purpose</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-24">Duration</th>
            <th className="text-left px-4 py-2.5 font-semibold text-slate-600 w-28">Provider</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((c, i) => (
            <tr key={c.name} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
              <td className="px-4 py-2.5 font-mono text-[12px] md:text-[10px] text-slate-700 font-medium align-top">{c.name}</td>
              <td className="px-4 py-2.5 text-slate-600 align-top leading-relaxed">{c.purpose}</td>
              <td className="px-4 py-2.5 text-slate-500 align-top whitespace-nowrap">{c.duration}</td>
              <td className="px-4 py-2.5 text-slate-500 align-top">{c.provider}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CategoryCard({
  cat,
  enabled,
  onToggle,
}: {
  cat: CookieCategory;
  enabled: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = cat.icon;

  return (
    <div className={`rounded-2xl border-2 bg-white/80 backdrop-blur-sm transition-all ${enabled ? cat.bg : 'border-slate-200'}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex flex-wrap items-center justify-center flex-shrink-0 ${enabled ? cat.bg : 'bg-slate-100'}`}>
            <Icon className={`w-5 h-5 ${enabled ? cat.accent : 'text-slate-400'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-y-2 items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-[15px]" style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                  {cat.label}
                </h3>
                {cat.required && (
                  <span className="text-[12px] md:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    Always on
                  </span>
                )}
              </div>
              <Toggle checked={enabled} onChange={onToggle} disabled={cat.required} />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Hide' : `Show ${cat.cookies.length} cookie${cat.cookies.length > 1 ? 's' : ''}`}
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-5">
          {cat.cookies.length > 0 ? (
            <CookieTable cookies={cat.cookies} />
          ) : (
            <p className="mt-4 text-xs text-slate-400 italic">
              {cat.id === 'marketing'
                ? 'No marketing cookies are currently set. We would update this page and ask again before that changed.'
                : 'These settings are kept in browser storage rather than cookies — see the section below.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export default function CookiesPage() {
  const [consent, setConsent] = useState<Consent>(DENY_ALL);
  const [saved, setSaved] = useState(false);
  const [consentDate, setConsentDate] = useState<string | null>(null);

  useEffect(() => {
    setConsent(getConsent());
    const d = readConsentDate();
    if (d) setConsentDate(fmt(d));
  }, []);

  const toggle = (key: keyof Consent) => {
    setConsent(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    persistConsent(consent);
    setConsentDate(fmt(new Date()));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAcceptAll = () => {
    setConsent(ALLOW_ALL);
    persistConsent(ALLOW_ALL);
    setConsentDate(fmt(new Date()));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRejectAll = () => {
    setConsent(DENY_ALL);
    persistConsent(DENY_ALL);
    setConsentDate(fmt(new Date()));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const enabledFor = (id: CookieCategory['id']) => {
    if (id === 'essential') return true;
    return consent[id as keyof Consent];
  };

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-200/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/legal/privacy" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Privacy</Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-600 font-medium">Cookies</span>
          </div>

          <p className="text-[12px] md:text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-500 mb-3"
            style={{ fontFamily: 'var(--font-dm-mono, monospace)' }}>
            Legal · Cookie Policy
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
            Cookies &{' '}
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Your Preferences
            </span>
          </h1>

          <p className="text-slate-500 text-base leading-relaxed max-w-2xl">
            We use cookies to keep you signed in, remember your preferences, and understand how SORMALITICS is used.
            Everything except the essentials is off until you switch it on, and you can change your mind here at any time.
          </p>

          {consentDate && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs text-green-700">
              <CheckCircle className="w-3.5 h-3.5" />
              Preferences last saved: {consentDate}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5 mb-8">
          <button
            onClick={handleAcceptAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all hover:-translate-y-px"
          >
            Accept all cookies
          </button>
          <button
            onClick={handleRejectAll}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all"
          >
            Essential only
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              enabled={enabledFor(cat.id)}
              onToggle={() => !cat.required && toggle(cat.id as keyof Consent)}
            />
          ))}
        </div>

        <div className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl p-6">
          <h2 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2"
            style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
            <HardDrive className="w-4 h-4 text-slate-500" />
            Browser storage (not cookies)
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Some settings are kept in your browser&apos;s local storage rather than in a cookie.
            The difference matters: local storage has no expiry date, it is never sent to our
            servers with your requests, and clearing your cookies does not remove it. Clearing
            site data does.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="pb-2 pr-4 font-semibold">Key</th>
                  <th className="pb-2 pr-4 font-semibold">What it is for</th>
                  <th className="pb-2 font-semibold">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {LOCAL_STORAGE_ITEMS.map(item => (
                  <tr key={item.name}>
                    <td className="py-2 pr-4 font-mono text-[12px] text-slate-700 whitespace-nowrap">{item.name}</td>
                    <td className="py-2 pr-4 text-slate-500">{item.purpose}</td>
                    <td className="py-2 text-slate-400 text-xs whitespace-nowrap">{item.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate-400 text-xs mt-4">
            The two consent keys are classed as essential because they are how your choices on this
            page survive a reload. Without them we would have to ask you again on every visit.
          </p>
        </div>

        <div className="sticky bottom-4 z-10">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl px-5 py-3.5 flex flex-wrap gap-y-2 items-center justify-between shadow-lg shadow-slate-200/60">
            <div>
              {saved ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Preferences saved</span>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {[
                      consent.analytics && 'Analytics',
                      consent.preferences && 'Preferences',
                      consent.marketing && 'Marketing',
                    ].filter(Boolean).join(', ') || 'Essential only'}
                  </span>
                  {' '}— unsaved changes
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setConsent(getConsent()); setSaved(false); }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Save preferences
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 prose prose-slate prose-sm max-w-none">
          <div className="bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-8 space-y-6">

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                <Globe className="w-4 h-4 text-blue-500" />
                What are cookies?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Cookies are small text files stored on your device when you visit a website.
                They help websites remember information about your visit, making it easier to return
                and more useful to you. Cookies cannot execute code or carry viruses.
              </p>
            </section>

            <div className="h-px bg-slate-100" />

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                <Database className="w-4 h-4 text-teal-500" />
                How we use cookies
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">
                SORMALITICS uses cookies to provide the service, keep it secure, and remember your
                preferences. We do not sell data to third parties, and we run no behavioural
                advertising.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">
                <strong className="text-slate-700">Nothing non-essential loads until you accept it.</strong>{' '}
                Analytics scripts are not placed on the page at all unless you have turned that
                category on. Declining is not a preference we note and then ignore — the scripts
                genuinely do not run.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                <strong className="text-slate-700">About Microsoft Clarity.</strong>{' '}
                Clarity records how visitors move through a page, which is more than aggregate
                counting — so we should be plain about it. It runs only on public marketing pages,
                never on the dashboard, payroll, checkout or sign-in screens, and only if you accept
                analytics. Google Analytics runs site-wide when accepted, with IP anonymisation on.
              </p>
            </section>

            <div className="h-px bg-slate-100" />

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                <HardDrive className="w-4 h-4 text-rose-500" />
                Error recordings
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">
                This one is not in the toggles above, and we would rather explain why than let you
                find it in a storage list. It is not analytics — it does not tell us which features
                are popular, and it does not run on a healthy session at all.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">
                <strong className="text-slate-700">How it works.</strong>{' '}
                Your browser keeps roughly the last minute of what happened on the page in memory
                and continuously throws it away. If the application throws an error — or if you
                click the same control several times in a way that suggests it is not responding —
                that minute is sent to Sentry, our error-tracking provider, so we can see what
                broke. Otherwise it is never sent anywhere.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">
                <strong className="text-slate-700">What it can and cannot see.</strong>{' '}
                Every piece of text, every field value and every image is replaced with blocks
                inside your browser <em>before</em> anything is transmitted. The readable version
                never leaves your device. We receive the layout of the page and which element was
                clicked — not what it said. Request and response contents are not captured at all,
                so no salary figure, identity number or bank detail is in the recording. Sentry
                deletes recordings after 90 days.
              </p>
              <p className="text-slate-500 text-sm leading-relaxed">
                <strong className="text-slate-700">Why it is not on a consent toggle.</strong>{' '}
                We rely on legitimate interests rather than consent, because the sessions that break
                are exactly the ones a consent gate would hide from us — and we are contractually
                obliged to keep this product working. You can still object: email{' '}
                <a href="mailto:privacy@sormalitics.com" className="text-blue-600 hover:underline">
                  privacy@sormalitics.com
                </a>{' '}
                and we will exclude you, no justification needed.
              </p>
            </section>

            <div className="h-px bg-slate-100" />

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-syne, sans-serif)' }}>
                <Clock className="w-4 h-4 text-violet-500" />
                Managing cookies in your browser
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-3">
                In addition to the controls above, you can manage or delete cookies through your browser settings.
                Note that disabling essential cookies will prevent you from logging in to SORMALITICS.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Chrome', href: 'https://support.google.com/chrome/answer/95647' },
                  { label: 'Firefox', href: 'https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox' },
                  { label: 'Safari', href: 'https://support.apple.com/en-gb/guide/safari/sfri11471' },
                  { label: 'Edge', href: 'https://support.microsoft.com/en-us/windows/delete-and-manage-cookies' },
                ].map(b => (
                  <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-600 font-medium transition-colors">
                    {b.label} <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                ))}
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400" style={{ fontFamily: 'var(--font-dm-mono, monospace)' }}>
                  Last updated: 23 August 2026 · v{LEGAL_VERSIONS.cookies} · Applies to sormalitics.com and all subdomains
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Questions? Email{' '}
                  <a href="mailto:privacy@sormalitics.com" className="text-blue-500 hover:underline">
                    privacy@sormalitics.com
                  </a>
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <Link href="/legal/privacy" className="text-slate-500 hover:text-slate-800 transition-colors underline">
                  Privacy Policy
                </Link>
                <Link href="/legal/terms" className="text-slate-500 hover:text-slate-800 transition-colors underline">
                  Terms of Service
                </Link>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}