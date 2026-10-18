// src/lib/legal/entities.ts
// ─────────────────────────────────────────────────────────────────────────────
// The contracting entities, as ONE place.
//
// Why this is a module rather than text in each page
// ──────────────────────────────────────────────────
// The company registration number, registered name and address now appear in
// the Terms, the Privacy Policy, the Refund Policy, the DPA and the PAIA
// manual. Five hand-typed copies is five chances to publish a wrong company
// number — and a wrong number on a PAIA manual or a processor contract is not a
// typo, it is a document identifying the wrong legal person.
//
// This codebase has already been bitten by the same shape of problem: five
// disagreeing definitions of what a plan allows (see lib/plans.ts). Same fix.
//
// ── The two-entity model ─────────────────────────────────────────────────────
// UK and EU customers contract with Polompa Investments Limited. Everyone else
// contracts with AlloBTeQ (Pty) Ltd. Terms §1.2 and Privacy §1.1 render this
// split, and the governing-law clause follows it.
// ─────────────────────────────────────────────────────────────────────────────

export interface LegalEntity {
  /** Registered name, exactly as it appears on the register. */
  registeredName: string;
  /** Short form for running prose. */
  shortName: string;
  registrationNumber: string;
  /** Companies Act 71 of 2008 classification, or the UK equivalent. */
  entityType: string;
  jurisdiction: string;
  registrar: string;
  /** Regions whose customers contract with this entity. */
  serves: string;
  address: {
    line1?: string;
    /** Suburb or second address line. */
    line2?: string;
    city: string;
    region?: string;
    postalCode?: string;
    country: string;
  };
  /** Whether the entity is registered for VAT. Stated in the PAIA manual. */
  vatRegistered?: boolean;
  /**
   * Data-protection regulator registration, where the jurisdiction has one.
   *
   * The UK requires controllers to register with the ICO and pay the annual
   * data protection fee. South Africa has no equivalent register — POPIA
   * requires an Information Officer to be registered instead, which is a
   * different thing and is tracked separately.
   */
  dataProtectionRegistration?: {
    regulator: string;
    /** The public registration number. Published in the Privacy Policy once issued. */
    number?: string;
    /** The application reference, useful only until the number arrives. */
    applicationNumber?: string;
    status: 'registered' | 'application-submitted' | 'not-applicable' | 'outstanding';
  };
  /**
   * POPIA Information Officer registration — a DIFFERENT thing from the
   * controller registration above, and kept in its own field so the two can
   * never be conflated.
   *
   * South Africa maintains no register of controllers. What it requires is that
   * the head of the organisation, who is the Information Officer by operation
   * of law, be registered with the Information Regulator. Registering an
   * Information Officer is not "registering as a data processor", and it does
   * nothing for the UK obligation — just as the ICO fee does nothing for this
   * one.
   */
  informationOfficerRegistration?: {
    regulator: string;
    number: string;
    /** ISO date the certificate was issued. */
    registeredOn: string;
    /** The registered officer. PAIA s51 requires the manual to publish both. */
    officerName?: string;
    officerEmail?: string;
  };
}

/**
 * South Africa and rest of world.
 *
 * The `/07` suffix on a CIPC registration number denotes a private company,
 * which is why the styled name carries "(Pty) Ltd" while the trading name is
 * plain AlloBTeQ.
 */
