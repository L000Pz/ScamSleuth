// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local';
import Footer from './components/Footer';
import Navbar from "./components/header";


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
    <html lang="en" className={Montserrat.className}>
      <body className="bg-background flex flex-col">
        <Navbar />
        <div className="pt-2 md:pt-5">
          <main className="flex-grow">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
