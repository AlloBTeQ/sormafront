import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = pageMeta({
  path: '/legal/privacy',
  title: 'Privacy Policy',
  description: 'How SORMALITICS collects, uses and protects personal information under POPIA and UK/EU GDPR.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
