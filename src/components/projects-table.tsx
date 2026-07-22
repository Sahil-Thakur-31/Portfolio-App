"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { deleteProjectAction, toggleProjectFeaturedAction, reorderProjectsAction } from "@/server/actions/projects";
import type { Project } from "@/lib/database.types";
import { App, ConfigProvider, theme } from "antd";

function ProjectsTableInner({ initialProjects }: { initialProjects: Project[] }) {
  const { message: antdMessage } = App.useApp();
  const [projects, setProjects] = useState(initialProjects);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleToggleFeatured = async (project: Project) => {
    const nextValue = !project.is_featured;
    setTogglingId(project.id);
    setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_featured: nextValue } : p)));
    try {
      await toggleProjectFeaturedAction(project.id, nextValue);
    } catch (err: any) {
      antdMessage.error(err.message || "Failed to update featured status.");
      setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_featured: project.is_featured } : p)));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (confirmDeleteId === id) {
      handleConfirmedDelete(id);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId((current) => (current === id ? null : current)), 3000);
    }
  };

  const handleConfirmedDelete = async (id: string) => {
    setDeletingId(id);
    setConfirmDeleteId(null);
    try {
      await deleteProjectAction(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      antdMessage.error(err.message || "Failed to delete project.");
      setDeletingId(null);
    }
  };

  const persistOrder = async (reordered: Project[]) => {
    const previous = projects;
    setProjects(reordered);
    try {
      await reorderProjectsAction(reordered.map((p) => p.id));
    } catch (err: any) {
      antdMessage.error(err.message || "Failed to reorder projects.");
      setProjects(previous);
    }
  };

  const moveRow = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;
    const reordered = [...projects];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    persistOrder(reordered);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...projects];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setDraggedIndex(null);
    setDragOverIndex(null);
    persistOrder(reordered);
  };

  return (
    <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border shadow-xl overflow-hidden">
      <span className="absolute top-2 left-2 w-1.5 h-1.5 border-t border-l border-theme-border/20" />

      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-theme-border bg-theme-input-bg/80">
            <th className="p-4 w-12" />
            <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">TITLE</th>
            <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">SLUG_ID</th>
            <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">STATUS</th>
            <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold">FEATURED</th>
            <th className="p-4 text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 font-bold text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-theme-white/5">
          {projects.map((project, index) => (
            <tr
              key={project.id}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverIndex !== index) setDragOverIndex(index);
              }}
              onDragLeave={() => setDragOverIndex((current) => (current === index ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(index);
              }}
              onDragEnd={() => {
                setDraggedIndex(null);
                setDragOverIndex(null);
              }}
              className={`hover:bg-theme-card-bg/60 text-theme-neutral-300 transition-colors duration-200 ${draggedIndex === index ? 'opacity-40' : ''} ${dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-t-theme-accent-teal' : ''}`}
            >
              <td className="p-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="cursor-grab active:cursor-grabbing text-theme-neutral-300 select-none"
                    title="Drag to reorder"
                  >
                    ⠿
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveRow(index, "up")}
                      disabled={index === 0}
                      title="Move up"
                      className="w-4 h-3.5 flex items-center justify-center text-[8px] text-theme-neutral-300 hover:text-theme-accent-teal disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveRow(index, "down")}
                      disabled={index === projects.length - 1}
                      title="Move down"
                      className="w-4 h-3.5 flex items-center justify-center text-[8px] text-theme-neutral-300 hover:text-theme-accent-teal disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </td>
              <td className="p-4 font-bold text-theme-neutral-200 text-sm">{project.title}</td>
              <td className="p-4 text-theme-neutral-300 font-mono text-[13px]">{project.slug}</td>
              <td className="p-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${project.is_published ? 'bg-theme-success/10 text-theme-success border border-theme-success/20' : 'bg-theme-warning/10 text-theme-warning border border-theme-warning/20'}`}>
                  {project.is_published ? "PUBLISHED" : "DRAFT"}
                </span>
              </td>
              <td className="p-4">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(project)}
                  disabled={togglingId === project.id}
                  title="Click to toggle featured status"
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-wait ${project.is_featured ? 'bg-theme-accent-teal/10 text-theme-accent-teal border border-theme-accent-teal/20' : 'bg-theme-neutral-900 text-theme-neutral-300 border border-theme-border'}`}
                >
                  {project.is_featured ? "FEATURED" : "STANDARD"}
                </button>
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/admin/projects/${project.id}/edit`} className="text-[13px] font-mono font-bold uppercase tracking-widest text-theme-accent-teal hover:text-theme-accent-blue transition-colors">
                    EDIT →
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(project.id)}
                    disabled={deletingId === project.id}
                    className={`text-[13px] font-mono font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 ${confirmDeleteId === project.id ? 'text-theme-error' : 'text-theme-neutral-300 hover:text-theme-error'}`}
                  >
                    {deletingId === project.id ? "DELETING..." : confirmDeleteId === project.id ? "CONFIRM?" : "DELETE"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {projects.length === 0 && (
        <div className="p-8 text-center text-xs font-mono text-theme-neutral-300">[NO_PROJECT_ENTRIES_IN_DATABASE]</div>
      )}
    </div>
  );
}

export function ProjectsTable(props: { initialProjects: Project[] }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "var(--theme-accent-teal)",
          colorBgContainer: "var(--theme-input-bg)",
          colorBorder: "var(--theme-border)",
          borderRadius: 12,
          colorText: "var(--theme-text)",
          fontFamily: "monospace",
        },
      }}
    >
      <App>
        <ProjectsTableInner {...props} />
      </App>
    </ConfigProvider>
  );
}
