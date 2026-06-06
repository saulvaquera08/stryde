-- ─── Tabla users: guardar la configuración del mix ───────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS secondary_program_days INTEGER NOT NULL DEFAULT 0
    CHECK (secondary_program_days >= 0 AND secondary_program_days <= 3),
  ADD COLUMN IF NOT EXISTS is_mixed_program BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN users.secondary_program_days IS
  'Número de días del programa secundario (0 = pure GYM o pure RUN, 1-3 = mix)';
COMMENT ON COLUMN users.is_mixed_program IS
  'true cuando el usuario combina GYM + RUN en el mismo plan';

-- ─── Tabla workouts: identificar días primarios vs secundarios ───────────────
ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS is_secondary_program BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN workouts.is_secondary_program IS
  'true si este workout pertenece al programa complementario (no al principal)';

-- ─── Índice para consultas por programa en el dashboard ─────────────────────
CREATE INDEX IF NOT EXISTS idx_workouts_secondary
  ON workouts (user_id, is_secondary_program, scheduled_date);
