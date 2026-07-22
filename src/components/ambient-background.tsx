import React from "react";
import { NetworkBackground } from "@/components/network-background";

/**
 * The shared animated backdrop (gradient blobs + particle network + grid +
 * scan sweep) used across the landing page, auth screens, and admin panel
 * so they all read as one consistent, dynamic product rather than a mix of
 * static and animated pages. Uses fixed positioning so it holds steady
 * behind scrollable content (e.g. long admin forms).
 */
export function AmbientBackground() {
  return (
    <>
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-theme-accent-teal/20 blur-[150px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-theme-accent-purple/20 blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-theme-accent-blue/15 blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
        <div className="absolute bottom-[10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-theme-accent-purple/10 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      {/* Interactive particle network */}
      <div className="fixed inset-0 z-0">
        <NetworkBackground />
      </div>

      {/* Grid watermark */}
      <div className="fixed inset-0 bg-grid-pattern opacity-15 pointer-events-none z-0" />

      {/* Vertical scan sweep for HUD feel */}
      <div className="fixed inset-x-0 top-0 h-px pointer-events-none overflow-hidden z-0">
        <div className="w-full h-40 bg-gradient-to-b from-theme-accent-teal/60 via-theme-accent-teal/10 to-transparent animate-scan-vertical" />
      </div>

      {/* Subtle grain to smooth gradient banding */}
      <div className="bg-noise" />
    </>
  );
}
