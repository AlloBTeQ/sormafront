import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

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
  'src/lib/billing/promotions.ts',
  // Cookie consent + consent-gated analytics — same code as the app.
  'src/components/legal/CookieBanner.tsx',
  'src/components/legal/Analytics.tsx',
  // The payroll engine behind the free calculators on /payroll/<country>.
  // calculatePayslip() and everything it imports (pure: no database, no
  // network). Re-run this script whenever a tax table changes in the app, or
  // the calculators fall behind the product.
  'src/lib/regions.ts',
  'src/lib/payroll/taxCalculations.ts',
  'src/lib/payroll/taxYear.ts',
  'src/lib/payroll/za/engine.ts',
  'src/config/za-tax-tables.ts',
  'src/config/za-source-codes.ts',
  'src/lib/payroll/bw/benefits.ts',
  'src/lib/payroll/na/config.ts',
  'src/lib/payroll/na/benefits.ts',
  'src/lib/payroll/zm/config.ts',
  'src/lib/payroll/zw/config.ts',
  'src/lib/payroll/zw/benefits.ts',
  'src/lib/payroll/sz/config.ts',
  'src/lib/payroll/ls/config.ts',
  'src/lib/payroll/ke/config.ts',
  'src/lib/payroll/rw/config.ts',
  'src/lib/payroll/ao/config.ts',
  'src/lib/payroll/mz/config.ts',
  'src/lib/services/payroll/engine/BOTSTaxEngine.ts',
  'src/lib/services/payroll/engine/ZAMTaxEngine.ts',
  'src/lib/services/payroll/engine/ZWTaxEngine.ts',
  'src/lib/services/payroll/engine/NAMTaxEngine.ts',
  'src/lib/services/payroll/engine/SZTaxEngine.ts',
  'src/lib/services/payroll/engine/LSTaxEngine.ts',
  'src/lib/services/payroll/engine/KENTaxEngine.ts',
  'src/lib/services/payroll/engine/RWTaxEngine.ts',
  'src/lib/services/payroll/engine/AOTaxEngine.ts',
  'src/lib/services/payroll/engine/MZTaxEngine.ts',
  'src/lib/services/payroll/engine/UKTaxEngine.ts',
  'src/lib/services/tax/irp5/accumulate.ts',
  'src/lib/services/tax/irp5/types.ts',
  'src/types/payroll.ts',
];
if (!existsSync(APP)) { console.error(`App repo not found at ${APP}`); process.exit(1); }
for (const f of FILES) { mkdirSync(dirname(resolve(f)), { recursive: true }); copyFileSync(resolve(APP, f), resolve(f)); console.log('synced', f); }
console.log('Done. Run `pnpm type-check && pnpm build` before pushing.');
