import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Launching soon',
  description: 'The SORMALITICS app is in its final stage of development. Get early access.',
  // A holding page: never in search results, and it disappears at launch.
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
