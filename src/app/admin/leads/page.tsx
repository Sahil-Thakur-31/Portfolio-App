import React from "react";
import { getLeads } from "@/server/db/leads";
import Link from "next/link";
import type { Lead } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  let leads: Lead[] = [];
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    leads = await getLeads({ ownerId: user?.id });
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="container mx-auto max-w-6xl px-6 py-16 relative z-10 select-none">
      
      {/* Header */}
      <div className="fade-in-up flex justify-between items-center gap-4 mb-10 border-b border-theme-border pb-6">
        <div>
          <div className="inline-block text-[9px] text-theme-success font-mono tracking-[0.25em] uppercase mb-1 bg-theme-success/10 border border-theme-success/20 px-2.5 py-0.5 rounded">
            MODULE: CLIENT_INQUIRIES
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gradient">Manage Leads</h1>
          <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">Review and track all client contact form submissions</p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 transition-all duration-300"
        >
          ← DASHBOARD
        </Link>
      </div>

      {/* Leads Table */}
      <div className="fade-in-up animation-delay-100 relative rounded-2xl border bg-theme-bg/60 border-theme-border shadow-xl overflow-hidden">
        <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />
        
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-theme-border bg-theme-input-bg/80">
              <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">NAME</th>
              <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">EMAIL_ADDRESS</th>
              <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">COMPANY</th>
              <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">MESSAGE</th>
              <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-white/5">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-theme-card-bg/60 text-theme-neutral-300 transition-colors duration-200">
                <td className="p-4 font-bold text-theme-neutral-200 text-sm">{lead.name}</td>
                <td className="p-4 text-theme-accent-teal text-xs font-mono">{lead.email}</td>
                <td className="p-4 text-theme-neutral-300 text-xs font-mono">{lead.company || "N/A"}</td>
                <td className="p-4 text-theme-neutral-300 max-w-xs truncate text-xs">{lead.message}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                    lead.status === 'new' 
                      ? 'bg-theme-accent-teal/10 text-theme-accent-teal border border-theme-accent-teal/20' 
                      : lead.status === 'read' 
                      ? 'bg-theme-neutral-900 text-theme-neutral-300 border border-theme-border' 
                      : 'bg-theme-success/10 text-theme-success border border-theme-success/20'
                  }`}>
                    {lead.status?.toUpperCase() || "NEW"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <div className="p-8 text-center text-xs font-mono text-theme-neutral-300">[NO_CLIENT_INQUIRIES_IN_DATABASE]</div>
        )}
      </div>
    </div>
  );
}
