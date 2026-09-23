import type { Metadata } from "next";
import { Source_Sans_3, Fraunces } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelAI",
  description:
    "TravelAI — autenticazione e database (Fase 2). Ricerca e AI non ancora disponibili.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="min-h-full font-sans text-stone-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
