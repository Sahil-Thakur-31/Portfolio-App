import React from "react";

/**
 * Instant loading UI shown by each route segment's loading.tsx while its
 * Server Component awaits data — replaces a blank/frozen screen with an
 * immediate, on-theme response so navigation feels responsive.
 */
export function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-theme-border" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-theme-accent-teal border-r-theme-accent-teal animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-theme-accent-purple animate-spin [animation-direction:reverse] [animation-duration:1.4s]" />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-theme-neutral-300">
          <span className="flex h-1.5 w-1.5 rounded-full bg-theme-accent-teal shadow-[0_0_10px_var(--theme-accent-teal)] animate-pulse" />
          LOADING_NODE_DATA...
        </div>
      </div>
    </div>
  );
}
