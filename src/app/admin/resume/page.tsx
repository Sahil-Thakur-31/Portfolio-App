import React from "react";
import { getResumeData } from "@/server/db/resume";
import { ResumeEditorForm } from "@/components/resume-editor-form";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminResumePage() {
  let resumeData = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user?.id) {
      resumeData = await getResumeData({ userId: user.id });
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8 relative z-10 select-none">
      <div className="fade-in-up flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-block text-[9px] text-theme-accent-purple font-mono tracking-[0.25em] uppercase mb-1 bg-theme-accent-purple/10 border border-theme-accent-purple/20 px-2.5 py-0.5 rounded">
            MODULE: RESUME_EDITOR
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Resume Details</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">Configure profile summaries, social channels, and work history</p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 transition-all duration-300"
        >
          ← DASHBOARD
        </Link>
      </div>
      <div className="fade-in-up animation-delay-100">
        {resumeData ? (
          <ResumeEditorForm initialDataJson={JSON.stringify(resumeData)} />
        ) : (
          <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-8 text-center text-xs font-mono text-theme-neutral-300">
            [NO_RESUME_CONFIGURATION_RECORD_LOADED]
          </div>
        )}
      </div>
    </div>
  );
}
