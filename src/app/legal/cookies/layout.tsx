import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'The cookies SORMALITICS uses and how to change your preferences.',
  alternates: { canonical: '/legal/cookies' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
