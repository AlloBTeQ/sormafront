import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = pageMeta({
  path: '/legal/dpa',
  title: 'Data Processing Agreement',
  description: 'The terms on which SORMALITICS processes personal information on your behalf.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
