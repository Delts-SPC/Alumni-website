# Delt Alumni Excellence Center — Product Requirements

## Original problem statement
Foundation for a high-value alumni programming initiative for Delta Tau Delta fraternity (~140k alumni).
The platform must position the alumnus as the hero, build trust before any ask, gather structured data
to guide future paid programs ($1k–$2k range), and remain privacy-first ("data used only for this
initiative; not shared with the fraternity or foundation unless opted in").

## Architecture
- Frontend: React 19 + Tailwind + Shadcn UI (deploys to Vercel)
- Database: Supabase (PostgreSQL) — frontend talks to Supabase directly with anon key
- Backend: None for Phase 1 (FastAPI/Railway reserved for Phase 7+ admin/CRM)
- Auth: Simple env-based credential check for Phase 1 admin (sessionStorage flag)
- Reports: Playwright (future phase)

## Core requirements (static)
- Privacy-first messaging woven throughout
- Alumnus-as-hero tone (no organizational/fundraising language)
- Subtle Delta Tau Delta purple (#6B2C91) accent — never dominant
- Mobile-first, fast load, frictionless multi-step forms with progress indicators
- Centered popup forms with X/Cancel exit
- Footer text exact: "Built by Delts. Supported by Delts. Independent from expectations. Focused on your next chapter."

## User personas
1. **Disengaged alumnus** — mid-career, skeptical of fraternity outreach, will engage if value is clear.
2. **Senior alumnus / expert** — willing to share experience to help younger Brothers.
3. **Admin** — info@spc-cpf.com — needs simple, clean view of collected data.

## What's been implemented (Phase 1 — Feb 2026)
- Landing page (`/`) with 7 sections per design brief: Hero, Voice (info gathering), Specific Challenge, Affirmation + email capture, Expertise to share, 4 Pillars, Footer.
- Three popup dialogs (Shadcn) with multi-step progress indicators:
  - **Email capture** (used for "Make my voice matter" + "Be one of the first to know") — 2 steps
  - **Specific Challenge** — 4 steps (situation → approaches → time/budget → contact)
  - **Share Expertise** — 4 steps (expertise items → problems → willingness → contact); supports up to 10 expertise items + 10 problems each
- All forms write directly to Supabase via `@supabase/supabase-js`:
  - `alumni_profiles` (upsert by email)
  - `engagement_entries`
  - `priorities`
  - `expertise`
  - `consent`
- Privacy/consent messaging on every form. Optional opt-in to share with Central Office.
- `/login` — env-based credential check.
- `/dashboard` — protected admin view with Shadcn Tabs + Tables, search, refresh, stat cards across all 5 tables.
- SQL migration script at `/app/supabase/schema.sql` — must be run in Supabase SQL editor before forms are functional.

## Backlog (deferred)
- **P0** — Run `/app/supabase/schema.sql` inside the Supabase SQL editor (user action).
- **P1** — Onsite quick survey for the initial rollout touchpoint (Phase 6).
- **P1** — Replace browser-side admin auth with Supabase Auth (proper RLS roles for SELECT).
- **P2** — Vercel deploy config + Railway backend skeleton.
- **P2** — CRM data management backend/frontend (Phase 7).
- **P2** — Email transactional flow (currently disabled per user — "no emails for phase 1").
- **P3** — Playwright PDF report generation.
