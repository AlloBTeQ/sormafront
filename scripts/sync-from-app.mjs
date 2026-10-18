// Copies the files this site shares with the app, so plans, prices and the
// jurisdiction list on the marketing page never drift from what the app bills.
// Run from this folder:  pnpm sync   (expects ../SORMALITICS beside it)
import { copyFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const APP = resolve(process.argv[2] ?? '../SORMALITICS');
const FILES = [
  'src/lib/plans.ts',
  'src/config/plans.ts',
  'src/lib/billing/practitionerBillingMath.ts',
  'src/lib/payroll/jurisdictionStatus.ts',
  'src/lib/payroll/regionRouter.ts',
  'src/components/brand/SormaliticsMark.tsx',
  // Content shared with the app's own copies of these pages.
  'src/lib/help/content.ts',
  'src/lib/legal/consent.ts',
  'src/lib/legal/entities.ts',
  'src/lib/legal/versions.ts',
  'src/lib/fisi/config.ts',
  // NOT synced: src/lib/store/product-catalog.ts — this copy's checkout links
  // point at APP_URL. Re-apply that if you copy it over again.
];
if (!existsSync(APP)) { console.error(`App repo not found at ${APP}`); process.exit(1); }
for (const f of FILES) { copyFileSync(resolve(APP, f), resolve(f)); console.log('synced', f); }
console.log('Done. Run `pnpm type-check && pnpm build` before pushing.');
