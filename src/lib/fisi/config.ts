// lib/fisi/config.ts
// Single source of truth for FISI employer types. Registration writes `employerType`
// onto the FisiProfile; middleware gates and the (dashboard) layout reads it and
// renders the matching nav/modules. One layout, config-driven.

export type EmployerType = "fleet" | "domestic" | "ehailing" | "contractor" | "freelancer";
export type Mode = "employer" | "self";
export type TaxStructure = "sole" | "company"; // self types only

export interface TypeConfig {
  id: EmployerType;
  label: string;
  blurb: string;
  mode: Mode;
  workerNoun: string;          // label for the drivers route per type
  vehicles: boolean;           // does this type manage vehicles?
  emp201: boolean;             // SARS EMP201 reminder relevant?
  uifFocus: boolean;           // surface UIF-registration nudge?
  engagement: boolean;         // workers have engagement end-dates (casual)?
  incomeKind?: "platform" | "client"; // self types only
  nav: string[];               // route keys the layout renders for this type
}

export const BUSINESS_TYPES: Record<EmployerType, TypeConfig> = {
  fleet: {
    id: "fleet",
    label: "Fleet owner",
    blurb: "Taxis or vehicles with drivers on your books. Full payroll — payslips, UIF and EMP201.",
    mode: "employer",
    workerNoun: "Drivers",
    vehicles: true,
    emp201: true,
    uifFocus: false,
    engagement: false,
    nav: ["hub", "drivers", "vehicles", "checkins", "payments", "finances"],
  },
  ehailing: {
    id: "ehailing",
    label: "eHailing Operator",
    blurb: "You run Uber, Bolt or similar vehicles. Formalise driver income into bankable proof.",
    mode: "self", // locked call (Spine B owner-driver): the operator IS the person being formalised — provisional tax, not PAYE+UIF
    workerNoun: "Drivers",
    vehicles: true,
    emp201: true,
    uifFocus: false,
    engagement: false,
    nav: ["hub", "drivers", "vehicles", "checkins", "payments", "finances"],
  },
  domestic: {
    id: "domestic",
    label: "Domestic Employer",
    blurb: "You employ household staff. Payslips and UIF, kept simple for a small roster.",
    mode: "employer",
    workerNoun: "Workers",
    vehicles: false,
    emp201: false,
    uifFocus: true,
    engagement: false,
    // No "checkins": a check-in is a takings record against a vehicle (CheckIn.vehicleId
    // is required). Wages for this persona are recorded in Finances until a
    // no-vehicle attendance record exists.
    nav: ["hub", "drivers", "payments", "finances"],
  },
  contractor: {
    id: "contractor",
    label: "Short-term Contractor",
    blurb: "You take people on for short jobs and pay them wages. Payslips per engagement.",
    mode: "employer",
    workerNoun: "Workers",
    vehicles: false,
    emp201: false,
    uifFocus: false,
    engagement: true,
    // No "checkins": a check-in is a takings record against a vehicle (CheckIn.vehicleId
    // is required). Wages for this persona are recorded in Finances until a
    // no-vehicle attendance record exists.
    nav: ["hub", "drivers", "payments", "finances"],
  },
  freelancer: {
    id: "freelancer",
    label: "Freelancer",
    blurb: "You work for yourself, no staff. Record client income and prove it to funders.",
    mode: "self",
    workerNoun: "—",
    vehicles: false,
    emp201: false,
    uifFocus: false,
    engagement: false,
    incomeKind: "client",
    nav: ["hub", "finances"],
  },
};

// drivers route shows a per-type label ("Drivers" vs "Workers")
export const ROUTE_LABELS: Record<string, string> = {
  hub: "Hub",
  drivers: "Drivers",
  vehicles: "Vehicles",
  checkins: "Check-in",
  payments: "Pay & UIF",
  finances: "Finances",
};

export function navFor(type: EmployerType): { key: string; label: string }[] {
  const cfg = BUSINESS_TYPES[type];
  return cfg.nav.map((key) => ({
    key,
    label: key === "drivers" ? cfg.workerNoun : ROUTE_LABELS[key] ?? key,
  }));
}

export const EMPLOYER_TYPE_IDS = Object.keys(BUSINESS_TYPES) as EmployerType[];
export function isEmployerType(v: unknown): v is EmployerType {
  return typeof v === "string" && (EMPLOYER_TYPE_IDS as string[]).includes(v);
}