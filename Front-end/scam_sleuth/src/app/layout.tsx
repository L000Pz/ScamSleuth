// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Footer from './components/Footer';
import Navbar from "./components/header";
import MirageSetup from "./components/MirageSetup";

export const metadata: Metadata = {
  title: "‌Scam Sleuth",
  description: "Uncovering Scams, One Report at a Time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background flex flex-col">
        <MirageSetup /> {/* Only runs on the client side */}
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
