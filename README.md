# Nexus — Multi-Tenant Developer Portfolio Platform

Nexus is a self-hosted platform for building and running a developer portfolio.
Every account gets its own public profile at `/{username}` — hero, about,
skills, education, experience, featured projects, a generated PDF résumé,
guestbook, and a public analytics dashboard — plus a private admin panel to
manage all of it. Data is fully tenant-isolated: each user only ever reads or
writes their own rows, enforced at the database layer via Postgres Row Level
Security, not just application code.

## Features

**Public profile** (`/{username}`)
- Hero, About, Skills, Education, Experience, and Featured Projects sections
- Auto-generated, downloadable PDF résumé
- Per-owner guestbook and public analytics/stats page
- Contact form that routes inquiries to the profile owner (email + Discord)
- English / Hindi language toggle
- Graceful placeholder content for a profile that hasn't been filled in yet,
  and a themed "not found" page for usernames that don't exist

**Admin panel** (`/admin`, any authenticated user manages only their own data)
- Full project CRUD with drag-to-reorder, featured/published toggles, and
  one-click GitHub repo import (syncs description, tags, and live URL from
  each repo's README)
- Résumé/About editor (profile, skills, experience, education, contact, about)
- Lead inbox and guestbook moderation
- GitHub / LinkedIn account linking

**Platform**
- Email/password and GitHub OAuth authentication
- Automatic, collision-safe username generation on signup
- Rate limiting on guestbook posts, contact submissions, and analytics events
- Middleware-protected admin routes

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack, Server Actions) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS v4 |
| Database / Auth / Storage | [Supabase](https://supabase.com) (Postgres, RLS, OAuth, Storage) |
| Admin UI primitives | [Ant Design](https://ant.design) |
| Forms | react-hook-form + zod |
| PDF generation | @react-pdf/renderer |
| Email | [Resend](https://resend.com) |
| Rate limiting | [Upstash Redis](https://upstash.com) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Lead notification email fallback, used if a profile has no contact email set
FALLBACK_LEAD_EMAIL=

# Optional integrations
RESEND_API_KEY=              # transactional email for new leads
DISCORD_WEBHOOK_URL=          # Discord alert for new leads
GITHUB_TOKEN=                 # raises the GitHub API rate limit for repo sync
UPSTASH_REDIS_REST_URL=       # rate limiting
UPSTASH_REDIS_REST_TOKEN=
CRON_SECRET=                   # protects /api/cron/keep-alive
```

### 3. Set up the database

Open the Supabase SQL Editor for your project:

- **Fresh project:** run `supabase/schema.sql`, then optionally `supabase/seed.sql` for sample data.
- **Upgrading an existing pre-multi-tenant deployment:** run `supabase_migration.sql`, then `supabase_migration_saas.sql`.

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    [username]/        Public profile and its sub-pages (guestbook, projects, stats, contact)
    admin/              Authenticated admin panel
    api/                Route handlers (analytics, auth callback, cron, PDF export)
    auth/                Login, signup, password recovery
  components/          Shared UI (forms, navbar, animated backgrounds, terminal easter egg, ...)
  server/
    actions/            Server Actions (mutations, called from client components)
    db/                  Supabase query functions
    integrations/        GitHub API client
    notifications/       Email / Discord senders
  lib/                  Types, validators, i18n messages, utilities
supabase/
  schema.sql             Full schema for a fresh install
  seed.sql               Sample data
supabase_migration.sql          Legacy → multi-tenant migration (historical)
supabase_migration_saas.sql     Ownership RLS + auto-provisioning migration
```

## Available Scripts

```bash
npm run dev      # start the dev server (Turbopack)
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```
