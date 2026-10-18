import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

// The page itself is a client component, so its title and description live here.
export const metadata: Metadata = pageMeta({
  path: '/legal/paia',
  title: 'PAIA Manual',
  description: 'Section 51 manual under the Promotion of Access to Information Act.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
