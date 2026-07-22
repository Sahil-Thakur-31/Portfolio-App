"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/providers/language-provider";
import { ContactForm } from "@/components/contact-form";
import { getWhatsappLink } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";
import type { Project, ResumeData } from "@/lib/database.types";
import { DEMO_ABOUT, DEMO_AVATAR_URL, DEMO_CONFIG_SNIPPET, DEMO_CONTACT, DEMO_EDUCATION, DEMO_EXPERIENCE, DEMO_FULL_NAME, DEMO_ROLE_TITLE, DEMO_SKILLS, DEMO_SUMMARY, initialsTag } from "@/lib/demo-resume";
import { App, ConfigProvider, theme } from "antd";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  FileText,
  Check,
  Copy,
  Code,
  Database,
  Cpu,
  Layers,
  Award,
  BookOpen,
  Briefcase,
  ChevronRight,
  Zap,
  MessageSquare,
  Globe
} from "lucide-react";

interface HomeClientProps {
  username: string;
  resumeDataJson: string | null;
  featuredProjects: Project[];
  totalProjectCount: number;
}

function HomeClientInner({ username, resumeDataJson, featuredProjects, totalProjectCount }: HomeClientProps) {
  const resumeData = resumeDataJson ? (JSON.parse(resumeDataJson) as ResumeData) : null;
  const hasResumeData = !!resumeData;
  const { message: antdMessage } = App.useApp();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("hero");
  const [copiedText, setCopiedText] = useState("");
  const [activeProjectIdx, setActiveProjectIdx] = useState(0);
  const [terminalCmd, setTerminalCmd] = useState("info.txt");

  const fullName = resumeData?.full_name || DEMO_FULL_NAME;
  const nodeTag = initialsTag(fullName);

  // Prefer the user's own saved objective; fall back to localized generic copy, then the placeholder
  const summary = resumeData?.summary
    || (t("About.summary") !== "About.summary" ? t("About.summary") : DEMO_SUMMARY);

  const experiences = resumeData?.experience || DEMO_EXPERIENCE;
  const jobs = experiences.filter((exp: any) => !exp.title.toLowerCase().includes("intern"));
  const internships = experiences.filter((exp: any) => exp.title.toLowerCase().includes("intern"));
  const rawSkills = resumeData?.skills as any;

  const skillsCategory = rawSkills
    ? {
      languages: rawSkills.languages || [],
      frameworks: rawSkills.frameworks || [],
      tools: rawSkills.tools || [],
    }
    : DEMO_SKILLS;

  const totalSkills = skillsCategory.languages.length + skillsCategory.frameworks.length + skillsCategory.tools.length;

  const stackCategories = [
    { key: "languages", icon: Code, color: "var(--theme-accent-teal)", items: skillsCategory.languages },
    { key: "frameworks", icon: Layers, color: "var(--theme-accent-purple)", items: skillsCategory.frameworks },
    { key: "tools", icon: Database, color: "var(--theme-accent-blue)", items: skillsCategory.tools },
  ];



  const education = resumeData?.education || DEMO_EDUCATION;

  const contact = resumeData?.contact || DEMO_CONTACT;
  const phoneDigits = contact.phone?.replace(/\D/g, "") || "";
  const whatsappLink = phoneDigits
    ? getWhatsappLink(contact.phone, `Hi ${fullName.split(" ")[0]}, I visited your portfolio and would like to connect with you regarding a job opportunity or software development project.`)
    : null;

  const isOpenToWork = resumeData?.is_open_to_opportunities ?? true;
  const avatarUrl = resumeData?.avatar_url || DEMO_AVATAR_URL;
  const roleTitle = resumeData ? (t("Hero.title") || DEMO_ROLE_TITLE) : DEMO_ROLE_TITLE;

  const about = resumeData?.about;
  const aboutHeadline = about?.headline || DEMO_ABOUT.headline;
  const aboutIntro = about?.intro || DEMO_ABOUT.intro;
  const whoIAmTitle = DEMO_ABOUT.whoIAmTitle;
  const whoIAmText = about?.who_i_am_text || DEMO_ABOUT.whoIAm;
  const philosophyTitle = DEMO_ABOUT.philosophyTitle;
  const philosophyText = about?.philosophy_text || DEMO_ABOUT.philosophy;
  const focusAreas = about?.focus_areas?.length ? about.focus_areas : DEMO_ABOUT.focusAreas;

  const configSnippet = hasResumeData
    ? {
      fileName: "sahil.config.ts",
      variableName: "sahil",
      role: "Full-Stack Developer",
      education: "MCA — Software Engineering",
      passions: ["Clean Architecture", "Scalable Systems", "Performance Optimization"],
      currentlyBuilding: "This Portfolio",
      funFact: "I debug in my dreams \u{1F41B}",
    }
    : DEMO_CONFIG_SNIPPET;

  const trackResumeDownload = async () => {
    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          event_type: "resume_download",
          page: window.location.pathname,
          user_agent: window.navigator.userAgent,
        }),
      });
    } catch (err) {
      console.error("Failed to log resume download:", err);
    }
  };

  // Compute years of experience from earliest start_date or period
  const yearsOfExperience = (() => {
    if (experiences.length === 0) return 0;
    const now = new Date();
    const startDates = experiences.map((exp: any) => {
      // Prefer structured start_date (YYYY-MM) if available
      if (exp.start_date) {
        const [y, m] = exp.start_date.split("-").map(Number);
        return new Date(y, m - 1);
      }
      // Fallback: parse year from period string
      const match = exp.period?.match(/(\d{4})/);
      return match ? new Date(parseInt(match[1]), 0) : now;
    });
    const earliest = new Date(Math.min(...startDates.map(d => d.getTime())));
    // Calculate difference in months for precision
    const months = (now.getFullYear() - earliest.getFullYear()) * 12 + (now.getMonth() - earliest.getMonth());
    return Math.max(1, Math.floor(months / 12));
  })();

  const sections = [
    { id: "hero", label: "Hero" },
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "education", label: "Education" },
    { id: "experience", label: "Experience" },
    ...(featuredProjects.length > 0 ? [{ id: "projects", label: "Projects" }] : []),
    { id: "contact", label: "Contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const bottom = top + el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < bottom) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [featuredProjects]);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const guardLink = (e: React.MouseEvent) => {
    if (!hasResumeData) {
      e.preventDefault();
      antdMessage.error("No user found.");
    }
  };

  return (
    <div className="relative min-h-screen bg-theme-bg text-theme-text selection:bg-theme-accent-teal/20">

      {/* Subtle Noise Grain to smooth out gradients and prevent banding */}
      <div className="bg-noise" />

      {/* Premium Animated Background Elements */}
      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none" />

      {/* Dynamic Background Floating Particles Layer with smooth radial gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--theme-accent-blue-rgb),0.08)_0%,rgba(var(--theme-accent-teal-rgb),0.02)_50%,transparent_75%)] animate-float-slow" />
        <div className="absolute top-[35%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--theme-accent-purple-rgb),0.07)_0%,rgba(var(--theme-accent-blue-rgb),0.015)_55%,transparent_75%)] animate-float-medium" />
        <div className="absolute top-[70%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--theme-accent-teal-rgb),0.06)_0%,rgba(var(--theme-accent-purple-rgb),0.01)_50%,transparent_75%)] animate-float-fast" />
        <div className="absolute bottom-[-10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle_at_center,rgba(var(--theme-accent-purple-rgb),0.08)_0%,rgba(var(--theme-accent-teal-rgb),0.02)_50%,transparent_75%)] animate-float-slow" />
      </div>

      {/* Vertical Navigation Dots Overlay */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-5 bg-theme-neutral-950/40 backdrop-blur-md px-3 py-6 rounded-full border border-theme-border">
        {sections.map((sec) => (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            title={sec.label}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 relative group flex items-center justify-center`}
          >
            <span
              className={`absolute w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeSection === sec.id
                  ? "bg-theme-accent-teal scale-150 shadow-[0_0_10px_var(--theme-accent-teal)]"
                  : "bg-theme-neutral-600 group-hover:bg-theme-neutral-300"
                }`}
            />
            {activeSection === sec.id && (
              <span className="absolute w-3.5 h-3.5 rounded-full border border-theme-accent-teal/50 animate-ping opacity-40" />
            )}
            <span className="absolute right-7 bg-theme-bg border border-theme-border/20 text-theme-accent-teal text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
              {sec.label}
            </span>
          </a>
        ))}
      </div>

      {/* Hero Section */}
      <section id="hero" className="min-h-screen flex items-center relative z-10 px-6 py-20 snap-section overflow-hidden">
        <div className="absolute top-[20%] right-[20%] w-72 h-72 border border-theme-border rounded-full blur-[2px] animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[15%] left-[10%] w-48 h-48 border border-theme-accent-teal/5 rounded-full blur-[1px] animate-float-medium pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid gap-12 md:grid-cols-12 items-center">

            {/* Left Column: Cyber Dossier */}
            <div className="md:col-span-7 flex flex-col gap-6">
              
              <div className="space-y-4">
                {isOpenToWork && (
                  <div className="inline-flex max-w-max items-center gap-2 rounded border border-theme-accent-teal/30 bg-theme-accent-teal/5 px-3 py-1 text-[9px] font-mono font-bold tracking-widest text-theme-accent-teal uppercase shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.1)] animate-pulse">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-theme-accent-teal shadow-[0_0_10px_var(--theme-accent-teal)]" />
                    SYS_THREAD: ACTIVE // OPEN_TO_Opportunities
                  </div>
                )}
                
                <div className="space-y-2 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-theme-accent-teal/50">[GRID_01]</span>
                    <span className="text-xs font-bold uppercase tracking-widest text-theme-accent-teal font-mono">
                      {t("Hero.greeting") || "Hi, I'm"}
                    </span>
                  </div>
                  
                  <div className="relative inline-block">
                    <h1 className="text-6xl font-black tracking-tight sm:text-7xl leading-none text-gradient pb-1 uppercase font-sans">
                      {fullName}
                    </h1>
                    <span className="absolute -bottom-1.5 right-0 text-[8px] font-mono text-theme-text-muted tracking-wider">SECURE_NODE_{nodeTag}</span>
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-theme-text-subtle tracking-wider font-mono uppercase mt-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-theme-accent-purple rounded-full animate-ping" />
                    ROLE: <span className="text-theme-accent-teal tracking-widest">{roleTitle}</span>
                  </h2>
                </div>
              </div>

              {/* Dossier Structured Records */}
              <div className="space-y-4 border-l border-theme-border pl-2 mt-2">
                <div className="flex gap-4 items-start border-l-2 border-theme-accent-teal pl-4 py-1.5 bg-gradient-to-r from-theme-accent-teal/2 to-transparent rounded-r-xl">
                  <div className="shrink-0 font-mono text-[9px] font-bold text-theme-accent-teal uppercase tracking-widest pt-0.5 min-w-[90px]">
                    OBJECTIVE //
                  </div>
                  <p className="text-theme-neutral-300 text-sm leading-relaxed font-sans max-w-xl">
                    {summary}
                  </p>
                </div>

                <div className="flex gap-4 items-start border-l-2 border-theme-accent-purple pl-4 py-1.5 bg-gradient-to-r from-theme-accent-purple/2 to-transparent rounded-r-xl">
                  <div className="shrink-0 font-mono text-[9px] font-bold text-theme-accent-purple uppercase tracking-widest pt-0.5 min-w-[90px]">
                    CORE_STACK //
                  </div>
                  <p className="text-theme-neutral-300 text-sm leading-relaxed font-sans max-w-xl">
                    Deploying applications built with <span className="text-theme-accent-purple font-mono font-semibold">{skillsCategory.frameworks.slice(0, 6).join(", ")}</span>, driven by core expertise in <span className="text-theme-neutral-200 font-mono font-semibold">{skillsCategory.languages.slice(0, 6).join(", ")}</span>.
                  </p>
                </div>
              </div>

              {/* High-Tech Telemetry Stats Grid */}
              <div className="relative w-full rounded-2xl bg-theme-bg/60 border border-theme-border overflow-hidden p-6 flex items-center justify-around font-mono text-center shadow-xl group">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
                
                <div>
                  <div className="text-2xl md:text-3xl font-black text-theme-accent-teal tracking-tight">{yearsOfExperience}+</div>
                  <div className="text-[8px] text-theme-text-muted uppercase tracking-widest mt-1">EXPERIENCE_YRS</div>
                </div>

                <div className="h-8 w-[1px] bg-theme-white/10" />

                <div>
                  <div className="text-2xl md:text-3xl font-black text-theme-text tracking-tight">{totalProjectCount}</div>
                  <div className="text-[8px] text-theme-text-muted uppercase tracking-widest mt-1">BUILDS_COMPLETED</div>
                </div>

                <div className="h-8 w-[1px] bg-theme-white/10" />

                <div>
                  <div className="text-2xl md:text-3xl font-black text-theme-accent-purple tracking-tight">{skillsCategory.languages.length + skillsCategory.frameworks.length + skillsCategory.tools.length}</div>
                  <div className="text-[8px] text-theme-text-muted uppercase tracking-widest mt-1">STACK_MODULES</div>
                </div>
              </div>

              {/* Action row */}
              <div className="flex flex-wrap gap-4 items-center mt-2">
                <a
                  href="#contact"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue px-8 font-bold font-mono text-xs uppercase tracking-widest text-theme-bg hover:shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.2)] hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                >
                  {t("Hero.cta_contact") || "Get in Touch"}
                </a>
                <a
                  href={`/api/resume/download?username=${encodeURIComponent(username)}`}
                  download={`${fullName.replace(/\s+/g, "_")}_Resume.pdf`}
                  onClick={(e) => {
                    if (!hasResumeData) {
                      guardLink(e);
                      return;
                    }
                    trackResumeDownload();
                  }}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-theme-border bg-theme-card-bg/60 backdrop-blur px-8 font-bold font-mono text-xs uppercase tracking-widest hover:bg-theme-neutral-800/80 hover:border-theme-accent-teal/25 hover:scale-[1.02] transition-all text-theme-accent-teal gap-2 shadow-lg"
                >
                  DOWNLOAD_CV //
                </a>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-xl border border-theme-border bg-theme-card-bg/60 backdrop-blur px-8 font-bold font-mono text-xs uppercase tracking-widest hover:bg-theme-neutral-800/80 hover:border-theme-success/25 hover:scale-[1.02] transition-all text-theme-success gap-2 shadow-lg"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp Chat
                  </a>
                )}
              </div>
            </div>

            {/* Right Column Portrait Frame (Cyber Target HUD) */}
            <div className="md:col-span-5 flex justify-center items-center relative py-12 lg:py-0">
              
              {/* Concentric Rotating HUD Rings */}
              <div className="absolute w-[360px] h-[360px] md:w-[440px] md:h-[440px] border border-theme-accent-teal/5 rounded-full pointer-events-none animate-spin-slow" />
              <div className="absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px] border border-dashed border-theme-accent-purple/10 rounded-full pointer-events-none animate-reverse-spin" />
              <div className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] border border-theme-accent-blue/10 rounded-full pointer-events-none" />

              {/* Floating Diagnostics Badges */}
              <div className="absolute top-[5%] left-[-4%] z-20 bg-theme-bg/95 border border-theme-accent-teal/40 px-3 py-1 rounded text-[8px] font-mono font-bold text-theme-accent-teal tracking-wider shadow-[0_0_15px_rgba(var(--theme-accent-teal-rgb),0.1)] animate-float-slow">
                SYS_NODE // REACT.JS
              </div>
              <div className="absolute bottom-[15%] right-[-4%] z-20 bg-theme-bg/95 border border-theme-accent-purple/40 px-3 py-1 rounded text-[8px] font-mono font-bold text-theme-accent-purple tracking-wider shadow-[0_0_15px_rgba(var(--theme-accent-purple-rgb),0.1)] animate-float-medium">
                CORE_ENGINE // NODE.JS
              </div>

              {/* HUD Scope Container */}
              <div className="relative group cursor-pointer p-4 select-none">
                
                {/* HUD Corners */}
                <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-theme-accent-teal group-hover:scale-95 transition-transform" />
                <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-theme-accent-teal group-hover:scale-95 transition-transform" />
                <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-theme-accent-purple group-hover:scale-95 transition-transform" />
                <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-theme-accent-purple group-hover:scale-95 transition-transform" />

                {/* Laser scan line overlay */}
                <div className="absolute inset-0 z-10 w-full h-[1px] bg-gradient-to-r from-transparent via-theme-accent-teal to-transparent opacity-0 group-hover:opacity-40 animate-scan pointer-events-none" />

                {/* Main Avatar Container */}
                <div className="relative overflow-hidden bg-theme-neutral-950/80 rounded-2xl border border-theme-border w-[260px] h-[320px] md:w-[290px] md:h-[370px]">
                  
                  {/* Backdrop radar ring */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--theme-accent-teal-rgb),0.03)_0%,transparent_75%)] pointer-events-none" />

                  {/* Avatar image */}
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-[105%] mix-blend-luminosity hover:mix-blend-normal"
                  />

                  {/* Grid layout watermark */}
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

                  {/* Dossier status label inside image */}
                  <div className="absolute bottom-3 left-3 right-3 bg-theme-bg/80 backdrop-blur-md border border-theme-border p-2 rounded-lg z-20 flex justify-between items-center text-[8px] font-mono tracking-widest text-theme-text-subtle">
                    <span>TARGET_ID: {nodeTag}</span>
                    <span className="text-theme-accent-teal animate-pulse">LOCKED</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-screen flex items-start px-6 pt-28 pb-12 snap-section overflow-hidden relative z-10">
        <div className="absolute top-[15%] left-[5%] w-60 h-60 rounded-full bg-theme-accent-teal/3 blur-[90px] animate-float-slow pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 rounded-full bg-theme-accent-purple/4 blur-[110px] animate-float-medium pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative">
          <div className="grid gap-10 lg:grid-cols-12 items-stretch">

            {/* Left Column (7 cols): Details & Philosophies */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-theme-accent-teal bg-theme-accent-teal/10 px-3.5 py-1.5 rounded-full">
                  {t("About.title") || "About Me"}
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient mt-4 mb-6">
                  {aboutHeadline}
                </h2>
                <p className="text-theme-text-subtle text-base md:text-lg leading-relaxed max-w-2xl">
                  {aboutIntro}
                </p>
              </div>

              {/* Interlocking philosophy cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group relative rounded-2xl border border-theme-border bg-theme-input-bg/60 p-6 transition-all duration-300 hover:translate-y-[-2px] hover:border-theme-accent-teal/20 hover:shadow-[0_8px_30px_rgba(var(--theme-black-rgb),0.12)]">
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-theme-accent-teal to-theme-accent-blue opacity-0 group-hover:opacity-10 transition duration-500 blur-sm pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-theme-accent-teal/10 text-theme-accent-teal rounded-xl">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-theme-neutral-200 group-hover:text-theme-text">
                      {whoIAmTitle}
                    </h3>
                  </div>
                  <p className="text-theme-text-subtle text-sm leading-relaxed">
                    {whoIAmText}
                  </p>
                </div>

                <div className="group relative rounded-2xl border border-theme-border bg-theme-input-bg/60 p-6 transition-all duration-300 hover:translate-y-[-2px] hover:border-theme-accent-purple/20 hover:shadow-[0_8px_30px_rgba(var(--theme-black-rgb),0.12)]">
                  <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-theme-accent-purple to-theme-accent-pink opacity-0 group-hover:opacity-10 transition duration-500 blur-sm pointer-events-none" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-theme-accent-purple/10 text-theme-accent-purple rounded-xl">
                      <Zap className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-theme-neutral-200 group-hover:text-theme-text">
                      {philosophyTitle}
                    </h3>
                  </div>
                  <p className="text-theme-text-subtle text-sm leading-relaxed">
                    {philosophyText}
                  </p>
                </div>
              </div>

              {/* Glowing chips container */}
              <div className="group relative rounded-2xl border border-theme-border bg-theme-input-bg/40 p-6 hover:border-theme-neutral-800 transition-all duration-350">
                <h3 className="text-xs font-bold text-theme-text-subtle uppercase tracking-widest mb-4">Key Focus Areas</h3>
                <div className="flex flex-wrap gap-2.5">
                  {focusAreas.map((val, idx) => (
                    <span key={idx} className="bg-theme-neutral-900/60 border border-theme-neutral-800/80 hover:border-theme-accent-teal/30 hover:bg-theme-accent-teal/5 text-xs font-medium text-theme-neutral-300 px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all duration-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-theme-accent-teal animate-pulse" /> {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Interactive Code Terminal Card */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Terminal-style card */}
              <div className="relative group h-full">
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-theme-accent-purple via-theme-accent-blue to-theme-accent-teal opacity-10 group-hover:opacity-20 transition duration-500 blur-md pointer-events-none" />
                <div className="relative bg-theme-terminal-bg rounded-3xl border border-theme-border overflow-hidden shadow-2xl h-full flex flex-col">
                  {/* Terminal top bar */}
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-theme-neutral-900/60 bg-theme-input-bg">
                    <span className="w-3 h-3 rounded-full bg-theme-error" />
                    <span className="w-3 h-3 rounded-full bg-theme-warning" />
                    <span className="w-3 h-3 rounded-full bg-theme-success" />
                    <span className="ml-3 text-[10px] text-theme-text-muted font-mono tracking-wider">{configSnippet.fileName}</span>
                  </div>
                  {/* Code content */}
                  <div className="p-6 font-mono text-[13px] leading-[1.85] flex-grow">
                    <div><span className="text-theme-accent-purple">const</span> <span className="text-theme-accent-teal">{configSnippet.variableName}</span> <span className="text-theme-text-muted">=</span> {"{"}</div>
                    <div className="pl-5"><span className="text-theme-accent-blue">role</span><span className="text-theme-neutral-600">:</span> <span className="text-theme-code-string">&quot;{configSnippet.role}&quot;</span><span className="text-theme-neutral-600">,</span></div>
                    <div className="pl-5"><span className="text-theme-accent-blue">education</span><span className="text-theme-neutral-600">:</span> <span className="text-theme-code-string">&quot;{configSnippet.education}&quot;</span><span className="text-theme-neutral-600">,</span></div>
                    <div className="pl-5"><span className="text-theme-accent-blue">passions</span><span className="text-theme-neutral-600">:</span> [</div>
                    {configSnippet.passions.map((passion, idx) => (
                      <div key={idx} className="pl-10">
                        <span className="text-theme-code-string">&quot;{passion}&quot;</span>
                        {idx < configSnippet.passions.length - 1 && <span className="text-theme-neutral-600">,</span>}
                      </div>
                    ))}
                    <div className="pl-5">]<span className="text-theme-neutral-600">,</span></div>
                    <div className="pl-5"><span className="text-theme-accent-blue">currentlyBuilding</span><span className="text-theme-neutral-600">:</span> <span className="text-theme-code-string">&quot;{configSnippet.currentlyBuilding}&quot;</span><span className="text-theme-neutral-600">,</span></div>
                    <div className="pl-5"><span className="text-theme-accent-blue">funFact</span><span className="text-theme-neutral-600">:</span> <span className="text-theme-code-string">&quot;{configSnippet.funFact}&quot;</span></div>
                    <div>{"}"}<span className="text-theme-neutral-600">;</span></div>
                    <div className="mt-4 flex items-center gap-1">
                      <span className="text-theme-success">❯</span>
                      <span className="w-2.5 h-5 bg-theme-accent-teal animate-pulse rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mini stats row below terminal */}
              <div className="grid grid-cols-3 gap-4">
                <div className="group relative rounded-2xl border border-theme-border bg-theme-input-bg/60 p-5 text-center hover:border-theme-accent-teal/20 transition-all duration-300">
                  <div className="text-2xl font-extrabold text-theme-accent-teal">{totalProjectCount}</div>
                  <div className="text-[10px] text-theme-text-muted uppercase tracking-widest font-bold mt-1">Projects</div>
                </div>
                <div className="group relative rounded-2xl border border-theme-border bg-theme-input-bg/60 p-5 text-center hover:border-theme-accent-purple/20 transition-all duration-300">
                  <div className="text-2xl font-extrabold text-theme-accent-purple">{totalSkills}</div>
                  <div className="text-[10px] text-theme-text-muted uppercase tracking-widest font-bold mt-1">Technologies</div>
                </div>
                <div className="group relative rounded-2xl border border-theme-border bg-theme-input-bg/60 p-5 text-center hover:border-theme-accent-blue/20 transition-all duration-300">
                  <div className="text-2xl font-extrabold text-theme-accent-blue">{yearsOfExperience}+</div>
                  <div className="text-[10px] text-theme-text-muted uppercase tracking-widest font-bold mt-1">Yrs Experience</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="min-h-screen flex items-start px-6 pt-28 pb-12 snap-section overflow-hidden relative z-10">
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-theme-accent-blue/3 blur-[100px] animate-float-medium pointer-events-none" />
        <div className="absolute bottom-[15%] left-[5%] w-96 h-96 rounded-full bg-theme-accent-purple/3 blur-[120px] animate-float-slow pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-theme-accent-teal bg-theme-accent-teal/10 px-3.5 py-1.5 rounded-full">
                Tech Stack
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient mt-4">
                {t("Skills.title") || "Skills & Technologies"}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-theme-text-muted">
              <span className="w-2 h-2 rounded-full bg-theme-accent-teal animate-pulse" />
              <span className="font-mono">{totalSkills} technologies</span>
            </div>
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--theme-accent-teal-rgb),0.05)_0%,transparent_70%)] pointer-events-none" />

            {/* LANGUAGES - Tall Left Card */}
            {(() => {
              const cat = stackCategories[0];
              return (
                <div className="lg:col-span-4 lg:row-span-2 group relative rounded-[2rem] bg-theme-input-bg/80 backdrop-blur-xl border border-theme-border overflow-hidden transition-all duration-500 hover:border-theme-accent-teal/30 hover:shadow-[0_0_40px_rgba(var(--theme-accent-teal-rgb),0.1)] flex flex-col min-h-[450px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-theme-accent-teal/5 via-transparent to-transparent opacity-50" />
                  <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700 transform group-hover:scale-110">
                    <cat.icon className="w-64 h-64" style={{ color: cat.color }} />
                  </div>
                  
                  <div className="p-8 relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3.5 bg-theme-accent-teal/10 rounded-2xl">
                        <cat.icon className="w-6 h-6 text-theme-accent-teal" />
                      </div>
                      <h3 className="text-xl font-black text-theme-text uppercase tracking-widest">{cat.key}</h3>
                    </div>

                    <div className="flex-1 flex flex-col gap-3 overflow-y-auto p-1 -m-1">
                      {cat.items.map((skill: string, idx: number) => (
                        <div key={idx} className="relative hover:z-10 flex items-center gap-3.5 bg-theme-white/5 border border-theme-border/20 rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-theme-accent-teal/20 hover:border-theme-accent-teal/50 hover:-translate-y-1 hover:shadow-lg cursor-default w-full">
                          <span className="w-2 h-2 rounded-full bg-theme-accent-teal animate-pulse shrink-0" style={{ boxShadow: '0 0 10px var(--theme-accent-teal)' }} />
                          <span className="font-semibold text-theme-neutral-200">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* FRAMEWORKS - Top Right Wide Card */}
            {(() => {
              const cat = stackCategories[1];
              return (
                <div className="lg:col-span-8 group relative rounded-[2rem] bg-theme-input-bg/80 backdrop-blur-xl border border-theme-border overflow-hidden transition-all duration-500 hover:border-theme-accent-purple/30 hover:shadow-[0_0_40px_rgba(var(--theme-accent-purple-rgb),0.1)] flex flex-col min-h-[220px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-theme-accent-purple/5 via-transparent to-transparent opacity-50" />
                  <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700 transform group-hover:scale-110">
                    <cat.icon className="w-64 h-64" style={{ color: cat.color }} />
                  </div>
                  
                  <div className="p-8 relative z-10 flex flex-col sm:flex-row sm:items-center gap-8 h-full">
                    <div className="flex items-center gap-3 sm:w-[35%] shrink-0">
                      <div className="p-3.5 bg-theme-accent-purple/10 rounded-2xl">
                        <cat.icon className="w-6 h-6 text-theme-accent-purple" />
                      </div>
                      <h3 className="text-xl font-black text-theme-text uppercase tracking-widest">{cat.key}</h3>
                    </div>

                    <div className="flex-1 sm:w-[65%]">
                      <div className="flex flex-row flex-wrap gap-3 items-center h-full">
                        {cat.items.map((skill: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3.5 bg-theme-white/5 border border-theme-border/20 rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-theme-accent-purple/20 hover:border-theme-accent-purple/50 hover:-translate-y-1 hover:shadow-lg cursor-default shrink-0">
                            <span className="w-2 h-2 rounded-full bg-theme-accent-purple shadow-[0_0_10px_var(--theme-accent-purple)] shrink-0" />
                            <span className="font-semibold text-theme-neutral-200">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TOOLS - Bottom Right Wide Card */}
            {(() => {
              const cat = stackCategories[2];
              return (
                <div className="lg:col-span-8 group relative rounded-[2rem] bg-theme-input-bg/80 backdrop-blur-xl border border-theme-border overflow-hidden transition-all duration-500 hover:border-theme-accent-blue/30 hover:shadow-[0_0_40px_rgba(var(--theme-accent-blue-rgb),0.1)] flex flex-col min-h-[220px]">
                  <div className="absolute inset-0 bg-gradient-to-l from-theme-accent-blue/5 via-transparent to-transparent opacity-50" />
                  <div className="absolute -bottom-10 -left-10 opacity-5 group-hover:opacity-10 transition-opacity duration-700 transform group-hover:scale-110">
                    <cat.icon className="w-64 h-64" style={{ color: cat.color }} />
                  </div>
                  
                  <div className="p-8 relative z-10 flex flex-col sm:flex-row-reverse sm:items-center gap-8 h-full">
                    <div className="flex items-center justify-end gap-3 sm:w-[35%] shrink-0">
                      <h3 className="text-xl font-black text-theme-text uppercase tracking-widest text-right">{cat.key}</h3>
                      <div className="p-3.5 bg-theme-accent-blue/10 rounded-2xl">
                        <cat.icon className="w-6 h-6 text-theme-accent-blue" />
                      </div>
                    </div>

                    <div className="flex-1 sm:w-[65%]">
                      <div className="flex flex-row flex-wrap gap-3 items-center sm:justify-end h-full">
                        {cat.items.map((skill: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-3.5 bg-theme-white/5 border border-theme-border/20 rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-theme-accent-blue/20 hover:border-theme-accent-blue/50 hover:-translate-y-1 hover:shadow-lg cursor-default shrink-0">
                            <span className="w-2 h-2 rounded-full bg-theme-accent-blue shadow-[0_0_10px_var(--theme-accent-blue)] shrink-0" />
                            <span className="font-semibold text-theme-neutral-200">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="min-h-screen flex items-start px-6 pt-28 pb-12 snap-section overflow-hidden relative z-10">
        {/* Background grid overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-theme-accent-blue/3 blur-[120px] animate-float-slow pointer-events-none" />

        <style>{`
          @keyframes scan {
            0% { transform: translateY(-150%); }
            100% { transform: translateY(250%); }
          }
          .animate-scan {
            animation: scan 4s linear infinite;
          }
          .cyber-clip {
            clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
          }
          @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes spin-reverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
          }
          .animate-spin-reverse {
            animation: spin-reverse 15s linear infinite;
          }
        `}</style>

        <div className="container mx-auto max-w-6xl relative">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient mb-16">
            {t("Education.title") || "Education"}
          </h2>
          
          <div className="space-y-12">
            {education.map((edu: any, index: number) => {
              // Dynamically extract details
              let cgpa = "";
              let coursework: string[] = [];
              const achievements: string[] = [];

              if (edu.details) {
                edu.details.forEach((detail: string) => {
                  if (detail.toLowerCase().includes("cgpa")) {
                    cgpa = detail;
                  } else if (detail.toLowerCase().startsWith("core coursework:")) {
                    const coursesStr = detail.replace(/core coursework:\s*/i, "");
                    coursework = coursesStr.split(",").map(c => c.trim());
                  } else {
                    achievements.push(detail);
                  }
                });
              }

              // Visual variance for each degree card
              const themeColor = index === 0 ? "var(--theme-accent-teal)" : "var(--theme-accent-purple)";
              const secondaryColor = index === 0 ? "var(--theme-accent-blue)" : "var(--theme-accent-pink)";

              return (
                <div key={index} className="group relative">
                  {/* Cyberpunk Outer Border & Glow */}
                  <div 
                    className="absolute -inset-[1px] opacity-20 group-hover:opacity-60 transition-opacity duration-500 cyber-clip"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${secondaryColor})` }}
                  />

                  {/* Main Card */}
                  <div 
                    className="relative bg-theme-bg/90 backdrop-blur-2xl px-6 py-4 lg:px-8 lg:py-5 cyber-clip border border-theme-border overflow-hidden flex flex-col lg:flex-row gap-6 items-center lg:items-stretch"
                    style={{ '--theme-color': themeColor } as React.CSSProperties}
                  >
                    


                    {/* Corner Cyber-brackets */}
                    <span className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 opacity-30 group-hover:opacity-100 transition-opacity" style={{ borderColor: themeColor }} />
                    <span className="absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 opacity-30 group-hover:opacity-100 transition-opacity" style={{ borderColor: secondaryColor }} />

                    {/* 1. Left Graphic Panel: Hologram Wireframe */}
                    <div className="w-full lg:w-[180px] flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-theme-border/20 pb-6 lg:pb-0 lg:pr-6 shrink-0 relative">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        {/* Rotating outer ring */}
                        <svg className="absolute w-full h-full animate-spin-slow opacity-20 group-hover:opacity-45 transition-opacity" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" stroke={themeColor} strokeWidth="1.5" strokeDasharray="5 10" fill="none" />
                        </svg>
                        {/* Rotating inner ring */}
                        <svg className="absolute w-[85%] h-[85%] animate-spin-reverse opacity-30 group-hover:opacity-60 transition-opacity" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" stroke={secondaryColor} strokeWidth="2" strokeDasharray="20 10" fill="none" />
                        </svg>
                        {/* Core visual icon / text */}
                        <div className="absolute z-10 flex flex-col items-center justify-center text-center">
                          <span className="text-2xl font-black tracking-tighter" style={{ color: themeColor }}>
                            {edu.short_form || (edu.degree ? edu.degree.split(" ")[0].slice(0, 5).toUpperCase() : "EDU")}
                          </span>
                          <span className="text-[9px] font-mono tracking-widest text-theme-text-muted uppercase mt-0.5">
                            {(() => {
                              const lvl = (edu.level || "").toLowerCase();
                              if (lvl === "10th") return "SSC";
                              if (lvl === "12th") return "HSC";
                              if (lvl === "graduation") return "GRAD";
                              if (lvl === "post graduation") return "POSTGRAD";
                              if (lvl === "phd") return "PHD";
                              if (lvl === "diploma") return "DIPLOMA";
                              if (lvl === "iti") return "ITI";
                              return lvl ? lvl.toUpperCase().slice(0, 8) : "DEGREE";
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Middle Content Panel */}
                    <div className="flex-1 flex flex-col justify-center space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-0.5 rounded bg-theme-white/5 border border-theme-border/20 text-theme-text-subtle">{edu.period}</span>
                          {edu.location && (
                            <span className="text-[10px] font-mono tracking-widest uppercase text-theme-text-muted">{edu.location}</span>
                          )}
                        </div>
                        <h3 className="text-2xl lg:text-3xl font-black text-theme-text group-hover:text-[var(--theme-color)] transition-colors duration-300">
                          {edu.degree}
                        </h3>
                        <h4 className="text-base font-bold" style={{ color: themeColor }}>{edu.institution}</h4>
                      </div>

                      {achievements.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-theme-text-muted uppercase tracking-widest font-black">Milestones & Achievements</div>
                          <ul className="space-y-1.5">
                            {achievements.map((ach: string, aIdx: number) => (
                              <li key={aIdx} className="flex items-start gap-2.5 text-theme-neutral-300 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 shadow-[0_0_8px_currentColor]" style={{ background: themeColor, color: themeColor }} />
                                <span>{ach}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {coursework.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[10px] text-theme-text-muted uppercase tracking-widest font-black">Modules Map</div>
                          <div className="flex flex-wrap gap-1.5">
                            {coursework.map((course: string, cIdx: number) => (
                              <span key={cIdx} className="bg-theme-white/[0.02] border border-theme-border hover:border-theme-border/20 text-[11px] font-mono text-theme-text-subtle px-2.5 py-1 rounded transition-colors cursor-default">
                                {course}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Right Status Panel: Grade */}
                    {cgpa && (
                      <div className="w-full lg:w-[150px] flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l border-theme-border/20 pt-6 lg:pt-0 lg:pl-6 shrink-0">
                        <div className="text-center space-y-1">
                          <div className="text-[10px] text-theme-text-muted font-mono tracking-widest uppercase">GRADE_INDEX</div>
                          <div className="text-3xl font-black text-theme-text font-mono tracking-tighter" style={{ textShadow: `0 0 15px ${themeColor}50` }}>
                            {cgpa.match(/\d+(\.\d+)?/)?.[0] || "GPA"}
                          </div>
                          <div className="text-[9px] text-theme-text-subtle font-semibold">{cgpa}</div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="min-h-screen flex items-start px-6 pt-28 pb-12 snap-section overflow-hidden relative z-10">
        <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-theme-accent-purple/3 blur-[140px] animate-float-medium pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative">
          <div className="mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-theme-accent-teal bg-theme-accent-teal/10 px-3.5 py-1.5 rounded-full">
              Timeline
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient mt-4">
              {t("Experience.title") || "Work Experience"}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT COLUMN: INTERNSHIPS */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2.5 h-2.5 rounded-full bg-theme-accent-purple shadow-[0_0_10px_var(--theme-accent-purple)]" />
                <h3 className="text-lg font-black uppercase tracking-widest text-theme-neutral-200">Internship Roles ({internships.length})</h3>
              </div>

              <div className="relative border-l-2 border-theme-accent-purple/20 ml-2 space-y-8">
                {internships.map((exp: any, index: number) => {
                  const themeColor = "var(--theme-accent-purple)";
                  const secondaryColor = "var(--theme-accent-pink)";
                  return (
                    <div key={index} className="relative pl-6 group">
                      <span 
                        className="absolute left-[-5px] top-4 h-2.5 w-2.5 rounded-full z-10 transition-all duration-300 scale-100 group-hover:scale-125" 
                        style={{ 
                          background: themeColor,
                          boxShadow: `0 0 10px ${themeColor}` 
                        }} 
                      />
                      <div className="relative">
                        <div 
                          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-10 transition duration-500 blur-sm" 
                          style={{ background: `linear-gradient(to right, ${themeColor}, ${secondaryColor})` }}
                        />
                        <div className="relative bg-theme-bg/80 border border-theme-border hover:border-theme-neutral-800/80 rounded-2xl p-6 transition-all duration-300">
                          <div className="flex flex-col gap-4">
                            <div>
                              <span className="bg-theme-accent-purple/10 border border-theme-accent-purple/25 text-theme-accent-purple text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded">{exp.period}</span>
                              <h4 className="text-xl font-bold text-theme-text mt-3 group-hover:text-[var(--theme-color)] transition-colors duration-300" style={{ '--theme-color': themeColor } as React.CSSProperties}>{exp.title}</h4>
                              <h5 className="text-sm font-semibold mt-1" style={{ color: themeColor }}>{exp.company}</h5>
                            </div>
                            {exp.location && <div className="text-xs text-theme-text-muted font-semibold">{exp.location}</div>}
                          </div>

                          <ul className="mt-6 space-y-3 text-theme-text-subtle text-xs md:text-sm leading-relaxed list-none">
                            {exp.bullets.map((bullet: string, bIndex: number) => (
                              <li key={bIndex} className="flex gap-2">
                                <span className="mt-1 font-bold" style={{ color: themeColor }}>•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: JOBS */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2.5 h-2.5 rounded-full bg-theme-accent-teal shadow-[0_0_10px_var(--theme-accent-teal)]" />
                <h3 className="text-lg font-black uppercase tracking-widest text-theme-neutral-200">Professional Jobs ({jobs.length})</h3>
              </div>

              <div className="relative border-l-2 border-theme-accent-teal/20 ml-2 space-y-8">
                {jobs.map((exp: any, index: number) => {
                  const themeColor = "var(--theme-accent-teal)";
                  const secondaryColor = "var(--theme-accent-blue)";
                  return (
                    <div key={index} className="relative pl-6 group">
                      <span 
                        className="absolute left-[-5px] top-4 h-2.5 w-2.5 rounded-full z-10 transition-all duration-300 scale-100 group-hover:scale-125" 
                        style={{ 
                          background: themeColor,
                          boxShadow: `0 0 10px ${themeColor}` 
                        }} 
                      />
                      <div className="relative">
                        <div 
                          className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-10 transition duration-500 blur-sm" 
                          style={{ background: `linear-gradient(to right, ${themeColor}, ${secondaryColor})` }}
                        />
                        <div className="relative bg-theme-bg/80 border border-theme-border hover:border-theme-neutral-800/80 rounded-2xl p-6 transition-all duration-300">
                          <div className="flex flex-col gap-4">
                            <div>
                              <span className="bg-theme-accent-teal/10 border border-theme-accent-teal/25 text-theme-accent-teal text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded">{exp.period}</span>
                              <h4 className="text-xl font-bold text-theme-text mt-3 group-hover:text-[var(--theme-color)] transition-colors duration-300" style={{ '--theme-color': themeColor } as React.CSSProperties}>{exp.title}</h4>
                              <h5 className="text-sm font-semibold mt-1" style={{ color: themeColor }}>{exp.company}</h5>
                            </div>
                            {exp.location && <div className="text-xs text-theme-text-muted font-semibold">{exp.location}</div>}
                          </div>

                          <ul className="mt-6 space-y-3 text-theme-text-subtle text-xs md:text-sm leading-relaxed list-none">
                            {exp.bullets.map((bullet: string, bIndex: number) => (
                              <li key={bIndex} className="flex gap-2">
                                <span className="mt-1 font-bold" style={{ color: themeColor }}>•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section id="projects" className="min-h-screen flex items-start px-6 pt-28 pb-12 snap-section overflow-hidden relative z-10">
          <div className="absolute top-[20%] left-[-5%] w-80 h-80 rounded-full bg-theme-accent-teal/4 blur-[100px] animate-float-fast pointer-events-none" />

          <div className="container mx-auto max-w-6xl relative">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient mb-16">
              {t("Projects.title") || "Featured Projects"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Project Selector Control Panel (col-span-4) */}
              <div className="lg:col-span-4 flex flex-col gap-3 justify-start">
                <div className="text-[10px] text-theme-text-muted font-mono tracking-widest uppercase mb-2">SYSTEM_TARGETS</div>
                {featuredProjects.map((project: any, index: number) => {
                  const isActive = index === activeProjectIdx;
                  const themeColor = index % 2 === 0 ? "var(--theme-accent-teal)" : "var(--theme-accent-purple)";
                  return (
                    <button
                      key={project.id}
                      onClick={() => setActiveProjectIdx(index)}
                      className={`relative flex items-center justify-between p-4.5 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                        isActive
                          ? "bg-theme-neutral-900/80 border-theme-neutral-700 shadow-[0_0_20px_rgba(var(--theme-accent-teal-rgb),0.05)]"
                          : "bg-theme-bg/60 border-theme-border hover:border-theme-neutral-800/80"
                      }`}
                      style={{ borderColor: isActive ? themeColor : undefined }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-2 h-2 rounded-full transition-transform duration-300 ${isActive ? 'scale-125' : ''}`}
                          style={{ 
                            background: themeColor,
                            boxShadow: isActive ? `0 0 10px ${themeColor}` : undefined 
                          }}
                        />
                        <div>
                          <div className="text-xs font-mono text-theme-text-muted">PROJ_0{index + 1}</div>
                          <div className="text-sm font-bold text-theme-neutral-200 mt-0.5 group-hover:text-theme-text">{project.title}</div>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isActive ? 'translate-x-1' : 'opacity-30 group-hover:opacity-60'}`} style={{ color: isActive ? themeColor : undefined }} />
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Holographic Detail Display (col-span-8) */}
              {(() => {
                const project = featuredProjects[activeProjectIdx];
                if (!project) return null;
                const themeColor = activeProjectIdx % 2 === 0 ? "var(--theme-accent-teal)" : "var(--theme-accent-purple)";
                const secondaryColor = activeProjectIdx % 2 === 0 ? "var(--theme-accent-blue)" : "var(--theme-accent-pink)";
                return (
                  <div className="lg:col-span-8 relative min-h-[400px] lg:min-h-[550px] w-full">
                    <div 
                      className="lg:absolute lg:inset-0 bg-theme-bg/90 backdrop-blur-2xl p-6 lg:p-8 cyber-clip border border-theme-border overflow-hidden flex flex-col md:flex-row gap-8 items-stretch transition-all duration-500"
                      key={project.id}
                      style={{ '--theme-color': themeColor } as React.CSSProperties}
                    >
                    {/* Glowing outer border */}
                    <div 
                      className="absolute -inset-[1px] opacity-35 cyber-clip pointer-events-none"
                      style={{ background: `linear-gradient(135deg, ${themeColor}, ${secondaryColor})` }}
                    />
                    
                    {/* Cyber corner brackets */}
                    <span className="absolute top-3 left-3 w-3 h-3 border-t border-l opacity-40" style={{ borderColor: themeColor }} />
                    <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r opacity-40" style={{ borderColor: secondaryColor }} />

                    {/* Project Visual Display Panel */}
                    <div className="w-full md:w-[45%] h-52 md:h-auto shrink-0 overflow-hidden rounded-2xl bg-theme-neutral-950 flex items-center justify-center border border-theme-border relative group/img">
                      {project.image_url ? (
                        <img 
                          src={project.image_url} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-all duration-700 group-hover/img:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                          <svg className="w-16 h-16 opacity-30" viewBox="0 0 100 100" fill="none">
                            <rect x="10" y="10" width="80" height="80" rx="15" stroke={themeColor} strokeWidth="1" strokeDasharray="4 8" />
                            <circle cx="50" cy="50" r="20" stroke={secondaryColor} strokeWidth="1.5" />
                          </svg>
                          <span className="text-[9px] font-mono tracking-widest text-theme-neutral-600 mt-3">SYS_GRAPHIC</span>
                        </div>
                      )}
                      
                      {/* Grid pattern overlays on image */}
                      <div className="absolute inset-0 bg-grid-pattern opacity-15 mix-blend-overlay pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-transparent to-transparent pointer-events-none" />
                    </div>

                    {/* Project Data/Specs Panel */}
                    <div className="flex-grow flex flex-col justify-start space-y-4 min-h-0">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[9px] font-mono tracking-widest uppercase text-theme-text-muted">DOSSIER_SYSTEM_V.1.0</span>
                        <span className="bg-theme-accent-teal/10 border border-theme-accent-teal/20 text-theme-accent-teal px-2.5 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase">
                          {project.is_featured ? "Featured" : "Core"}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-theme-text tracking-tight" style={{ textShadow: `0 0 30px ${themeColor}15` }}>
                          {project.title}
                        </h3>
                        <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: themeColor }}>Status: ONLINE / DEPLOYED</div>
                      </div>

                      <div className="text-theme-neutral-300 text-xs md:text-sm leading-relaxed flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-0">
                        {project.description ? renderMarkdown(project.description) : (
                          <p className="text-xs text-theme-text-muted italic">No detailed documentation log compiled.</p>
                        )}
                      </div>

                      <div className="space-y-4 pt-4 border-t border-theme-border/20">
                        {/* Modules/Tags */}
                        <div className="flex flex-wrap gap-1.5">
                          {project.tags.map((tag: string, tagIndex: number) => (
                            <span key={tagIndex} className="rounded bg-theme-white/[0.02] border border-theme-border hover:border-theme-border/20 px-2.5 py-1 text-[10px] font-mono text-theme-text-subtle cursor-default transition-all duration-300">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-6 text-sm font-bold font-mono tracking-wider">
                          {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-theme-text-subtle hover:text-theme-text transition-colors flex items-center gap-1.5 uppercase">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                              </svg>
                              Source Code
                            </a>
                          )}
                          {project.live_url && (
                            <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-[var(--theme-color)] hover:text-theme-white transition-colors flex items-center gap-1.5 uppercase">
                              <Globe className="w-4 h-4" /> Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })()}
              
            </div>
          </div>
        </section>
      )}

      {/* Contact Section near Footer */}
      <section id="contact" className="min-h-screen flex flex-col px-6 pt-28 pb-6 snap-section relative overflow-hidden z-10">
        <div className="absolute top-[10%] right-[10%] w-[35rem] h-[35rem] rounded-full bg-theme-accent-blue/4 blur-[130px] animate-float-slow pointer-events-none" />

        <div className="container mx-auto max-w-6xl flex-grow flex flex-col justify-center relative">
          <div className="text-center mb-16">
            <div className="inline-block text-[10px] text-theme-accent-teal font-mono tracking-[0.25em] uppercase mb-3 bg-theme-accent-teal/10 border border-theme-accent-teal/20 px-3 py-1 rounded">
              COMMUNICATION_UPLINK
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient">{t("Navbar.contact") || "Get In Touch"}</h2>
            <p className="text-theme-text-subtle mt-3 text-sm md:text-base max-w-md mx-auto">
              Initiate transmission channels below to establish secure direct comms or submit a secure contract inquiry.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-stretch">

            {/* Left Column: Direct Contact Info Blocks with Copy features */}
            <div className="md:col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="text-[10px] text-theme-text-muted font-mono tracking-widest uppercase mb-1">TRANSMISSION_CHANNELS</div>

                {/* Email Block */}
                <div 
                  onClick={() => copyToClipboard(contact.email, "email")}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 group cursor-pointer overflow-hidden ${
                    copiedText === "email"
                      ? "bg-theme-success/10 border-theme-success/30 shadow-[0_0_20px_rgba(var(--theme-success-rgb),0.05)]"
                      : "bg-theme-bg/60 border-theme-border hover:border-theme-accent-teal/30 hover:bg-theme-neutral-900/40"
                  }`}
                >
                  <div className="absolute -inset-y-0 -left-1 w-1 bg-theme-accent-teal opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-xl border transition-colors ${copiedText === 'email' ? 'bg-theme-success/15 border-theme-success/30 text-theme-success' : 'bg-theme-neutral-900/80 border-theme-neutral-800 text-theme-accent-teal group-hover:text-theme-white'}`}>
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-theme-text-muted font-bold block">CHANNEL_01: EMAIL</span>
                        <span className="text-sm font-semibold text-theme-neutral-200 block mt-0.5 font-mono">{contact.email}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-theme-text-muted group-hover:text-theme-text-subtle transition-colors">
                      {copiedText === "email" ? "SECURED" : "COPY_KEY"}
                    </span>
                  </div>
                </div>

                {/* Phone Block */}
                <div 
                  onClick={() => copyToClipboard(contact.phone, "phone")}
                  className={`relative p-5 rounded-2xl border transition-all duration-300 group cursor-pointer overflow-hidden ${
                    copiedText === "phone"
                      ? "bg-theme-success/10 border-theme-success/30 shadow-[0_0_20px_rgba(var(--theme-success-rgb),0.05)]"
                      : "bg-theme-bg/60 border-theme-border hover:border-theme-accent-purple/30 hover:bg-theme-neutral-900/40"
                  }`}
                >
                  <div className="absolute -inset-y-0 -left-1 w-1 bg-theme-accent-purple opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-xl border transition-colors ${copiedText === 'phone' ? 'bg-theme-success/15 border-theme-success/30 text-theme-success' : 'bg-theme-neutral-900/80 border-theme-neutral-800 text-theme-accent-purple group-hover:text-theme-white'}`}>
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-theme-text-muted font-bold block">CHANNEL_02: MOBILE</span>
                        <span className="text-sm font-semibold text-theme-neutral-200 block mt-0.5 font-mono">{contact.phone}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-theme-text-muted group-hover:text-theme-text-subtle transition-colors">
                      {copiedText === "phone" ? "SECURED" : "COPY_KEY"}
                    </span>
                  </div>
                </div>

                {/* Location Card with Map */}
                <div className="relative rounded-2xl border bg-theme-bg/60 border-theme-border overflow-hidden group hover:border-theme-accent-blue/30 transition-all duration-300">
                  <div className="absolute -inset-y-0 -left-1 w-1 bg-theme-accent-blue opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="p-5 flex gap-4 items-center justify-between border-b border-theme-border relative z-10">
                    <div className="flex gap-4 items-center">
                      <div className="p-3 bg-theme-neutral-900/80 border border-theme-neutral-800 rounded-xl text-theme-accent-blue group-hover:text-theme-white transition-colors">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-theme-text-muted font-bold block">CHANNEL_03: NODE_LOC</span>
                        <span className="text-sm font-semibold text-theme-neutral-200 block mt-0.5">{contact.location}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-theme-text-muted">STABLE</span>
                  </div>

                  {/* Embedded Map Panel */}
                  <div className="w-full h-32 relative opacity-60 hover:opacity-85 transition-opacity duration-300">
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(contact.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      className="w-full h-full border-none invert-[90%] hue-rotate-180 brightness-[85%] contrast-110 pointer-events-none"
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Social Channels Row */}
              <div className="grid grid-cols-3 gap-4">
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={guardLink}
                  className="relative p-4 rounded-xl border border-theme-border bg-theme-bg/40 hover:bg-theme-bg text-theme-text-subtle hover:text-theme-accent-teal hover:border-theme-accent-teal/20 transition-all duration-300 font-bold font-mono text-[11px] tracking-widest text-center flex items-center justify-center gap-2 group uppercase"
                >
                  <span className="absolute top-1 left-1.5 text-[6px] text-theme-text-muted group-hover:text-theme-accent-teal/40 transition-colors">SYS_LINK_01</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={guardLink}
                  className="relative p-4 rounded-xl border border-theme-border bg-theme-bg/40 hover:bg-theme-bg text-theme-text-subtle hover:text-theme-accent-purple hover:border-theme-accent-purple/20 transition-all duration-300 font-bold font-mono text-[11px] tracking-widest text-center flex items-center justify-center gap-2 group uppercase"
                >
                  <span className="absolute top-1 left-1.5 text-[6px] text-theme-text-muted group-hover:text-theme-accent-purple/40 transition-colors">SYS_LINK_02</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href={`/api/resume/download?username=${encodeURIComponent(username)}`}
                  download={`${fullName.replace(/\s+/g, "_")}_Resume.pdf`}
                  onClick={(e) => {
                    if (!hasResumeData) {
                      guardLink(e);
                      return;
                    }
                    trackResumeDownload();
                  }}
                  className="relative p-4 rounded-xl border border-theme-border bg-theme-bg/40 hover:bg-theme-bg text-theme-text-subtle hover:text-theme-success hover:border-theme-success/20 transition-all duration-300 font-bold font-mono text-[11px] tracking-widest text-center flex items-center justify-center gap-2 group uppercase"
                >
                  <span className="absolute top-1 left-1.5 text-[6px] text-theme-text-muted group-hover:text-theme-success/40 transition-colors">SYS_LINK_03</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Resume
                </a>
              </div>

            </div>

            {/* Right Column: Contact Message Form */}
            <div className="md:col-span-7 flex">
              <div className="group relative w-full flex">
                <div className="absolute -inset-[1.5px] rounded-[2rem] bg-gradient-to-r from-theme-accent-teal/20 to-theme-accent-purple/20 opacity-45 group-hover:opacity-70 transition duration-500 pointer-events-none" />
                <div className="relative bg-theme-bg/95 backdrop-blur-3xl rounded-[2rem] p-8 shadow-2xl border border-theme-border overflow-hidden w-full flex flex-col justify-between cyber-clip">
                  
                  <span className="absolute top-3 left-3 w-2 h-2 border-t border-l border-theme-accent-teal opacity-40" />
                  <span className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-theme-accent-purple opacity-40" />
                  
                  <div className="mb-6 flex justify-between items-center border-b border-theme-border pb-4">
                    <div>
                      <h3 className="text-lg font-black text-theme-text uppercase tracking-wider font-mono">COMMS_TERMINAL</h3>
                      <p className="text-[10px] font-mono text-theme-text-muted mt-0.5">SYS_STATUS: READY_TO_TRANSMIT</p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-theme-success animate-pulse shadow-[0_0_10px_var(--theme-success)]" />
                  </div>

                  <ContactForm username={username} disabled={!hasResumeData} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Cockpit Footer Panel */}
        <div className="w-full mt-24 border-t border-theme-neutral-900/60 pt-6 pb-2 relative z-10 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono tracking-widest text-theme-text-muted gap-4">
          <div className="flex items-center gap-4 text-[9px]">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-theme-success animate-pulse" />SYS_STATUS: ONLINE</span>
            <span className="text-theme-neutral-700">|</span>
            <span>LATITUDE: 18.5204° N</span>
            <span className="text-theme-neutral-700">|</span>
            <span>LONGITUDE: 73.8567° E</span>
          </div>

          <div className="text-center md:text-right flex flex-col items-center md:items-end">
            <span className="text-theme-text-subtle font-bold uppercase tracking-[0.2em]">Designed & Programmed by {fullName}</span>
            <span className="text-[8px] text-theme-neutral-600 mt-1">© {new Date().getFullYear()} {fullName}. DEPLOYED_VER: 1.0.4. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export function HomeClient(props: HomeClientProps) {
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
        <HomeClientInner {...props} />
      </App>
    </ConfigProvider>
  );
}

