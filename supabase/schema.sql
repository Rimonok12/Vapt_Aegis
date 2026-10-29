-- ============================================================================
-- Aegis Compliance Portal — Supabase schema
-- ----------------------------------------------------------------------------
-- NOTE: this file mirrors the schema already applied in the Supabase project
-- (kept here as the source of truth for new environments). Safe to re-run on a
-- fresh project; on an existing one, review before applying.
--
-- Security model:
--   * Clients (browsers) only ever READ through the publishable key. Row Level
--     Security confines every row to the caller's verified organisation.
--   * All writes (signup profile bootstrap, NID verification, report rows,
--     role changes, backend ingest updates) go through the service-role key
--     from the Next.js server or the FastAPI backend, which bypasses RLS.
-- ============================================================================

-- ── Enums ──────────────────────────────────────────────────────────────────
-- Postgres has no `create type if not exists`; guard each enum instead.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role' and typnamespace = 'public'::regnamespace) then
    create type public.user_role as enum ('client', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'report_status' and typnamespace = 'public'::regnamespace) then
    create type public.report_status as enum ('processing', 'ready', 'failed');
  end if;
  if not exists (select 1 from pg_type where typname = 'scan_source' and typnamespace = 'public'::regnamespace) then
    create type public.scan_source as enum ('nessus', 'nmap', 'json');
  end if;
end
$$;

-- ── Organisations (tenants) ────────────────────────────────────────────────
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ── Profiles (1:1 with auth.users) ─────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  email           text,
  full_name       text not null default '',
  role            public.user_role not null default 'client',
  nid_verified    boolean not null default false,
  nid_verified_at timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_organization_id_idx
  on public.profiles (organization_id);

-- ── Reports ────────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  title             text not null,
  source            public.scan_source not null,
  original_filename text,
  status            public.report_status not null default 'processing',
  risk_score        int,
  severity_counts   jsonb not null default '{"critical":0,"high":0,"medium":0,"low":0,"info":0}'::jsonb,
  asset_count       int not null default 0,
  findings          jsonb not null default '[]'::jsonb,
  ai_report         jsonb,
  ai_model          text,
  error             text,
  scanned_at        timestamptz,
  created_by        uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now(),
  completed_at      timestamptz
);

create index if not exists reports_organization_created_idx
  on public.reports (organization_id, created_at desc);

-- ── NID verification attempts (rate-limit / audit trail) ───────────────────
create table if not exists public.nid_verification_attempts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  succeeded  boolean not null,
  reason     text,
  created_at timestamptz not null default now()
);

create index if not exists nid_attempts_user_created_idx
  on public.nid_verification_attempts (user_id, created_at desc);

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── Helper: the caller's verified organisation ─────────────────────────────
-- SECURITY DEFINER so the RLS policies below can read profiles without
-- recursing into the profiles policy itself. Returns NULL (denies everything)
-- unless the caller's profile is NID-verified and belongs to an organisation.
create or replace function public.current_verified_org_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select p.organization_id
  from public.profiles p
  where p.id = (select auth.uid())
    and p.nid_verified = true;
$$;

revoke all on function public.current_verified_org_id() from anon;
grant execute on function public.current_verified_org_id() to authenticated;

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.nid_verification_attempts enable row level security;

-- Clients may see their own organisation once verified.
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
  for select to authenticated
  using (id = public.current_verified_org_id());

-- Clients may see their own profile, and — when verified — the whole of the
-- rest of their organisation (the admin console lists members).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or organization_id = public.current_verified_org_id()
  );

-- Verified members see only their organisation's reports.
drop policy if exists reports_select on public.reports;
create policy reports_select on public.reports
  for select to authenticated
  using (organization_id = public.current_verified_org_id());

-- Audit attempts are private to the user who made them.
drop policy if exists nid_attempts_select on public.nid_verification_attempts;
create policy nid_attempts_select on public.nid_verification_attempts
  for select to authenticated
  using (user_id = (select auth.uid()));

-- No insert/update/delete policies on purpose: every write path in the app
-- uses the service-role key (which bypasses RLS) from server code only.

-- Later migrations live in supabase/migrations/ (run them in order).
