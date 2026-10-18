import type { Metadata } from 'next';
import { pageMeta, softwareLd, ld } from '@/lib/seo';
import { PricingSection } from '@/components/PricingSection';

export const metadata: Metadata = pageMeta({
  path: '/pricing',
  title: 'Pricing — Payroll & Accounting Plans in Rand',
  description: 'SORMALITICS plans — Free, Professional, Business and Practitioner. Priced in rand, billed monthly or yearly.',
});

export default function PricingPage() {
  return (
    <div style={{ color: '#FBF7EA', background: '#143152', fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(softwareLd) }} />
      <PricingSection asPage />
    </div>
  );
}
