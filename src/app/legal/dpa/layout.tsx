import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = {
  title: 'Data Processing Agreement',
  description: 'The terms on which SORMALITICS processes personal information on your behalf.',
  alternates: { canonical: '/legal/dpa' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
