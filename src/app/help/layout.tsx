import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = pageMeta({
  path: '/help',
  title: 'Help Centre',
  description: 'Guides and answers for payroll, invoicing, tax compliance, billing and security in SORMALITICS.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
