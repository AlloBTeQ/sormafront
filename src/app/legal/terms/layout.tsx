import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The agreement that governs your use of SORMALITICS.',
  alternates: { canonical: '/legal/terms' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
