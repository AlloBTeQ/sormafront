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
// So ZW sat exactly where UK sits: two of three, blocked on the same
// operational act, not on code. See READINESS below, which records this in data
// rather than prose so it cannot quietly go stale.
//
// ── Zimbabwe promoted, 20 October 2026 ───────────────────────────────────────
// The operational act happened on 19 October 2026, on the local database, as the
// ZW business test tenant: two USD runs (Aug, Sep 2026) prepared by the owner and
// approved by the seeded payroll approver under segregation of duties; the P2
// generated from them tied to the payslips (PAYE 548.48, NSSA 51.75 + 51.75,
// ZIMDEF 23.02 per month); the ITF16 reported "nothing declared" rather than a
// false balance; the P6 rendered from the same runs. Live as of this change.
// Open practitioner sign-offs are NOT closed by this — see READINESS.ZW.note.
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
const LIVE_REGIONS: readonly PayrollRegion[] = ['RSA', 'BW', 'ZM', 'ZW', 'NA', 'SZ', 'LS', 'KE', 'RW', 'AO', 'MZ'] as const;

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
  ZW: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'P2 produced end-to-end from approved runs on a real database on 2026-10-19 ' +
      '(ZW business tenant, Aug and Sep 2026, tied to the payslips); ITF16 and P6 ' +
      'rendered from the same runs. NSSA deductibility RESOLVED 2026-10-20 from ' +
      'ZIMRA\'s FDS Guide (deducted before the tables, shared USD 5,400 cap with ' +
      'pension). Still awaiting a Zimbabwean practitioner on: the NSSA ZiG ceiling ' +
      'and the pro-rata basis for mixed-currency remittances.',
  },
  SZ: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'PROMOTED 2026-10-26 on the owner\'s sign-off (Mvelase). Walked live on a real database 2026-10-21 and ' +
      'again 2026-10-25 (SZ business tenant, Nov 2026: four employees incl. pension over the 15% cap): ' +
      'payslips, ERS PAYE and ENPF schedules, the declaration of record (ENPF split stored, 47e44bb), PAYE05 ' +
      'certificates reconciled to the months, and the ledger all tied to hand-worked figures. ' +
      'Engine, ledger regime and schedules built and unit-green (2026-10-21, feat/sadc-expansion). ' +
      'Checked at source 2026-10-23: bands and rebate unchanged for 2026/27 (ERS; Budget 2026); ENPF base is ' +
      'gross cash wages (ENPF Order s2); employee ENPF deducted before tax (ERS lists SNPF as allowable); ' +
      'approved pension deductible to 15% of pensionable salary (LN 69 of 2024, via PaySpace/Sage); PAYE paid ' +
      'before the 7th, PAYE 04 return by the 7th (ERS); ENPF within 21 days (s14(3)); monthly TaxEase ' +
      'schedules replace the year-end recon from 2024/25; PAYE05 within 14 days of 30 June (Sage). ' +
      'Declarations of record built (c506e61). Open: TaxEase schedule columns, benefits in kind (IT/01/23 ' +
      'from 1 Sep 2026), contract profile, a live walk.',
  },
  LS: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'PROMOTED 2026-10-26 on the owner\'s sign-off (Mvelase). Walked live on a real database 2026-10-21 and ' +
      'again 2026-10-25 (LS business tenant, Nov 2026: four employees incl. pension over the 20% cap): payslips, ' +
      'the RSL PAYE schedule, the declaration of record, P.16 certificates reconciled to the months, a leaver\'s ' +
      '7-day P.16, and the ledger all tied to hand-worked figures. Employer pension over s95\'s combined 20% is ' +
      'the employer\'s lost deduction, not employee PAYE (s95(3)); FBT is still not built. ' +
      'Engine and schedules built and unit-green (2026-10-21, feat/sadc-expansion). Tables from RSL (Legal Notice 24 of 2026). ' +
      'Checked at source 2026-10-23: superannuation deductible before tax to 20% of employment income (RSL return ' +
      'instructions; P.16 line (e)); bonus taxed in the month paid — RSL publishes no averaging, over-withholding is ' +
      'refunded on assessment; year-end: Form P.16 to each employee and the statement to RSL within 28 days of 31 March, a leaver\'s P.16 within 7 days (ITO 1993 s163-164; Sage says end-June). ' +
      'Fringe benefits are an EMPLOYER tax (FBT, quarterly) outside PAYE — not built: rate 40% (RSL ruling 2011, Sage) ' +
      'vs 30% (ACCA 2025); the 1993 Fourth Schedule says 40%. Terminal-benefit 25% exemption not modelled. Declarations of record built (c506e61). ' +
      'Contract profile from the Labour Act 3 of 2024 (2026-10-23). Open: FBT rate, a live walk (the October run sits in review).',
  },
  RW: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'PROMOTED 2026-10-28 on the owner\'s sign-off (Mvelase). WALKED LIVE 2026-10-27 on the local database (Kigali Business Ltd, Oct 2026, four employees incl. PwC\'s ' +
      'car + housing case, a second job and a low earner): prepared by the owner, approved by the seeded payroll ' +
      'approver; payslips, the unified PAYE + RSSB schedule (FRW 2,475,137 due 15 Nov), the ledger (one RSSB ' +
      'payable 851,237, balanced, nothing in 2300) all tied to hand-worked figures. Fixed on the walk: deemed ' +
      'car/housing no longer counted as employer cost; tax year shown as 2026; whole francs; payslip shows taxable ' +
      'benefits and taxable income. Awaiting the owner\'s sign-off to promote. ' +
      'Built 2026-10-27 on feat/sadc-expansion (memos/RW-RECON-1.md). Engine ties PwC\'s worked sample to the franc ' +
      '(PAYE, pension, maternity, occupational hazards, CBHI). Checked at source: monthly bands 60k/100k/200k (RRA ' +
      'Calculate PAYE); pension 6% + 6% (RRA), dated table to 10% + 10% in 2030; no PAYE relief for RSSB. ' +
      'Not built: e-Tax upload file (layout unpublished), declaration of record, contract profile (agreements fall ' +
      'back), quarterly filing. Open: RSSB base for bonus, casual-labourer reading, MIFOTRA Q4 2026 laws.',
  },
  AO: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'PROMOTED 2026-10-28 on the owner\'s sign-off (Mvelase). WALKED LIVE 2026-10-27 on the local database (Luanda Business Lda, Oct 2026, four employees incl. the meal + ' +
      'transport allowance case and one just over the 150,000 cliff): owner prepared, approver released; IRT ' +
      'Kz 553,505.50 (due 30 Nov) and INSS 343,200 (due 10 Nov) schedules, the declaration of record (calendar shows ' +
      'filed), the Modelo 2 summary (zero variance) and the ledger all tied. Awaiting the owner\'s sign-off to promote. ' +
      'Built 2026-10-27 on feat/sadc-expansion (memos/AO-RECON-1.md). IRT on the Lei 14/25 table (from 1 Jan 2026; ' +
      'verified against PwC), cliffs at 150,000 and 200,000 kept as the law has them; AGT\'s own example ties ' +
      '(175,000 → 16,500). INSS 3% + 8% (DP 227/18). IRT is replaced by IRPS from 1 Jan 2027 — a 2027 table is ' +
      'needed before January. Not built: upload layouts, contract profile. Open: holiday subsidy outside INSS ' +
      'needs its own pay line; INSS 5% + 10% if decreed.',
  },
  MZ: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'PROMOTED 2026-10-28 on the owner\'s sign-off (Mvelase). WALKED LIVE 2026-10-27 on the local database (Maputo Business Lda, Oct 2026, five employees incl. 2 and 1 ' +
      'dependants and the OCAM and Mercans cases): owner prepared, approver released; IRPS MT 81,867.50 (due 20 Nov) ' +
      'and INSS 31,885 (due 10 Nov), the declaration of record, the certificates (zero variance) and the ledger all ' +
      'tied. Fixed on the walk: a stale schedule response overwrote the selected month (shared with SZ/LS). ' +
      'Awaiting the owner\'s sign-off to promote. ' +
      'Built 2026-10-27 on feat/sadc-expansion (memos/MZ-RECON-1.md). Withholding table on gross by dependants ' +
      '(OCAM and Mercans examples tie; two printing errors corrected by continuity). INSS 3% + 4%, not deducted ' +
      'before IRPS. Lei 11/2025: withholding no longer final from 2026, employees file Modelo 10 — the annual ' +
      'certificates support it. Not built: M/19 and SISSMO layouts, contract profile. Open: IRPS regulations ' +
      'under Lei 11/2025, 13th-month method.',
  },
  NA: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'PROMOTED 2026-10-22 on the owner\'s sign-off (Mvelase): bonus and commission stay OUT of the ' +
      'SSC base, the last open judgement call. ' +
      'Walked live 2026-10-21 on a real database (NA business tenant, Sep and Oct 2026, bonus, ' +
      'commission, overtime, allowance and pension): payslips, ETX/SSC/VET schedules, PAYE 5, ' +
      'declarations and the ledger all tied to hand-worked figures. Researched at source 2026-10-21: ' +
      'SSC basic wage per SS regs reg 1 (allowances, overtime, premiums excluded by name); N$12,500 ' +
      'ceiling from 1 Sep 2026 per the SSC despite GN 236/2026 saying 1 Mar; bonus taxed at the margin ' +
      '(NamRA withholds on the balance of remuneration, no separate method published); ECF is an ' +
      'employer assessment by industry class, E.As.6 by 31 Mar, N$101,625 cover ceiling. Year-end: ' +
      'ITAS FAQ Q7 — the detailed monthly ETX returns accumulate, NO annual recon is filed; PAYE 5 ' +
      'to each employee (30 days after Feb; 14 days after a leaver; 7 if the employer ceases). ' +
      'ETX upload file built 2026-10-22 on NamRA\'s own ETX_Template_Version_2 (pension / RA fund names ' +
      'and registration numbers entered once on the employer profile / employee record, d181e3c). ' +
      'Built 2026-10-23: fringe benefits (car, housing, loans) and the approved-housing-scheme third ' +
      '(b87d02f); leavers with the 14-day PAYE 5 and PAYE 5 PDFs (3935e3c). ' +
      'Still not modelled: per-km travel (on PAYE 5, no PAYE — Practice Note 3), the 18% part-time rate. ' +
      'Not yet proven: an ETX file uploaded to ITAS.',
  },
  KE: {
    runPersists: true,
    testSuite: true,
    outputsGenerated: true,
    note:
      'PROMOTED 2026-10-26 on the owner\'s sign-off (Mvelase). Walked live on a real database 2026-10-25 ' +
      '(KE business tenant, Oct 2026): PAYE with SHIF, NSSF and the housing levy deducted first, the KRA PAYE, ' +
      'NSSF, SHIF and AHL schedules, and a leaver\'s P9A tied to hand-worked figures. Engine rebuilt to the ' +
      'researched spec 2026-10-23 (SHIF replaces NHIF; NSSF Third Schedule limits dated to Feb 2027). ' +
      'Not yet built: a Kenya ledger regime (approvals post to the generic accounts), the KRA iTax P10 file.',
  },
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
