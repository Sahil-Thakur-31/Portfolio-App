"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeDataSchema, type ResumeDataFormValues } from "@/lib/validators";
import { updateResumeDataAction } from "@/server/actions/resume";
import { useRouter } from "next/navigation";
import { ConfigProvider, DatePicker, theme, Popconfirm, App } from "antd";
import dayjs from "dayjs";
import { useGithubIdentity } from "@/hooks/use-github-identity";
import { DEMO_AVATAR_URL } from "@/lib/demo-resume";

// Converts "2025-06" to "Jun 2025"
function formatMonthLabel(monthStr: string): string {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

// Shared styling constants (Linked to CSS variables inside globals.css)
const inputClass = "w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_var(--theme-accent-teal-hover)] px-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono";
const labelClass = "block text-[9px] font-mono uppercase tracking-widest text-theme-neutral-300 mb-1.5 font-bold";

function ResumeEditorFormInner({ initialDataJson }: { initialDataJson: string }) {
  const initialData = JSON.parse(initialDataJson);
  const { message: antdMessage } = App.useApp();
  const [activeTab, setActiveTab] = useState("profile"); // profile, skills, experience, education, about
  const [expSubTab, setExpSubTab] = useState("jobs"); // jobs, internships
  const router = useRouter();
  const { username: githubUsername, loading: githubLoading, linking: githubLinking, error: githubLinkError, linkGithub } = useGithubIdentity();
  const authenticatedGithubUrl = githubUsername ? `https://github.com/${githubUsername}` : null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { isSubmitting },
  } = useForm<ResumeDataFormValues>({
    resolver: zodResolver(resumeDataSchema) as any,
    defaultValues: initialData,
  });

  useEffect(() => {
    if (authenticatedGithubUrl) {
      setValue("contact.github", authenticatedGithubUrl);
    }
  }, [authenticatedGithubUrl, setValue]);

  const { fields: expFields, append: appendExp, remove: removeExp, move: moveExp } = useFieldArray({
    control,
    name: "experience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu, move: moveEdu } = useFieldArray({
    control,
    name: "education",
  });

  const [languagesText, setLanguagesText] = useState(initialData?.skills?.languages?.join(", ") || "");
  const [frameworksText, setFrameworksText] = useState(initialData?.skills?.frameworks?.join(", ") || "");
  const [toolsText, setToolsText] = useState(initialData?.skills?.tools?.join(", ") || "");
  const [focusAreasText, setFocusAreasText] = useState(initialData?.about?.focus_areas?.join(", ") || "");
  const [uploading, setUploading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState(initialData?.avatar_url || DEMO_AVATAR_URL);

  // Reordering functions
  const moveExperience = (currentIndex: number, direction: "up" | "down") => {
    const isIntern = watch(`experience.${currentIndex}.title`)?.toLowerCase().includes("intern");
    const matchingIndices = expFields
      .map((_, idx) => idx)
      .filter(idx => {
        const title = watch(`experience.${idx}.title`) || "";
        const itemIsIntern = title.toLowerCase().includes("intern");
        return itemIsIntern === isIntern;
      });

    const position = matchingIndices.indexOf(currentIndex);
    if (direction === "up" && position > 0) {
      moveExp(currentIndex, matchingIndices[position - 1]);
    } else if (direction === "down" && position < matchingIndices.length - 1) {
      moveExp(currentIndex, matchingIndices[position + 1]);
    }
  };

  const isFirstExperience = (currentIndex: number) => {
    const isIntern = watch(`experience.${currentIndex}.title`)?.toLowerCase().includes("intern");
    const firstMatch = expFields.findIndex(f => {
      const title = f.title || "";
      return title.toLowerCase().includes("intern") === isIntern;
    });
    return firstMatch === currentIndex;
  };

  const isLastExperience = (currentIndex: number) => {
    const isIntern = watch(`experience.${currentIndex}.title`)?.toLowerCase().includes("intern");
    let lastMatch = -1;
    for (let i = expFields.length - 1; i >= 0; i--) {
      const title = expFields[i].title || "";
      if (title.toLowerCase().includes("intern") === isIntern) {
        lastMatch = i;
        break;
      }
    }
    return lastMatch === currentIndex;
  };

  // Drag-and-drop reordering (alongside the up/down arrows above)
  const [draggedExpIndex, setDraggedExpIndex] = useState<number | null>(null);
  const [dragOverExpIndex, setDragOverExpIndex] = useState<number | null>(null);
  const [draggedEduIndex, setDraggedEduIndex] = useState<number | null>(null);
  const [dragOverEduIndex, setDragOverEduIndex] = useState<number | null>(null);

  const handleExpDrop = (targetIndex: number) => {
    if (draggedExpIndex !== null && draggedExpIndex !== targetIndex) {
      moveExp(draggedExpIndex, targetIndex);
    }
    setDraggedExpIndex(null);
    setDragOverExpIndex(null);
  };

  const handleEduDrop = (targetIndex: number) => {
    if (draggedEduIndex !== null && draggedEduIndex !== targetIndex) {
      moveEdu(draggedEduIndex, targetIndex);
    }
    setDraggedEduIndex(null);
    setDragOverEduIndex(null);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      antdMessage.error("File size must be under 3MB.");
      return;
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png" && file.type !== "image/jpg") {
      antdMessage.error("Only JPG, JPEG, and PNG formats are allowed.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { uploadAvatarAction } = await import("@/server/actions/resume");
      const uploadedUrl = await uploadAvatarAction(formData);

      setCurrentAvatarUrl(uploadedUrl);
      setValue("avatar_url", uploadedUrl);
      setUploading(false);
      antdMessage.success("Avatar uploaded successfully!");
    } catch (err: any) {
      antdMessage.error(err.message || "Failed to upload avatar image.");
      setUploading(false);
    }
  };

  const onSubmit = async (data: ResumeDataFormValues) => {
    try {
      const cleanData = {
        full_name: data.full_name,
        avatar_url: currentAvatarUrl,
        is_open_to_opportunities: data.is_open_to_opportunities,
        summary: data.summary,
        experience: (data.experience || []).map(exp => {
          const startLabel = exp.start_date ? formatMonthLabel(exp.start_date) : "";
          const endLabel = exp.is_current ? "Present" : (exp.end_date ? formatMonthLabel(exp.end_date) : "");
          const period = startLabel && endLabel ? `${startLabel} - ${endLabel}` : exp.period || "";
          return {
            company: exp.company,
            title: exp.title,
            period,
            start_date: exp.start_date || "",
            end_date: exp.is_current ? "" : (exp.end_date || ""),
            is_current: exp.is_current || false,
            location: exp.location || "",
            bullets: exp.bullets || []
          };
        }),
        education: (data.education || []).map(edu => {
          const startLabel = edu.start_date ? formatMonthLabel(edu.start_date) : "";
          const endLabel = edu.is_current ? "Present" : (edu.end_date ? formatMonthLabel(edu.end_date) : "");
          const period = startLabel && endLabel ? `${startLabel} - ${endLabel}` : edu.period || "";
          return {
            institution: edu.institution,
            degree: edu.degree,
            period,
            start_date: edu.start_date || "",
            end_date: edu.is_current ? "" : (edu.end_date || ""),
            is_current: edu.is_current || false,
            gpa: edu.gpa || "",
            level: edu.level || "graduation",
            short_form: edu.short_form || ""
          };
        }),
        skills: {
          languages: languagesText.split(",").map((s: string) => s.trim()).filter(Boolean),
          frameworks: frameworksText.split(",").map((s: string) => s.trim()).filter(Boolean),
          tools: toolsText.split(",").map((s: string) => s.trim()).filter(Boolean),
        },
        certifications: data.certifications || [],
        contact: {
          email: data.contact?.email || "",
          phone: data.contact?.phone || "",
          location: data.contact?.location || "",
          github: data.contact?.github || "",
          linkedin: data.contact?.linkedin || "",
          portfolio: data.contact?.portfolio || ""
        },
        about: {
          headline: data.about?.headline || "",
          intro: data.about?.intro || "",
          who_i_am_text: data.about?.who_i_am_text || "",
          philosophy_text: data.about?.philosophy_text || "",
          focus_areas: focusAreasText.split(",").map((s: string) => s.trim()).filter(Boolean),
        }
      };

      const res = await updateResumeDataAction(initialData.id, JSON.stringify(cleanData));
      if (res.error) {
        antdMessage.error(`[UPDATE_FAILED] ${res.error}`);
      } else {
        antdMessage.success("[UPDATE_SUCCESS] Resume database updated!");
        router.refresh();
      }
    } catch (err: any) {
      antdMessage.error(err.message || "Failed to update resume.");
    }
  };

  const renderDateField = (
    fieldName: "start_date" | "end_date",
    index: number,
    type: "experience" | "education",
    disabled = false
  ) => {
    const value = watch(`${type}.${index}.${fieldName}`) || "";
    const dateValue = value ? dayjs(value, "YYYY-MM") : null;
    const isTeal = type === "experience";

    return (
      <div className="w-full">
        <div className={`relative flex items-center w-full h-11 bg-theme-input-bg border border-theme-border rounded-xl overflow-hidden focus-within:border-theme-accent-${isTeal ? "teal" : "purple"}/40 focus-within:shadow-[0_0_15px_var(--theme-accent-${isTeal ? "teal" : "purple"}-hover)] transition-all duration-300`}>
          <div className="flex-1">
            <DatePicker
              picker="month"
              value={dateValue}
              disabled={disabled}
              variant="borderless"
              onChange={(date) => {
                const formatted = date ? date.format("YYYY-MM") : "";
                setValue(`${type}.${index}.${fieldName}`, formatted);
              }}
              className="w-full"
              style={{
                width: "100%",
                height: "42px",
                background: "transparent",
                color: "var(--theme-text)",
                fontFamily: "monospace"
              }}
            />
          </div>
          {fieldName === "end_date" && (
            <>
              <div className="w-[1px] h-6 bg-theme-white/10 shrink-0" />
              <div className="px-3 flex items-center gap-1.5 shrink-0 bg-theme-input-bg/95 h-full select-none border-l border-theme-border">
                <input
                  type="checkbox"
                  {...register(`${type}.${index}.is_current`)}
                  className={`accent-theme-accent-${isTeal ? "teal" : "purple"} w-3.5 h-3.5 rounded cursor-pointer`}
                />
                <span className={`text-[8px] font-mono font-bold uppercase tracking-wider text-theme-accent-${isTeal ? "teal" : "purple"}`}>
                  {isTeal ? "Current" : "Ongoing"}
                </span>
              </div>
            </>
          )}
        </div>
        <input type="hidden" {...register(`${type}.${index}.${fieldName}`)} />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-6xl mx-auto rounded-2xl border border-theme-border bg-theme-bg/90 p-8 shadow-2xl relative">
      <span className="absolute top-2 left-2 w-2 h-2 border-t border-l border-theme-accent-teal/45" />
      <span className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-theme-accent-purple/45" />

      {/* Tab Selector Bar */}
      <div className="flex flex-wrap border-b border-theme-border pb-2 mb-6 gap-2 select-none">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer ${activeTab === "profile"
              ? "bg-theme-accent-teal/10 border-theme-accent-teal/30 text-theme-accent-teal shadow-[0_0_15px_var(--theme-accent-teal-hover)]"
              : "border-transparent text-theme-neutral-300 hover:text-theme-text"
            }`}
        >
          // 01. PROFILE_CONTACT
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer ${activeTab === "skills"
              ? "bg-theme-accent-purple/10 border-theme-accent-purple/30 text-theme-accent-purple shadow-[0_0_15px_var(--theme-accent-purple-hover)]"
              : "border-transparent text-theme-neutral-300 hover:text-theme-text"
            }`}
        >
          // 02. SKILLS
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer ${activeTab === "experience"
              ? "bg-theme-accent-teal/10 border-theme-accent-teal/30 text-theme-accent-teal shadow-[0_0_15px_var(--theme-accent-teal-hover)]"
              : "border-transparent text-theme-neutral-300 hover:text-theme-text"
            }`}
        >
          // 03. EXPERIENCE
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer ${activeTab === "education"
              ? "bg-theme-accent-purple/10 border-theme-accent-purple/30 text-theme-accent-purple shadow-[0_0_15px_var(--theme-accent-purple-hover)]"
              : "border-transparent text-theme-neutral-300 hover:text-theme-text"
            }`}
        >
          // 04. EDUCATION
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("about")}
          className={`px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 cursor-pointer ${activeTab === "about"
              ? "bg-theme-accent-teal/10 border-theme-accent-teal/30 text-theme-accent-teal shadow-[0_0_15px_var(--theme-accent-teal-hover)]"
              : "border-transparent text-theme-neutral-300 hover:text-theme-text"
            }`}
        >
          // 05. ABOUT_SECTION
        </button>
      </div>

      {/* Tab Contents: Profile Info & Contact Channels */}
      <div className={activeTab === "profile" ? "grid md:grid-cols-2 gap-8 animate-fade-in" : "hidden"}>

        {/* Profile details */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-theme-border pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-theme-accent-teal">Profile Details</h2>
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-teal animate-pulse" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>FULL_NAME</label>
              <input
                type="text"
                {...register("full_name")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>LOCATION</label>
              <input
                type="text"
                {...register("contact.location")}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 items-end">
            <div>
              <label className={labelClass}>
                AVATAR_PHOTO (JPG/PNG, MAX_3MB)
              </label>
              <div className="flex items-center gap-4">
                {currentAvatarUrl && (
                  <div className="relative shrink-0 w-15 h-15 rounded-xl overflow-hidden border border-theme-border bg-theme-input-bg">
                    <img src={currentAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="w-full text-xs text-transparent file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-mono file:font-bold file:uppercase file:tracking-widest file:bg-theme-accent-teal/10 file:text-theme-accent-teal hover:file:bg-theme-accent-teal/20 file:cursor-pointer file:border file:border-theme-accent-teal/20"
                  />
                  {uploading && <span className="text-[10px] text-theme-accent-teal animate-pulse font-mono">UPLOADING...</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center pb-3">
              <label className="flex items-center gap-3 text-theme-neutral-300 text-xs font-mono cursor-pointer select-none uppercase tracking-wider">
                <input type="checkbox" {...register("is_open_to_opportunities")} className="h-4 w-4 rounded border-theme-border bg-theme-input-bg accent-theme-accent-teal" />
                OPEN_TO_OPPORTUNITIES
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>PROFESSIONAL_SUMMARY</label>
            <textarea
              {...register("summary")}
              className="w-full min-h-[175px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_var(--theme-accent-teal-hover)] p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-theme-border pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-theme-accent-purple">Contact & Social Channels</h2>
            <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-purple animate-pulse" />
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>EMAIL_ADDRESS</label>
              <input type="email" {...register("contact.email")} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>PHONE_NUMBER</label>
              <input type="text" {...register("contact.phone")} className={inputClass} />
              <p className="mt-1 text-[10px] font-mono text-theme-neutral-300">WhatsApp chat link is generated automatically from this number.</p>
            </div>
            <div>
              <label className={labelClass}>GITHUB_PROFILE_LINK</label>
              {authenticatedGithubUrl ? (
                <>
                  <input type="hidden" {...register("contact.github")} />
                  <div className={`${inputClass} flex items-center text-theme-accent-purple`}>{authenticatedGithubUrl}</div>
                  <p className="mt-1 text-[10px] font-mono text-theme-neutral-300">Locked to your GitHub sign-in identity.</p>
                </>
              ) : (
                <>
                  <input type="hidden" {...register("contact.github")} />
                  <button
                    type="button"
                    onClick={linkGithub}
                    disabled={githubLoading || githubLinking}
                    className="w-full h-11 rounded-xl border border-theme-border bg-theme-input-bg/85 hover:border-theme-accent-purple/40 px-4 text-sm text-theme-neutral-300 hover:text-theme-accent-purple transition-all duration-300 font-mono text-left cursor-pointer disabled:opacity-50"
                  >
                    {githubLinking ? "REDIRECTING..." : "+ LINK_GITHUB_ACCOUNT"}
                  </button>
                  {githubLinkError && (
                    <p className="mt-1 text-[10px] font-mono text-theme-error">{githubLinkError}</p>
                  )}
                </>
              )}
            </div>
            <div>
              <label className={labelClass}>LINKEDIN_PROFILE_LINK</label>
              <input type="text" {...register("contact.linkedin")} className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Contents: Skills Inventory */}
      <div className={activeTab === "skills" ? "space-y-6 animate-fade-in" : "hidden"}>
        <div className="flex justify-between items-center border-b border-theme-border pb-3">
          <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-theme-text">Skills Inventory</h2>
          <span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>PROGRAMMING_LANGUAGES (COMMA_SEPARATED)</label>
            <textarea
              value={languagesText}
              onChange={(e) => setLanguagesText(e.target.value)}
              placeholder="JavaScript, TypeScript, Python..."
              className="w-full min-h-[150px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
            />
          </div>
          <div>
            <label className={labelClass}>FRAMEWORKS_LIBRARIES (COMMA_SEPARATED)</label>
            <textarea
              value={frameworksText}
              onChange={(e) => setFrameworksText(e.target.value)}
              placeholder="React, Next.js, Node.js..."
              className="w-full min-h-[150px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
            />
          </div>
          <div>
            <label className={labelClass}>DEVELOPER_TOOLS_DBS (COMMA_SEPARATED)</label>
            <textarea
              value={toolsText}
              onChange={(e) => setToolsText(e.target.value)}
              placeholder="PostgreSQL, MongoDB, Git, Docker..."
              className="w-full min-h-[150px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Tab Contents: Experience */}
      <div className={activeTab === "experience" ? "space-y-8 animate-fade-in" : "hidden"}>

        {/* Experience Sub-Tabs */}
        <div className="flex gap-4 border-b border-theme-border pb-2 mb-4 select-none">
          <button
            type="button"
            onClick={() => setExpSubTab("jobs")}
            className={`text-[10px] font-mono font-bold uppercase tracking-wider pb-1.5 border-b-2 transition-all duration-300 cursor-pointer ${expSubTab === "jobs"
                ? "border-theme-accent-teal text-theme-accent-teal"
                : "border-transparent text-theme-neutral-300 hover:text-theme-text"
              }`}
          >
            // JOB_POSITIONS
          </button>
          <button
            type="button"
            onClick={() => setExpSubTab("internships")}
            className={`text-[10px] font-mono font-bold uppercase tracking-wider pb-1.5 border-b-2 transition-all duration-300 cursor-pointer ${expSubTab === "internships"
                ? "border-theme-accent-purple text-theme-accent-purple"
                : "border-transparent text-theme-neutral-300 hover:text-theme-text"
              }`}
          >
            // INTERNSHIPS
          </button>
        </div>

        {/* Job Positions Section */}
        <div className={expSubTab === "jobs" ? "space-y-6 animate-fade-in" : "hidden"}>
          <div className="flex items-center justify-between border-b border-theme-border pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-theme-accent-teal">Job Positions</h2>
            <button
              type="button"
              onClick={() => appendExp({ company: "", title: "Software Engineer", start_date: "", end_date: "", is_current: false, period: "", location: "", bullets: [""] })}
              className="rounded-xl border border-theme-accent-teal/20 bg-theme-accent-teal/10 hover:bg-theme-accent-teal/20 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-theme-accent-teal transition-all cursor-pointer"
            >
              + ADD_JOB
            </button>
          </div>

          <div className="space-y-6">
            {expFields.map((field, index) => {
              const title = watch(`experience.${index}.title`) || "";
              if (title.toLowerCase().includes("intern")) return null;
              return (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => setDraggedExpIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverExpIndex !== index) setDragOverExpIndex(index);
                  }}
                  onDragLeave={() => setDragOverExpIndex((current) => (current === index ? null : current))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleExpDrop(index);
                  }}
                  onDragEnd={() => {
                    setDraggedExpIndex(null);
                    setDragOverExpIndex(null);
                  }}
                  className={`p-6 rounded-2xl border border-theme-border bg-theme-input-bg/60 relative hover:border-theme-accent-teal/20 transition-all duration-300 ${draggedExpIndex === index ? 'opacity-40' : ''} ${dragOverExpIndex === index && draggedExpIndex !== index ? 'border-theme-accent-teal/60' : ''}`}
                >
                  <span className="absolute top-2 left-2 w-1 h-1 border-t border-l border-theme-border/20" />

                  <div className="flex justify-between items-center border-b border-theme-border pb-3 mb-4">
                    <span className="text-[9px] font-mono font-bold text-theme-neutral-300 uppercase tracking-widest font-sans flex items-center gap-2">
                      <span className="cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">⠿</span>
                      JOB_#{index + 1}
                    </span>
                    <div className="flex items-center gap-4">
                      {/* Move Up/Down Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isFirstExperience(index)}
                          onClick={() => moveExperience(index, "up")}
                          className="w-6 h-6 rounded border border-theme-border hover:border-theme-accent-teal/30 hover:bg-theme-accent-teal/10 text-xs font-mono font-bold text-theme-neutral-300 hover:text-theme-accent-teal disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={isLastExperience(index)}
                          onClick={() => moveExperience(index, "down")}
                          className="w-6 h-6 rounded border border-theme-border hover:border-theme-accent-teal/30 hover:bg-theme-accent-teal/10 text-xs font-mono font-bold text-theme-neutral-300 hover:text-theme-accent-teal disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                      <Popconfirm
                        title="Delete record?"
                        description="Are you sure you want to remove this job position?"
                        onConfirm={() => removeExp(index)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          type="button"
                          className="text-[9px] font-mono text-theme-error hover:text-theme-error/70 font-bold uppercase tracking-widest cursor-pointer transition-colors"
                        >
                          REMOVE
                        </button>
                      </Popconfirm>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Row 1: Company Name, Job Title, Location */}
                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <label className={labelClass}>COMPANY_NAME</label>
                        <input type="text" {...register(`experience.${index}.company`)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>JOB_TITLE</label>
                        <input type="text" {...register(`experience.${index}.title`)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>LOCATION</label>
                        <input type="text" {...register(`experience.${index}.location`)} className={inputClass} />
                      </div>
                    </div>

                    {/* Row 2: Start Date, End Date (Current Integrated) */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>START_DATE</label>
                        {renderDateField("start_date", index, "experience")}
                      </div>
                      <div>
                        <label className={labelClass}>END_DATE</label>
                        {renderDateField("end_date", index, "experience", watch(`experience.${index}.is_current`))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Internships Section */}
        <div className={expSubTab === "internships" ? "space-y-6 animate-fade-in" : "hidden"}>
          <div className="flex items-center justify-between border-b border-theme-border pb-3">
            <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-theme-accent-purple">Internships</h2>
            <button
              type="button"
              onClick={() => appendExp({ company: "", title: "Software Developer Intern", start_date: "", end_date: "", is_current: false, period: "", location: "", bullets: [""] })}
              className="rounded-xl border border-theme-accent-purple/20 bg-theme-accent-purple/10 hover:bg-theme-accent-purple/20 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-theme-accent-purple transition-all cursor-pointer"
            >
              + ADD_INTERNSHIP
            </button>
          </div>

          <div className="space-y-6">
            {expFields.map((field, index) => {
              const title = watch(`experience.${index}.title`) || "";
              if (!title.toLowerCase().includes("intern")) return null;
              return (
                <div
                  key={field.id}
                  draggable
                  onDragStart={() => setDraggedExpIndex(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverExpIndex !== index) setDragOverExpIndex(index);
                  }}
                  onDragLeave={() => setDragOverExpIndex((current) => (current === index ? null : current))}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleExpDrop(index);
                  }}
                  onDragEnd={() => {
                    setDraggedExpIndex(null);
                    setDragOverExpIndex(null);
                  }}
                  className={`p-6 rounded-2xl border border-theme-border bg-theme-input-bg/60 relative hover:border-theme-accent-purple/20 transition-all duration-300 ${draggedExpIndex === index ? 'opacity-40' : ''} ${dragOverExpIndex === index && draggedExpIndex !== index ? 'border-theme-accent-purple/60' : ''}`}
                >
                  <span className="absolute top-2 left-2 w-1 h-1 border-t border-l border-theme-border/20" />

                  <div className="flex justify-between items-center border-b border-theme-border pb-3 mb-4">
                    <span className="text-[9px] font-mono font-bold text-theme-neutral-300 uppercase tracking-widest font-sans flex items-center gap-2">
                      <span className="cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">⠿</span>
                      INTERN_#{index + 1}
                    </span>
                    <div className="flex items-center gap-4">
                      {/* Move Up/Down Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={isFirstExperience(index)}
                          onClick={() => moveExperience(index, "up")}
                          className="w-6 h-6 rounded border border-theme-border hover:border-theme-accent-purple/30 hover:bg-theme-accent-purple/10 text-xs font-mono font-bold text-theme-neutral-300 hover:text-theme-accent-purple disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={isLastExperience(index)}
                          onClick={() => moveExperience(index, "down")}
                          className="w-6 h-6 rounded border border-theme-border hover:border-theme-accent-purple/30 hover:bg-theme-accent-purple/10 text-xs font-mono font-bold text-theme-neutral-300 hover:text-theme-accent-purple disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
                          title="Move Down"
                        >
                          ▼
                        </button>
                      </div>
                      <Popconfirm
                        title="Delete record?"
                        description="Are you sure you want to remove this internship record?"
                        onConfirm={() => removeExp(index)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          type="button"
                          className="text-[9px] font-mono text-theme-error hover:text-theme-error/70 font-bold uppercase tracking-widest cursor-pointer transition-colors"
                        >
                          REMOVE
                        </button>
                      </Popconfirm>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Row 1: Company Name, Job Title, Location */}
                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <label className={labelClass}>COMPANY_NAME</label>
                        <input type="text" {...register(`experience.${index}.company`)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>JOB_TITLE</label>
                        <input type="text" {...register(`experience.${index}.title`)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>LOCATION</label>
                        <input type="text" {...register(`experience.${index}.location`)} className={inputClass} />
                      </div>
                    </div>

                    {/* Row 2: Start Date, End Date (Current Integrated) */}
                    <div className="grid gap-6 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>START_DATE</label>
                        {renderDateField("start_date", index, "experience")}
                      </div>
                      <div>
                        <label className={labelClass}>END_DATE</label>
                        {renderDateField("end_date", index, "experience", watch(`experience.${index}.is_current`))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Tab Contents: Education */}
      <div className={activeTab === "education" ? "space-y-6 animate-fade-in" : "hidden"}>
        <div className="flex items-center justify-between border-b border-theme-border pb-3">
          <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-theme-text">Education History</h2>
          <button
            type="button"
            onClick={() => appendEdu({ institution: "", degree: "", start_date: "", end_date: "", is_current: false, period: "", gpa: "", level: "graduation", short_form: "" })}
            className="rounded-xl border border-theme-accent-purple/20 bg-theme-accent-purple/10 hover:bg-theme-accent-purple/20 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-theme-accent-purple transition-all cursor-pointer"
          >
            + ADD_DEGREE
          </button>
        </div>

        <div className="space-y-6">
          {eduFields.map((field, index) => (
            <div
              key={field.id}
              draggable
              onDragStart={() => setDraggedEduIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverEduIndex !== index) setDragOverEduIndex(index);
              }}
              onDragLeave={() => setDragOverEduIndex((current) => (current === index ? null : current))}
              onDrop={(e) => {
                e.preventDefault();
                handleEduDrop(index);
              }}
              onDragEnd={() => {
                setDraggedEduIndex(null);
                setDragOverEduIndex(null);
              }}
              className={`p-6 rounded-2xl border border-theme-border bg-theme-input-bg/60 relative hover:border-theme-accent-purple/20 transition-all duration-300 ${draggedEduIndex === index ? 'opacity-40' : ''} ${dragOverEduIndex === index && draggedEduIndex !== index ? 'border-theme-accent-purple/60' : ''}`}
            >
              <span className="absolute top-2 left-2 w-1 h-1 border-t border-l border-theme-border/20" />

              <div className="flex justify-between items-center border-b border-theme-border pb-3 mb-4">
                <span className="text-[9px] font-mono font-bold text-theme-neutral-300 uppercase tracking-widest font-sans flex items-center gap-2">
                  <span className="cursor-grab active:cursor-grabbing select-none" title="Drag to reorder">⠿</span>
                  DEGREE_#{index + 1}
                </span>
                <div className="flex items-center gap-4">
                  {/* Move Up/Down Controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveEdu(index, index - 1)}
                      className="w-6 h-6 rounded border border-theme-border hover:border-theme-accent-purple/30 hover:bg-theme-accent-purple/10 text-xs font-mono font-bold text-theme-neutral-300 hover:text-theme-accent-purple disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={index === eduFields.length - 1}
                      onClick={() => moveEdu(index, index + 1)}
                      className="w-6 h-6 rounded border border-theme-border hover:border-theme-accent-purple/30 hover:bg-theme-accent-purple/10 text-xs font-mono font-bold text-theme-neutral-300 hover:text-theme-accent-purple disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center justify-center transition-all"
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                  <Popconfirm
                    title="Delete record?"
                    description="Are you sure you want to remove this education degree?"
                    onConfirm={() => removeEdu(index)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button
                      type="button"
                      className="text-[9px] font-mono text-theme-error hover:text-theme-error/70 font-bold uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      REMOVE
                    </button>
                  </Popconfirm>
                </div>
              </div>

              <div className="space-y-4">
                {/* Row 1: Institution, Degree, CGPA + Short Form */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className={labelClass}>INSTITUTION</label>
                    <input type="text" {...register(`education.${index}.institution`)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>DEGREE_TITLE</label>
                    <input type="text" {...register(`education.${index}.degree`)} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>CGPA/MARKS</label>
                      <input type="text" {...register(`education.${index}.gpa`)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>SHORT_FORM</label>
                      <input type="text" {...register(`education.${index}.short_form`)} placeholder="e.g. MCA" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Row 2: Level, Start Date, End Date (Checkbox Inside) */}
                <div className="grid gap-6 md:grid-cols-3 items-start">
                  <div>
                    <label className={labelClass}>EDUCATION_LEVEL</label>
                    <select
                      {...register(`education.${index}.level`)}
                      className={`${inputClass} appearance-none cursor-pointer pr-8`}
                      style={{
                        background: "var(--theme-input-bg) url(\"data:image/svg+xml;utf8,<svg fill='%23f1f5f9' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>\") no-repeat right 8px center"
                      }}
                    >
                      <option value="10th">10th</option>
                      <option value="12th">12th</option>
                      <option value="graduation">Graduation</option>
                      <option value="post graduation">Post Graduation</option>
                      <option value="phd">PhD</option>
                      <option value="diploma">Diploma</option>
                      <option value="iti">ITI</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>START_DATE</label>
                    {renderDateField("start_date", index, "education")}
                  </div>
                  <div>
                    <label className={labelClass}>END_DATE</label>
                    {renderDateField("end_date", index, "education", watch(`education.${index}.is_current`))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {eduFields.length === 0 && (
            <p className="text-xs font-mono text-theme-neutral-300 py-4 text-center">[NO_EDUCATION_RECORDS_ADDED]</p>
          )}
        </div>
      </div>

      {/* Tab Contents: About Section */}
      <div className={activeTab === "about" ? "space-y-6 animate-fade-in" : "hidden"}>
        <div className="flex justify-between items-center border-b border-theme-border pb-3">
          <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-theme-accent-teal">About Section</h2>
          <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-teal animate-pulse" />
        </div>

        <div>
          <label className={labelClass}>HEADLINE</label>
          <input
            type="text"
            {...register("about.headline")}
            placeholder="Crafting Scalable Solutions"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>INTRO_PARAGRAPH</label>
          <textarea
            {...register("about.intro")}
            placeholder="Write a short introduction about what you do and what you're passionate about."
            className="w-full min-h-[110px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 focus:shadow-[0_0_15px_var(--theme-accent-teal-hover)] p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 rounded-2xl border border-theme-border bg-theme-input-bg/60 p-5">
            <div>
              <label className={labelClass}>WHO_I_AM_CARD_TEXT</label>
              <textarea
                {...register("about.who_i_am_text")}
                placeholder="Describe your background, what you're studying or have studied, and what you build."
                className="w-full min-h-[130px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-theme-border bg-theme-input-bg/60 p-5">
            <div>
              <label className={labelClass}>PHILOSOPHY_CARD_TEXT</label>
              <textarea
                {...register("about.philosophy_text")}
                placeholder="Share the principles that guide how you approach your work."
                className="w-full min-h-[130px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-purple/40 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>KEY_FOCUS_AREAS (COMMA_SEPARATED)</label>
          <textarea
            value={focusAreasText}
            onChange={(e) => setFocusAreasText(e.target.value)}
            placeholder="System Architecture, Performance Optimization, Database Security..."
            className="w-full min-h-[100px] rounded-xl border border-theme-border bg-theme-input-bg/85 focus:border-theme-accent-teal/40 p-4 text-sm text-theme-text placeholder-theme-text-muted focus:outline-none transition-all duration-300 font-mono"
          />
        </div>
      </div>

      {/* Permanently Visible Submit Bar */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue hover:opacity-90 px-6 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_var(--theme-accent-teal-hover)] hover:scale-[1.01] transition-all duration-300 cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? "SAVING_RESUME_CONFIG..." : "[ COMMIT_FULL_PROFILE_UPDATE ]"}
      </button>
    </form>
  );
}

export function ResumeEditorForm({ initialDataJson }: { initialDataJson: string }) {
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
        components: {
          DatePicker: {
            controlHeight: 44,
            colorBgElevated: "var(--theme-popover-bg)",
            activeBorderColor: "var(--theme-accent-teal)",
            hoverBorderColor: "var(--theme-accent-teal-hover)",
            activeShadow: "0 0 15px var(--theme-accent-teal-hover)",
            cellHeight: 22,
            cellWidth: 48,
          }
        }
      }}
    >
      <App>
        <ResumeEditorFormInner initialDataJson={initialDataJson} />
      </App>
    </ConfigProvider>
  );
}
