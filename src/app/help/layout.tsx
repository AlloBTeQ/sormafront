import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Help Centre',
  description: 'Guides and answers for payroll, invoicing, tax compliance, billing and security in SORMALITICS.',
  alternates: { canonical: '/help' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
