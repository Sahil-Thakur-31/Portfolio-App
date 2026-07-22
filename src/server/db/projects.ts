import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectInsert, ProjectUpdate } from "@/lib/database.types";

export async function getProjects(options?: { username?: string; userId?: string }) {
  const supabase = await createClient();
  let query = supabase.from("projects").select("*, profiles!inner(id, username)");

  if (options?.username) {
    query = query.eq("profiles.username", options.username);
  }
  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) throw error;
  return data as Project[];
}

export async function getFeaturedProjects(options?: { username?: string; userId?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*, profiles!inner(id, username)")
    .eq("is_published", true)
    .eq("is_featured", true);

  if (options?.username) {
    query = query.eq("profiles.username", options.username);
  }
  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }

  const { data, error } = await query.order("sort_order", { ascending: true });

  if (error) throw error;
  return data as Project[];
}

export async function getProjectBySlug(slug: string, options?: { username?: string }) {
  const supabase = await createClient();
  let query = supabase.from("projects").select("*, profiles!inner(id, username)").eq("slug", slug);

  if (options?.username) {
    query = query.eq("profiles.username", options.username);
  }

  const { data, error } = await query.single();

  if (error) throw error;
  return data as Project;
}

export async function createProject(project: ProjectInsert) {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("projects") as any)
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, project: ProjectUpdate) {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("projects") as any)
    .update(project)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await (supabase
    .from("projects") as any)
    .delete()
    .eq("id", id);

  if (error) throw error;
  return true;
}
