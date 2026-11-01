// src/lib/payroll/countryPages.ts
// ─────────────────────────────────────────────────────────────────────────────
// One landing page per live payroll country (owner, 2026-11-01: "SADC, then
// Kenya"). These are the pages people search for — "payroll software Zambia",
// "EMP201 software", "PAYE calculator Kenya" — so each says, in that country's
// own terms, what SORMALITICS calculates and which schedules it prepares.
//
// EVERY claim here is checked against the app, not written from memory:
//   - deduction names are the engine's own payslip lines (lib/payroll/
//     taxCalculations.ts, synced into this repo, which also runs the calculator);
//   - monthly and year-end items are the labels on the app's returns screens
//     (app/api/payroll/tax/<country>);
//   - filing wording comes from filingNoteFor() — SORMALITICS prepares and
//     reconciles; the EMPLOYER files. Never "we file for you".
// When a country's rules change in the app, change them here in the same PR.
// ─────────────────────────────────────────────────────────────────────────────

import type { PayrollRegion } from '@/lib/payroll/regionRouter';

export interface CountryPage {
  slug: string;
  /** The app's region key — what the calculator passes to the engine. */
  region: PayrollRegion;
  /** ISO code for hreflang/areaServed. */
  iso: string;
  name: string;
  /** Currency salaries are paid in (what the calculator shows). */
  payCurrency: string;
  authority: string;
  /** SEO title (the template adds "| SORMALITICS"). */
  title: string;
  description: string;
  /** One line under the H1: the taxes in the country's own words. */
  strapline: string;
  /** Employee deductions the engine calculates on every payslip. */
  employee: string[];
  /** Employer contributions and levies. */
  employer: string[];
  /** What SORMALITICS prepares each month. */
  monthly: string[];
  /** Year-end and certificates. */
  yearEnd: string[];
  /** Something only this country needs, said plainly. */
  localNote?: string;
  /** Sensible monthly gross for the calculator's first figure. */
  sampleGross: number;
  group: 'sadc' | 'east-africa';
}

