import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'When and how SORMALITICS refunds subscriptions and document purchases.',
  alternates: { canonical: '/legal/refunds' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
