-- =============================================================================
-- QChinese — Direct Browser-to-Supabase Cloud Schema & Row Level Security
-- Architecture aligned with QEnglish & TKB (Supabase Auth + PostgREST RLS + Realtime WSS)
--
-- 100% ISOLATED: All tables use the `qchinese_*` prefix so running this in the
-- shared Supabase project causes ZERO collisions with QEnglish or TKB tables!
-- =============================================================================

-- 1. User Profiles (authenticated via Supabase Auth `auth.users`)
create table if not exists public.qchinese_user_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default 'Học viên QChinese',
    email text not null default '',
    avatar text not null default '练',
    hsk_level integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.qchinese_user_profiles enable row level security;

drop policy if exists "QChinese users select own profile" on public.qchinese_user_profiles;
create policy "QChinese users select own profile"
on public.qchinese_user_profiles for select
using (auth.uid() = user_id);

drop policy if exists "QChinese users insert own profile" on public.qchinese_user_profiles;
create policy "QChinese users insert own profile"
on public.qchinese_user_profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "QChinese users update own profile" on public.qchinese_user_profiles;
create policy "QChinese users update own profile"
on public.qchinese_user_profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "QChinese users delete own profile" on public.qchinese_user_profiles;
create policy "QChinese users delete own profile"
on public.qchinese_user_profiles for delete
using (auth.uid() = user_id);

-- 2. Complete Isolated Learning Workspace Snapshots (Real-time Sync across Laptop & Phone)
create table if not exists public.qchinese_user_snapshots (
    user_id uuid primary key references auth.users(id) on delete cascade,
    revision bigint not null default 1,
    device_id text not null default '',
    device_name text not null default 'Web Browser',
    state_json jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.qchinese_user_snapshots enable row level security;

drop policy if exists "QChinese users select own snapshot" on public.qchinese_user_snapshots;
create policy "QChinese users select own snapshot"
on public.qchinese_user_snapshots for select
using (auth.uid() = user_id);

drop policy if exists "QChinese users insert own snapshot" on public.qchinese_user_snapshots;
create policy "QChinese users insert own snapshot"
on public.qchinese_user_snapshots for insert
with check (auth.uid() = user_id);

drop policy if exists "QChinese users update own snapshot" on public.qchinese_user_snapshots;
create policy "QChinese users update own snapshot"
on public.qchinese_user_snapshots for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "QChinese users delete own snapshot" on public.qchinese_user_snapshots;
create policy "QChinese users delete own snapshot"
on public.qchinese_user_snapshots for delete
using (auth.uid() = user_id);

-- 3. Multi-Device Active Sessions Registry (concurrent logins + remote device sign-out)
create table if not exists public.qchinese_user_devices (
    user_id uuid not null references auth.users(id) on delete cascade,
    device_id text not null,
    device_name text not null default 'Web Browser',
    platform text not null default 'web',
    user_agent text not null default '',
    is_revoked boolean not null default false,
    last_seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    primary key (user_id, device_id)
);

create index if not exists idx_qchinese_user_devices_last_seen
    on public.qchinese_user_devices (user_id, last_seen_at desc);

alter table public.qchinese_user_devices enable row level security;

drop policy if exists "QChinese users manage own devices" on public.qchinese_user_devices;
create policy "QChinese users manage own devices"
on public.qchinese_user_devices for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 4. Public Shared AI-Generated Exercises (Community Pool shared across all accounts, while progress stays 100% per-account!)
create table if not exists public.qchinese_shared_exercises (
    id text primary key,
    hsk_level integer not null default 1,
    lesson_num integer not null default 1,
    skill text not null,
    author_user_id uuid references auth.users(id) on delete set null,
    author_name text not null default 'Học viên QChinese',
    is_public boolean not null default true,
    exercise_json jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_qchinese_shared_ex_lookup
    on public.qchinese_shared_exercises (hsk_level, lesson_num, skill, created_at asc);

alter table public.qchinese_shared_exercises enable row level security;

drop policy if exists "QChinese everyone reads public shared exercises" on public.qchinese_shared_exercises;
create policy "QChinese everyone reads public shared exercises"
on public.qchinese_shared_exercises for select
using (is_public = true);

drop policy if exists "QChinese authenticated users publish shared exercises" on public.qchinese_shared_exercises;
create policy "QChinese authenticated users publish shared exercises"
on public.qchinese_shared_exercises for insert
with check (auth.uid() is not null and (author_user_id is null or author_user_id = auth.uid()));

drop policy if exists "QChinese authors delete own shared exercises" on public.qchinese_shared_exercises;
create policy "QChinese authors delete own shared exercises"
on public.qchinese_shared_exercises for delete
using (auth.uid() = author_user_id);

-- 5. Enable Supabase Realtime (CDC WebSocket Push) on QChinese multi-device & shared tables
alter table public.qchinese_user_snapshots replica identity full;
alter table public.qchinese_user_devices replica identity full;
alter table public.qchinese_shared_exercises replica identity full;

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'qchinese_user_snapshots'
    ) then
        alter publication supabase_realtime add table public.qchinese_user_snapshots;
    end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'qchinese_user_devices'
    ) then
        alter publication supabase_realtime add table public.qchinese_user_devices;
    end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'qchinese_shared_exercises'
    ) then
        alter publication supabase_realtime add table public.qchinese_shared_exercises;
    end if;
end $$;

-- 6. Explicit least-privilege table grants
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on table
    public.qchinese_user_profiles,
    public.qchinese_user_snapshots,
    public.qchinese_user_devices
to authenticated;
grant select, insert, delete on table public.qchinese_shared_exercises to authenticated;
grant select on table public.qchinese_shared_exercises to anon;
