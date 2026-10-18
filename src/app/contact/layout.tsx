import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Contact',
  description: 'Talk to the SORMALITICS team — sales, support or a walkthrough of the platform.',
  alternates: { canonical: '/contact' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
