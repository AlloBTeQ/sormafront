import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the team building SORMALITICS — open roles and how to apply.',
  alternates: { canonical: '/careers' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
