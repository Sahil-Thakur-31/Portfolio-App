"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * Wraps route content in a subtle fade+rise so navigating between pages
 * reads as one smooth motion instead of an abrupt swap. Keying the wrapper
 * on the pathname makes React remount it on every navigation, replaying the
 * CSS animation each time.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-page-fade-in">
      {children}
    </div>
  );
}
