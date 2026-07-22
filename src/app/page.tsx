import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AmbientBackground } from "@/components/ambient-background";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-center relative overflow-hidden font-sans">

      <AmbientBackground />

      {/* System status HUD badge */}
      <div className="fade-in-up absolute top-6 left-1/2 -translate-x-1/2 z-10 inline-flex items-center gap-2 rounded border border-theme-accent-teal/30 bg-theme-accent-teal/5 px-3 py-1 text-[9px] font-mono font-bold tracking-widest text-theme-accent-teal uppercase shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.1)]">
        <span className="flex h-1.5 w-1.5 rounded-full bg-theme-accent-teal shadow-[0_0_10px_var(--theme-accent-teal)] animate-pulse" />
        SYS_STATUS: ONLINE // MULTI_TENANT_READY
      </div>

      {/* Hero Content */}
      <div className="container mx-auto max-w-4xl px-6 relative z-10 flex flex-col items-center text-center mt-[-5vh]">

        {/* Logo */}
        <div className="fade-in-up animation-delay-100 relative w-48 h-48 md:w-64 md:h-64 mb-8 drop-shadow-[0_0_30px_rgba(var(--theme-accent-teal-rgb),0.3)] animate-float">
          <Image
            src="/logo-clean.png"
            alt="Nexus Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="fade-in-up animation-delay-200 text-5xl md:text-7xl leading-[1.2] font-black tracking-tight text-gradient mb-6 drop-shadow-sm py-1 pr-2">
          Welcome to Nexus
        </h1>
        <p className="fade-in-up animation-delay-300 text-lg md:text-2xl text-theme-neutral-300 font-mono mb-12 max-w-2xl mx-auto leading-relaxed">
          The ultimate platform to build, manage, and showcase your developer portfolio in seconds.
        </p>

        {/* CTA Buttons */}
        <div className="fade-in-up animation-delay-400 flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto sm:max-w-none">
          <Link
            href="/auth/login"
            className="group relative inline-flex h-14 items-center justify-center rounded-xl bg-theme-text px-10 font-bold font-mono text-sm uppercase tracking-widest text-theme-bg overflow-hidden transition-all duration-300 w-full sm:w-auto hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
          >
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="relative h-full w-8 bg-white/40" />
            </div>
            <span className="relative">Log In</span>
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-14 items-center justify-center rounded-xl border border-theme-border bg-theme-bg/50 backdrop-blur-md hover:bg-theme-neutral-800/80 hover:border-theme-neutral-600 px-10 font-bold font-mono text-sm uppercase tracking-widest text-theme-text gap-2 transition-all duration-300 w-full sm:w-auto"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
