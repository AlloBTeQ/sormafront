import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = pageMeta({
  path: '/legal/cookies',
  title: 'Cookie Policy',
  description: 'The cookies SORMALITICS uses and how to change your preferences.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
