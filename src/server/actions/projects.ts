"use server";

import { createProject, updateProject, deleteProject, getProjects } from "@/server/db/projects";
import { projectSchema } from "@/lib/validators";
import { fetchGithubRepos } from "@/server/integrations/github";
import { createClient } from "@/lib/supabase/server";
import { getGithubUsername } from "@/lib/utils";
import { revalidatePath } from "next/cache";

async function requireUserId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  return user.id;
}

export async function createProjectAction(formData: any) {
  const userId = await requireUserId();
  const validated = projectSchema.parse(formData);
  const existingProjects = await getProjects({ userId });
  const nextSortOrder = existingProjects.reduce((max, p) => Math.max(max, p.sort_order), 0) + 1;
  const data = await createProject({
    user_id: userId,
    title: validated.title,
    slug: validated.slug,
    description: validated.description || null,
    tags: validated.tags,
    image_url: validated.image_url || null,
    live_url: validated.live_url || null,
    github_url: validated.github_url || null,
    is_featured: validated.is_featured,
    is_published: validated.is_published,
    sort_order: nextSortOrder,
  });
  revalidatePath("/admin/projects");
  return data;
}

export async function updateProjectAction(id: string, formData: any) {
  const validated = projectSchema.parse(formData);
  const data = await updateProject(id, {
    title: validated.title,
    slug: validated.slug,
    description: validated.description || null,
    tags: validated.tags,
    image_url: validated.image_url || null,
    live_url: validated.live_url || null,
    github_url: validated.github_url || null,
    is_featured: validated.is_featured,
    is_published: validated.is_published,
  });
  revalidatePath("/admin/projects");
  return data;
}

export async function reorderProjectsAction(orderedIds: string[]) {
  await Promise.all(orderedIds.map((id, index) => updateProject(id, { sort_order: index })));
  revalidatePath("/admin/projects");
}

export async function deleteProjectAction(id: string) {
  await deleteProject(id);
  revalidatePath("/admin/projects");
}

export async function toggleProjectFeaturedAction(id: string, isFeatured: boolean) {
  const data = await updateProject(id, { is_featured: isFeatured });
  revalidatePath("/admin/projects");
  return data;
}

export async function syncGithubProjectsAction(username: string) {
  // If the admin is signed in via GitHub OAuth, always sync THEIR repos —
  // the authenticated identity overrides whatever was typed into the form,
  // so this can't be pointed at someone else's account.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const authenticatedUsername = getGithubUsername(user);

  const trimmed = (authenticatedUsername || username)
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\/$/, "");
  if (!trimmed) throw new Error("GitHub username is required");

  const [repos, existingProjects] = await Promise.all([
    fetchGithubRepos(trimmed),
    getProjects({ userId: user.id }),
  ]);

  const existingByGithubUrl = new Map(
    existingProjects
      .filter((p) => p.github_url)
      .map((p) => [p.github_url!.toLowerCase().replace(/\/$/, ""), p.id])
  );
  const existingSlugs = new Set(existingProjects.map((p) => p.slug));
  let nextSortOrder = existingProjects.reduce((max, p) => Math.max(max, p.sort_order), 0) + 1;

  let created = 0;
  let updated = 0;

  const sanitize = (str: string | null | undefined) => str ? str.replace(new RegExp("\u0000", "g"), "") : (str ?? null);

  for (const repo of repos) {
    const existingId = existingByGithubUrl.get(repo.github_url.toLowerCase().replace(/\/$/, ""));

    if (existingId) {
      // Already imported — refresh only the GitHub-sourced fields (README-based
      // description, tags, live demo link). Title, slug, featured/published
      // state, sort order, and image are hand-curated and never touched here.
      await updateProject(existingId, {
        description: sanitize(repo.description),
        tags: repo.tags,
        live_url: repo.live_url,
      });
      updated += 1;
      continue;
    }

    let slug = repo.slug;
    if (existingSlugs.has(slug)) {
      const suffix = repo.github_url.split("/").filter(Boolean).slice(-2, -1)[0] || "repo";
      slug = `${slug}-${suffix.toLowerCase()}`;
    }
    existingSlugs.add(slug);

    await createProject({
      user_id: user.id,
      title: sanitize(repo.title) as string,
      slug,
      description: sanitize(repo.description),
      tags: repo.tags,
      image_url: null,
      live_url: repo.live_url,
      github_url: repo.github_url,
      is_featured: false,
      is_published: false,
      sort_order: nextSortOrder,
    });
    nextSortOrder += 1;
    created += 1;
  }

  revalidatePath("/admin/projects");

  return { created, updated, total: repos.length };
}
