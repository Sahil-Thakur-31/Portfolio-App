"use client";

import React from "react";

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="hidden focus:block focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-theme-accent-teal focus:px-4 focus:py-2 focus:text-theme-bg focus:font-semibold focus:outline-none"
    >
      Skip to Content
    </a>
  );
}
