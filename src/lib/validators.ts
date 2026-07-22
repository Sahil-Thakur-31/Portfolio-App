import { z } from "zod";

// ---- Project Validators ----

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  live_url: z.string().url().optional().nullable().or(z.literal("")),
  github_url: z.string().url().optional().nullable().or(z.literal("")),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// ---- Guestbook Validators ----

export const guestbookSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or fewer")
    .regex(/^[^0-9]+$/, "Name cannot contain numbers")
    .trim(),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(500, "Message must be 500 characters or fewer")
    .trim(),
});

export type GuestbookFormValues = z.infer<typeof guestbookSchema>;

// ---- Lead / Contact Form Validators ----

export const leadSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .regex(/^[^0-9]+$/, "Name cannot contain numbers"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().max(100).optional(),
  budget: z.string().max(50).optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2000 characters or fewer"),
});

export type LeadFormValues = z.infer<typeof leadSchema>;

// ---- Resume Data Validators ----

export const resumeExperienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  period: z.string().min(1),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_current: z.boolean().optional(),
  location: z.string().optional(),
  bullets: z.array(z.string()),
});

export const resumeEducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  period: z.string().min(1),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_current: z.boolean().optional(),
  gpa: z.string().optional(),
  level: z.string().optional(),
  short_form: z.string().optional(),
});

export const resumeAboutSchema = z.object({
  headline: z.string().optional().default(""),
  intro: z.string().optional().default(""),
  who_i_am_text: z.string().optional().default(""),
  philosophy_text: z.string().optional().default(""),
  focus_areas: z.array(z.string()).default([]),
});

export const resumeDataSchema = z.object({
  full_name: z.string().min(1),
  avatar_url: z.string().optional().nullable(),
  is_open_to_opportunities: z.boolean().default(true),
  summary: z.string().optional().nullable(),
  experience: z.array(resumeExperienceSchema),
  education: z.array(resumeEducationSchema),
  skills: z.object({
    languages: z.array(z.string()),
    frameworks: z.array(z.string()),
    tools: z.array(z.string()),
  }),
  certifications: z.array(z.any()).default([]),
  contact: z.object({
    email: z.string().email(),
    phone: z.string(),
    location: z.string(),
    github: z.string().url(),
    linkedin: z.string().url(),
    portfolio: z.string().url().optional(),
  }),
  about: resumeAboutSchema.optional(),
});

export type ResumeDataFormValues = z.infer<typeof resumeDataSchema>;
