import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = pageMeta({
  path: '/legal/terms',
  title: 'Terms of Service',
  description: 'The agreement that governs your use of SORMALITICS.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
