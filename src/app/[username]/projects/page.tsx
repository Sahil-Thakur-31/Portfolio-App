import React from "react";
import Link from "next/link";
import { getProjects } from "@/server/db/projects";
import { getMarkdownExcerpt } from "@/lib/markdown";
import type { Project } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  let projects: Project[] = [];
  try {
    projects = await getProjects({ username });
  } catch (error) {
    console.error("Failed to load projects:", error);
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight text-theme-accent-teal mb-8">Projects Showcase</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="group rounded-xl border border-theme-neutral-800 bg-theme-neutral-900/40 p-6 hover:border-theme-neutral-700 hover:bg-theme-neutral-900/60 transition-all">
            <h3 className="text-xl font-bold text-theme-text group-hover:text-theme-accent-teal transition-colors">
              {project.title}
            </h3>
            <p className="mt-2 text-theme-neutral-300 text-sm leading-relaxed line-clamp-3">
              {getMarkdownExcerpt(project.description, 180)}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="rounded bg-theme-neutral-800 px-2 py-0.5 text-xs text-theme-neutral-300 border border-theme-neutral-700">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-6 text-sm font-medium">
              <Link href={`/${username}/projects/${project.slug}`} className="text-theme-accent-purple hover:text-theme-accent-purple/70">
                Details →
              </Link>
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-theme-neutral-300 hover:text-theme-text">
                  Code →
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-theme-accent-teal hover:text-theme-accent-teal/70">
                  Live Demo →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
