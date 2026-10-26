// src/lib/payroll/jurisdictionStatus.ts
// ─────────────────────────────────────────────────────────────────────────────
// Which payroll jurisdictions are LIVE, as ONE place.
//
// Why this is a module and not copy on the landing page
// ────────────────────────────────────────────────────
// The marketing page makes a claim about what works. Before this file, that
// claim was a hand-written list of flag pills — so it could drift from the
// product silently, and it had (the old page advertised all seven equally).
//
// ── What "live" means here ───────────────────────────────────────────────────
// The landing page states the bar in public: a jurisdiction is live once its
// payroll engine has run real payroll against that authority's rules. In code
// terms the observable test is whether its run screen can PERSIST a payroll
// run — a screen that only computes on-screen has not run payroll, it has
// previewed it.
//
// As of 23 August 2026, counting POST calls per regional run page:
//
//   zaprun  (RSA) — 4 POSTs   → persists
//   botrun  (BW)  — 4 POSTs   → persists
//   zambrun (ZM)  — 2 POSTs   → persists
//   ukrun   (UK)  — 3 POSTs   → persists  (create / approve+pay / send)
//   usrun   (US)  — 0 POSTs   → computes only
//   kenrun  (KE)  — 0 POSTs   → computes only
//   ugarun  (UG)  — 0 POSTs   → computes only
//
// So do NOT promote a region here because its engine or its screens exist.
// Promote it when its run persists, its outputs generate from the persisted
// run, and it has a test suite. See docs/compliance/UK-Engine-Recon.md for what
// that took for UK.
//
// ── Why UK is STILL in-development despite persisting ────────────────────────
// Persistence was one of three conditions. Against the bar above, as of
// 23 August 2026:
//
//   run persists           ✅ 3 POSTs, ledger journals post under UK_REGIME
//   test suite             ✅ 109 tests across ukPaye / ukAdapter / p32Period /
//                             uk/statutory
//   outputs generate       ⚠️  the P32 path is rebuilt and unit-green, but no P32
//                             has yet been generated end-to-end against a real
//                             saved run on a real database.
//
// What the rebuild fixed, all four of which were silent:
//   · the screen posted to /api/tax/p32/generate — a prefix with no route
//     directory behind it, so Generate 404'd for the whole life of the screen;
//   · the route filtered runs on `userId`, ranged over `startDate`/`endDate` and
//     summed `run.entries` — not one of those fields exists on models/PayrollRun,
//     which stores organizationId / periodStart / periodEnd / payslips;
//   · it answered a flat single-month object while the component renders
//     `data.months[]` and `data.totals`;
//   · it authenticated on a Bearer session id via SessionManager while every
//     other payroll route reads the auth-token cookie.
// Selection now runs through lib/payroll/uk/statutory.ts, which buckets by HMRC
// tax month (6th–5th) in Europe/London — the stored `taxYear`/`taxPeriod` are
// calendar-derived and wrong for the UK by construction.
//
// The remaining condition is not a code change: someone has to run a UK payroll
// against a real database and produce a real P32 from it. Flip UK to live after
// that, not before. Note the older /api/payroll/tax/p32 GET/POST still exists on
// SessionManager auth and is NOT the path the screen uses.
//
// ── Zimbabwe, added 26 August 2026 ───────────────────────────────────────────
// Against the same three conditions:
//
//   run persists           ✅ zimrun posts twice — the same shape as zambrun,
//                             which is live. Journals post under ZW_REGIME, with
//                             three payees rather than one residual bucket.
//   test suite             ✅ 104 tests across zwPaye / zwP2Declarations /
//                             zwPosting / zwPayslip / zwP6Certificate
//   outputs generate       ⚠️  the whole chain exists and is unit-green — P2
//                             declarations of record, an ITF16 reconciliation
//                             that can actually fail, a per-currency payslip and
//                             a P6 certificate — but no P2 has yet been produced
//                             end-to-end from a real saved run on a real
//                             database.
//
// So ZW sits exactly where UK sits: two of three, blocked on the same
// operational act, not on code. See READINESS below, which records this in data
// rather than prose so it cannot quietly go stale.
//
// ── One thing that is NOT a per-region caveat ────────────────────────────────
// SORMALITICS does not submit to ANY revenue authority. Not SARS eFiling, not
// TaRMS, not HMRC. It prepares, reconciles and records; the employer files.
// `TaxSubmission.status === 'submitted'` means the EMPLOYER told us they filed,
// never that we did.
//
// That is true of the three live jurisdictions too, so it is not a reason to
// hold ZW back — but it was stated in exactly one place in the product (the UK
// run screen) and nowhere else. FILING_NOTE below gives it one home so four
// screens cannot drift into four different promises.
//
// UK remains a genuine special case, and not for that reason: RTI must be filed
// ON OR BEFORE each payday, so a UK employer cannot run compliant payroll from
// this product alone. A monthly EMP201, P11 or P2 filed after the fact is a
// different proposition. Weigh that separately from the three conditions.
// ─────────────────────────────────────────────────────────────────────────────

import { REGION_META, type PayrollRegion } from './regionRouter';

export type JurisdictionStatus = 'live' | 'in-development';

/**
 * The live set. Everything not listed here is 'in-development'.
 *
 * Deliberately a list of the LIVE ones rather than a status per region: a new
 * region added to REGION_META then defaults to in-development, which is the
 * safe direction to fail.
 */
const LIVE_REGIONS: readonly PayrollRegion[] = ['RSA', 'BW', 'ZM', 'ZW', 'NA', 'SZ', 'LS', 'KE'] as const;

