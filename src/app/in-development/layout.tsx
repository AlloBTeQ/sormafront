import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Launching soon',
  description: 'The SORMALITICS app opens shortly. Get early access.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/in-development' },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
