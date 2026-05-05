-- 003_onboarding_v2.sql
-- Adds fields required by the v2 onboarding flow

alter table public.users
  -- Programa principal
  add column if not exists program_type text,

  -- GYM específico
  add column if not exists gym_goal        text,
  add column if not exists priority_muscles text[] not null default '{}',

  -- RUN específico
  add column if not exists run_distance text,
  add column if not exists run_race_date date,
  add column if not exists run_weekly_km text,
  add column if not exists run_level     text,

  -- HYROX específico
  add column if not exists hyrox_experience              text,
  add column if not exists hyrox_race_date               date,
  add column if not exists hyrox_last_time               interval,
  add column if not exists hyrox_target_time             interval,
  add column if not exists hyrox_weak_stations           text[] not null default '{}',
  add column if not exists hyrox_strength_cardio_balance integer,

  -- Lesiones
  add column if not exists injury_notes             text,
  add column if not exists low_intensity_preference boolean not null default false,

  -- Preferencias de sesión
  add column if not exists preferred_time    text,
  add column if not exists session_duration  text;

-- injuries column already exists as text[] from migration 001
-- training_days already exists
-- level already exists (reused for gym_level / run_level depending on program_type)
