import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How SORMALITICS collects, uses and protects personal information under POPIA and UK/EU GDPR.',
  alternates: { canonical: '/legal/privacy' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
