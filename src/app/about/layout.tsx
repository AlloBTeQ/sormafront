import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = pageMeta({
  path: '/about',
  title: 'About',
  description: 'Why SORMALITICS exists: professional finance tools for practitioners, accountants, consultants and freelancers.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
