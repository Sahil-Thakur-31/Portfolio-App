import React from "react";
import Link from "next/link";
import { getAnalyticsSummary } from "@/server/db/analytics";

export const dynamic = "force-dynamic";

export default async function StatsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let stats = {
    totalPageViews: 0,
    totalProjectClicks: 0,
    totalResumeDownloads: 0,
    geographicDistribution: [] as { name: string; value: number }[],
  };

  try {
    stats = await getAnalyticsSummary({ username });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
  }

  // Find max value to render relative progress weights
  const maxHits = Math.max(...stats.geographicDistribution.map(item => item.value), 1);

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text flex flex-col items-center justify-start relative overflow-hidden font-sans">
      {/* Background neon glows */}
      <div className="absolute top-[10%] left-[10%] w-[35rem] h-[35rem] rounded-full bg-theme-accent-teal/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] rounded-full bg-theme-accent-purple/3 blur-[120px] pointer-events-none" />

      {/* Grid watermark background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />

      <div className="container mx-auto max-w-6xl px-6 py-24 relative z-10 w-full select-none">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between gap-4 mb-12 border-b border-theme-border pb-6">
          <div>
            <div className="inline-block text-[9px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-1 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-2.5 py-0.5 rounded">
              SYS_TELEMETRY // ACTIVE
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient">Public Analytics</h1>
            <p className="text-xs text-theme-neutral-300 font-mono mt-1 uppercase tracking-wider">Real-time network traffic indices and access nodes</p>
          </div>
          <Link
            href={`/${username}`}
            className="shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-theme-border bg-theme-neutral-900/60 hover:bg-theme-neutral-800/80 px-4 text-xs font-mono font-bold uppercase tracking-wider text-theme-neutral-300 gap-2 transition-all duration-300"
          >
            <span>← RETURN</span>
          </Link>
        </div>
               {/* Telemetry Layout Grid */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: KPI Cards (stacked vertically) */}
          <div className="md:col-span-3 flex flex-col gap-4">
            
            {/* Card 1 */}
            <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-5 shadow-xl group overflow-hidden hover:border-theme-accent-teal/30 transition-all duration-300">
              <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />
              <div className="flex justify-between items-start border-b border-theme-border pb-2 mb-3">
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-theme-neutral-300 group-hover:text-theme-accent-teal transition-colors font-bold">PAGE_VIEWS_RAW</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-teal animate-pulse" />
              </div>
              <p className="text-3xl font-black text-theme-text font-mono tracking-tight group-hover:text-theme-accent-teal transition-colors">{stats.totalPageViews}</p>
              <div className="mt-3 h-1 w-full bg-theme-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue w-[75%] opacity-60" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-5 shadow-xl group overflow-hidden hover:border-theme-accent-purple/30 transition-all duration-300">
              <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />
              <div className="flex justify-between items-start border-b border-theme-border pb-2 mb-3">
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-theme-neutral-300 group-hover:text-theme-accent-purple transition-colors font-bold">PROJECT_CLICKS</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-purple animate-pulse" />
              </div>
              <p className="text-3xl font-black text-theme-text font-mono tracking-tight group-hover:text-theme-accent-purple transition-colors">{stats.totalProjectClicks}</p>
              <div className="mt-3 h-1 w-full bg-theme-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-theme-accent-purple to-theme-accent-purple-light w-[50%] opacity-60" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border p-5 shadow-xl group overflow-hidden hover:border-theme-success/30 transition-all duration-300">
              <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />
              <div className="flex justify-between items-start border-b border-theme-border pb-2 mb-3">
                <h3 className="text-[10px] font-mono uppercase tracking-wider text-theme-neutral-300 group-hover:text-theme-success transition-colors font-bold">CV_DOWNLOADS</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
              </div>
              <p className="text-3xl font-black text-theme-text font-mono tracking-tight group-hover:text-theme-success transition-colors">{stats.totalResumeDownloads}</p>
              <div className="mt-3 h-1 w-full bg-theme-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-theme-success to-theme-accent-teal w-[60%] opacity-60" />
              </div>
            </div>

          </div>

          {/* Right Column: Node Traffic Geolocation Grid */}
          <div className="md:col-span-9 relative rounded-2xl border bg-theme-bg/60 border-theme-border p-6 shadow-xl w-full">
            <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />
            
            <div className="flex justify-between items-center border-b border-theme-border pb-4 mb-6">
              <h2 className="text-md font-bold uppercase font-mono tracking-widest text-theme-neutral-200">Traffic Geographical Node Distribution</h2>
              <span className="text-[8px] font-mono text-theme-neutral-300">SORT: DESC</span>
            </div>

            <div className="space-y-4">
              {stats.geographicDistribution.map((item, idx) => {
                const relativeWidth = `${(item.value / maxHits) * 100}%`;
                return (
                  <div key={idx} className="flex flex-col gap-2 py-3 border-b border-theme-border last:border-0">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-theme-neutral-300 tracking-wider uppercase">{item.name}</span>
                      <span className="font-bold text-theme-accent-teal">{item.value} HITS</span>
                    </div>
                    
                    {/* Dynamic diagnostic signal bar */}
                    <div className="h-2 w-full bg-theme-input-bg/90 rounded overflow-hidden border border-theme-border">
                      <div 
                        className="h-full bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue rounded transition-all duration-500 shadow-[0_0_10px_rgba(var(--theme-accent-teal-rgb),0.15)]"
                        style={{ width: relativeWidth }}
                      />
                    </div>
                  </div>
                );
              })}
              
              {stats.geographicDistribution.length === 0 && (
                <p className="text-xs font-mono text-theme-neutral-300 py-4 text-center">[NO_GEOGRAPHIC_EVENTS_LOGGED_YET]</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
