// src/lib/plans.ts
// ═════════════════════════════════════════════════════════════════════════════
// THE canonical plan definition. Single source of truth for limits, feature
// access, pricing and display.
//
// Why this file is emphatic about being the only one
// ──────────────────────────────────────────────────
// There were five disagreeing definitions of what a plan allows:
//
//   src/config/plans.ts                     → drove /pricing        (free = 3 invoices)
//   src/lib/plans.ts                        → drove /api/billing/me (free = 5 invoices)
//   src/lib/billing/plans.ts                → drove /dashboard/billing
//   src/lib/services/billing/UsageTracker   → drove actual enforcement on agreements
//   src/lib/utils/subscriptionCheck.ts      → orphaned, different numbers again
//   plus inline copies in api/usage/check and api/usage/stats
//
// They disagreed on the invoice ceiling, on whether Professional includes
// payroll, and even on which plans exist. That is survivable while nothing is
// enforced. The moment money changes hands it is not: Stripe writes a plan key,
// and whichever table the enforcing route happens to read decides what the
// customer actually receives.
//
// Every one of those files is now a thin adapter over this one. If you are
// adding a limit, a feature flag or a price, it goes HERE and nowhere else.
// ═════════════════════════════════════════════════════════════════════════════

// The per-client floor lives in practitionerBillingMath because that module is
// dependency-free and is what actually enforces the quantity against Stripe.
// Importing it here rather than restating "2" keeps the number in one place —
// the whole point of this file.
import {
  PRACTITIONER_MIN_CLIENTS, computeGraduatedTotal, type RateBreak,
} from '@/lib/billing/practitionerBillingMath';

// ─── Plans ───────────────────────────────────────────────────────────────────

// Canonical ladder: free → professional → business → practitioner, with
// `cooperative` beside Business: the same company toolkit plus the member
// ledger and the Prudential Authority returns, for South African SACCOs and
// co-operative banks (owner's decision, 2026-11-03). `school` likewise beside
// Business: the company toolkit plus Sormalitics Edu (owner's decision,
// 2026-11-21 — the School plan is a plan of its own; Business no longer
// carries the school module), priced by learner tiers chosen at checkout.
// `team`/`enterprise` are retained as legacy aliases so historical User
// documents still validate; they are not sold.
export type Plan =
  | 'free'
  | 'professional'
  | 'business'
  | 'cooperative'
  | 'school'
  | 'practitioner'
  | 'team'
  | 'enterprise';

/** Plans a customer can actually buy today, in ladder order. */
export const PURCHASABLE_PLANS = ['free', 'professional', 'business', 'cooperative', 'school', 'practitioner'] as const;
export type PurchasablePlan = (typeof PURCHASABLE_PLANS)[number];

/**
 * Plans that can be bought through Stripe Checkout with no sales involvement.
 * Practitioner is priced per active client (metered as a quantity-synced
 * subscription, floor of 2 — see lib/billing/practitionerBilling.ts): checkout
 * starts at the minimum quantity and the count is reconciled automatically as
 * clients are added/removed, so it is self-serve like the others.
 */
export const SELF_SERVE_PLANS = ['professional', 'business', 'cooperative', 'school', 'practitioner'] as const;
export type SelfServePlan = (typeof SELF_SERVE_PLANS)[number];

export type BillingCycle = 'monthly' | 'annual';

// ─── Currency ────────────────────────────────────────────────────────────────

export type SupportedCurrency = 'ZAR' | 'GBP' | 'USD' | 'EUR' | 'KES' | 'ZMW';

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['ZAR', 'GBP', 'USD', 'EUR', 'KES', 'ZMW'];

/**
 * The currencies we OFFER at checkout today. A subset of SUPPORTED_CURRENCIES.
 *
 * EUR stays in the type and in SUPPORTED_CURRENCIES on purpose: historical
 * orders were priced in it, StoreOrder's schema enum still accepts it, and
 * Stripe's country→currency map still resolves EU countries to it. Removing it
 * from the type would make those existing rows fail to typecheck and, on the
 * StoreOrder enum, fail validation on their next write.
 *
 * What changed is that we no longer PRESENT it: the pricing selector and the
 * marketing copy offer ZAR, GBP and USD. Anything user-facing that lists
 * currencies must read this, not SUPPORTED_CURRENCIES.
 */
//
// 2026-10-17: ZAR only. The Stripe Prices are ZAR-only (no currency_options),
// so a GBP/USD selection was shown a foreign price and then charged in rand by
// the fallback in lib/stripe.ts.
//
// 2026-10-27: local pricing for Zimbabwe (USD), Kenya (KES) and Zambia (ZMW).
// The list is read from BILLING_OFFERED_CURRENCIES so a currency can be
// switched on the moment its `currency_options` exist on all six Stripe Prices,
// and not a deploy before. Order of operations, every time:
//   1. add the currency to each Price's currency_options in Stripe;
//   2. set BILLING_OFFERED_CURRENCIES (e.g. "ZAR,USD,KES,ZMW") in Vercel;
//   3. redeploy.
// Unset, it is ZAR only. Unknown codes are ignored; ZAR is always present.
function readOfferedCurrencies(): SupportedCurrency[] {
  const raw = (process.env.BILLING_OFFERED_CURRENCIES ?? process.env.NEXT_PUBLIC_BILLING_OFFERED_CURRENCIES ?? 'ZAR')
    .split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
  const list = raw.filter((c): c is SupportedCurrency => (SUPPORTED_CURRENCIES as string[]).includes(c));
  return list.includes('ZAR') ? list : ['ZAR', ...list];
}
export const OFFERED_CURRENCIES: SupportedCurrency[] = readOfferedCurrencies();