/**
 * The three published conditions, per region, as DATA.
 *
 * The header above used to carry this as prose, which is how a status note goes
 * stale: the words stay accurate-sounding while the product moves. Recorded here
 * so `readinessFor()` can be asserted in a test and so promoting a region is a
 * visible, reviewable change rather than an edit to a comment.
 *
 * `outputsGenerated` is the only one that cannot be established from the
 * repository. It is an operational fact — someone ran a real payroll against a
 * real database and produced a real statutory output from it — so it is recorded
 * with the evidence, and stays false until that has actually happened.
 */
export interface JurisdictionReadiness {
  runPersists: boolean;
  testSuite: boolean;
  outputsGenerated: boolean;
  /** What must be produced end-to-end before this region can be called live. */
  blockingArtefact?: string;
  note?: string;
}

export const READINESS: Partial<Record<PayrollRegion, JurisdictionReadiness>> = {
  RSA: { runPersists: true, testSuite: true, outputsGenerated: true },
  BW:  { runPersists: true, testSuite: true, outputsGenerated: true },
  ZM:  { runPersists: true, testSuite: true, outputsGenerated: true },
  ZW: { runPersists: true, testSuite: true, outputsGenerated: true, note: 'P2, ITF16 and P6 from real saved runs, 2026-10-19.' },
  NA: { runPersists: true, testSuite: true, outputsGenerated: true, note: 'ETX, SSC and PAYE 5 from real saved runs, 2026-10-21.' },
  SZ: { runPersists: true, testSuite: true, outputsGenerated: true, note: 'PAYE and ENPF schedules and PAYE05 from real saved runs, 2026-10-25.' },
  LS: { runPersists: true, testSuite: true, outputsGenerated: true, note: 'PAYE schedule and P.16 from real saved runs, 2026-10-25.' },
  KE: { runPersists: true, testSuite: true, outputsGenerated: true, note: 'PAYE, NSSF, SHIF and housing levy schedules and P9A from real saved runs, 2026-10-25.' },
  UK: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: false,
    blockingArtefact: 'an HMRC P32 produced from a real saved run on a real database',
    note:
      'Separately from the three conditions: there is no RTI. No FPS, no EPS, no ' +
      'submission. RTI is due on or before each payday, so a UK employer cannot run ' +
      'compliant payroll from this product alone. Weigh that before promoting UK.',
  },
};

/** True only when all three published conditions are met. */
export function meetsLiveBar(region: PayrollRegion): boolean {
  const r = READINESS[region];
  return !!r && r.runPersists && r.testSuite && r.outputsGenerated;
}

export function readinessFor(region: PayrollRegion): JurisdictionReadiness | undefined {
  return READINESS[region];
}

/**
 * Who files with the authority. ONE home for a product-wide truth.
 *
 * SORMALITICS does not submit to any revenue authority. Before this, that was
 * written on the UK run screen and nowhere else — so three live jurisdictions
 * said nothing at all, and a fourth screen would have been a fourth wording.
 *
 * Say it the same way everywhere. An employer who believes a return was filed
 * for them does not discover otherwise until a penalty arrives.
 */
export const FILING_NOTE_GENERAL =
  'SORMALITICS produces reports and schedules to support your filings. You review them, and you submit to the authority yourself.';

const FILING_PORTAL: Partial<Record<PayrollRegion, string>> = {
  RSA: 'SARS eFiling',
  BW:  'the BURS portal',
  ZM:  'the ZRA TaxOnline portal',
  ZW:  'ZIMRA TaRMS',
  UK:  'your RTI software',
  NA:  'NamRA ITAS (SSC and the NTA separately)',
  SZ:  'ERS (ENPF separately)',
  LS:  'RSL',
  KE:  'KRA iTax (NSSF and SHA separately)',
};

/** e.g. "Generate the P2 and supporting schedules — you file with ZIMRA TaRMS yourself." */
export function filingNoteFor(region: PayrollRegion): string {
  const portal = FILING_PORTAL[region];
  return portal
    ? `${FILING_NOTE_GENERAL.replace('the authority', portal)}`
    : FILING_NOTE_GENERAL;
}

export function statusFor(region: PayrollRegion): JurisdictionStatus {
  return LIVE_REGIONS.includes(region) ? 'live' : 'in-development';
}

export interface JurisdictionSummary {
  region: PayrollRegion;
  /** ISO-ish code shown to users. Not the internal region key — RSA renders ZA. */
  code: string;
  name: string;
  taxAuthority: string;
  currency: string;
  status: JurisdictionStatus;
}

/**
 * `RSA` is the internal key; `ZA` is the ISO 3166 code a reader expects.
 * Only this map bridges the two — nothing else should special-case it.
 */
const DISPLAY_CODE: Partial<Record<PayrollRegion, string>> = { RSA: 'ZA' };

/** Live jurisdictions first, each group in declaration order. */
export const JURISDICTIONS: JurisdictionSummary[] = (
  Object.keys(REGION_META) as PayrollRegion[]
)
  .map(region => ({
    region,
    code: DISPLAY_CODE[region] ?? region,
    name: REGION_META[region].name,
    taxAuthority: REGION_META[region].taxAuthority,
    currency: REGION_META[region].currency,
    status: statusFor(region),
  }))
  .sort((a, b) => (a.status === b.status ? 0 : a.status === 'live' ? -1 : 1));

export const LIVE_COUNT = JURISDICTIONS.filter(j => j.status === 'live').length;
export const IN_DEVELOPMENT_COUNT = JURISDICTIONS.length - LIVE_COUNT;

/** "ZA · BW · ZM" — for the stats strip, so the caption cannot drift either. */
export function codeList(status: JurisdictionStatus): string {
  return JURISDICTIONS.filter(j => j.status === status).map(j => j.code).join(' · ');
}
