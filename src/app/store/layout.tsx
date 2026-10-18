import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Document Store',
  description: 'Professional payslip, invoice, agreement and schedule templates. Preview before you buy, download instantly.',
  alternates: { canonical: '/store' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
