-- Fix upsert: completed_workouts needs a unique constraint on (workout_id, user_id)
alter table public.completed_workouts
  add constraint completed_workouts_workout_user_unique unique (workout_id, user_id);

-- Expand rating range from 1-5 to 1-10 (difficulty scale)
alter table public.completed_workouts
  drop constraint if exists completed_workouts_rating_check;
alter table public.completed_workouts
  add constraint completed_workouts_rating_check check (rating between 1 and 10);

-- Track actual workout duration in seconds
alter table public.completed_workouts
  add column if not exists duration_seconds integer check (duration_seconds > 0);
