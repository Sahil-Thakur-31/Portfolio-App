"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectFormValues } from "@/lib/validators";
import { createProjectAction, updateProjectAction } from "@/server/actions/projects";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { App, ConfigProvider, theme } from "antd";

function ProjectFormInner({ initialData, id }: { initialData?: any; id?: string }) {
  const { message: antdMessage } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as any,
    defaultValues: initialData || {
      title: "",
      slug: "",
      description: "",
      tags: [],
      image_url: "",
      live_url: "",
      github_url: "",
      is_featured: false,
      is_published: true,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be signed in to upload an image.");
      }
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("project-images")
        .getPublicUrl(filePath);

      setValue("image_url", publicUrl);
    } catch (err: any) {
      antdMessage.error("Failed to upload image: " + (err.message || err));
    } finally {
      setIsUploading(false);
    }
  };

  const [tagsText, setTagsText] = useState(initialData?.tags?.join(", ") || "");

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      setError(null);
      
      // Parse tags comma-separated values to array string format
      data.tags = tagsText.split(",").map((t: string) => t.trim()).filter(Boolean);

      if (id) {
        await updateProjectAction(id, data);
      } else {
        await createProjectAction(data);
      }
      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  // Shared input styling (Linked to CSS variables inside globals.css)
  const inputClass = "w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_var(--theme-accent-teal-hover)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono";
  const labelClass = "block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5 font-bold";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto rounded-2xl border border-theme-border bg-theme-bg/90 p-8 shadow-2xl relative">
      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-theme-accent-teal/45" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-theme-accent-purple/45" />

      {error && (
        <div className="rounded-xl border border-theme-error/30 bg-theme-error/10 p-4 text-[10px] font-mono text-theme-error">
          [SAVE_FAILED] {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelClass}>PROJECT_TITLE</label>
        <input
          type="text"
          {...register("title")}
          placeholder="e.g. AI Sales Platform"
          className={inputClass}
        />
        {errors.title && <p className="mt-1 text-[10px] font-mono text-theme-error">{errors.title.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label className={labelClass}>SLUG_URL_SEGMENT</label>
        <input
          type="text"
          {...register("slug")}
          placeholder="ai-sales-crm"
          className={inputClass}
        />
        {errors.slug && <p className="mt-1 text-[10px] font-mono text-theme-error">{errors.slug.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>PROJECT_DESCRIPTION (MARKDOWN)</label>
        <textarea
          {...register("description")}
          placeholder={"# Features\n- Real-time DB...\n\nSupports **markdown** — headers, bold text, and lists."}
          className="w-full min-h-[200px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_var(--theme-accent-teal-hover)] p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
        />
        <p className="mt-1 text-[10px] font-mono text-theme-neutral-300">Used for both the card preview (auto-shortened) and the full project page. Syncing from GitHub fills this from the repo's README.</p>
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>TAGS_ARRAY (COMMA_SEPARATED)</label>
        <input
          type="text"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="React, Next.js, Node.js..."
          className={inputClass}
        />
      </div>

      {/* URLs */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass}>LIVE_DEMO_URL</label>
          <input
            type="text"
            {...register("live_url")}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>GITHUB_REPO_URL</label>
          <input
            type="text"
            {...register("github_url")}
            placeholder="https://github.com..."
            className={inputClass}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className={labelClass}>PROJECT_IMAGE</label>
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center rounded-xl border border-theme-border bg-theme-input-bg/60 p-4">
          {watch("image_url") && (
            <div className="w-16 h-16 rounded-lg border border-theme-border overflow-hidden shrink-0 bg-theme-bg flex items-center justify-center">
              <img src={watch("image_url")!} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
                id="project-image-file"
              />
              <label
                htmlFor="project-image-file"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-theme-accent-teal/10 border border-theme-accent-teal/20 hover:bg-theme-accent-teal/20 text-[10px] font-mono uppercase tracking-widest text-theme-accent-teal cursor-pointer transition-colors px-4"
              >
                {isUploading ? "UPLOADING..." : "SELECT_FILE"}
              </label>
              {isUploading && (
                <span className="text-[9px] text-theme-neutral-300 animate-pulse font-mono">STORING_TO_SUPABASE...</span>
              )}
            </div>
            <input
              type="text"
              {...register("image_url")}
              placeholder="Or paste direct image URL..."
              className="w-full h-9 rounded-lg border border-theme-border bg-theme-bg/80 px-3 text-[10px] text-theme-text placeholder-theme-text-muted focus:border-theme-accent-teal/40 focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* Flags */}
      <div className="flex gap-8 items-center pt-2 border-t border-theme-border">
        <label className="flex items-center gap-3 text-theme-neutral-300 text-xs font-mono cursor-pointer select-none uppercase tracking-wider">
          <input type="checkbox" {...register("is_featured")} className="h-4 w-4 rounded border-theme-border/20 bg-theme-input-bg accent-theme-accent-teal" />
          IS_FEATURED
        </label>
        <label className="flex items-center gap-3 text-theme-neutral-300 text-xs font-mono cursor-pointer select-none uppercase tracking-wider">
          <input type="checkbox" {...register("is_published")} className="h-4 w-4 rounded border-theme-border/20 bg-theme-input-bg accent-theme-success" />
          IS_PUBLISHED
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue hover:opacity-90 px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_var(--theme-accent-teal-hover)] hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? "SAVING_PROJECT_DATA..." : "[ COMMIT_PROJECT_CONFIG ]"}
      </button>
    </form>
  );
}

export function ProjectForm(props: { initialData?: any; id?: string }) {
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
        <ProjectFormInner {...props} />
      </App>
    </ConfigProvider>
  );
}
