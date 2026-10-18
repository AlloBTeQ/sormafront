import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'About',
  description: 'Why SORMALITICS exists: professional finance tools for practitioners, accountants, consultants and freelancers.',
  alternates: { canonical: '/about' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
