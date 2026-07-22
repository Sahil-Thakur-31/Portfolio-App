import React from "react";
import { getProjectBySlug } from "@/server/db/projects";
import { ProjectForm } from "@/components/project-form";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { id } = await params;
  let project = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    project = (data as any)?.user_id === user?.id ? data : null;
  } catch (error) {
    notFound();
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10 select-none">
      <div className="fade-in-up flex items-center justify-between gap-4 mb-10 border-b border-theme-border pb-6">
        <div>
          <div className="inline-block text-[9px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-1 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-2.5 py-0.5 rounded">
            MODULE: EDIT_PROJECT_ENTRY
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Edit Project</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">Modify details for this portfolio project catalog record</p>
        </div>
        <Link
          href="/admin/projects"
          className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 transition-all duration-300"
        >
          ← CANCEL
        </Link>
      </div>
      <div className="fade-in-up animation-delay-100">
        <ProjectForm initialData={project} id={id} />
      </div>
    </div>
  );
}
