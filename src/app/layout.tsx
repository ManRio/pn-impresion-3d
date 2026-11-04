import type { Metadata } from 'next';
import { Oxanium, Inter } from 'next/font/google';

import './globals.css';
import '@/app/branding-v03.css';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Tipografía para títulos
const oxanium = Oxanium({
  subsets: ['latin'],
  variable: '--font-oxanium',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

// Tipografía para textos
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'P&N Impresión 3D | Tus ideas en 3D',
    template: '%s | P&N Impresión 3D',
  },
  description:
    'Figuras, regalos y productos personalizados impresos en 3D. Fabricación bajo demanda y envíos a toda España.',
  icons: {
    icon: '/LogoPN.png',
    shortcut: '/LogoPN.png',
    apple: '/LogoPN.png',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es' data-scroll-behavior='smooth'>
      <body className={`${oxanium.variable} ${inter.variable}`}>
        <a href='#contenido-principal' className='skip-link'>
          Saltar al contenido principal
        </a>

        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}
