import type { Metadata, Viewport } from 'next';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/dm-mono/400.css';
import '@fontsource/dm-mono/500.css';
import './globals.css';
import { SormaliticsLayout } from '@/components/layout/SormaliticsLayout';
import { SITE_URL } from '@/lib/site';
import { organizationLd, websiteLd, ld } from '@/lib/seo';
import { Toaster } from 'sonner';

// No analytics on this origin yet, so no cookies are set and no consent banner
// is needed. If GA/Clarity is added here, port CookieBanner + lib/legal/consent
// from the app first — never load a tag unconditionally.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // The <title> carries the search terms; the tagline lives on the social card
  // (openGraph/twitter below), where people read it rather than Google.
  title: {
    default: 'Payroll & Accounting Software South Africa — SORMALITICS',
    template: '%s | SORMALITICS',
  },
  description:
    'Payroll with EMP201 and IRP5, invoicing, VAT, accounting and IFRS for SMEs financial statements on one ledger — with approvals and a full audit trail. Start free.',
  applicationName: 'SORMALITICS',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: SITE_URL,
    siteName: 'SORMALITICS',
    title: 'SORMALITICS — Nothing posts until someone signs for it',
    description: 'Invoicing, payroll, accounting and agreements with approvals and an audit trail built in.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SORMALITICS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SORMALITICS',
    description: 'The finance stack for teams that get audited.',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }, { url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  // Google Search Console: paste the token from "HTML tag" verification into
  // NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION on Vercel and redeploy. Unset → no tag.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: '#143152',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        {/* Who we are, sitewide. The product + prices are on / and /pricing. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld([organizationLd, websiteLd]) }} />
        <SormaliticsLayout>{children}</SormaliticsLayout>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
