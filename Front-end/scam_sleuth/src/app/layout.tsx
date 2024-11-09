import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import Footer from './components/Footer';
import Navbar from "./components/header";



export const metadata: Metadata = {
  title: "‌Scam Sleuth",
  description: "Uncovering Scams, One Report at a Time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background flex flex-col " >
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
