import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Autism Support Assistant',
  description: 'AI-powered autism support and screening assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}