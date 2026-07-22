-- ============================================================================
-- MULTI-TENANT PORTFOLIO PLATFORM — DATABASE SCHEMA
-- Run this entire script in the Supabase SQL Editor for a fresh install.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PROFILES — Extends auth.users for public profile data
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  email       TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Public profile data extending Supabase auth.users';

-- Generates a URL-safe, collision-free username from a display name or email,
-- appending a numeric suffix if the base slug is already taken.
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  base text;
  candidate text;
  suffix int := 0;
BEGIN
  base := lower(regexp_replace(coalesce(nullif(trim(base_input), ''), 'user'), '[^a-zA-Z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  IF base = '' THEN
    base := 'user';
  END IF;

  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = candidate) LOOP
    suffix := suffix + 1;
    candidate := base || '-' || suffix;
  END LOOP;

  RETURN candidate;
END;
$$;

-- Auto-create profile + starter resume row on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_username text;
  new_full_name text;
BEGIN
  new_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '');
  new_username := public.generate_unique_username(COALESCE(NULLIF(new_full_name, ''), split_part(NEW.email, '@', 1)));

  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, role)
  VALUES (
    NEW.id,
    new_username,
    new_full_name,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', ''),
    NEW.email,
    'user'
  );

  INSERT INTO public.resume_data (user_id, full_name)
  VALUES (NEW.id, new_full_name);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 2. PROJECTS — Portfolio project showcase (one owner per row)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  content      TEXT,  -- Rich markdown body for project detail page
  tags         TEXT[] DEFAULT '{}',
  image_url    TEXT,
  live_url     TEXT,
  github_url   TEXT,
  is_featured  BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.projects IS 'Portfolio projects with full CRUD from admin panel, one owner per row';

CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_published ON public.projects(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON public.projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_user ON public.projects(user_id);

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 3. GUESTBOOK ENTRIES — Messages left on a specific user's portfolio page
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.guestbook_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- whose portfolio this was posted on
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for unauthenticated posters
  user_name   TEXT NOT NULL,
  user_avatar TEXT,
  message     TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.guestbook_entries IS 'Per-portfolio guestbook messages';

CREATE INDEX IF NOT EXISTS idx_guestbook_created ON public.guestbook_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_owner ON public.guestbook_entries(owner_id);

-- ============================================================================
-- 4. LEADS — Contact form / client inquiries, addressed to a specific owner
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  company    TEXT,
  budget     TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived', 'replied')),
  tags       TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.leads IS 'Client inquiries from the contact form, addressed to a specific portfolio owner';

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON public.leads(owner_id);

-- ============================================================================
-- 5. RESUME DATA — One row per user, powers their public resume/PDF
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.resume_data (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL DEFAULT '',
  summary        TEXT,
  experience     JSONB DEFAULT '[]'::jsonb,
  education      JSONB DEFAULT '[]'::jsonb,
  skills         JSONB DEFAULT '{}'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  contact        JSONB DEFAULT '{}'::jsonb,
  about          JSONB DEFAULT '{}'::jsonb,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.resume_data IS 'One JSON resume row per user, powering their public profile and PDF generation';

CREATE INDEX IF NOT EXISTS idx_resume_data_user ON public.resume_data(user_id);

CREATE TRIGGER update_resume_data_updated_at
  BEFORE UPDATE ON public.resume_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. ANALYTICS EVENTS — Page views, clicks, and interaction tracking, per owner
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN ('page_view', 'project_click', 'resume_download', 'guestbook_post', 'contact_submit')),
  page        TEXT,
  referrer    TEXT,
  country     TEXT,
  city        TEXT,
  user_agent  TEXT,
  session_id  TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.analytics_events IS 'Per-owner analytics for each user''s stats dashboard';

CREATE INDEX IF NOT EXISTS idx_analytics_type_date ON public.analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON public.analytics_events(page) WHERE event_type = 'page_view';
CREATE INDEX IF NOT EXISTS idx_analytics_owner ON public.analytics_events(owner_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — ownership-based, not a single admin gate
-- ============================================================================

-- Helper function kept for potential future super-admin tooling; tenant tables
-- below are gated by ownership instead of this.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
    AND role = 'admin'
  );
$$;

-- ---- PROFILES ----
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ---- PROJECTS ----
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Owner can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owner can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- ---- GUESTBOOK ENTRIES ----
ALTER TABLE public.guestbook_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guestbook entries"
  ON public.guestbook_entries FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own entries"
  ON public.guestbook_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner or poster can delete guestbook entry"
  ON public.guestbook_entries FOR DELETE
  USING (auth.uid() = owner_id OR auth.uid() = user_id);

-- ---- LEADS ----
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead to a real owner"
  ON public.leads FOR INSERT
  WITH CHECK (owner_id IS NOT NULL);

CREATE POLICY "Owner can view own leads" ON public.leads FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owner can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = owner_id);

-- ---- RESUME DATA ----
ALTER TABLE public.resume_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resume data"
  ON public.resume_data FOR SELECT
  USING (true);

CREATE POLICY "Owner can update own resume data"
  ON public.resume_data FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- ANALYTICS EVENTS ----
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owner can view own analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = owner_id);

-- ============================================================================
-- STORAGE BUCKET for project images
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view project images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-images');

-- Uploads must live under a folder named after the uploader's own user id
-- (e.g. "<user_id>/avatars/..." or "<user_id>/projects/...") so one tenant
-- can never overwrite or delete another tenant's images.
CREATE POLICY "Users can upload into their own image folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'project-images' AND (storage.foldername(name))[1] = auth.uid()::text);
