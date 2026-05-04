-- =====================================================================
-- Delt Alumni Excellence Center — Phase 1 Schema
-- Run this in Supabase SQL Editor.
-- Tables follow the Phase 1 minimum spec from the project brief, extended
-- only enough to capture the fields collected by the two popup forms.
-- =====================================================================

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- =====================================================================
-- alumni_profiles
-- One row per alumnus (deduplicated by email)
-- =====================================================================
create table if not exists public.alumni_profiles (
    id                uuid primary key default gen_random_uuid(),
    first_name        text,
    last_name         text,
    email             text not null unique,
    phone             text,
    university        text,
    chapter           text,
    greek_designation text,
    grad_year         integer,
    linkedin          text,
    city              text,
    country           text,
    created_at        timestamptz not null default now()
);

create index if not exists alumni_profiles_email_idx on public.alumni_profiles (email);
create index if not exists alumni_profiles_created_at_idx on public.alumni_profiles (created_at desc);

-- =====================================================================
-- engagement_entries
-- Each interaction (visit-with-form-submit, interview, etc.)
-- =====================================================================
create table if not exists public.engagement_entries (
    id          uuid primary key default gen_random_uuid(),
    alumni_id   uuid references public.alumni_profiles(id) on delete cascade,
    source      text not null,  -- landing_page, survey, interview, referral
    stage       text not null,  -- visitor, respondent, interview, priority_list
    created_at  timestamptz not null default now()
);

create index if not exists engagement_entries_alumni_idx on public.engagement_entries (alumni_id);

-- =====================================================================
-- priorities  (data captured by the "Specific Challenge" popup)
-- =====================================================================
create table if not exists public.priorities (
    id                       uuid primary key default gen_random_uuid(),
    alumni_id                uuid references public.alumni_profiles(id) on delete cascade,
    situation_description    text,            -- Describe your situation
    why_matters              text,            -- Why does this matter now?
    desired_outcome          text,            -- What outcome are you looking for?
    approaches               jsonb,           -- ["seminar","weekend_retreat",...]
    other_approach           text,
    time_commitment          text,            -- a_day, weekend, week, etc.
    time_commitment_other    text,
    budget_expectation       text,            -- free-text expected investment
    primary_focus            text,            -- career, leadership, personal, self_employment
    current_stage            text,            -- early, mid, senior, transition
    biggest_challenge        text,
    biggest_concern_12mo     text,
    milestone                text,            -- marriage, fatherhood, job_change, etc.
    willingness_invest_money text,
    willingness_invest_time  text,
    created_at               timestamptz not null default now()
);

create index if not exists priorities_alumni_idx on public.priorities (alumni_id);

-- =====================================================================
-- expertise  (data captured by the "Share Expertise" popup)
-- =====================================================================
create table if not exists public.expertise (
    id                  uuid primary key default gen_random_uuid(),
    alumni_id           uuid references public.alumni_profiles(id) on delete cascade,
    expertise_items     jsonb,   -- [{title, description}, ...]  up to 10
    problems_to_solve   jsonb,   -- [{title, why_someone_cares}, ...]
    willing_to          jsonb,   -- {interview, future_session, connect_directly, something_else, not_sure}
    willing_other       text,
    additional_notes    text,
    expertise_area      text,    -- short summary tag
    willing_to_share    boolean default false,
    interview_interest  boolean default false,
    created_at          timestamptz not null default now()
);

create index if not exists expertise_alumni_idx on public.expertise (alumni_id);

-- =====================================================================
-- consent
-- =====================================================================
create table if not exists public.consent (
    id                        uuid primary key default gen_random_uuid(),
    alumni_id                 uuid references public.alumni_profiles(id) on delete cascade,
    program_only_consent      boolean not null default true,
    share_with_central_office boolean not null default false,
    timestamp                 timestamptz not null default now()
);

create index if not exists consent_alumni_idx on public.consent (alumni_id);

-- =====================================================================
-- Row Level Security
-- Phase 1: allow anonymous INSERTs (forms write directly from browser).
-- Reads are restricted — Phase 1 admin reads happen server-side / via
-- Supabase service-role key (NOT exposed to the browser). For the
-- Phase 1 admin dashboard we read with the anon key by also adding a
-- permissive SELECT policy below; tighten this in Phase 2 with proper
-- Supabase Auth roles.
-- =====================================================================
alter table public.alumni_profiles    enable row level security;
alter table public.engagement_entries enable row level security;
alter table public.priorities         enable row level security;
alter table public.expertise          enable row level security;
alter table public.consent            enable row level security;

-- INSERT policies (anonymous form submissions)
drop policy if exists "anon insert alumni_profiles"    on public.alumni_profiles;
drop policy if exists "anon insert engagement_entries" on public.engagement_entries;
drop policy if exists "anon insert priorities"         on public.priorities;
drop policy if exists "anon insert expertise"          on public.expertise;
drop policy if exists "anon insert consent"            on public.consent;

create policy "anon insert alumni_profiles"    on public.alumni_profiles    for insert to anon with check (true);
create policy "anon insert engagement_entries" on public.engagement_entries for insert to anon with check (true);
create policy "anon insert priorities"         on public.priorities         for insert to anon with check (true);
create policy "anon insert expertise"          on public.expertise          for insert to anon with check (true);
create policy "anon insert consent"            on public.consent            for insert to anon with check (true);

-- UPDATE policies (so we can upsert alumni_profiles by email)
drop policy if exists "anon update alumni_profiles" on public.alumni_profiles;
create policy "anon update alumni_profiles" on public.alumni_profiles for update to anon using (true) with check (true);

-- SELECT policies (Phase 1 admin dashboard reads with anon key — tighten later)
drop policy if exists "anon select alumni_profiles"    on public.alumni_profiles;
drop policy if exists "anon select engagement_entries" on public.engagement_entries;
drop policy if exists "anon select priorities"         on public.priorities;
drop policy if exists "anon select expertise"          on public.expertise;
drop policy if exists "anon select consent"            on public.consent;

create policy "anon select alumni_profiles"    on public.alumni_profiles    for select to anon using (true);
create policy "anon select engagement_entries" on public.engagement_entries for select to anon using (true);
create policy "anon select priorities"         on public.priorities         for select to anon using (true);
create policy "anon select expertise"          on public.expertise          for select to anon using (true);
create policy "anon select consent"            on public.consent            for select to anon using (true);
