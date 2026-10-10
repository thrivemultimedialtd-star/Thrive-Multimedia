import type { Metadata, Viewport } from 'next';
import { Archivo, Fraunces, Montserrat } from 'next/font/google';
import './globals.css';
import { site } from '@/content/site';
import MotionProvider from '@/components/motion/MotionProvider';
import Cursor from '@/components/motion/Cursor/Cursor';
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
const fraunces = Fraunces({
  subsets: ['latin'],
  axes: ['opsz', 'SOFT'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const preflight = `(function(d){d.dataset.js='1';d.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'})(document.documentElement)`;

export const metadata: Metadata = {
  title: {
    default: 'Thrive Multimedia: Creative studio, Abuja',
    template: '%s · Thrive Multimedia',
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: '#f3f1ea',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${fraunces.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Runs before first paint so entrance states apply without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: preflight }} />
      </head>
      <body data-theme="paper">
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
        <Cursor />
      </body>
    </html>
  );
}
