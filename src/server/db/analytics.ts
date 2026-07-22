import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsEvent, AnalyticsEventInsert } from "@/lib/database.types";

export async function resolveOwnerIdFromUsername(username: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  return (data as any).id as string;
}

export async function trackEvent(event: AnalyticsEventInsert) {
  // Use the admin client since anyone can log events regardless of session/Auth state
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("analytics_events")
    .insert(event as any)
    .select()
    .single();

  if (error) throw error;
  return data as AnalyticsEvent;
}

export async function getAnalyticsSummary(options?: { ownerId?: string; username?: string }) {
  const supabase = createAdminClient();

  let ownerId = options?.ownerId;
  if (!ownerId && options?.username) {
    ownerId = (await resolveOwnerIdFromUsername(options.username)) || undefined;
  }

  // Basic aggregates
  let query = supabase.from("analytics_events").select("event_type, created_at, page, country");
  if (ownerId) {
    query = query.eq("owner_id", ownerId);
  }
  const { data: eventsData, error } = await query;

  if (error) throw error;

  const events = (eventsData || []) as any[];

  const totalPageViews = events.filter((e) => e.event_type === "page_view").length;
  const totalProjectClicks = events.filter((e) => e.event_type === "project_click").length;
  const totalResumeDownloads = events.filter((e) => e.event_type === "resume_download").length;

  // Group by country
  const countries: Record<string, number> = {};
  events.forEach((e) => {
    if (e.country) {
      countries[e.country] = (countries[e.country] || 0) + 1;
    }
  });

  return {
    totalPageViews,
    totalProjectClicks,
    totalResumeDownloads,
    geographicDistribution: Object.entries(countries).map(([name, value]) => ({ name, value })),
  };
}
