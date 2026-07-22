import React from "react";
import Link from "next/link";
import { getProjectBySlug } from "@/server/db/projects";
import { renderMarkdown } from "@/lib/markdown";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ProjectPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { username, slug } = await params;
  let project = null;

  try {
    project = await getProjectBySlug(slug, { username });
  } catch (error) {
    notFound();
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <Link href={`/${username}#projects`} className="text-sm font-medium text-theme-accent-teal hover:underline mb-8 inline-block">
        ← Back to Projects
      </Link>
      <h1 className="text-4xl font-extrabold tracking-tight text-theme-text mb-2">{project.title}</h1>
      <div className="flex flex-wrap gap-2 mb-8">
        {project.tags.map((tag, idx) => (
          <span key={idx} className="rounded bg-theme-neutral-800 px-2.5 py-0.5 text-xs text-theme-neutral-300 border border-theme-neutral-700">
            {tag}
          </span>
        ))}
      </div>
      {project.description && (
        <div className="text-base leading-relaxed mb-8">
          {renderMarkdown(project.description)}
        </div>
      )}

      <div className="flex gap-4 border-t border-theme-neutral-800 pt-8 mt-12">
        {project.github_url && (
          <a
            href={project.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-theme-neutral-700 bg-theme-neutral-900 px-6 font-medium hover:bg-theme-neutral-800 transition-colors text-theme-neutral-200"
          >
            GitHub Repository
          </a>
        )}
        {project.live_url && (
          <a
            href={project.live_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-theme-accent-teal px-6 font-medium text-theme-bg hover:bg-theme-accent-teal/90 transition-colors"
          >
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
}