export const CURRENCY_META: Record<SupportedCurrency, { symbol: string; name: string }> = {
  ZAR: { symbol: 'R', name: 'South African Rand' },
  GBP: { symbol: '£', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  KES: { symbol: 'KSh ', name: 'Kenyan Shilling' },
  ZMW: { symbol: 'K', name: 'Zambian Kwacha' },
};

// ─── Jurisdiction → billing currency ─────────────────────────────────────────
//
// Where a customer runs payroll decides what they see on the pricing page and
// the billing cards. BW, SZ, LS and NA stay on rand (their currencies are
// pegged to it and cards there clear ZAR). Zimbabwe is dollarised; Kenya and
// Zambia get their own price points rather than a rand conversion (see the
// 2026-10-27 pricing note). Only a currency that is OFFERED is returned, so a
// market whose Stripe prices are not yet set up falls back to rand.
const JURISDICTION_CURRENCY: Record<string, SupportedCurrency> = {
  ZW: 'USD', KE: 'KES', ZM: 'ZMW', UK: 'GBP', US: 'USD',
};

export function billingCurrencyFor(jurisdiction: string | null | undefined): SupportedCurrency {
  const c = jurisdiction ? JURISDICTION_CURRENCY[jurisdiction.toUpperCase()] : undefined;
  return c && OFFERED_CURRENCIES.includes(c) ? c : 'ZAR';
}

// ─── Modules ─────────────────────────────────────────────────────────────────

/** Feature areas a plan can grant. Checked with `planHasAccess`. */
export type ModuleKey =
  | 'invoicing'
  | 'accounting'
  | 'agreements'
  | 'tax'
  | 'payroll'
  | 'reporting'
  | 'practice'
  | 'fleet'
  /**
   * The co-operative member ledger and the PA's CFI001–CFI005 returns.
   * Cooperative has it; Practitioner and Enterprise have it so a practice can
   * prepare a SACCO client's returns.
   */
  | 'regulatory'
  /**
   * Sormalitics Edu — school fee debtors, billing runs and statements. Shown
   * only on a school's books (lib/edu/isSchoolBooks.ts). The School plan
   * carries it; Practitioner and Enterprise too, so a practice can run a
   * school client's books. Business does not (owner's decision, 2026-11-21).
   */
  | 'school';

// ─── Limits ──────────────────────────────────────────────────────────────────

export interface PlanLimits {
  /** Monthly document creation ceilings. -1 = unlimited. */
  invoices:   number;
  /**
   * Quotations, metered separately from invoices.
   *
   * Sharing the invoice ceiling was the obvious shortcut and it prices the
   * product backwards: a customer who quotes ten prospects and wins two would
   * have paid for ten invoices to issue two. Quotes are a sales activity and a
   * won quote pays for its own invoice at conversion, so the two meters are
   * independent. Every paid tier is unlimited on both — the ceiling exists to
   * stop Starter being a free branded-PDF generator, not to ration selling.
   *
   * Professional was briefly capped at 15 (2026-08-29) and reverted the same
   * day. It would have been the only monthly ceiling on that tier able to
   * refuse a paying customer, and it rationed the FRONT of the funnel while
   * leaving the back open — bill without limit, but quote fifteen times. The
   * fence between Professional and Business is payroll (`payrollMode: 'draft'`,
   * 2 employees, 3 users), which tracks a real business event. Quote
   * volume does not. Do not re-add a quote ceiling to a paid tier.
   */
  quotes:     number;
  payslips:   number;
  agreements: number;
  /**
   * Max active business identities (issuers) this account may issue documents
   * as. Stops one seat being used as an invoicing bureau for unrelated
   * companies, and is the metric Practitioner is priced on.
   */
  issuers:      number;
  /** Max active employees in payroll. */
  employees:    number;
  /** Max team members, including the owner. */
  teamMembers:  number;
  /** Max report exports per hour. */
  reportExports: number;
  /** Max PDF uploads per month (agreements). */
  pdfUploads:   number;
  /** Max e-signature requests per month. */
  signatureRequests: number;
  /** Max custom templates per month. */
  templates:    number;
  /**
   * Co-operative members included in the price — the people on the member
   * register at a date (lib/regulatory). Only meaningful on a plan with the
   * 'regulatory' module; UNLIMITED everywhere else.
   */
  members:      number;
}

/**
 * Display metadata for a plan whose price is per unit rather than per account.
 *
 * This describes how the price is *presented and quoted*. It deliberately does
 * not decide what gets billed: for Practitioner the live quantity is owned by
 * lib/billing/practitionerBilling.ts, which keeps the Stripe subscription item
 * equal to max(minQuantity, active clients). Two places computing a billable
 * quantity is how a customer ends up charged for a number nobody can explain.
 */
export interface PerSeatPricing {
  /** Singular noun for one unit, e.g. "client". */
  unit:        string;
  /** Plural noun, e.g. "clients". */
  unitPlural:  string;
  /** Billing floor — charged even when fewer units are active. */
  minQuantity: number;
  /**
   * Graduated volume breaks, cheapest-last. Absent = a flat per-unit rate.
   *
   * These are GRADUATED, not a cliff: at 10 clients the first five are charged
   * at tier 1 and the next five at tier 2. A cliff ("21+ clients cost 19.99
   * each") would make the 21st client cheaper than the 20th *in total*, which
   * is a refund waiting to be discovered.
   *
   * The first tier's rate MUST also be `monthlyPrice`, so a caller that quotes
   * the headline rate and a caller that computes a total agree about client
   * number one. `plans.assertions.test.ts` fails if they drift apart.
   */
  volumeTiers?: readonly VolumeTier[];
}

/**
 * One graduated price break.
 *
 * `upTo` is inclusive and counts from unit 1, so `[{upTo:5},{upTo:20},{upTo:null}]`
 * reads as "1–5, 6–20, 21 and up". Exactly one tier may have `upTo: null` and it
 * must be the last, or the ladder has a hole above its highest break.
 */
export interface VolumeTier {
  /** Highest unit number charged at this rate, inclusive. `null` = no ceiling. */
  upTo: number | null;
  rate: Record<SupportedCurrency, number>;
}

/**
 * How much of the payroll module a plan may actually finish.
 *
 * `'draft'` is the Professional demo: build a run, calculate it, review live
 * payslips and see the statutory figures — but never approve, pay, distribute
 * or file. It exists because a payroll you cannot finalise shows the customer
 * exactly what they would get without being usable in anger, and the upgrade
 * prompt lands on the button they were already reaching for.
 *
 * Absent means the plan has no payroll at all; `access` is still the gate for
 * that. This only distinguishes *how far* a plan that HAS payroll may go.
 */
export type PayrollMode = 'full' | 'draft';

export interface PlanDefinition {
  key:      Plan;
  /** Display name shown to customers. */
  name:     string;
  tagline:  string;
  /** Small badge on the pricing card. Empty string = no badge. */
  badge:    string;
  limits:   PlanLimits;
  access:   ModuleKey[];
  /**
   * Monthly price per currency. `null` = free, or priced per client and
   * therefore not self-serve. Annual is derived — see `annualPrice`.
   */
  monthlyPrice: Record<SupportedCurrency, number> | null;
  /**
   * Annual price as a multiple of the monthly. 10 = two months free, which is
   * what the pricing page has always shown.
   */
  annualMonths: number;
  /** Bullet list on the pricing card. */
  features: string[];
  /** Call-to-action label. */
  cta:      string;
  /** Tailwind accent used by the pricing card. */
  accent:   string;
  highlighted?: boolean;
  /**
   * Env var holding the Stripe Price ID, per billing cycle. Absent for plans
   * that are not self-serve.
   */
  stripePriceEnv?: Record<BillingCycle, string>;
  /**
   * Set when `monthlyPrice` is a per-unit rate. Absent = flat subscription,
   * quantity is always 1.
   */
  perSeat?: PerSeatPricing;
  /** Not offered on the pricing page — legacy records only. */
  legacy?: boolean;
  /**
   * Limits that are a once-off allowance, not a monthly ceiling.
   *
   * A key listed here is counted over the account's whole life, and across
   * every account that shares a company registration, tax or VAT number
   * (lib/billing/freeAllowance.ts) — so the allowance belongs to the COMPANY,
   * not to an email address, and deleting a document does not hand it back.
   * Absent = every limit is monthly, which is the case for every paid plan.
   */
  lifetimeLimits?: readonly (keyof PlanLimits)[];
  /**
   * How far into the payroll lifecycle this plan may go. Only meaningful when
   * `access` includes 'payroll'. Undefined on a payroll plan is read as 'full'
   * by `payrollModeFor`, so an omission cannot silently lock a paying customer
   * out of their own payroll.
   */
  payrollMode?: PayrollMode;
  /**
   * Recurring price for one employee ABOVE `limits.employees`, per month.
   * `null`/absent = no overage is sold; the ceiling is a hard wall and the
   * customer must move up the ladder.
   *
   * ── WHY THIS IS NOT THE PLAN PRICE ÷ ANYTHING ───────────────────────────
   * Plan prices in this file carry a consistent ZAR:GBP ratio of about 23.
   * This one deliberately does NOT. A bundled subscription is never compared
   * line-for-line; a metered per-employee rate always is, by an accountant
   * with SimplePay's calculator open. £2.99 sits fairly against a UK payroll
   * add-on market of £1.50–£2.00 because our seat also carries distribution
   * and statutory filing. Applying the 23× ratio would put ZAR at R69, roughly
   * three times what South African vendors charge per head, and we would lose
   * the deal on one line item. The rand rate is priced to its own market on
   * purpose: R19.99 from 2026-11-11 (was R39), level with SimplePay (~R18.25 ex
   * VAT) and PaySpace (from R21.49).
   *
   * Anyone "fixing the inconsistency" by rescaling this row is reintroducing
   * the bug. It is inconsistent on purpose.
   */
  employeeOverage?: Record<SupportedCurrency, number> | null;
  /**
   * Payroll jurisdictions this plan is sold to. Absent = every jurisdiction.
   *
   * Cooperative is ['ZA']: its returns are the South African Prudential
   * Authority's. A currency check is not enough — `billingCurrencyFor` folds
   * Botswana, Namibia, Eswatini, Lesotho and others into the rand zone too.
   */
  soldIn?: readonly string[];
  /**
   * Monthly rate for one co-operative member above `limits.members`, or
   * null/absent while none is set — the members above the allowance are then
   * reported to the customer and to us, not charged.
   */
  memberOverage?: Record<SupportedCurrency, number> | null;
  /**
   * School: the monthly price by learners on the register (rand). The first
   * tier whose `upTo` covers the count applies; above the last, quoted.
   */
  learnerTiers?: readonly { upTo: number; monthly: number }[];
}

/**
 * The sentinel for "no ceiling". Exported because callers must compare against
 * it rather than hardcoding -1 — a quota check written as `limit > 0` silently
 * refuses every unlimited plan.
 */
export const UNLIMITED = -1;

// ─── The definitions ─────────────────────────────────────────────────────────

export const PLANS: Record<Plan, PlanDefinition> = {

  free: {
    key:     'free',
    name:    'Starter',
    tagline: 'Try SORMALITICS on real documents, free',
    badge:   'FREE TO TRY',
    // The four document limits below are a ONCE-OFF trial allowance, not a
    // monthly ceiling — see `lifetimeLimits`. Owner's rule, 2026-10-26: Starter
    // is a marketing tool. It exists so a business can see the quality of what
    // we produce on its own data — 3 invoices, 2 quotes, 1 payslip and 1
    // agreement, once, per company — not as a permanent free tier. A monthly
    // "1 payslip" would run a one-employee business's payroll forever.
    limits: {
      invoices: 3, quotes: 2, payslips: 1, agreements: 1,
      issuers: 1, employees: 0, teamMembers: 1,
      reportExports: 2, pdfUploads: 5, signatureRequests: 3, templates: 2, members: UNLIMITED,
    },
    lifetimeLimits: ['invoices', 'quotes', 'payslips', 'agreements'],
    access: ['invoicing'],
    monthlyPrice: { ZAR: 0, GBP: 0, USD: 0, EUR: 0, KES: 0, ZMW: 0 },
    annualMonths: 10,
    features: [
      '3 invoices to try',
      '2 quotations to try',
      '1 payslip to try',
      '1 legal agreement to try',
      'Your logo and details on every document',
      'PDF generation & email delivery',
      'No card needed',
    ],
    cta:    'Start Free',
    accent: 'emerald',
  },

  professional: {
    key:     'professional',
    name:    'Professional',
    tagline: 'Everything an independent professional needs',
    badge:   'MOST POPULAR',
    limits: {
      invoices: UNLIMITED, quotes: UNLIMITED, payslips: 12, agreements: 25,
      // Two employees on a LIVE payroll (owner's decision, 2026-11-11 pricing
      // review: draft-only payroll priced the owner-managed company out — it had
      // to buy Business to pay two people). Twelve payslips a month covers a
      // weekly run for two plus a re-run; the employee ceiling is what moves a
      // growing company up to Business, not a switched-off feature.
      //
      // teamMembers 2 = three people in total: `teamMembers` counts only the
      // people the owner ADDS, never the owner (see countTeamMemberSeats). Owner's
      // rule, 2026-10-15: Professional is three staff, and the buyer adds the
      // other two by email. With three people a Professional team can easily end
      // up with one person both capturing and approving — that is expected on
      // this tier, and segregationOfDuties.ts waives the split here on purpose.
      issuers: 1, employees: 2, teamMembers: 2,
      reportExports: 20, pdfUploads: 100, signatureRequests: 50, templates: 20, members: UNLIMITED,
    },
    // Payroll IS on Professional now, but only as far as `review` — see
    // `payrollMode` below. The previous comment here said "no payroll on
    // Professional — that is the Business tier's reason to exist", and that
    // reason still holds: Business is where a run can be approved, paid,
    // distributed and filed. What changed is that Professional can now SEE the
    // thing it would be buying, with its own two employees in it.
    //
    // 'reporting' added 2026-09-19: Professional is a one-owner-plus-an-
    // administrator tier, and the owner is meant to see the executive
    // dashboard — `teamMembers` above was 1 to make that "mainly one man
    // shop" description literal; it is now 2 (three users in all). The plan-level array was never actually the
    // control for this (see `assertModule` in entitlements.ts and the note on
    // `requireModule` in moduleAccess.ts, which is what stops a team member
    // from getting it), but a module the plan legitimately grants belongs in
    // this list — the array is meant to describe the truth, even where it
    // isn't the enforcement.
    access: ['invoicing', 'accounting', 'agreements', 'tax', 'payroll', 'reporting'],
    // 'full' since 2026-11-11 — was 'draft'. See the note on `limits` above.
    payrollMode: 'full',
    // 2026-11-11 price list v3 (excl. VAT; the seller is not VAT-registered).
    // R299.99 sits under Sage Start + Sage Payroll (R367 incl. VAT, ~R319 ex).
    monthlyPrice: { ZAR: 299.99, GBP: 17.99, USD: 15.99, EUR: 20.99, KES: 1499, ZMW: 339 },
    annualMonths: 10,
    features: [
      'Unlimited invoices & quotes',
      'Full accounting — GL, trial balance, reports',
      'Legal agreements with e-signature',
      'Full payroll — 2 employees included',
      '3 users — you plus 2 team members',
      'Tax compliance (EMP201, P32, Form 941)',
      'Custom branding on all documents',
      'Recurring invoices on autopilot',
      'Priority email support',
    ],
    highlighted: true,
    cta:    'Get Started',
    accent: 'teal',
    stripePriceEnv: {
      monthly: 'STRIPE_PRICE_PROFESSIONAL_MONTHLY',
      annual:  'STRIPE_PRICE_PROFESSIONAL_ANNUAL',
    },
  },

  business: {
    key:     'business',
    name:    'Business',
    tagline: 'For growing teams that run payroll',
    badge:   'TEAM POWER',
    limits: {
      invoices: UNLIMITED, quotes: UNLIMITED, payslips: UNLIMITED, agreements: UNLIMITED,
      // One business. Group structures with several registered entities belong
      // on Practitioner, where entities are the billing metric.
      //
      // teamMembers is 15, not 10, ON PURPOSE. It used to be 10, which is now
      // the employee ceiling — two different limits carrying the same number is
      // how a support conversation and a customer end up meaning different
      // things by "you're allowed ten". Raising it also costs no existing
      // customer anything, which lowering `employees` to disambiguate would.
      issuers: 1, employees: 10, teamMembers: 15,
      reportExports: UNLIMITED, pdfUploads: UNLIMITED, signatureRequests: UNLIMITED, templates: UNLIMITED, members: UNLIMITED,
    },
    access: ['invoicing', 'accounting', 'agreements', 'tax', 'payroll', 'reporting'],
    payrollMode: 'full',
    // 2026-11-11 price list v3: R699.99 (was R899.99), under Sage Standard +
    // Sage Payroll for 10 staff (R920 incl. VAT, ~R800 ex).
    monthlyPrice: { ZAR: 699.99, GBP: 39.99, USD: 39.00, EUR: 44.99, KES: 2999, ZMW: 799 },
    // £39.99 ÷ 10 included employees is £4.00 a head, so £2.99 for employee 11
    // is a volume step down rather than a penalty. Read the comment on
    // `employeeOverage` in PlanDefinition before touching the ZAR figure.
    employeeOverage: { ZAR: 19.99, GBP: 2.99, USD: 1.29, EUR: 3.49, KES: 149, ZMW: 25 },
    annualMonths: 10,
    features: [
      'Everything in Professional',
      'Full payroll — 10 employees included',
      'Extra employees at {overage} each per month',
      'Payslip generation & distribution',
      'Team collaboration (up to 15 members)',
      'Advanced reporting & schedules',
      'Dedicated support channel',
    ],
    cta:    'Get Started',
    accent: 'indigo',
    stripePriceEnv: {
      monthly: 'STRIPE_PRICE_BUSINESS_MONTHLY',
      annual:  'STRIPE_PRICE_BUSINESS_ANNUAL',
    },
  },

  cooperative: {
    key:     'cooperative',
    name:    'Co-operative',
    tagline: 'For SACCOs and co-operative banks — member ledger and PA returns',
    badge:   'PA RETURNS',
    // Business's limits, plus the member allowance. Owner's decisions,
    // 2026-11-03: priced for quarterly PA returns (R999.99 then; R849.99 from
    // the 2026-11-11 price list v3, i.e. Business + R150) — the price
    // is set for a book that is busy four times a year, not every day — South
    // Africa only, and nothing extra for members until the register passes 750.
    limits: {
      invoices: UNLIMITED, quotes: UNLIMITED, payslips: UNLIMITED, agreements: UNLIMITED,
      issuers: 1, employees: 10, teamMembers: 15,
      reportExports: UNLIMITED, pdfUploads: UNLIMITED, signatureRequests: UNLIMITED, templates: UNLIMITED,
      members: 750,
    },
    access: ['invoicing', 'accounting', 'agreements', 'tax', 'payroll', 'reporting', 'regulatory'],
    payrollMode: 'full',
    // Rand only. The other currencies are placeholders the type requires and
    // are never quoted: `soldIn` refuses every jurisdiction but South Africa,
    // and `monthlyPrice()` returns null outside it (see below).
    monthlyPrice: { ZAR: 849.99, GBP: 0, USD: 0, EUR: 0, KES: 0, ZMW: 0 },
    employeeOverage: { ZAR: 19.99, GBP: 0, USD: 0, EUR: 0, KES: 0, ZMW: 0 },
    // Not set yet: above 750 members the excess is shown, not billed.
    memberOverage: null,
    soldIn: ['ZA'],
    annualMonths: 10,
    features: [
      'Everything in Business',
      'Member register — savings, shares and loans',
      'Member activity posts straight to your ledger',
      'Loan book with arrears, interest runs and provisions',
      "Prudential Authority returns CFI001–CFI005, on the PA's own workbook",
      'Prudential ratio checks before you sign',
      'Up to 750 members included',
    ],
    cta:    'Get Started',
    accent: 'teal',
    stripePriceEnv: {
      monthly: 'STRIPE_PRICE_COOPERATIVE_MONTHLY',
      annual:  'STRIPE_PRICE_COOPERATIVE_ANNUAL',
    },
  },

  school: {
    key:     'school',
    name:    'School',
    tagline: 'For independent schools — fee billing, statements and subsidy accounting',
    badge:   'SCHOOLS',
    // Business's limits. Priced by learners on the register (owner's decision,
    // 2026-11-21): R1,250 a month to 300 learners, R1,750 to 599, custom from 600
    // — the same shape as the IFRS 16 Leases tiers. Self-serve: the
    // buyer picks the tier at checkout; the register is held to it
    // (lib/edu/learnerCap.ts) and the tier can be changed from Billing.
    limits: {
      invoices: UNLIMITED, quotes: UNLIMITED, payslips: UNLIMITED, agreements: UNLIMITED,
      issuers: 1, employees: 10, teamMembers: 15,
      reportExports: UNLIMITED, pdfUploads: UNLIMITED, signatureRequests: UNLIMITED, templates: UNLIMITED, members: UNLIMITED,
    },
    access: ['invoicing', 'accounting', 'agreements', 'tax', 'payroll', 'reporting', 'school'],
    payrollMode: 'full',
    // The first tier's price — what "from" shows. Rand only, as Co-operative.
    monthlyPrice: { ZAR: 1250, GBP: 0, USD: 0, EUR: 0, KES: 0, ZMW: 0 },
    // Owner, 2026-11-21: 1–300 R1,250, 301–599 R1,750, 600+ custom pricing.
    learnerTiers: [
      { upTo: 300, monthly: 1250 },
      { upTo: 599, monthly: 1750 },
    ],
    // One Volume-tiered Stripe price per cycle; the subscription quantity is
    // the learners covered (300 or 599) and Stripe picks the band. The price
    // also carries a 600+ band (SCHOOL_STRIPE_TOP_BAND) for completeness, but
    // the app never sends 600 or more — those schools are quoted.
    stripePriceEnv: { monthly: 'STRIPE_PRICE_SCHOOL_MONTHLY', annual: 'STRIPE_PRICE_SCHOOL_ANNUAL' },
    employeeOverage: { ZAR: 19.99, GBP: 0, USD: 0, EUR: 0, KES: 0, ZMW: 0 },
    soldIn: ['ZA'],
    annualMonths: 10,
    features: [
      'Everything in Business',
      'Up to 300 learners: R1,250 a month',
      '301 to 599 learners: R1,750 a month',
      '600 learners or more: custom pricing',
      'Family accounts, learner register and monthly billing run',
      'Statements by e-mail, bank statement import and cash receipting',
      'Age analysis, approvals and payment arrangements',
      'Subsidy fund accounting and the quarterly subsidy report',
    ],
    cta:    'Get Started',
    accent: 'sky',
  },

  practitioner: {
    key:     'practitioner',
    name:    'Practitioner',
    tagline: 'Built for accounting firms — priced per client',
    badge:   'PER CLIENT',
    limits: {
      invoices: UNLIMITED, quotes: UNLIMITED, payslips: UNLIMITED, agreements: UNLIMITED,
      // Unlimited issuers is the product here, not a leak: a practitioner is
      // billed per client, so each additional business is revenue.
      //
      // `employees` is 10, NOT unlimited, and it applies to the practitioner's
      // OWN books — their firm is one business on Business terms like any
      // other. Each managed client gets its own 10 through the grant, resolved
      // in lib/billing/entitlements.ts. Leaving this unlimited was a real leak:
      // it let one tenancy run a 400-person payroll for the price of a slot.
      issuers: UNLIMITED, employees: 10, teamMembers: UNLIMITED,
      reportExports: UNLIMITED, pdfUploads: UNLIMITED, signatureRequests: UNLIMITED, templates: UNLIMITED, members: UNLIMITED,
    },
    access: ['invoicing', 'accounting', 'agreements', 'tax', 'payroll', 'reporting', 'practice', 'regulatory', 'school'],
    payrollMode: 'full',
    // The FIRST tier's rate, and it must stay equal to volumeTiers[0].rate —
    // this is what the pricing card quotes as the headline "per client" price.
    monthlyPrice: { ZAR: 469.99, GBP: 29.99, USD: 26.00, EUR: 34.99, KES: 2499, ZMW: 529 },
    // Same rate as Business, deliberately. If a practitioner's employees were
    // cheaper than a Business customer's, the arbitrage is to register one
    // 100-person company as ten "clients".
    employeeOverage: { ZAR: 19.99, GBP: 2.99, USD: 1.29, EUR: 3.49, KES: 149, ZMW: 25 },
    annualMonths: 10,
    features: [
      'All Business features per client',
      'White-label branding',
      'Client management portal',
      'Bulk operations across clients',
      'Practice analytics dashboard',
      'Priority dedicated support',
      'Volume pricing — from {tier2} at 6 clients, {tier3} at 21',
    ],
    cta:    'Get Started',
    accent: 'purple',
    // Per-client pricing is now live as a quantity-synced subscription: the
    // Price below is a per-unit recurring price and checkout starts at the
    // 2-client minimum. lib/billing/practitionerBilling.ts keeps the quantity
    // equal to max(2, active clients). Set these env vars to the per-client Price.
    stripePriceEnv: {
      monthly: 'STRIPE_PRICE_PRACTITIONER_MONTHLY',
      annual:  'STRIPE_PRICE_PRACTITIONER_ANNUAL',
    },
    perSeat: {
      unit:        'client',
      unitPlural:  'clients',
      minQuantity: PRACTITIONER_MIN_CLIENTS,
      // ── THE CONSTRAINT THIS LADDER EXISTS TO SATISFY ──────────────────────
      // A single-entity customer must find Business CHEAPER than Practitioner
      // at its 2-client floor, or every new signup buys the wrong plan and we
      // lose the top of the funnel to our own price list.
      //
      //   Business            £39.99
      //   Practitioner floor  2 x £29.99 = £59.98      ✓ Business wins by £19.99
      //
      // Under the old flat £19.99 the floor was £39.98 — one penny under a
      // £39.99 Business. That is not a margin, it is a coin toss, and it is why
      // these two numbers may never move independently.
      // `practitionerBillingMath.test.ts` asserts the inequality directly.
      volumeTiers: [
      //   2026-11-11 (price list v3), per currency — floor vs Business:
      //     ZAR 2 x 469.99 = 939.98 vs 699.99 · USD 52 vs 39 · KES 4,998 vs 2,999
      //     ZMW 1,058 vs 799 · GBP 59.98 vs 39.99 · EUR 69.98 vs 44.99
        { upTo: 5,    rate: { ZAR: 469.99, GBP: 29.99, USD: 26.00, EUR: 34.99, KES: 2499, ZMW: 529 } },
        { upTo: 20,   rate: { ZAR: 379.99, GBP: 24.99, USD: 21.00, EUR: 29.99, KES: 1999, ZMW: 429 } },
        { upTo: null, rate: { ZAR: 309.99, GBP: 19.99, USD: 17.00, EUR: 21.99, KES: 1599, ZMW: 349 } },
      ],
    },
  },

  // ── Legacy aliases. Not sold; kept so historical User documents validate and
  //    existing customers keep the access they were promised.
  team: {
    key:     'team',
    name:    'Business',
    tagline: 'Legacy plan',
    badge:   '',
    limits: {
      invoices: UNLIMITED, quotes: UNLIMITED, payslips: UNLIMITED, agreements: UNLIMITED,
      issuers: 1, employees: 25, teamMembers: 15,
      reportExports: UNLIMITED, pdfUploads: UNLIMITED, signatureRequests: UNLIMITED, templates: UNLIMITED, members: UNLIMITED,
    },
    access: ['invoicing', 'accounting', 'agreements', 'tax', 'payroll', 'reporting'],
    monthlyPrice: null,
    annualMonths: 10,
    features: [],
    cta:    '',
    accent: 'indigo',
    legacy: true,
  },

  enterprise: {
    key:     'enterprise',
    name:    'Enterprise',
    tagline: 'Legacy plan',
    badge:   '',
    limits: {
      invoices: UNLIMITED, quotes: UNLIMITED, payslips: UNLIMITED, agreements: UNLIMITED,
      issuers: UNLIMITED, employees: UNLIMITED, teamMembers: UNLIMITED,
      reportExports: UNLIMITED, pdfUploads: UNLIMITED, signatureRequests: UNLIMITED, templates: UNLIMITED, members: UNLIMITED,
    },
    access: ['invoicing', 'accounting', 'agreements', 'tax', 'payroll', 'reporting', 'practice', 'regulatory', 'school'],
    monthlyPrice: null,
    annualMonths: 10,
    features: [],
    cta:    '',
    accent: 'purple',
    legacy: true,
  },
};

// ─── Lookups ─────────────────────────────────────────────────────────────────

/** Normalise an arbitrary stored value to a known plan. Unknown → `free`. */
export function normalisePlan(plan: string | null | undefined): Plan {
  if (plan && plan in PLANS) return plan as Plan;
  // `starter` was the pricing page's name for the free tier and may exist in
  // older records or Stripe metadata.
  if (plan === 'starter') return 'free';
  return 'free';
}

export function getPlan(plan: string | null | undefined): PlanDefinition {
  return PLANS[normalisePlan(plan)];
}

/** Limits for a plan. Falls back to `free` for anything unrecognised. */
export function getPlanLimits(plan: string | null | undefined): PlanLimits {
  return getPlan(plan).limits;
}

/** Is this limit a once-off allowance on this plan, rather than monthly? */
export function isLifetimeLimit(plan: string | null | undefined, key: keyof PlanLimits): boolean {
  return getPlan(plan).lifetimeLimits?.includes(key) ?? false;
}

/** Modules a plan grants. */
export function planAccess(plan: string | null | undefined): ModuleKey[] {
  return getPlan(plan).access;
}

/** Whether a plan grants a module. */
export function planHasAccess(plan: string | null | undefined, module: ModuleKey): boolean {
  return getPlan(plan).access.includes(module);
}

/** Human-readable plan name. */
export function planDisplayName(plan: string | null | undefined): string {
  return getPlan(plan).name;
}

/** Plans shown on the pricing page, in ladder order. */
export const PRICING_PLANS: PlanDefinition[] =
  PURCHASABLE_PLANS.map(key => PLANS[key]);

/**
 * The School plan's monthly price for a register of `learners`, or null above
 * the last tier (quoted). Learners are those on the register now.
 */
export function schoolTierFor(learners: number): { upTo: number; monthly: number; index: number } | null {
  const tiers = PLANS.school.learnerTiers ?? [];
  const i = tiers.findIndex(t => learners <= t.upTo);
  return i < 0 ? null : { ...tiers[i], index: i };
}

export const SCHOOL_TIER_SIZES = [300, 599] as const;
export type SchoolTierSize = (typeof SCHOOL_TIER_SIZES)[number];
/** From this many learners the School plan is custom-priced (contact support). */
export const SCHOOL_QUOTED_FROM = 600;
/** The 600+ band on the Stripe price, monthly rand — never charged by the app. */
export const SCHOOL_STRIPE_TOP_BAND = 2500;

/** The School tier a subscription quantity sits in (Volume: the first band at or above it). */
export function schoolTierOfQuantity(q: number | null | undefined): SchoolTierSize | null {
  if (!q || q < 1 || q >= SCHOOL_QUOTED_FROM) return null;
  return q <= 300 ? 300 : 599;
}

/** The monthly (or annual) price of a School tier, rand. */
export function schoolTierPrice(upTo: number, cycle: BillingCycle): number | null {
  const t = (PLANS.school.learnerTiers ?? []).find(x => x.upTo === upTo);
  if (!t) return null;
  return cycle === 'annual' ? t.monthly * PLANS.school.annualMonths : t.monthly;
}

/** Why a plan cannot be bought from a company's country. */
export function notSoldInMessage(plan: string): string {
  if (plan === 'school') return 'The School plan is for South African schools.';
  if (plan === 'cooperative') return 'The Co-operative plan is for South African co-operatives registered with the Prudential Authority.';
  return 'This plan is not sold in your company\'s country.';
}

export function isSelfServe(plan: string): plan is SelfServePlan {
  return (SELF_SERVE_PLANS as readonly string[]).includes(plan);
}

// ─── Per-unit pricing ────────────────────────────────────────────────────────

/** Per-unit pricing metadata, or null when the plan is a flat subscription. */
export function perSeatConfig(plan: string | null | undefined): PerSeatPricing | null {
  return getPlan(plan).perSeat ?? null;
}

/** Billing floor for a plan. 1 for flat plans. */
export function minQuantityFor(plan: string | null | undefined): number {
  return getPlan(plan).perSeat?.minQuantity ?? 1;
}

/**
 * Quantity to *quote* for a plan. Flat plans collapse to 1; per-unit plans are
 * never quoted below their floor.
 *
 * This is presentation only. What Stripe actually bills a practitioner is
 * reconciled against the purchased slot count on the Stripe subscription,
 * which is the authority (see lib/billing/practitionerBilling.ts).
 */
export function displayQuantity(plan: string | null | undefined, requested: unknown): number {
  const cfg = perSeatConfig(plan);
  if (!cfg) return 1;
  const n = Math.floor(Number(requested));
  if (!Number.isFinite(n)) return cfg.minQuantity;
  return Math.max(cfg.minQuantity, n);
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

/** Monthly price in a currency, or null when the plan is not fixed-price. */
export function monthlyPrice(plan: Plan, currency: SupportedCurrency): number | null {
  if (PLANS[plan].soldIn && !planSoldInCurrency(plan, currency)) return null;
  return PLANS[plan].monthlyPrice?.[currency] ?? null;
}

/**
 * Whether `plan` is sold to a company whose payroll jurisdiction is
 * `jurisdiction`. 'RSA' is the payroll engine's spelling of South Africa.
 */
export function planSoldIn(plan: string | null | undefined, jurisdiction: string | null | undefined): boolean {
  const list = getPlan(plan).soldIn;
  if (!list) return true;
  const j = String(jurisdiction ?? '').toUpperCase();
  const norm = j === 'RSA' ? 'ZA' : j === 'UK' ? 'GB' : j;
  // An account with no jurisdiction on record is billed in rand (see
  // billingCurrencyFor) and was registered before the jurisdiction question;
  // those are South African.
  return list.includes(norm || 'ZA');
}

/** A jurisdiction-limited plan is quoted only in the currency its jurisdictions bill in. */
function planSoldInCurrency(plan: Plan, currency: SupportedCurrency): boolean {
  const list = PLANS[plan].soldIn;
  if (!list) return true;
  return list.some((j) => billingCurrencyFor(j) === currency);
}

/** Annual price — `annualMonths` × the monthly rate. */
export function annualPrice(plan: Plan, currency: SupportedCurrency): number | null {
  const def = PLANS[plan];
  const m   = def.monthlyPrice?.[currency];
  if (m === undefined || m === null) return null;
  return Math.round(m * def.annualMonths * 100) / 100;
}

export function priceFor(
  plan: Plan,
  currency: SupportedCurrency,
  cycle: BillingCycle,
): number | null {
  return cycle === 'annual' ? annualPrice(plan, currency) : monthlyPrice(plan, currency);
}

/**
 * The graduated price ladder for a per-unit plan in one currency, or null when
 * the plan is flat or has no volume breaks.
 */
export function rateBreaksFor(
  plan: string | null | undefined,
  currency: SupportedCurrency,
): RateBreak[] | null {
  const tiers = perSeatConfig(plan)?.volumeTiers;
  if (!tiers?.length) return null;
  return tiers.map(t => ({ upTo: t.upTo, rate: t.rate[currency] }));
}

/**
 * What a given quantity costs per cycle.
 *
 * Flat plans: identical to `priceFor`. Per-unit plans WITH volume breaks: the
 * graduated total over the quoted quantity. Per-unit plans without: rate ×
 * quantity, which is what this function used to do for everything.
 *
 * The graduated branch is the one that matters — quoting rate × quantity for a
 * tiered plan overcharges every practitioner past their first break, on the
 * page where they decide whether to buy.
 */
export function totalPriceFor(
  plan: Plan,
  currency: SupportedCurrency,
  cycle: BillingCycle,
  quantity = 1,
): number | null {
  const qty    = displayQuantity(plan, quantity);
  const breaks = rateBreaksFor(plan, currency);

  if (breaks) {
    const monthly = computeGraduatedTotal(qty, breaks);
    const months  = cycle === 'annual' ? PLANS[plan].annualMonths : 1;
    return Math.round(monthly * months * 100) / 100;
  }

  const unit = priceFor(plan, currency, cycle);
  if (unit === null) return null;
  return Math.round(unit * qty * 100) / 100;
}

// ─── Payroll depth and employee overage ──────────────────────────────────────

/**
 * How far into the payroll lifecycle a plan may go, or null when it has no
 * payroll at all.
 *
 * A plan that grants 'payroll' but forgets `payrollMode` is read as 'full'.
 * That default is deliberate and one-directional: forgetting the field on a
 * paying tier must never quietly lock them out of their own payroll run, and a
 * plan that should have been restricted will be caught by the assertion test
 * rather than by a customer.
 */
export function payrollModeFor(plan: string | null | undefined): PayrollMode | null {
  const def = getPlan(plan);
  if (!def.access.includes('payroll')) return null;
  return def.payrollMode ?? 'full';
}

/** Whether this plan may take a payroll run past `review`. */
export function canFinalisePayroll(plan: string | null | undefined): boolean {
  return payrollModeFor(plan) === 'full';
}

/**
 * Monthly rate for one employee above the plan's ceiling, or null when the plan
 * sells no overage and the ceiling is a hard wall.
 */
export function employeeOverageRate(
  plan: string | null | undefined,
  currency: SupportedCurrency,
): number | null {
  return getPlan(plan).employeeOverage?.[currency] ?? null;
}

/** Whether exceeding `limits.employees` is purchasable rather than a wall. */
export function sellsEmployeeOverage(plan: string | null | undefined): boolean {
  return getPlan(plan).employeeOverage != null;
}

/** Currencies quoted in whole units on the price list (KSh 1,499, not KSh 1,499.00). */
export const WHOLE_UNIT_CURRENCIES: SupportedCurrency[] = ['KES', 'ZMW'];

export function formatPrice(amount: number, currency: SupportedCurrency): string {
  const symbol = CURRENCY_META[currency].symbol;
  // en-GB, not en-ZA: ICU's en-ZA prints "R899,99" and "R5 500", which the
  // price list has never shown. Dot decimal, comma thousands, everywhere.
  const value  = amount % 1 === 0 || WHOLE_UNIT_CURRENCIES.includes(currency)
    ? Math.round(amount).toLocaleString('en-GB')
    : amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${value}`;
}

/**
 * A plan's feature bullets with money printed in ONE currency.
 *
 * Two bullets quote a price — the employee overage and the Practitioner volume
 * breaks. They used to be typed out as "£2.99 / R39", which was wrong for
 * every other currency the moment there was one. The definitions now carry
 * {overage}, {tier2} and {tier3}; this fills them from the same tables the
 * headline price comes from, so the bullet and the invoice cannot disagree.
 */
export function planFeatures(plan: string | null | undefined, currency: SupportedCurrency = 'ZAR'): string[] {
  const def = getPlan(plan);
  const breaks = rateBreaksFor(def.key, currency) ?? [];
  const overage = def.employeeOverage?.[currency];
  return def.features.map(f => f
    .replace('{overage}', overage != null ? formatPrice(overage, currency) : '—')
    .replace('{tier2}', breaks[1] ? formatPrice(breaks[1].rate, currency) : '—')
    .replace('{tier3}', breaks[2] ? formatPrice(breaks[2].rate, currency) : '—'));
}

/**
 * Resolve the Stripe Price ID for a self-serve plan and cycle.
 * Returns null when the env var is unset — Stripe is simply not configured yet,
 * which the caller should surface as a 503, not a crash.
 */
/** Other env names a plan's price is read from — the names the owner set in Vercel. */
const STRIPE_PRICE_ENV_ALIASES: Partial<Record<Plan, Record<BillingCycle, string>>> = {
  // Owner, 2026-11-21: the School prices were set under these names.
  school: { monthly: 'STRIPE_PRICE_SCHOOL_300_MONTHLY', annual: 'STRIPE_PRICE_SCHOOL_600_ANNUAL' },
};

export function resolveStripePriceId(plan: SelfServePlan, cycle: BillingCycle): string | null {
  const envKey = PLANS[plan].stripePriceEnv?.[cycle];
  if (!envKey) return null;
  const alias = STRIPE_PRICE_ENV_ALIASES[plan]?.[cycle];
  return process.env[envKey]?.trim() || (alias ? process.env[alias]?.trim() : undefined) || null;
}

/**
 * Reverse of `resolveStripePriceId` — which plan and cycle does a Stripe Price
 * ID belong to? Returns null for a price we never configured (one-off store
 * items, retired prices), which callers must treat as "unknown" rather than
 * falling back to a default plan.
 */
export function planFromStripePriceId(
  priceId: string | null | undefined,
): { plan: Plan; cycle: BillingCycle } | null {
  if (!priceId) return null;
  // A practitioner's per-zone client line is still the Practitioner plan.
  const zoned = practitionerZoneOfPrice(priceId);
  if (zoned) return { plan: 'practitioner', cycle: zoned.cycle };
  for (const plan of Object.keys(PLANS) as Plan[]) {
    for (const cycle of ['monthly', 'annual'] as BillingCycle[]) {
      if (!PLANS[plan].stripePriceEnv?.[cycle]) continue;
      if (resolveStripePriceId(plan as SelfServePlan, cycle) === priceId) {
        return { plan, cycle };
      }
    }
  }
  return null;
}

// ─── Practitioner client price zones ─────────────────────────────────────────
//
// A practitioner client is priced by the country its payroll runs in, not by
// where the practice registered (owner's decision, 2026-10-30). Without this a
// practice could register in Kenya, pay the KES slot price and run rand
// payrolls on it — the arbitrage the 2026-10-28 billing rule closed for
// companies.
//
// The ZONE is the billing currency of the client's country, as
// `billingCurrencyFor` decides it: South Africa, Botswana, Eswatini, Lesotho,
// Namibia, Rwanda, Angola, Mozambique and Uganda are the ZAR zone; Kenya is
// KES; Zambia ZMW; Zimbabwe and the US are USD; the UK is GBP. A currency that
// is not yet OFFERED folds back into ZAR, exactly as it does for a company.
//
// Stripe will not let one customer hold live subscriptions in two currencies,
// so every zone is a LINE on the practitioner's one subscription, in the
// practitioner's own currency:
//
//   - the client's zone IS the practitioner's currency → the existing
//     Practitioner price (STRIPE_PRICE_PRACTITIONER_*), already on the
//     subscription, at its local amount;
//   - any other zone → a per-zone Price, STRIPE_PRICE_PRACTITIONER_ZONE_<CCY>_
//     MONTHLY / _ANNUAL, whose base currency is the zone's own and whose
//     currency_options carry what that client costs in every other billing
//     currency. Those amounts are set in Stripe, by us, deliberately.
//
// A zone whose Price is missing — or lacks an amount in the practitioner's
// currency — cannot be sold. That fails CLOSED: the client is refused with a
// plain reason rather than slipped onto the cheaper home line.

/** Env var holding the per-zone Practitioner Price for `zone` and `cycle`. */
export function practitionerZonePriceEnv(zone: SupportedCurrency, cycle: BillingCycle): string {
  return `STRIPE_PRICE_PRACTITIONER_ZONE_${zone}_${cycle === 'annual' ? 'ANNUAL' : 'MONTHLY'}`;
}

/** The per-zone Price id, or null when that zone is not configured. */
export function resolvePractitionerZonePriceId(zone: SupportedCurrency, cycle: BillingCycle): string | null {
  return process.env[practitionerZonePriceEnv(zone, cycle)] || null;
}

/** Which zone and cycle a per-zone Price belongs to; null for any other price. */
export function practitionerZoneOfPrice(
  priceId: string | null | undefined,
): { zone: SupportedCurrency; cycle: BillingCycle } | null {
  if (!priceId) return null;
  for (const zone of SUPPORTED_CURRENCIES) {
    for (const cycle of ['monthly', 'annual'] as BillingCycle[]) {
      if (resolvePractitionerZonePriceId(zone, cycle) === priceId) return { zone, cycle };
    }
  }
  return null;
}

/** The price zone of a client company's payroll country. */
export function practitionerZoneFor(payrollRegion: string | null | undefined): SupportedCurrency {
  // `RSA` is the payroll-region spelling of South Africa; billingCurrencyFor
  // keys on the exceptions only, so anything unlisted is the ZAR zone.
  return billingCurrencyFor(payrollRegion ?? null);
}

/** "South Africa-priced" style label for a zone, for quotes and errors. */
export const PRACTITIONER_ZONE_LABEL: Record<SupportedCurrency, string> = {
  ZAR: 'Southern Africa (rand)',
  KES: 'Kenya (shilling)',
  ZMW: 'Zambia (kwacha)',
  USD: 'Zimbabwe & US (dollar)',
  GBP: 'United Kingdom (pound)',
  EUR: 'Euro',
};

// ─── Quota helpers ───────────────────────────────────────────────────────────

export interface QuotaResult {
  allowed:   boolean;
  /** -1 when the plan is unlimited. */
  remaining: number;
  limit:     number;
  current:   number;
}

/** Check numeric usage against a ceiling. -1 means unlimited. */
export function checkQuota(limit: number, current: number): QuotaResult {
  if (limit === UNLIMITED) {
    return { allowed: true, remaining: UNLIMITED, limit, current };
  }
  const remaining = Math.max(0, limit - current);
  return { allowed: remaining > 0, remaining, limit, current };
}

/** Check a named limit for a plan in one call. */
export function checkPlanQuota(
  plan: string | null | undefined,
  key: keyof PlanLimits,
  current: number,
): QuotaResult {
  return checkQuota(getPlanLimits(plan)[key], current);
}

// ─── Back-compat exports ─────────────────────────────────────────────────────
// Kept so existing call sites keep working while they migrate to the functions
// above. Both are derived — they cannot drift from PLANS.

/** @deprecated Use `getPlanLimits(plan)`. */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = Object.fromEntries(
  (Object.keys(PLANS) as Plan[]).map(key => [key, PLANS[key].limits]),
) as Record<Plan, PlanLimits>;

/** @deprecated Use `planDisplayName(plan)`. */
export const PLAN_DISPLAY: Record<Plan, string> = Object.fromEntries(
  (Object.keys(PLANS) as Plan[]).map(key => [key, PLANS[key].name]),
) as Record<Plan, string>;
