import type { Metadata, Viewport } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: {
    default: 'Tapadam Football - Find Players for Your Match',
    template: '%s | Tapadam Football',
  },
  description:
    'Connect with football players in Baku. Create matches, join games, and play at premium stadiums.',
  openGraph: {
    title: 'Tapadam Football',
    description:
      'Connect with football players in Baku. Create matches, join games, and play at premium stadiums.',
    siteName: 'Tapadam Football',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${rajdhani.variable}`}>
      <body className="font-body bg-dark-950 text-slate-200 antialiased min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="pb-20 md:pb-0">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
