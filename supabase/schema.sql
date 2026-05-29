-- ============================================================
-- SOLO LEVELING SYSTEM — Supabase Schema
-- ============================================================

-- Enable Row Level Security
alter table if exists public.users enable row level security;

-- Users table (linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  player_name text default 'Seeker',
  current_rank text default 'E',
  overall_level integer default 0,
  job_class text default null,
  gold integer default 0,
  stat_points integer default 0,
  schema_version integer default 2,
  joined_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pillars
create table if not exists public.pillars (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pillar text check (pillar in ('deen','body','money')) not null,
  level integer default 0,
  xp integer default 0,
  streak integer default 0,
  active_debuff jsonb default null,
  shadows_unlocked text[] default '{}',
  updated_at timestamptz default now(),
  unique(user_id, pillar)
);

-- Stats
create table if not exists public.stats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  strength integer default 10,
  agility integer default 10,
  intelligence integer default 10,
  sense integer default 10,
  health integer default 10,
  mana integer default 10,
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Daily Quests (regenerated each day)
create table if not exists public.daily_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_id text not null,
  unique_id text not null,
  title text not null,
  description text,
  pillar text check (pillar in ('deen','body','money')) not null,
  xp integer default 0,
  base_xp integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  quest_date date not null,
  tags text[] default '{}',
  estimated_minutes integer default 0,
  updated_at timestamptz default now(),
  unique(user_id, unique_id)
);

-- Level Quests (one-time milestones)
create table if not exists public.level_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  level integer not null,
  rank text not null,
  title text not null,
  description text,
  completed boolean default false,
  completed_at timestamptz,
  activated_at timestamptz default now(),
  reward_gold integer default 0,
  reward_stat_points integer default 0,
  reward_rank_up text,
  reward_job_change text,
  reward_shadow_unlock text,
  system_message text,
  updated_at timestamptz default now(),
  unique(user_id, level)
);

-- Level Quest Sub-quests
create table if not exists public.level_quest_steps (
  id uuid default gen_random_uuid() primary key,
  level_quest_id uuid references public.level_quests(id) on delete cascade not null,
  step_id text not null,
  title text not null,
  description text,
  pillar text check (pillar in ('deen','body','money')) not null,
  xp integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  updated_at timestamptz default now()
);

-- Weekly Dungeons
create table if not exists public.weekly_dungeons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_id text not null,
  pillar text check (pillar in ('deen','body','money')) not null,
  title text not null,
  description text,
  xp integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  bonus_claimed boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, week_id, pillar)
);

-- Weekly Dungeon Steps
create table if not exists public.weekly_dungeon_steps (
  id uuid default gen_random_uuid() primary key,
  dungeon_id uuid references public.weekly_dungeons(id) on delete cascade not null,
  step_id text not null,
  text text not null,
  completed boolean default false,
  updated_at timestamptz default now()
);

-- Redemption Quests
create table if not exists public.redemption_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_template_id text not null,
  title text not null,
  description text,
  required_days integer not null,
  completed boolean default false,
  completed_at timestamptz,
  reward_gold integer default 0,
  reward_stat_points integer default 0,
  system_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Shadows
create table if not exists public.shadows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  shadow_id text not null,
  name text not null,
  description text,
  grade text not null,
  pillar text not null,
  passive_bonus numeric default 0,
  effect text,
  special text,
  extracted_at timestamptz default now(),
  unique(user_id, shadow_id)
);

-- Job Changes
create table if not exists public.job_changes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id text not null,
  name text not null,
  rank text not null,
  level_required integer not null,
  description text,
  completed boolean default false,
  completed_at timestamptz,
  reward_gold integer default 0,
  reward_stat_points integer default 0,
  title text,
  updated_at timestamptz default now(),
  unique(user_id, job_id)
);

-- Job Change Steps
create table if not exists public.job_change_steps (
  id uuid default gen_random_uuid() primary key,
  job_change_id uuid references public.job_changes(id) on delete cascade not null,
  step_id text not null,
  text text not null,
  completed boolean default false,
  updated_at timestamptz default now()
);

-- Custom Quests
create table if not exists public.custom_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_id text not null,
  title text not null,
  description text,
  xp integer default 10,
  pillar text check (pillar in ('deen','body','money')) not null,
  alignment_status text,
  justification text,
  last_completed date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Purchase History
create table if not exists public.purchased_rewards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reward_id text not null,
  name text not null,
  cost integer not null,
  category text,
  description text,
  unlock_rank text,
  rarity text,
  purchased_at timestamptz default now()
);

