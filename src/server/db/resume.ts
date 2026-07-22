import { createClient } from "@/lib/supabase/server";
import type { ResumeData, ResumeDataUpdate } from "@/lib/database.types";

export async function getResumeData(options?: { username?: string; userId?: string }) {
  const supabase = await createClient();
  let query = supabase.from("resume_data").select("*, profiles!inner(id, username)");

  if (options?.username) {
    query = query.eq("profiles.username", options.username);
  }
  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.limit(1).single();

  if (error) throw error;

  // Map avatar_url and is_open_to_opportunities from the contact JSON column if they exist there
  const resume = data as any;
  return {
    ...resume,
    avatar_url: resume.contact?.avatar_url || null,
    is_open_to_opportunities: resume.contact?.is_open_to_opportunities ?? true,
  } as ResumeData;
}

export async function updateResumeData(id: string, resumeData: ResumeDataUpdate) {
  const supabase = await createClient();

  // Map avatar_url and is_open_to_opportunities into the contact JSON column 
  // to avoid PostgreSQL column mismatch errors on columns that don't exist in the table.
  const { avatar_url, is_open_to_opportunities, ...rest } = resumeData as any;

  const updatedContact = {
    ...rest.contact,
    avatar_url: avatar_url || null,
    is_open_to_opportunities: is_open_to_opportunities ?? true,
  };

  const updatePayload = {
    ...rest,
    contact: updatedContact,
  };

  const { data, error } = await (supabase
    .from("resume_data") as any)
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  // Map fields back when returning database response
  const updatedResume = data as any;
  return {
    ...updatedResume,
    avatar_url: updatedResume.contact?.avatar_url || null,
    is_open_to_opportunities: updatedResume.contact?.is_open_to_opportunities ?? true,
  } as ResumeData;
}
