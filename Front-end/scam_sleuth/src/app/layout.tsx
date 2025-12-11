// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import localFont from 'next/font/local';
import { Vazirmatn } from 'next/font/google';
import Footer from './components/Footer';
import Navbar from "./components/header";
import AutoFont from "@/components/AutoFont";

const Montserrat = localFont({
  src: [
    {
      path: './fonts/montserrat-v26-latin-300.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/montserrat-v26-latin-300italic.woff2',
      weight: '300',
      style: 'italic',
    },
    {
      path: './fonts/montserrat-v26-latin-500.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/montserrat-v26-latin-500italic.woff2',
      weight: '500',
      style: 'italic',
    },
    {
      path: './fonts/montserrat-v26-latin-700.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/montserrat-v26-latin-700italic.woff2',
      weight: '700',
      style: 'italic',
    },
    {
      path: './fonts/montserrat-v26-latin-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/montserrat-v26-latin-italic.woff2',
      weight: '400',
      style: 'italic',
    },
  ],
  variable: '--font-montserrat',
});

const vazir = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "‌Scam Sleuth",
  description: "Uncovering Scams, One Report at a Time.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${Montserrat.variable} ${vazir.variable}`}>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/gh/rastikerdar/iran-sans-font@v5.0/fontface.css" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/gh/rastikerdar/yekan-font@v1.0/fontface.css" 
        />
        
        {/* Google Fonts for additional English fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Impact&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${Montserrat.className} bg-background flex flex-col`}>
        <Navbar />
        <AutoFont />
        <div className="pt-2 md:pt-5">
          <main className="flex-grow">{children}</main>
        </div>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}