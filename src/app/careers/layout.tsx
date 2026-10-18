import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = pageMeta({
  path: '/careers',
  title: 'Careers',
  description: 'Join the team building SORMALITICS — open roles and how to apply.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
