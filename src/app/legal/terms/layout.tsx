import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = pageMeta({
  path: '/legal/terms',
  title: 'Terms of Service',
  description: 'The agreement that governs your use of SORMALITICS.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
