// The payroll engine is synced from the app (scripts/sync-from-app.mjs), and
// one synced type file, src/types/payroll.ts, has an unused `import { ObjectId }
// from 'mongodb'`. This site has no database and does not install mongodb, so
// the type checker needs a stand-in. Types only — nothing here reaches a bundle.
declare module 'mongodb' {
  export type ObjectId = { toHexString(): string };
  export const ObjectId: unknown;
}
