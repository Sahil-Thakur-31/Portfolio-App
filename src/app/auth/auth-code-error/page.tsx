import React from "react";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-center relative overflow-hidden font-sans px-4">
      <div className="absolute top-[30%] left-[20%] w-[35rem] h-[35rem] rounded-full bg-theme-accent-teal/3 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[30%] right-[20%] w-[35rem] h-[35rem] rounded-full bg-theme-accent-purple/3 blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none z-0" />

      <div className="container mx-auto max-w-sm relative z-10 w-full select-none">
        <div className="rounded-2xl border border-theme-border bg-theme-bg/90 p-8 shadow-2xl relative text-center">
          <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-theme-error/45" />
          <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-theme-error/45" />

          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-theme-error/10 border border-theme-error/30">
            <span className="text-3xl leading-none text-theme-error">!</span>
          </div>

          <div className="inline-block text-[9px] text-theme-error font-mono tracking-[0.25em] uppercase mb-2 bg-theme-error/10 border border-theme-error/20 px-3 py-1 rounded">
            AUTH_EXCHANGE_FAILED
          </div>
          <h1 className="text-2xl font-black tracking-tight text-theme-text mb-2">Sign-In Link Invalid</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mb-8 leading-relaxed">
            This link is expired, already used, or invalid. Request a new one and try again.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.02] transition-all duration-300"
            >
              Back to Login
            </Link>
            <Link
              href="/"
              className="text-[10px] font-mono text-theme-neutral-300 hover:text-theme-accent-teal uppercase tracking-widest transition-colors font-semibold"
            >
              ← return_home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