export const ALLOBTEQ: LegalEntity = {
  registeredName: 'AlloBTeQ (Pty) Ltd',
  shortName: 'AlloBTeQ',
  registrationNumber: '2023/270245/07',
  entityType: 'Private company (profit company)',
  jurisdiction: 'South Africa',
  registrar: 'Companies and Intellectual Property Commission (CIPC)',
  serves: 'South Africa and all regions outside the UK and EU',
  // PAIA s51 requires a physical address at which the Information Officer can
  // be reached, and the manual must be publicly available — so this address is
  // published, not internal. Same for the ICO's register of fee payers on the
  // Polompa side.
  address: {
    line1: 'Anrickle Place, Kiaat Street',
    line2: 'Noordwyk',
    city: 'Midrand',
    region: 'Johannesburg',
    postalCode: '1687',
    country: 'South Africa',
  },
  /**
   * Not VAT-registered. Recorded explicitly rather than left undefined: the
   * PAIA manual has to state one or the other, and "we forgot to fill it in"
   * and "we are not registered" look identical when the field is simply blank.
   *
   * South Africa's compulsory VAT registration threshold is R1 million in
   * taxable supplies over any 12 months. Revisit when you approach it.
   */
  vatRegistered: false,
  // POPIA has no register of controllers, so there is nothing to register in
  // the sense this field means. The South African obligation is the Information
  // Officer registration immediately below — a different thing, deliberately in
  // a different field.
  dataProtectionRegistration: {
    regulator: 'Information Regulator (South Africa)',
    status: 'not-applicable',
  },
  /**
   * Registered 23 August 2026. Certificate confirms the organisation as
   * ALLOBTEQ, "PRIVATE COMPANY [ (PTY) LTD ] - 2023/270245/07", which matches
   * `registrationNumber` above and confirms the "(Pty) Ltd" styling.
   *
   * The officer's direct address is deliberately a named mailbox on the
   * corporate domain rather than privacy@sormalitics.com. The Regulator
   * requires a direct address it can reach the officer at — a shared product
   * inbox does not satisfy that, and PAIA s51 requires the manual to publish
   * both the name and the contact.
   */
  informationOfficerRegistration: {
    regulator: 'Information Regulator (South Africa)',
    number: '2026-065021',
    registeredOn: '2026-08-23',
    officerName: 'Brian Mthembu',
    officerEmail: 'brian.mthembu@allob.co.za',
  },
};

/** United Kingdom and European Union. */
export const POLOMPA: LegalEntity = {
  registeredName: 'Polompa Investments Limited',
  shortName: 'Polompa',
  registrationNumber: '15079461',
  entityType: 'Private company limited by shares',
  jurisdiction: 'England & Wales',
  registrar: 'Companies House',
  serves: 'United Kingdom and European Union',
  address: {
    // TODO: UK registered office still outstanding.
    city: '',
    country: 'United Kingdom',
  },
  /**
   * REGISTERED with the ICO, 23 August 2026. Reference ZC229379.
   *
   * The fee was paid under application C2014276 the same day and the ICO
   * confirmed payment and issued the registration reference. `applicationNumber`
   * is kept because the ICO's online change service at ico.org.uk/update needs
   * the registration reference plus the security number issued separately — it
   * is NOT a second registration number and must never be published as one.
   *
   * Registration is as a DATA CONTROLLER. That is what the ICO fee regime
   * covers and what the confirmation says; it is not a "data processor
   * registration", which is not a thing that exists. The distinction matters:
   * SORMALITICS is a processor when it handles a practitioner's client data
   * under the DPA, and a controller for its own account holders. The register
   * entry speaks to the second.
   *
   * The Privacy Policy §12.3 renders this automatically, gated on
   * `status === 'registered' && number` — so setting these two fields is the
   * whole change. Nothing else needed editing.
   *
   * One caveat worth keeping: the ICO said it "will soon publish" the entry on
   * the public register of fee payers. The registration is effective now; the
   * PUBLIC LOOKUP may lag by a day or two, and the downloadable certificate
   * comes from that register. If someone checks the register before it
   * publishes and finds nothing, that is publication lag, not a problem with
   * the registration.
   */
  dataProtectionRegistration: {
    regulator: "Information Commissioner's Office (ICO)",
    number: 'ZC229379',
    applicationNumber: 'C2014276',
    status: 'registered',
  },
};

export const ENTITIES = { allobteq: ALLOBTEQ, polompa: POLOMPA } as const;

/** Single-line address for a contact block. Omits empty parts. */
export function formatAddress(entity: LegalEntity): string {
  const a = entity.address;
  return [a.line1, a.line2, a.city, a.region, a.postalCode, a.country].filter(Boolean).join(', ');
}

/** "AlloBTeQ (Pty) Ltd (registration number 2023/270245/07)" */
export function nameWithNumber(entity: LegalEntity): string {
  return `${entity.registeredName} (registration number ${entity.registrationNumber})`;
}

/** Shared contact addresses, so no page invents its own. */
export const CONTACT = {
  privacy: 'privacy@sormalitics.com',
  legal:   'legal@sormalitics.com',
  support: 'support@sormalitics.com',
  phone:   '+27 (0)67 921 1947',
  hours:   '09:00–17:00 SAST, Monday to Friday',
} as const;
