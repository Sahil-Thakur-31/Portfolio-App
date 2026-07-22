import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadInsert } from "@/lib/database.types";

export async function getLeads(options?: { ownerId?: string }) {
  const supabase = await createClient();
  let query = supabase.from("leads").select("*");

  if (options?.ownerId) {
    query = query.eq("owner_id", options.ownerId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return data as Lead[];
}

export async function createLead(lead: LeadInsert) {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("leads") as any)
    .insert(lead)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function updateLeadStatus(id: string, status: Lead["status"]) {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("leads") as any)
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function updateLeadTags(id: string, tags: string[]) {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("leads") as any)
    .update({ tags })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
