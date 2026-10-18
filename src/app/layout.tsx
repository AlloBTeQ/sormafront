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
import { Toaster } from 'sonner';

// No analytics on this origin yet, so no cookies are set and no consent banner
// is needed. If GA/Clarity is added here, port CookieBanner + lib/legal/consent
// from the app first — never load a tag unconditionally.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SORMALITICS — Nothing posts until someone signs for it',
    template: '%s | SORMALITICS',
  },
  description:
    'The finance stack for teams that get audited: invoicing, payroll, accounting, agreements and financial statements — with segregation of duties and a full audit trail built in.',
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
};

export const viewport: Viewport = {
  themeColor: '#143152',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <SormaliticsLayout>{children}</SormaliticsLayout>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
