-- ============================================================================
-- 002 — subscription plans, per-asset map, IT audit checklists
-- Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================================

-- ── Plans ──────────────────────────────────────────────────────────────────
-- Activated by the platform operator after payment (Table Editor →
-- organizations → plan). New organisations start on the free trial.
alter table public.organizations
  add column if not exists plan text not null default 'trial';

alter table public.organizations
  drop constraint if exists organizations_plan_check;
alter table public.organizations
  add constraint organizations_plan_check
  check (plan in ('trial', 'starter', 'business', 'enterprise'));

alter table public.organizations
  add column if not exists plan_renews_at timestamptz;

-- ── Per-asset map ──────────────────────────────────────────────────────────
-- Which real host each finding affects. The host identifier is AES-256-GCM
-- ciphertext written by the backend; only the server can decrypt it, and only
-- for organisation admins. No RLS policies: browsers can never read this table.
create table if not exists public.report_assets (
  id              bigint generated always as identity primary key,
  report_id       uuid not null references public.reports (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  finding_id      text not null,
  label           text not null,
  host_enc        text not null,
  port            text,
  protocol        text,
  created_at      timestamptz not null default now()
);

create index if not exists report_assets_report_idx
  on public.report_assets (report_id);

alter table public.report_assets enable row level security;

-- ── IT audit checklists ────────────────────────────────────────────────────
create table if not exists public.audits (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  framework       text not null,
  title           text not null,
  answers         jsonb not null default '{}'::jsonb,
  score           int,
  status          text not null default 'draft' check (status in ('draft', 'completed')),
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  completed_at    timestamptz
);

create index if not exists audits_organization_created_idx
  on public.audits (organization_id, created_at desc);

alter table public.audits enable row level security;

-- Verified members read their organisation's audits; writes go through the
-- server (service role) after an admin check.
drop policy if exists audits_select on public.audits;
create policy audits_select on public.audits
  for select to authenticated
  using (organization_id = public.current_verified_org_id());
