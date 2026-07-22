"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { AmbientBackground } from "@/components/ambient-background";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setMessage("Decryption key instructions dispatched to email.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-center relative overflow-hidden font-sans px-4">
      <AmbientBackground />

      <div className="container mx-auto max-w-sm relative z-10 w-full select-none">
        
        <div className="fade-in-up text-center mb-8">
          <div className="inline-block text-[9px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-2 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-3 py-1 rounded">
            CREDENTIAL_RECOVERY_NODE
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">Forgot Password</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1.5 uppercase tracking-wider">Request verification cipher to override account key</p>
        </div>

        <form onSubmit={handleReset} className="fade-in-up animation-delay-200 space-y-5 rounded-2xl border border-theme-border bg-theme-bg/60 backdrop-blur-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_60px_rgba(var(--theme-accent-teal-rgb),0.08)] relative group overflow-hidden">
          <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-theme-accent-teal/45" />
          <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-theme-accent-purple/45" />

          <div className="flex justify-between items-center border-b border-theme-border pb-3.5 mb-2 select-none">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-theme-accent-teal font-bold block">RECOVERY // RESET</span>
              <span className="text-[8px] font-mono text-theme-neutral-300 uppercase mt-0.5">SYS_MODULE: AUTH_OVERRIDE</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-theme-accent-teal animate-pulse" />
          </div>

          {error && (
            <div className="rounded-xl border border-theme-error/30 bg-theme-error/10 p-4 text-[10px] font-mono text-theme-error">
              [RECOVERY_FAILED] {error}
            </div>
          )}

          {message && (
            <div className="rounded-xl border border-theme-success/30 bg-theme-success/10 p-4 text-[10px] font-mono text-theme-success">
              [RESET_LINK_SENT] {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5 font-bold">REGISTERED_EMAIL_KEY</label>
            <input
              id="email"
              type="email"
              placeholder="developer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue hover:from-theme-accent-teal/90 hover:to-theme-accent-blue/90 px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50"
          >
            {loading ? "TRANSMITTING..." : "[ TRANSMIT_RECOVERY_KEY ]"}
          </button>
        </form>

        <div className="fade-in-up animation-delay-400 text-center mt-6">
          <Link
            href="/auth/login"
            className="text-[10px] font-mono text-theme-neutral-300 hover:text-theme-accent-teal uppercase tracking-widest transition-colors font-semibold"
          >
            ← abort // return_to_login
          </Link>
        </div>

      </div>
    </div>
  );
}
