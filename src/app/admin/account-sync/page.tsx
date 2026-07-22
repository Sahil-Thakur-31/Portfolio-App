"use client";

import React from "react";
import Link from "next/link";
import { useGithubIdentity } from "@/hooks/use-github-identity";
import { useLinkedinIdentity } from "@/hooks/use-linkedin-identity";
import { Loader2, Link as LinkIcon, Unlink } from "lucide-react";
import { GithubOutlined, LinkedinOutlined } from "@ant-design/icons";

export default function AccountSyncPage() {
  const { username, loading, linking, error, linkGithub, unlinkGithub } = useGithubIdentity();
  const { username: linkedinUsername, loading: linkedinLoading, linking: linkedinLinking, error: linkedinError, linkLinkedin, unlinkLinkedin } = useLinkedinIdentity();

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10 select-none">
      {/* Header */}
      <div className="fade-in-up flex items-center justify-between gap-4 mb-12 border-b border-theme-border pb-6">
        <div>
          <div className="inline-block text-[9px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-1 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-2.5 py-0.5 rounded">
            SYS_CONFIG // ACCOUNT_SYNC
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Account Sync</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">
            Manage linked third-party accounts and integrations
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 gap-2 transition-all duration-300"
        >
          ← RETURN
        </Link>
      </div>

      <div className="fade-in-up animation-delay-100 grid gap-6">
        {/* Integrations Card */}
        <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-6 shadow-xl flex flex-col gap-6">
          <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />
          
          {/* GitHub Integration */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between border-b border-theme-border pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-theme-border bg-theme-input-bg/60">
                  <GithubOutlined className="text-xl text-theme-text" />
                </div>
                <div>
                  <h2 className="text-md font-bold uppercase font-mono tracking-widest text-theme-neutral-200">GitHub</h2>
                  <p className="text-xs font-mono text-theme-neutral-300 mt-0.5">Link your GitHub identity to import projects automatically.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="flex h-9 items-center justify-center px-4 rounded-lg border border-theme-border bg-theme-input-bg/40 text-theme-neutral-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : username ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-theme-success px-3 py-1.5 rounded-md bg-theme-success/10 border border-theme-success/20 h-9">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-success opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-theme-success"></span>
                      </span>
                      Linked: {username}
                    </div>
                    <button
                      onClick={unlinkGithub}
                      disabled={linking}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 gap-1.5 transition-all duration-300 disabled:opacity-50"
                    >
                      {linking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3" />}
                      Unlink Account
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={linkGithub}
                    disabled={linking}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-theme-accent-teal/50 bg-theme-accent-teal/10 hover:bg-theme-accent-teal/20 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-accent-teal gap-2 transition-all duration-300 disabled:opacity-50"
                  >
                    {linking ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                    Link GitHub
                  </button>
                )}
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono -mt-2 mb-2">
                [ERROR]: {error}
              </div>
            )}
          </div>

          {/* LinkedIn Integration */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-theme-border bg-theme-input-bg/60">
                  <LinkedinOutlined className="text-xl text-[#0077B5]" />
                </div>
                <div>
                  <h2 className="text-md font-bold uppercase font-mono tracking-widest text-theme-neutral-200">LinkedIn</h2>
                  <p className="text-xs font-mono text-theme-neutral-300 mt-0.5">Link your LinkedIn profile to enhance your resume generation.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {linkedinLoading ? (
                  <div className="flex h-9 items-center justify-center px-4 rounded-lg border border-theme-border bg-theme-input-bg/40 text-theme-neutral-300">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : linkedinUsername ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#0077B5] px-3 py-1.5 rounded-md bg-[#0077B5]/10 border border-[#0077B5]/20 h-9">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0077B5] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0077B5]"></span>
                      </span>
                      Linked: {linkedinUsername}
                    </div>
                    <button
                      onClick={unlinkLinkedin}
                      disabled={linkedinLinking}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-4 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 gap-1.5 transition-all duration-300 disabled:opacity-50"
                    >
                      {linkedinLinking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Unlink className="h-3 w-3" />}
                      Unlink Account
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={linkLinkedin}
                    disabled={linkedinLinking}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-[#0077B5]/50 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 px-4 text-xs font-mono font-bold uppercase tracking-wider text-[#0077B5] gap-2 transition-all duration-300 disabled:opacity-50"
                  >
                    {linkedinLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                    Link LinkedIn
                  </button>
                )}
              </div>
            </div>
            
            {linkedinError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono -mt-2">
                [ERROR]: {linkedinError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
