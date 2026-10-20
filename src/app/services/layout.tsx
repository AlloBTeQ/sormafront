import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = pageMeta({
  path: '/services',
  title: 'Payroll, Invoicing, Accounting & AFS',
  description: 'Accounting (quotes, invoicing, budgets, ledger, VAT, financial reporting, AFS), multi-country payroll with each authority’s returns, agreements with e-signature, and an Exco dashboard — on one ledger.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
