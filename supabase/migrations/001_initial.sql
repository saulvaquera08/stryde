-- STRYDE — Initial Schema
-- Run against your Supabase project via the SQL editor or `supabase db push`

-- ─── Enums ─────────────────────────────────────────────────────────────────

create type goal_type as enum ('hyrox', '21k', '5k', '10k', 'strength', 'recomp');
create type intensity_level as enum ('low', 'moderate', 'high');

-- ─── Users profile (extends auth.users) ────────────────────────────────────

create table public.users (
  id              uuid primary key references auth.users(id) on delete cascade,
  age             integer,
  weight          numeric(5,2),            -- kg
  height          numeric(5,2),            -- cm
  level           text,                     -- 'beginner' | 'intermediate' | 'advanced'
  available_days  integer[],               -- e.g. [1,2,4,6] (0=Sun ... 6=Sat)
  equipment       text[],                  -- e.g. ['barbell','dumbbells','sled']
  injuries        text[],                  -- free-text injury notes
  current_5k_time interval,               -- e.g. '00:25:00'
  current_10k_time interval,              -- e.g. '00:55:00'
  created_at      timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read/write own profile"
  on public.users for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ─── Goals ─────────────────────────────────────────────────────────────────

create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        goal_type not null,
  race_date   date,
  priority    integer not null default 1,  -- 1 = primary, 2+ = secondary
  created_at  timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Plans ─────────────────────────────────────────────────────────────────

create table public.plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  start_date   date not null,
  end_date     date not null,
  total_weeks  integer not null,
  structure    jsonb not null default '{}',  -- full AI-generated plan metadata
  created_at   timestamptz not null default now()
);

alter table public.plans enable row level security;

create policy "Users can manage own plans"
  on public.plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Workouts ──────────────────────────────────────────────────────────────

create table public.workouts (
  id                uuid primary key default gen_random_uuid(),
  plan_id           uuid not null references public.plans(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  scheduled_date    date not null,
  week_number       integer not null,
  day_type          text not null,           -- e.g. 'Strength Lower + Intervals'
  blocks            jsonb not null default '[]',  -- array of block objects
  duration_minutes  integer,
  intensity         intensity_level not null,
  goals_tags        text[] not null default '{}',
  is_rest_day       boolean not null default false
);

create index workouts_user_date_idx on public.workouts (user_id, scheduled_date);
create index workouts_plan_idx on public.workouts (plan_id);

alter table public.workouts enable row level security;

create policy "Users can manage own workouts"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Completed Workouts ────────────────────────────────────────────────────

create table public.completed_workouts (
  id           uuid primary key default gen_random_uuid(),
  workout_id   uuid not null references public.workouts(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  completed_at timestamptz not null default now(),
  rating       integer check (rating between 1 and 5),
  notes        text,
  metrics      jsonb not null default '{}'   -- e.g. {pace, avg_hr, sets_logged}
);

create index completed_workouts_user_idx on public.completed_workouts (user_id, completed_at desc);

alter table public.completed_workouts enable row level security;

create policy "Users can manage own completed workouts"
  on public.completed_workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Auto-create user profile on signup ────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
