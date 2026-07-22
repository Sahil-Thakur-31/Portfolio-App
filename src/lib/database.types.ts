// ============================================================================
// DATABASE TYPES — Hand-crafted TypeScript interfaces matching the DDL
// ============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---- Domain Types ----

export type UserRole = "admin" | "user";
export type ProjectStatus = "published" | "draft";
export type LeadStatus = "new" | "read" | "archived" | "replied";
export type EventType =
  | "page_view"
  | "project_click"
  | "resume_download"
  | "guestbook_post"
  | "contact_submit";

// ---- Resume sub-types ----

export interface ResumeExperience {
  company: string;
  title: string;
  period: string;
  location?: string;
  bullets: string[];
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  period: string;
  gpa?: string;
}

export interface ResumeSkills {
  languages: string[];
  frameworks: string[];
  tools: string[];
}

export interface ResumeContact {
  email: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio?: string;
}

export interface ResumeAbout {
  headline: string;
  intro: string;
  who_i_am_text: string;
  philosophy_text: string;
  focus_areas: string[];
}

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  tags: string[];
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GuestbookEntry {
  id: string;
  owner_id: string;
  user_id: string | null;
  user_name: string;
  user_avatar: string | null;
  message: string;
  created_at: string;
}

export interface Lead {
  id: string;
  owner_id: string;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  message: string;
  status: LeadStatus;
  tags: string[];
  created_at: string;
}

export interface ResumeData {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  is_open_to_opportunities: boolean;
  summary: string | null;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: ResumeSkills;
  certifications: Json[];
  contact: ResumeContact;
  about: ResumeAbout | null;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  owner_id: string;
  event_type: EventType;
  page: string | null;
  referrer: string | null;
  country: string | null;
  city: string | null;
  user_agent: string | null;
  session_id: string | null;
  metadata: Json;
  created_at: string;
}

// ============================================================================
// INSERT / UPDATE TYPES (Omit auto-generated fields)
// ============================================================================

export type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;
export type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;

export type ProjectInsert = Omit<Project, "id" | "created_at" | "updated_at">;
export type ProjectUpdate = Partial<Omit<Project, "id" | "created_at" | "updated_at">>;

export type GuestbookEntryInsert = Omit<GuestbookEntry, "id" | "created_at">;
export type GuestbookEntryUpdate = Partial<Omit<GuestbookEntry, "id" | "user_id" | "created_at">>;

export type LeadInsert = Omit<Lead, "id" | "created_at" | "status" | "tags"> & {
  status?: LeadStatus;
  tags?: string[];
};
export type LeadUpdate = Partial<Omit<Lead, "id" | "created_at">>;

export type ResumeDataUpdate = Partial<Omit<ResumeData, "id" | "updated_at">>;

export type AnalyticsEventInsert = Omit<AnalyticsEvent, "id" | "created_at">;

// ============================================================================
// SUPABASE DATABASE TYPE (for generic client typing)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      guestbook_entries: {
        Row: GuestbookEntry;
        Insert: GuestbookEntryInsert;
        Update: GuestbookEntryUpdate;
      };
      leads: {
        Row: Lead;
        Insert: LeadInsert;
        Update: any;
      };
      resume_data: {
        Row: ResumeData;
        Insert: ResumeData;
        Update: ResumeDataUpdate;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: AnalyticsEventInsert;
        Update: any;
      };
    };
  };
}
