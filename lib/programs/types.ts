export type ProgramType = 'gym' | 'run'
export type RunGoal    = '5k' | '10k' | 'half_marathon' | 'marathon'
export type Variant    = 'A' | 'B' | 'C'

export interface GymExercise {
  name:    string
  sets:    number
  reps:    string
  weight:  string
  rest:    number   // seconds
}

export interface GymWorkout {
  variant:  Variant
  focus:    string
  exercises: GymExercise[]
}

export interface GymDay {
  dow:      string   // 'LUNES' | 'MARTES' etc.
  muscle:   string   // 'Pecho – Hombro – Trícep'
  isRest:   boolean
  workouts: GymWorkout[]
}

// ── RUN ──────────────────────────────────────────────────────────────────────

export interface RunSession {
  variant:     Variant
  type:        string    // 'EASY' | 'SERIES 400m' | 'TEMPO' etc.
  description: string
  distanceKm:  number
  durationMin: number
  pacePerKm:   string
  intensity:   string
  notes:       string
}

export interface RunDay {
  dow:      string
  isRest:   boolean
  sessions: RunSession[]
}

export interface RunProgram {
  goal:    RunGoal
  label:   string
  days:    RunDay[]
}
