import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Marketing copy of the FISI landing. The app frame (FisiShell) belongs to the
// app's /fisi/* routes, which live on app.sormalitics.com.
export const metadata: Metadata = {
  title: { absolute: 'FISI — Proof of income, formalised' },
  description:
    'FISI turns taxi takings, household wages, client invoices and trip earnings into a record a bank will accept. Payslips for the people you pay — no money moves through FISI.',
  alternates: { canonical: '/fisi' },
  openGraph: {
    type: 'website',
    url: '/fisi',
    title: 'FISI — Proof of income, formalised',
    description: 'You already earn it. Now prove it.',
    siteName: 'FISI by SORMALITICS',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'FISI by SORMALITICS' }],
  },
};

export default function FisiLayout({ children }: { children: ReactNode }) {
  return children;
}