export const COUNTRY_PAGES: CountryPage[] = [
  // ── SADC ──────────────────────────────────────────────────────────────────
  {
    slug: 'south-africa', region: 'RSA', iso: 'ZA', name: 'South Africa', payCurrency: 'ZAR', authority: 'SARS',
    title: 'Payroll Software South Africa — PAYE, UIF, SDL, EMP201 & EMP501',
    description: 'Run South African payroll with PAYE, UIF and SDL calculated on every payslip, EMP201 schedules each month and EMP501 reconciliation with IRP5 certificates at year-end. Free PAYE calculator.',
    strapline: 'PAYE, UIF and SDL on every payslip — EMP201 every month, EMP501 and IRP5s at year-end.',
    employee: ['PAYE (income tax, current SARS tables)', 'UIF — 1% of remuneration, capped'],
    employer: ['UIF — matching 1%', 'Skills Development Levy (SDL) — 1% where your annual payroll exceeds R500,000'],
    monthly: ['EMP201 schedule — PAYE, UIF and SDL for the month, ready to capture on eFiling', 'Payslips by email, with approval by someone other than the preparer'],
    yearEnd: ['EMP501 reconciliation, checked against every approved run', 'IRP5 / IT3(a) employee tax certificates'],
    localNote: 'Mid-month starters and leavers are prorated by calendar days, with PAYE averaged over the part of the month worked.',
    sampleGross: 25000, group: 'sadc',
  },
  {
    slug: 'botswana', region: 'BW', iso: 'BW', name: 'Botswana', payCurrency: 'BWP', authority: 'BURS',
    title: 'Payroll Software Botswana — PAYE, ITW 8 & ITW 10',
    description: 'Botswana payroll with PAYE on every payslip under current BURS tables, taxable benefits included, a monthly PAYE remittance schedule and ITW 8 certificates with the ITW 10 annual return. Free PAYE calculator.',
    strapline: 'BURS PAYE on every payslip — monthly remittance, ITW 8 certificates and the ITW 10 annual return.',
    employee: ['PAYE (BURS tables), including taxable benefits in kind'],
    employer: [],
    monthly: ['PAYE remittance schedule for the month', 'Payslips by email, released only after approval'],
    yearEnd: ['ITW 8 employee tax certificates', 'ITW 10 annual return'],
    sampleGross: 15000, group: 'sadc',
  },
  {
    slug: 'namibia', region: 'NA', iso: 'NA', name: 'Namibia', payCurrency: 'NAD', authority: 'NamRA',
    title: 'Payroll Software Namibia — PAYE, Social Security & ETX File',
    description: 'Namibian payroll with PAYE and Social Security on every payslip, housing and fringe benefits handled, NamRA’s own ETX upload file filled from the run and PAYE 5 certificates at year-end. Free PAYE calculator.',
    strapline: 'NamRA PAYE and Social Security on every payslip — the ETX upload file and PAYE 5 certificates from the same run.',
    employee: ['PAYE (NamRA tables), with fringe benefits and housing allowance', 'Social Security — 0.9%, capped'],
    employer: ['Social Security — matching 0.9%, capped'],
    monthly: ['Monthly PAYE return schedule', 'ETX upload file in NamRA’s own template, filled from the approved run'],
    yearEnd: ['PAYE 5 employee tax certificates'],
    localNote: 'A NamRA-approved housing scheme makes a third of the housing allowance exempt; SORMALITICS applies it when you record the scheme.',
    sampleGross: 25000, group: 'sadc',
  },
  {
    slug: 'eswatini', region: 'SZ', iso: 'SZ', name: 'Eswatini', payCurrency: 'SZL', authority: 'ERS',
    title: 'Payroll Software Eswatini — PAYE, ENPF & PAYE 04',
    description: 'Eswatini payroll with PAYE and ENPF on every payslip, the PAYE 04 monthly return schedule and PAYE05 certificates at year-end. Free PAYE calculator.',
    strapline: 'ERS PAYE and ENPF on every payslip — PAYE 04 each month, PAYE05 certificates at year-end.',
    employee: ['PAYE (ERS tables)', 'ENPF — 5%, capped'],
    employer: ['ENPF — matching employer contribution'],
    monthly: ['PAYE — pay before the 7th; PAYE 04 return schedule by the 7th', 'ENPF (employee + employer) — within 21 days'],
    yearEnd: ['PAYE05 employee tax certificates'],
    sampleGross: 15000, group: 'sadc',
  },
  {
    slug: 'lesotho', region: 'LS', iso: 'LS', name: 'Lesotho', payCurrency: 'LSL', authority: 'RSL',
    title: 'Payroll Software Lesotho — PAYE & P.16 Certificates',
    description: 'Lesotho payroll with PAYE on every payslip under current RSL tables, a monthly PAYE remittance schedule and P.16 tax withholding certificates at year-end. Free PAYE calculator.',
    strapline: 'RSL PAYE on every payslip — monthly remittance and P.16 certificates at year-end.',
    employee: ['PAYE (RSL tables)'],
    employer: [],
    monthly: ['PAYE monthly remittance schedule', 'Payslips by email, released only after approval'],
    yearEnd: ['P.16 tax withholding certificates'],
    sampleGross: 12000, group: 'sadc',
  },
  {
    slug: 'zambia', region: 'ZM', iso: 'ZM', name: 'Zambia', payCurrency: 'ZMW', authority: 'ZRA',
    title: 'Payroll Software Zambia — PAYE, NAPSA, NHIMA & P11',
    description: 'Zambian payroll with PAYE, NAPSA and NHIMA on every payslip, the Skills Development Levy, and P11 declarations from each approved run. Priced in kwacha. Free PAYE calculator.',
    strapline: 'ZRA PAYE, NAPSA and NHIMA on every payslip — P11 declarations from the approved run.',
    employee: ['PAYE (ZRA tables)', 'NAPSA — 5%, capped at the annual ceiling', 'NHIMA — 1% of basic pay'],
    employer: ['NAPSA — matching 5%', 'NHIMA — matching 1%', 'Skills Development Levy'],
    monthly: ['PAYE (P11) declaration schedule', 'NAPSA (employee + employer)', 'NHIMA (employee + employer)', 'Skills Development Levy'],
    yearEnd: [],
    sampleGross: 15000, group: 'sadc',
  },
  {
    slug: 'zimbabwe', region: 'ZW', iso: 'ZW', name: 'Zimbabwe', payCurrency: 'USD', authority: 'ZIMRA',
    title: 'Payroll Software Zimbabwe — PAYE, AIDS Levy, NSSA, P2 & ITF16',
    description: 'Zimbabwe payroll in USD or ZWG with PAYE and AIDS levy, NSSA, ZIMDEF and NEC dues on every payslip, P2 and P4 schedules each month and the ITF16 with P6 certificates at year-end. Priced in US dollars. Free PAYE calculator.',
    strapline: 'ZIMRA PAYE and AIDS levy, NSSA, ZIMDEF and NEC — P2 and P4 every month, ITF16 and P6 at year-end.',
    employee: ['PAYE (ZIMRA USD or ZWG tables) and the 3% AIDS levy', 'NSSA POBS — 4.5%, capped', 'NEC dues, where your sector has them'],
    employer: ['NSSA POBS — matching 4.5%', 'ZIMDEF training levy', 'NEC dues (employer share)', "APWCS workers' compensation, if you opt in"],
    monthly: ['PAYE + AIDS levy (P2) schedule', 'NSSA POBS (P4)', 'ZIMDEF training levy', 'NEC dues'],
    yearEnd: ['ITF16 reconciliation', 'P6 employee tax certificates'],
    localNote: 'Each run is in USD or ZWG and uses ZIMRA’s tables for that currency; the payslip shows the currency it was paid in.',
    sampleGross: 1200, group: 'sadc',
  },
  {
    slug: 'angola', region: 'AO', iso: 'AO', name: 'Angola', payCurrency: 'AOA', authority: 'AGT',
    title: 'Payroll Software Angola — IRT, INSS & Mapa de Remunerações',
    description: 'Angolan payroll with IRT under the 2026 table and INSS on every payslip, the Mapa de Remunerações each month and the annual Modelo 2 declaration. Free IRT calculator.',
    strapline: 'AGT IRT and INSS on every payslip — the Mapa de Remunerações each month, Modelo 2 at year-end.',
    employee: ['IRT (2026 table)', 'INSS — 3%'],
    employer: ['INSS — 8%'],
    monthly: ['IRT withheld — pay over and file the Mapa de Remunerações by the end of the month', 'INSS (3% employee + 8% employer) — by the 10th'],
    yearEnd: ['Modelo 2 annual declaration'],
    sampleGross: 500000, group: 'sadc',
  },
  {
    slug: 'mozambique', region: 'MZ', iso: 'MZ', name: 'Mozambique', payCurrency: 'MZN', authority: 'AT',
    title: 'Payroll Software Mozambique — IRPS, INSS & M/19',
    description: 'Mozambican payroll with IRPS withholding by dependants and INSS on every payslip, the M/19 each month and IRPS employee certificates at year-end. Free IRPS calculator.',
    strapline: 'AT IRPS and INSS on every payslip — M/19 each month, IRPS certificates at year-end.',
    employee: ['IRPS withholding (table by number of dependants)', 'INSS — 3%'],
    employer: ['INSS — 4%'],
    monthly: ['IRPS withheld — pay and declare (M/19) by the 20th', 'INSS (3% employee + 4% employer) — by the 10th'],
    yearEnd: ['IRPS employee certificates'],
    sampleGross: 60000, group: 'sadc',
  },
  // ── East Africa ───────────────────────────────────────────────────────────
  {
    slug: 'kenya', region: 'KE', iso: 'KE', name: 'Kenya', payCurrency: 'KES', authority: 'KRA',
    title: 'Payroll Software Kenya — PAYE, NSSF, SHIF, Housing Levy & P9A',
    description: 'Kenyan payroll with PAYE, NSSF Tier I and II, SHIF and the Affordable Housing Levy on every payslip — deductions applied before PAYE as the law requires — and P9A certificates, leavers included. Priced in shillings. Free net pay calculator.',
    strapline: 'KRA PAYE, NSSF, SHIF and the Housing Levy on every payslip — P9A certificates for every employee, leavers included.',
    employee: ['PAYE (KRA bands, after personal relief)', 'NSSF Tier I and Tier II', 'SHIF — 2.75%', 'Affordable Housing Levy — 1.5%'],
    employer: ['NSSF — matching Tier I and II', 'Affordable Housing Levy — matching 1.5%'],
    monthly: ['PAYE schedule for iTax', 'NSSF (employee + employer)', 'SHIF', 'Affordable Housing Levy (employee + employer)'],
    yearEnd: ['P9A tax deduction cards for every employee, including those who left during the year'],
    localNote: 'NSSF, SHIF and the Housing Levy are deducted before PAYE is worked out, as Kenyan law now requires.',
    sampleGross: 100000, group: 'east-africa',
  },
];

export function countryBySlug(slug: string): CountryPage | undefined {
  return COUNTRY_PAGES.find(c => c.slug === slug);
}
