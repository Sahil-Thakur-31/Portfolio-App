"use client";

import React, { useEffect } from "react";
import { getUsernameFromPathname } from "@/lib/utils";

export function AnalyticsTracker() {
  useEffect(() => {
    const username = getUsernameFromPathname(window.location.pathname);
    if (!username) return; // Not on a portfolio page (e.g. admin/auth/landing) — nothing to attribute this to.

    const trackPageView = async () => {
      try {
        const metadata = {
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          language: window.navigator.language,
        };

        await fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            event_type: "page_view",
            page: window.location.pathname,
            referrer: document.referrer || null,
            user_agent: window.navigator.userAgent,
            metadata,
          }),
        });
      } catch (err) {
        console.error("Failed to log page view analytics:", err);
      }
    };

    trackPageView();
  }, []);

  return null;
}
