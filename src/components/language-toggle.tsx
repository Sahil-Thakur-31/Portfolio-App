"use client";

import React from "react";
import { useLanguage } from "@/providers/language-provider";

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === "en" ? "hi" : "en")}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-theme-neutral-800 bg-theme-neutral-900 px-3 text-xs font-semibold hover:bg-theme-neutral-800 text-theme-accent-teal transition-colors cursor-pointer"
    >
      {locale === "en" ? "हिन्दी (HI)" : "English (EN)"}
    </button>
  );
}
