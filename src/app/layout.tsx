import React from "react";
import type { Metadata } from "next";
import { Outfit, Pacifico } from "next/font/google";
import "./globals.css";
import { TerminalProvider } from "@/components/terminal/terminal-provider";
import { TerminalOverlay } from "@/components/terminal/terminal-overlay";
import { LanguageProvider } from "@/providers/language-provider";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { SkipToContent } from "@/components/skip-to-content";
import { PageTransition } from "@/components/page-transition";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-logo",
});

export const metadata: Metadata = {
  title: "Nexus — Developer Portfolio",
  description: "Enterprise-grade developer portfolio",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={`${outfit.variable} ${pacifico.variable} scroll-smooth`}>
      <body className="antialiased text-theme-text min-h-screen flex flex-col justify-between selection:bg-theme-accent-teal/30">
        <LanguageProvider>
          <TerminalProvider>
            <SkipToContent />
            <AnalyticsTracker />
            <main id="main-content" className="flex-grow">
              <PageTransition>{children}</PageTransition>
            </main>
            <TerminalOverlay />
          </TerminalProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
