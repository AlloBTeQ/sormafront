import type { Metadata } from 'next';
import { pageMeta } from '@/lib/seo';
import type { ReactNode } from 'react';

export const metadata: Metadata = pageMeta({
  path: '/pricing/ifrs16',
  title: 'IFRS 16 Module — Lessee, Lessor or Both',
  description: 'IFRS 16 lease accounting as lessee, as lessor, or both. Each side is priced by the leases you hold on it: up to 10, 11 to 25, or quoted above 25. On its own or with any SORMALITICS plan.',
});

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
