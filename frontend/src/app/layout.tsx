import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CookieConsent from "@/components/shared/CookieConsent";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://lhamsdj.com'),
  title: { default: 'LhamsDJ - Marketplace', template: '%s | LhamsDJ' },
  description: 'Your global marketplace for the best products. Shop electronics, fashion, home & more from verified vendors worldwide.',
  keywords: ['marketplace', 'online shopping', 'ecommerce', 'electronics', 'fashion', 'dropshipping'],
  openGraph: {
    type: 'website',
    siteName: 'LhamsDJ',
    title: 'LhamsDJ - Global Marketplace',
    description: 'Shop the best products from verified vendors worldwide.',
    locale: 'en_US',
    alternateLocale: ['fr_FR', 'es_ES'],
  },
  twitter: { card: 'summary_large_image', title: 'LhamsDJ - Global Marketplace', description: 'Shop the best products from verified vendors worldwide.' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
