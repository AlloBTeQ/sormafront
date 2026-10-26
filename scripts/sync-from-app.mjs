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
  'src/lib/help/content.ts',
  'src/lib/legal/consent.ts',
  'src/lib/legal/entities.ts',
  'src/lib/legal/versions.ts',
  'src/lib/fisi/config.ts',
];
if (!existsSync(APP)) { console.error(`App repo not found at ${APP}`); process.exit(1); }
for (const f of FILES) { copyFileSync(resolve(APP, f), resolve(f)); console.log('synced', f); }
console.log('Done. Run `pnpm type-check && pnpm build` before pushing.');
