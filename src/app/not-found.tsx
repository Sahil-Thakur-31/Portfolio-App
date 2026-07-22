import React from "react";
import Link from "next/link";

export default function UserNotFound() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-bg overflow-hidden">
      {/* Ambient background gradients, matching the site's landing aesthetic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-theme-accent-teal/20 blur-[150px] mix-blend-screen animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-theme-accent-purple/20 blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-theme-accent-blue/15 blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

      {/* Fully blurred backdrop behind the modal card */}
      <div className="absolute inset-0 bg-theme-bg/70 backdrop-blur-2xl" />

      {/* Centered modal card */}
      <div className="relative z-10 max-w-md w-full mx-6 rounded-2xl border border-theme-border bg-theme-bg/90 backdrop-blur-xl p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-theme-error/10 border border-theme-error/30">
          <span className="text-3xl leading-none text-theme-error">!</span>
        </div>
        <h1 className="text-2xl font-black text-theme-text mb-2">User Not Found</h1>
        <p className="text-sm text-theme-neutral-300 mb-8 leading-relaxed">
          This portfolio doesn&apos;t exist. Double-check the link, or head back to the homepage.
        </p>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue px-8 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.02] transition-all duration-300"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
