"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/lib/i18n/messages/en.json";
import hi from "@/lib/i18n/messages/hi.json";

type Locale = "en" | "hi";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries = { en, hi };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("portfolio-locale") as Locale;
    if (saved === "en" || saved === "hi") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("portfolio-locale", newLocale);
  };

  // Helper function to translate keys using path notation (e.g. "Navbar.about")
  const t = (pathKey: string): string => {
    const [section, key] = pathKey.split(".");
    const dict = dictionaries[locale] as any;
    return dict[section]?.[key] || pathKey;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
