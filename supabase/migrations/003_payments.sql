-- 003 · Card payments (shurjoPay)
--
-- One row per checkout attempt. Rows are written only by the server with the
-- service role after shurjoPay confirms the payment server-to-server; members
-- of a verified organisation may read their own organisation's history.
-- Safe to run more than once.

create table if not exists public.payments (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references public.organizations (id) on delete cascade,
  plan              text not null check (plan in ('starter', 'business', 'enterprise')),
  amount_bdt        numeric(12, 2) not null check (amount_bdt > 0),
  provider          text not null default 'shurjopay',
  customer_order_id text not null unique,
  provider_order_id text unique,
  status            text not null default 'initiated'
                      check (status in ('initiated', 'paid', 'failed', 'cancelled')),
  method            text,
  bank_trx_id       text,
  created_by        uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create index if not exists payments_organization_created_idx
  on public.payments (organization_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists payments_select on public.payments;
create policy payments_select on public.payments
  for select to authenticated
  using (organization_id = public.current_verified_org_id());
