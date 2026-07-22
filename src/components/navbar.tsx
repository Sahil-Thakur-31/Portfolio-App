"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/providers/language-provider";
import { LanguageToggle } from "./language-toggle";

export function Navbar({ username, userName = "" }: { username?: string; userName?: string }) {
  const { t } = useLanguage();

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 0 || !parts[0]) return "";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = userName ? getInitials(userName) : "";
  const homeHref = username ? `/${username}` : "/";

  return (
    <header className="sticky top-0 z-50 w-full pt-4 pb-8">
      {/* Full-width blur & fade overlay */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none -z-10"
        style={{
          background: "linear-gradient(to bottom, var(--theme-bg) 0%, rgba(var(--theme-bg-rgb), 0.95) 45%, rgba(var(--theme-bg-rgb), 0.4) 75%, transparent 100%)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 100%)",
        }}
      />
      <div className="max-w-[92vw] mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between px-6 rounded-2xl border border-theme-border bg-theme-bg/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(var(--theme-black-rgb),0.5)]">
          <Link href={homeHref} className="flex items-center justify-center hover:opacity-90 transition-opacity">
            {userName ? (
              <span className="text-4xl font-[family-name:var(--font-logo)] tracking-widest text-gradient drop-shadow-sm pr-2">
                {initials}
              </span>
            ) : (
              <Image src="/logo-clean.png" alt="Nexus Logo" width={40} height={40} className="rounded-xl object-contain drop-shadow-md" />
            )}
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-theme-neutral-300">
            <Link href={homeHref} className="hover:text-theme-text transition-colors">{t("Navbar.home") || "Home"}</Link>
            <Link href={`${homeHref}#experience`} className="hover:text-theme-text transition-colors">{t("Navbar.experience") || "Experience"}</Link>
            <Link href={`${homeHref}#projects`} className="hover:text-theme-text transition-colors">{t("Navbar.projects") || "Projects"}</Link>
            <Link href={`${homeHref}/guestbook`} className="hover:text-theme-text transition-colors">{t("Navbar.guestbook") || "Guestbook"}</Link>
            <Link href={`${homeHref}/stats`} className="hover:text-theme-text transition-colors">{t("Navbar.stats") || "Stats"}</Link>
            <Link href="/admin" className="text-theme-accent-teal hover:text-theme-accent-teal/70 transition-colors">
              {t("Navbar.admin") || "Admin"}
            </Link>
            <LanguageToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
