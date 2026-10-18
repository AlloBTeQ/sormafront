// src/lib/legal/versions.ts
// ─────────────────────────────────────────────────────────────────────────────
// Versions of the published legal documents, as ONE place.
//
// Why a version rather than just a date on the page
// ─────────────────────────────────────────────────
// Terms §11.4 promises to notify users of material changes. That promise is
// unevidenced unless we know WHICH text a given user accepted. Before this file
// existed, registration linked to /legal/terms and stored nothing at all — pure
// browsewrap. The liability cap, the indemnity and the governing-law clause all
// rest on assent we could not demonstrate.
//
// So: every acceptance stores the version string below. When a document changes
// materially, bump its version here. Anything comparing a stored acceptance
// against the current value will then correctly report that re-acceptance is
// due — see `needsReacceptance` in this file.
//
// Use ISO dates. They sort, they are unambiguous across locales, and they match
// the "Last updated" line rendered on each page.
// ─────────────────────────────────────────────────────────────────────────────

export const LEGAL_VERSIONS = {
  // 2026-08-29 — Terms §4.5, fair use of "unlimited" allowances. Every paid
  // tier promises unlimited invoices, quotes, agreements and payslips, and
  // nothing defined what that meant. An unlimited promise with no fair-use
  // clause is either unenforceable against the one bad actor or, if acted on
  // anyway, a promise broken without a term to point at.
  //
  // Treated as MATERIAL: it adds a right to limit an allowance, so §11.2's
  // 30-day notice applies and the page carries an effective date of
  // 28 September 2026. The version string stays the PUBLICATION date, per this
  // file's ISO-date convention and the "Last updated" line on the page.
  //
  // NOTE: §11.2 also promises notice by email to every registered address.
  // Nothing sends it. That is an operational task, not a code change.
  terms:   '2026-08-29',
  // 2026-08-25 — Sentry session replay. The privacy policy gained a new
  // processing activity (masked, error-triggered session recording under
  // legitimate interests) and the Sentry subprocessor row now describes what it
  // actually receives. The cookie policy gained the matching "Error recordings"
  // section and the sentryReplaySession storage entry.
  //
  // `dpa` is deliberately NOT bumped. Sentry was already a named subprocessor,
  // the scope of what it receives has widened rather than the processor set
  // changing, and bumping dpa locks every practitioner out of adding clients
  // until they re-accept. Notice is the proportionate response; re-acceptance
  // is not. Revisit if the masking posture is ever loosened.
  privacy: '2026-08-25',
  cookies: '2026-08-25',
  refunds: '2026-08-23',
  /**
   * Data Processing Agreement — practitioners only.
   *
   * Unlike the others, this one GATES a feature: POST /api/practice/clients
   * refuses while the accepted version is behind this value. Bumping it stops
   * every practitioner from adding clients until they re-accept, which is the
   * intended behaviour for a material change to a processor contract — but it
   * is disruptive, so bump it only for a genuinely material change.
   */
  dpa:     '2026-08-23',
} as const;

export type LegalDocument = keyof typeof LEGAL_VERSIONS;

export const CURRENT_TERMS_VERSION   = LEGAL_VERSIONS.terms;
export const CURRENT_PRIVACY_VERSION = LEGAL_VERSIONS.privacy;

/**
 * True when a stored acceptance predates the current published version.
 *
 * A MISSING acceptance also returns true — accounts created before acceptance
 * was recorded have not demonstrably agreed to anything, and treating that as
 * "already accepted" would defeat the point of recording it.
 */
export function needsReacceptance(
  doc: LegalDocument,
  acceptedVersion: string | null | undefined,
): boolean {
  if (!acceptedVersion) return true;
  return acceptedVersion < LEGAL_VERSIONS[doc];
}
