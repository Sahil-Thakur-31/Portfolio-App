import { GuestbookForm } from "@/components/guestbook-form";
import { getGuestbookEntries } from "@/server/db/guestbook";
import { getResumeData } from "@/server/db/resume";
import Link from "next/link";
import type { GuestbookEntry } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function GuestbookPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let entries: GuestbookEntry[] = [];
  let isOwner = false;

  try {
    entries = await getGuestbookEntries({ username });
  } catch (error) {
    console.error("Failed to load guestbook details:", error);
  }

  try {
    const resume = await getResumeData({ username });
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    isOwner = !!user && !!resume?.user_id && user.id === resume.user_id;
  } catch (error) {
    // Session or database query failed
  }

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-start relative overflow-hidden font-sans">
      {/* Background neon glows */}
      <div className="absolute top-[10%] left-[10%] w-[35rem] h-[35rem] rounded-full bg-theme-accent-teal/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] rounded-full bg-theme-accent-purple/3 blur-[120px] pointer-events-none" />

      {/* Grid watermark background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto max-w-6xl px-6 py-24 relative z-10 w-full">

        {/* Header Ribbon */}
        <div className="flex items-center justify-between gap-4 mb-12 border-b border-theme-border pb-6">
          <div>
            <div className="inline-block text-[9px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-1 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-2.5 py-0.5 rounded">
              GUESTBOOK_NODE
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient">System Logs</h1>
            <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">Public read/write access active</p>
          </div>
          <Link
            href={`/${username}`}
            className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 gap-2 transition-all duration-300"
          >
            <span>← RETURN</span>
          </Link>
        </div>

        <GuestbookForm initialEntries={entries} username={username} isAdmin={isOwner} />
      </div>
    </div>
  );
}
