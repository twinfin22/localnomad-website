-- =============================================================================
-- Phase 1-4: Auth Tables — Profiles, User Visas, Checklist Items
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- 1. Profiles
-- Auto-created via trigger when a user signs up (auth.users → profiles).
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_locale text check (preferred_locale in ('en', 'ja', 'zh-tw', 'vi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. User Visas
-- Tracks which visa a user is monitoring. is_active = true for the current one.
create table if not exists public.user_visas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  country text not null check (country in ('kr', 'tw')),
  visa_type text not null,
  expiry_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_visas enable row level security;

create policy "Users can read own visas"
  on public.user_visas for select
  using (auth.uid() = user_id);

create policy "Users can insert own visas"
  on public.user_visas for insert
  with check (auth.uid() = user_id);

create policy "Users can update own visas"
  on public.user_visas for update
  using (auth.uid() = user_id);

create policy "Users can delete own visas"
  on public.user_visas for delete
  using (auth.uid() = user_id);

create index idx_user_visas_user_active on public.user_visas(user_id, is_active)
  where is_active = true;

-- 3. Checklist Items
-- Per-document toggle state, linked to a user_visa.
create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_visa_id uuid not null references public.user_visas(id) on delete cascade,
  document_id text not null,
  checked boolean not null default false,
  checked_at timestamptz,
  unique (user_visa_id, document_id)
);

alter table public.checklist_items enable row level security;

create policy "Users can read own checklist items"
  on public.checklist_items for select
  using (
    exists (
      select 1 from public.user_visas
      where user_visas.id = checklist_items.user_visa_id
        and user_visas.user_id = auth.uid()
    )
  );

create policy "Users can insert own checklist items"
  on public.checklist_items for insert
  with check (
    exists (
      select 1 from public.user_visas
      where user_visas.id = checklist_items.user_visa_id
        and user_visas.user_id = auth.uid()
    )
  );

create policy "Users can update own checklist items"
  on public.checklist_items for update
  using (
    exists (
      select 1 from public.user_visas
      where user_visas.id = checklist_items.user_visa_id
        and user_visas.user_id = auth.uid()
    )
  );

create index idx_checklist_items_visa on public.checklist_items(user_visa_id);

-- 4. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_user_visas_updated_at
  before update on public.user_visas
  for each row execute function public.update_updated_at();
