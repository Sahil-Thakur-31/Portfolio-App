import React from "react";
import Link from "next/link";
import { getProjects } from "@/server/db/projects";
import { GithubSyncForm } from "@/components/github-sync-form";
import { ProjectsTable } from "@/components/projects-table";
import type { Project } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  let projects: Project[] = [];
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    projects = await getProjects({ userId: user?.id });
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10 select-none">
      
      {/* Header */}
      <div className="fade-in-up flex justify-between items-center gap-4 mb-10 border-b border-theme-border pb-6">
        <div>
          <div className="inline-block text-[9px] text-theme-accent-purple font-mono tracking-[0.25em] uppercase mb-1 bg-theme-accent-purple/10 border border-theme-accent-purple/20 px-2.5 py-0.5 rounded">
            MODULE: PROJECTS_CRUD
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Manage Projects</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">Add, update, or remove portfolio items showcased in your catalog</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link 
            href="/admin/projects/new" 
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue px-5 text-xs font-mono font-bold uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.01] transition-all duration-300"
          >
            + ADD_PROJECT
          </Link>
          <GithubSyncForm />
          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 transition-all duration-300"
          >
            ← DASHBOARD
          </Link>
        </div>
      </div>

      <div className="fade-in-up animation-delay-100">
        <ProjectsTable initialProjects={projects} />
      </div>
    </div>
  );
}
