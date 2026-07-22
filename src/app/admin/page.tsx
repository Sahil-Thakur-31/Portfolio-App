import React from "react";
import Link from "next/link";
import { getProjects } from "@/server/db/projects";
import { getLeads } from "@/server/db/leads";
import { getGuestbookEntries } from "@/server/db/guestbook";
import type { Lead } from "@/lib/database.types";
import { logoutAction } from "@/server/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let projectsCount = 0;
  let leadsCount = 0;
  let guestbookCount = 0;
  let recentLeads: Lead[] = [];
  let ownUsername = "";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    if (userId) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", userId).maybeSingle();
      ownUsername = (profile as any)?.username || "";
    }

    const projects = await getProjects({ userId });
    projectsCount = projects.length;

    const leads = await getLeads({ ownerId: userId });
    leadsCount = leads.length;
    recentLeads = leads.slice(0, 5);

    const guestbook = await getGuestbookEntries({ ownerId: userId });
    guestbookCount = guestbook.length;
  } catch (error) {
    console.error("Admin stats fetch failed:", error);
  }

  const portfolioHref = ownUsername ? `/${ownUsername}` : "/";

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10 select-none">
      
      {/* Header */}
      <div className="fade-in-up flex items-center justify-between gap-4 mb-12 border-b border-theme-border pb-6">
        <div>
          <div className="inline-block text-[9px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-1 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-2.5 py-0.5 rounded">
            SYS_DASHBOARD // OVERVIEW
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Admin Control Panel</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">Manage project databases, track analytics, and handle visitor inputs</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={portfolioHref}
            className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 gap-2 transition-all duration-300"
          >
            ← VIEW_PORTFOLIO
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-red-900/30 bg-red-950/20 hover:bg-red-900/40 px-4 text-xs font-mono font-bold uppercase tracking-wider text-red-400 gap-2 transition-all duration-300"
            >
              LOGOUT ⏏
            </button>
          </form>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid md:grid-cols-12 gap-8 items-start">

        {/* Left Column: KPI Cards */}
        <div className="fade-in-up animation-delay-100 md:col-span-4 flex flex-col gap-4">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Leads KPI */}
            <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-4 shadow-xl group overflow-hidden hover:border-theme-accent-purple/30 transition-all duration-300">
              <span className="absolute top-2 left-2 w-1 h-1 border-t border-l border-theme-border/20" />
              <div className="flex justify-between items-start border-b border-theme-border pb-2 mb-2">
                <h3 className="text-[8px] font-mono uppercase tracking-wider text-theme-neutral-300 group-hover:text-theme-accent-purple transition-colors font-bold">CLIENT_LEADS</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-purple animate-pulse" />
              </div>
              <p className="text-2xl font-black text-theme-text font-mono tracking-tight group-hover:text-theme-accent-purple transition-colors">{leadsCount}</p>
            </div>

            {/* Guestbook KPI */}
            <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-4 shadow-xl group overflow-hidden hover:border-theme-success/30 transition-all duration-300">
              <span className="absolute top-2 left-2 w-1 h-1 border-t border-l border-theme-border/20" />
              <div className="flex justify-between items-start border-b border-theme-border pb-2 mb-2">
                <h3 className="text-[8px] font-mono uppercase tracking-wider text-theme-neutral-300 group-hover:text-theme-success transition-colors font-bold">GUEST_SIGNATURES</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
              </div>
              <p className="text-2xl font-black text-theme-text font-mono tracking-tight group-hover:text-theme-success transition-colors">{guestbookCount}</p>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-5 shadow-xl">
            <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />
            <div className="border-b border-theme-border pb-2 mb-4">
              <h3 className="text-[10px] font-mono uppercase tracking-wider text-theme-neutral-300 font-bold">QUICK_ACTIONS</h3>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/admin/projects" className="inline-flex h-10 items-center justify-center rounded-xl border border-theme-border bg-theme-input-bg/85 hover:border-theme-accent-teal/30 hover:bg-theme-card-bg px-4 font-mono text-[10px] uppercase tracking-widest text-theme-neutral-300 hover:text-theme-accent-teal transition-all duration-300">
                → MANAGE_PROJECTS_CRUD
              </Link>
              <Link href="/admin/resume" className="inline-flex h-10 items-center justify-center rounded-xl border border-theme-border bg-theme-input-bg/85 hover:border-theme-accent-purple/30 hover:bg-theme-card-bg px-4 font-mono text-[10px] uppercase tracking-widest text-theme-neutral-300 hover:text-theme-accent-purple transition-all duration-300">
                → EDIT_RESUME_PARAMETERS
              </Link>
              <Link href="/admin/leads" className="inline-flex h-10 items-center justify-center rounded-xl border border-theme-border bg-theme-input-bg/85 hover:border-theme-success/30 hover:bg-theme-card-bg px-4 font-mono text-[10px] uppercase tracking-widest text-theme-neutral-300 hover:text-theme-success transition-all duration-300">
                → VIEW_CLIENT_INQUIRIES
              </Link>
              <Link href="/admin/account-sync" className="inline-flex h-10 items-center justify-center rounded-xl border border-theme-border bg-theme-input-bg/85 hover:border-theme-accent-purple/30 hover:bg-theme-card-bg px-4 font-mono text-[10px] uppercase tracking-widest text-theme-neutral-300 hover:text-theme-accent-purple transition-all duration-300">
                → ACCOUNT_SYNC
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Leads */}
        <div className="fade-in-up animation-delay-200 md:col-span-8 relative rounded-2xl border bg-theme-bg/60 border-theme-border p-6 shadow-xl">
          <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />

          <div className="flex justify-between items-center border-b border-theme-border pb-4 mb-6">
            <h2 className="text-md font-bold uppercase font-mono tracking-widest text-theme-neutral-200">Recent Client Inquiries</h2>
            <Link href="/admin/leads" className="text-[8px] font-mono text-theme-neutral-300 hover:text-theme-accent-teal uppercase tracking-widest transition-colors">
              VIEW_ALL →
            </Link>
          </div>

          <div className="space-y-4">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="relative rounded-xl border border-theme-border bg-theme-input-bg/60 p-4 hover:border-theme-border/20 transition-all duration-300">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-theme-neutral-200 text-sm font-mono">{lead.name}</span>
                  <span className="text-[8px] font-mono text-theme-neutral-300">{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-[10px] font-mono text-theme-accent-teal mb-2">{lead.email}</p>
                <p className="text-xs text-theme-neutral-300 leading-relaxed line-clamp-2">{lead.message}</p>
              </div>
            ))}
            {recentLeads.length === 0 && (
              <p className="text-xs font-mono text-theme-neutral-300 py-4 text-center">[NO_CLIENT_INQUIRIES_LOGGED]</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
