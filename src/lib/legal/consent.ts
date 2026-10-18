// src/lib/legal/consent.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cookie consent state, as ONE place.
//
// What was wrong
// ──────────────
// CookieBanner wrote `fk:cookie-consent` into localStorage and dispatched an
// event. Nothing read either one. Google Analytics and Microsoft Clarity were
// injected from app/layout.tsx gated only on NODE_ENV and the presence of the
// env var, so "Essential only" and "Reject all" changed nothing — both trackers
// were already running, on every route, including the authenticated dashboard.
//
// (The banner was also never rendered by any layout, so in practice no consent
// was ever collected either. Both halves are fixed: layout.tsx now renders the
// banner, and components/legal/Analytics.tsx reads this module before loading
// anything.)
//
// Under UK/EU GDPR + PECR, analytics cookies need prior opt-in. Under POPIA the
// processing needs a lawful basis and s69 governs direct marketing. So the
// default here is DENY, and it stays deny until a human says otherwise.
//
// Every consumer — banner, cookies page, analytics loader — must go through
// this module. No component may read the storage key directly.
// ─────────────────────────────────────────────────────────────────────────────

export type ConsentCategory = 'analytics' | 'marketing' | 'preferences';

export type Consent = Record<ConsentCategory, boolean>;

/** Storage keys. Kept as the historical `fk:` prefix so existing choices survive. */
export const CONSENT_STORAGE_KEY = 'fk:cookie-consent';
export const CONSENT_DATE_KEY    = 'fk:cookie-consent-date';

/** Dispatched on the window whenever consent changes, in this tab. */
export const CONSENT_EVENT = 'fk:consent-updated';

/**
 * Version of the consent MECHANISM, not of any one person's choice.
 *
 * Why this exists
 * ───────────────
 * The old cookies page wrote this same storage key for months, under a flow
 * that was not valid consent:
 *
 *   - `preferences` defaulted to TRUE before the user chose anything, and a
 *     pre-ticked box is not consent under GDPR Art. 4(11);
 *   - nothing ever READ the stored value, so analytics and session recording
 *     ran whatever the record said. Consent that was never honoured is not
 *     consent that can be relied on.
 *
 * Those records still sit in people's browsers. Without a version, every one of
 * them would suppress the new banner forever, and we would be treating an
 * invalid record as a valid one — quietly inheriting the exact problem this
 * work set out to fix.
 *
 * So: a record carrying no version, or an older one, is treated as UNDECIDED.
 * The banner asks again, and nothing non-essential loads until it is answered.
 *
 * Bump this only when a change means previous answers can no longer be relied
 * on — a new processor in an existing category, or a change to what a category
 * covers. Bumping it re-prompts every visitor, which is disruptive and is
 * exactly what it is for.
 *
 *   1 — legacy, pre-enforcement. Never written by this module.
 *   2 — first version that is actually enforced (23 August 2026).
 */
export const CONSENT_VERSION = 2;

/**
 * The pre-decision state. Not merely "all false" by coincidence — this is the
 * lawful default before a choice exists, and every read path falls back to it.
 */
export const DENY_ALL: Consent = {
  analytics:   false,
  marketing:   false,
  preferences: false,
};

export const ALLOW_ALL: Consent = {
  analytics:   true,
  marketing:   true,
  preferences: true,
};

/** What actually goes into storage: the choice plus the mechanism version. */
interface StoredConsent extends Consent {
  v: number;
}

function isConsent(value: unknown): value is Consent {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.analytics   === 'boolean' &&
    typeof v.marketing   === 'boolean' &&
    typeof v.preferences === 'boolean'
  );
}

/**
 * True when a stored record predates the current mechanism and must be
 * re-obtained. A record with no `v` at all is a legacy record, which is the
 * common case for anyone who used the site before today.
 */
function isCurrentVersion(value: unknown): boolean {
  const v = (value as Record<string, unknown> | null)?.v;
  return typeof v === 'number' && v >= CONSENT_VERSION;
}

/**
 * The stored choice, or null when the user has not decided yet.
 *
 * Returns null — never DENY_ALL — for "undecided", because the banner needs to
 * distinguish "hasn't been asked" from "was asked and said no". Callers that
 * only care about permission should use `getConsent()`.
 */
export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    // Malformed, or written under a superseded mechanism → undecided. Both
    // fail closed: the banner asks again and nothing non-essential loads.
    if (!isConsent(parsed) || !isCurrentVersion(parsed)) return null;
    return parsed;
  } catch {
    // Private mode, disabled storage, corrupted JSON — all mean "no consent".
    return null;
  }
}

/** The effective permissions right now. Undecided reads as DENY_ALL. */
export function getConsent(): Consent {
  return readConsent() ?? DENY_ALL;
}

/** True once the user has made any explicit choice. */
export function hasConsented(): boolean {
  return readConsent() !== null;
}

/** Convenience for the common single-category check. */
export function hasConsentFor(category: ConsentCategory): boolean {
  return getConsent()[category];
}

/** When the current choice was made, for the audit trail. */
export function consentDate(): Date | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_DATE_KEY);
    return raw ? new Date(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Record a choice and tell every listener in this tab.
 *
 * Writing the date alongside is not decoration: a regulator asking "when did
 * this user consent, and to what" needs both halves, and PECR/GDPR consent is
 * expected to be refreshed rather than held forever.
 */
export function persistConsent(consent: Consent): void {
  if (typeof window === 'undefined') return;
  try {
    const stored: StoredConsent = { ...consent, v: CONSENT_VERSION };
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
    window.localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
  } catch {
    // Storage unavailable. The event still fires so the current page reacts;
    // the choice simply will not survive a reload, which fails closed.
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
}

/** Clear the choice entirely, returning the user to the undecided state. */
export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.localStorage.removeItem(CONSENT_DATE_KEY);
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: DENY_ALL }));
}

/**
 * Subscribe to consent changes. Returns an unsubscribe function.
 *
 * Listens to BOTH the in-tab custom event and the cross-tab `storage` event, so
 * revoking consent in one tab takes effect in the others. Without the storage
 * listener a user who rejected analytics in a second tab would keep being
 * tracked in the first one.
 */
export function subscribeToConsent(callback: (consent: Consent) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const onLocal = (e: Event) => {
    const detail = (e as CustomEvent<Consent>).detail;
    callback(isConsent(detail) ? detail : getConsent());
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY || e.key === null) callback(getConsent());
  };

  window.addEventListener(CONSENT_EVENT, onLocal);
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener(CONSENT_EVENT, onLocal);
    window.removeEventListener('storage', onStorage);
  };
}
