"use client";

import React, { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AmbientBackground } from "@/components/ambient-background";

function SignupCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setMessage("Transmission success. Verification link sent to email.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-5 rounded-2xl border border-theme-border bg-theme-bg/60 backdrop-blur-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_60px_rgba(var(--theme-accent-teal-rgb),0.08)] relative group overflow-hidden">
      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-theme-accent-teal/45" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-theme-accent-purple/45" />

      <div className="flex justify-between items-center border-b border-theme-border pb-3.5 mb-2 select-none">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-theme-accent-teal font-bold block">CREATE_NODE // REGISTER</span>
          <span className="text-[8px] font-mono text-theme-neutral-300 uppercase mt-0.5">SYS_MODULE: USER_REGISTRATION</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-theme-accent-purple animate-pulse shadow-[0_0_10px_var(--theme-accent-purple)]" />
      </div>

      {error && (
        <div className="rounded-xl border border-theme-error/30 bg-theme-error/10 p-4 text-[10px] font-mono text-theme-error">
          [REGISTRATION_FAILED] {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-theme-success/30 bg-theme-success/10 p-4 text-[10px] font-mono text-theme-success">
          [TRANSMISSION_SUCCESS] {message}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5 font-bold">SYS_EMAIL_KEY</label>
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

      <div>
        <label htmlFor="password" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5 font-bold">SYS_PASSWORD_KEY</label>
        <input
          id="password"
          type="password"
          placeholder="••••••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5 font-bold">CONFIRM_PASSWORD_KEY</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.06)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue hover:from-theme-accent-teal/90 hover:to-theme-accent-blue/90 px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50"
      >
        {loading ? "TRANSMITTING..." : "[ INITIATE_NODE_CREATION ]"}
      </button>

      <div className="flex justify-end items-center text-[10px] font-mono text-theme-neutral-300 font-semibold pt-2 px-1">
        <Link href="/auth/login" className="hover:text-theme-accent-teal transition-colors">
          // ALREADY_REGISTERED (LOG_IN)
        </Link>
      </div>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-center relative overflow-hidden font-sans px-4">
      <AmbientBackground />

      <div className="container mx-auto max-w-sm relative z-10 w-full select-none">
        
        <div className="fade-in-up text-center mb-8">
          <div className="inline-block text-[9px] text-theme-accent-purple font-mono tracking-[0.25em] uppercase mb-2 bg-theme-accent-purple/10 border border-theme-accent-purple/20 px-3 py-1 rounded">
            NODE_REGISTRATION_PORTAL
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">Create Account</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1.5 uppercase tracking-wider">Register credentials to provision your portfolio node</p>
        </div>

        <div className="fade-in-up animation-delay-200">
          <SignupCard />
        </div>

        <div className="fade-in-up animation-delay-400 text-center mt-6">
          <Link
            href="/"
            className="text-[10px] font-mono text-theme-neutral-300 hover:text-theme-accent-teal uppercase tracking-widest transition-colors font-semibold"
          >
            ← abort_connection // return_home
          </Link>
        </div>

      </div>
    </div>
  );
}
