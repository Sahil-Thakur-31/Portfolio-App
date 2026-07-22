import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { GuestbookEntry, GuestbookEntryInsert } from "@/lib/database.types";

export async function getGuestbookEntries(options?: { username?: string; ownerId?: string; limit?: number; offset?: number }) {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  const supabase = await createClient();
  let query = supabase.from("guestbook_entries").select("*, profiles!inner(id, username)");

  if (options?.username) {
    query = query.eq("profiles.username", options.username);
  }
  if (options?.ownerId) {
    query = query.eq("owner_id", options.ownerId);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data as GuestbookEntry[];
}

export async function createGuestbookEntry(entry: GuestbookEntryInsert) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("guestbook_entries")
    .insert(entry as any)
    .select()
    .single();

  if (error) throw error;
  return data as GuestbookEntry;
}

export async function deleteGuestbookEntry(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("guestbook_entries")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
