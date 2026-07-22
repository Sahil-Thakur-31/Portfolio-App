"use client";

import React, { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AmbientBackground } from "@/components/ambient-background";

function LoginCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  // Only set when middleware bounced the user from a specific protected page
  // (e.g. /admin/leads). Otherwise we send them to their own portfolio.
  const redirectTo = searchParams.get("redirectTo");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      const destination = redirectTo || "/admin";
      router.push(destination);
      router.refresh();
    }
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    setError(null);
    const supabase = createClient();
    const callbackUrl = redirectTo
      ? `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`
      : `${window.location.origin}/api/auth/callback`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: callbackUrl,
      },
    });
    if (authError) {
      setError(authError.message);
      setGithubLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-5 rounded-2xl border border-theme-border bg-theme-bg/60 backdrop-blur-2xl p-8 shadow-[0_8px_40px_rgba(0,0,0,0.55),0_0_60px_rgba(var(--theme-accent-teal-rgb),0.08)] relative group overflow-hidden">
      {/* HUD scope brackets */}
      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-theme-accent-teal/45" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-theme-accent-purple/45" />

      {/* Console details */}
      <div className="flex justify-between items-center border-b border-theme-border pb-3.5 mb-2 select-none">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-theme-accent-teal font-bold block">SECURE_SHELL // AUTH</span>
          <span className="text-[8px] font-mono text-theme-neutral-300 uppercase mt-0.5">ALGORITHM: AES_256_GCM</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-theme-error animate-pulse shadow-[0_0_10px_var(--theme-error)]" />
      </div>

      {error && (
        <div className="rounded-xl border border-theme-error/30 bg-theme-error/10 p-4 text-[10px] font-mono text-theme-error">
          [DECRYPTION_FAILED] {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5 font-bold">SYS_EMAIL_KEY</label>
        <input
          id="email"
          type="email"
          placeholder="admin@sahilthakur.com"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue hover:from-theme-accent-teal/90 hover:to-theme-accent-blue/90 px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50"
      >
        {loading ? "DECRYPTING..." : "[ INITIATE_ACCESS_UPLINK ]"}
      </button>

      <div className="flex items-center gap-3 text-[9px] font-mono text-theme-neutral-300 uppercase tracking-widest">
        <span className="flex-1 h-px bg-theme-border" />
        OR
        <span className="flex-1 h-px bg-theme-border" />
      </div>

      <button
        type="button"
        onClick={handleGithubLogin}
        disabled={githubLoading}
        className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 hover:border-theme-accent-purple/25 px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-text transition-all duration-300 cursor-pointer disabled:opacity-50"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.42-1.305.762-1.605-2.665-.303-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.5 11.5 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.807 5.624-5.479 5.921.43.372.814 1.103.814 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.696.825.578C20.565 21.795 24 17.298 24 12c0-6.63-5.373-12-12-12z" />
        </svg>
        {githubLoading ? "REDIRECTING..." : "Sign in with GitHub"}
      </button>

      <div className="flex justify-between items-center text-[10px] font-mono text-theme-neutral-300 font-semibold pt-2 px-1">
        <Link href="/auth/forgot-password" className="hover:text-theme-accent-teal transition-colors">
          // FORGOT_PASSWORD?
        </Link>
        <Link href="/auth/signup" className="hover:text-theme-accent-purple transition-colors">
          // CREATE_NEW_NODE (SIGN_UP)
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-center relative overflow-hidden font-sans px-4">
      <AmbientBackground />

      <div className="container mx-auto max-w-sm relative z-10 w-full select-none">
        
        {/* Title details */}
        <div className="fade-in-up text-center mb-8">
          <div className="inline-block text-[9px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-2 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-3 py-1 rounded">
            RESTRICTED_NODE_ACCESS
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gradient">Admin Login</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1.5 uppercase tracking-wider">Flashing core credentials decrypted on authorization</p>
        </div>

        <div className="fade-in-up animation-delay-200">
          <Suspense fallback={
            <div className="relative rounded-2xl border bg-theme-bg/60 backdrop-blur-2xl border-theme-border p-8 text-center text-xs font-mono text-theme-neutral-300">
              LOADING_SECURE_AUTH_MODULE...
            </div>
          }>
            <LoginCard />
          </Suspense>
        </div>

        {/* Back option */}
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
