import type { Metadata } from 'next';
import { PricingSection } from '@/components/PricingSection';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'SORMALITICS plans — Free, Professional, Business and Practitioner. Priced in rand, billed monthly or yearly.',
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return (
    <div style={{ color: '#FBF7EA', background: '#143152', fontFamily: 'var(--font-syne), ui-sans-serif, system-ui, sans-serif' }}>
      <PricingSection asPage />
    </div>
  );
}
