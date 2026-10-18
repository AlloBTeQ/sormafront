import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Services',
  description: 'Invoicing, payroll, legal agreements and accounting — the tools inside SORMALITICS, and the pay-per-use document templates.',
  alternates: { canonical: '/services' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