-- Quest History
create table if not exists public.history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  quest_id text,
  title text not null,
  pillar text,
  xp integer default 0,
  gold integer default 0,
  completed_at timestamptz default now()
);

-- System Messages
create table if not exists public.system_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  subtitle text,
  message text,
  created_at timestamptz default now()
);

-- RLS Policies: Users can only access their own data
-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Pillars
create policy "Users can manage own pillars"
  on public.pillars for all
  using (auth.uid() = user_id);

-- Stats
create policy "Users can manage own stats"
  on public.stats for all
  using (auth.uid() = user_id);

-- Daily Quests
create policy "Users can manage own daily quests"
  on public.daily_quests for all
  using (auth.uid() = user_id);

-- Level Quests
create policy "Users can manage own level quests"
  on public.level_quests for all
  using (auth.uid() = user_id);

-- Weekly Dungeons
create policy "Users can manage own dungeons"
  on public.weekly_dungeons for all
  using (auth.uid() = user_id);

-- Redemption Quests
create policy "Users can manage own redemption quests"
  on public.redemption_quests for all
  using (auth.uid() = user_id);

-- Shadows
create policy "Users can manage own shadows"
  on public.shadows for all
  using (auth.uid() = user_id);

-- Job Changes
create policy "Users can manage own job changes"
  on public.job_changes for all
  using (auth.uid() = user_id);

-- Custom Quests
create policy "Users can manage own custom quests"
  on public.custom_quests for all
  using (auth.uid() = user_id);

-- Purchased Rewards
create policy "Users can manage own rewards"
  on public.purchased_rewards for all
  using (auth.uid() = user_id);

-- History
create policy "Users can manage own history"
  on public.history for all
  using (auth.uid() = user_id);

-- System Messages
create policy "Users can manage own system messages"
  on public.system_messages for all
  using (auth.uid() = user_id);

-- Functions
-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
-- Profiles
create trigger if not exists handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Pillars
create trigger if not exists handle_pillars_updated_at
  before update on public.pillars
  for each row execute procedure public.handle_updated_at();

-- Stats
create trigger if not exists handle_stats_updated_at
  before update on public.stats
  for each row execute procedure public.handle_updated_at();

-- Daily Quests
create trigger if not exists handle_daily_quests_updated_at
  before update on public.daily_quests
  for each row execute procedure public.handle_updated_at();

-- Level Quests
create trigger if not exists handle_level_quests_updated_at
  before update on public.level_quests
  for each row execute procedure public.handle_updated_at();

-- Weekly Dungeons
create trigger if not exists handle_weekly_dungeons_updated_at
  before update on public.weekly_dungeons
  for each row execute procedure public.handle_updated_at();

-- Job Changes
create trigger if not exists handle_job_changes_updated_at
  before update on public.job_changes
  for each row execute procedure public.handle_updated_at();

-- Custom Quests
create trigger if not exists handle_custom_quests_updated_at
  before update on public.custom_quests
  for each row execute procedure public.handle_updated_at();

-- ============================================================
-- MIGRATION 2026-05-29: Full-state sync + missing tables
-- Run this section if your project was created before today
-- ============================================================

-- Add missing columns to profiles
alter table public.profiles
  add column if not exists flow_state jsonb default null,
  add column if not exists last_quest_date date default null,
  add column if not exists last_active_date date default null;

-- State snapshots (guaranteed full-state backup, no data loss)
create table if not exists public.state_snapshots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  snapshot jsonb not null,
  updated_at timestamptz default now(),
  unique(user_id)
);

create policy "Users can manage own state snapshots"
  on public.state_snapshots for all
  using (auth.uid() = user_id);

create trigger if not exists handle_state_snapshots_updated_at
  before update on public.state_snapshots
  for each row execute procedure public.handle_updated_at();

-- AI Dungeons
create table if not exists public.ai_dungeons (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  dungeon_id text not null,
  title text not null,
  description text,
  pillar text check (pillar in ('deen','body','money')) not null,
  difficulty text,
  steps jsonb default '[]',
  completed boolean default false,
  completed_at timestamptz,
  reward_gold integer default 0,
  reward_xp integer default 0,
  reward_shadow_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, dungeon_id)
);

create policy "Users can manage own ai dungeons"
  on public.ai_dungeons for all
  using (auth.uid() = user_id);

create trigger if not exists handle_ai_dungeons_updated_at
  before update on public.ai_dungeons
  for each row execute procedure public.handle_updated_at();

-- Add unique constraints for reliable upserts
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'unique_redemption_quest'
  ) then
    alter table public.redemption_quests add constraint unique_redemption_quest unique (user_id, quest_template_id);
  end if;
end $$;
