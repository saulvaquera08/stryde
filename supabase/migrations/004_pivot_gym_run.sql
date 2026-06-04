-- ============================================================================
-- Migration 004: Pivot to GYM + RUN only (remove HYROX)
-- ============================================================================

-- 1A — Truncate workout/plan data (preserve users & auth)
TRUNCATE TABLE completed_workouts CASCADE;
TRUNCATE TABLE workouts CASCADE;
TRUNCATE TABLE plans CASCADE;
TRUNCATE TABLE goals CASCADE;

-- 1B — Replace goal_type enum (remove hyrox, add half_marathon/marathon/general_fitness)
ALTER TYPE goal_type RENAME TO goal_type_old;

CREATE TYPE goal_type AS ENUM (
  '5k',
  '10k',
  'half_marathon',
  'marathon',
  'strength',
  'recomp',
  'general_fitness'
);

ALTER TABLE goals
  ALTER COLUMN type TYPE goal_type
  USING type::text::goal_type;

DROP TYPE goal_type_old;

-- 1C — Add new user columns for the pivot
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_half_marathon_time TEXT,
  ADD COLUMN IF NOT EXISTS current_marathon_time TEXT,
  ADD COLUMN IF NOT EXISTS program_type TEXT CHECK (program_type IN ('gym', 'run')),
  ADD COLUMN IF NOT EXISTS gym_split TEXT CHECK (gym_split IN ('ppl', 'upper_lower', 'full_body'));

-- Drop HYROX-specific columns if they exist
ALTER TABLE users DROP COLUMN IF EXISTS hyrox_experience;
ALTER TABLE users DROP COLUMN IF EXISTS hyrox_race_date;
ALTER TABLE users DROP COLUMN IF EXISTS hyrox_weak_stations;
ALTER TABLE users DROP COLUMN IF EXISTS hyrox_strength_cardio_balance;
