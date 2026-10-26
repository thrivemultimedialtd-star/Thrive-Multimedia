import type { Metadata, Viewport } from 'next';
import { Archivo, Montserrat } from 'next/font/google';
import './globals.css';
import { contact, site } from '@/content/site';
import JsonLd from '@/components/ui/JsonLd';
import MotionProvider from '@/components/motion/MotionProvider';
import PageTransition from '@/components/motion/PageTransition/PageTransition';
import SectionTheme from '@/components/motion/SectionTheme';
import Navigation from '@/components/ui/Navigation/Navigation';
import Footer from '@/components/ui/Footer/Footer';
import ChatGuide from '@/components/chat/ChatGuide/ChatGuide';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const preflight = `(function(d){d.dataset.js='1';d.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'})(document.documentElement)`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Thrive Multimedia: Creative studio, Abuja',
    template: '%s · Thrive Multimedia',
  },
  description: site.description,
  // Canonical URLs are set per page (lib/metadata.ts), so the 404 page never claims one.
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_NG',
    title: 'Thrive Multimedia: Creative studio, Abuja',
    description: site.description,
  },
  twitter: { card: 'summary_large_image' },
};

// The studio as a local business, from the brochure's own details only (no hours, ratings or
// social profiles until Thrive supplies them).
const business = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${site.url}/#studio`,
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/thrive-logo.png`,
  image: `${site.url}/opengraph-image`,
  description: site.description,
  email: contact.email,
  telephone: contact.phones.map((p) => p.href.replace('tel:', '')),
  address: {
    '@type': 'PostalAddress',
    streetAddress: contact.address.slice(0, 2).join(' ').replace(/,$/, ''),
    addressLocality: site.location.split(',')[0],
    addressCountry: 'NG',
  },
};

export const viewport: Viewport = {
  themeColor: '#f3f1ea',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so entrance states apply without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: preflight }} />
      </head>
      <body data-theme="paper">
        <JsonLd data={business} />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionProvider />
        <Navigation />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <ChatGuide />
        <SectionTheme />
        <PageTransition />
      </body>
    </html>
  );
}
