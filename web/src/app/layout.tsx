import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { YakThemeProvider } from '@yak/react';

import { getYakThemeContext } from '../../yak.context';
import '@/styles/globals';

import { AppChrome } from '@/components/app-chrome';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Aegis — Vulnerability Intelligence Portal',
    template: '%s · Aegis',
  },
  description:
    'Secure multi-tenant platform that turns raw Nessus and Nmap scans into executive-ready vulnerability reports.',
  applicationName: 'Aegis',
  authors: [{ name: 'Aegis Security' }],
  openGraph: {
    title: 'Aegis — Vulnerability Intelligence Portal',
    description:
      'Upload raw scan logs, get sanitised AI-generated executive reports. Access gated by National ID verification.',
    type: 'website',
  },
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#12161f' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/** Runs before first paint so the stored theme never flashes. */
const themeBootstrap = `
(function(){try{var m=localStorage.getItem('aq-theme')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <YakThemeProvider theme={getYakThemeContext()}>
          <AppChrome>{children}</AppChrome>
        </YakThemeProvider>
      </body>
    </html>
  );
}
