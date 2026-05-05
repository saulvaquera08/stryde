export type ProgramType = 'gym' | 'run' | 'hyrox'

// GYM
export type GymGoal      = 'strength' | 'hypertrophy' | 'recomp' | 'general'
export type GymLevel     = 'beginner' | 'intermediate' | 'advanced'
export type EquipmentType = 'full_gym' | 'basic_gym' | 'home'
export type MuscleGroup  = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core'

// RUN
export type RunDistance = '5k' | '10k' | '15k' | '21k' | '42k'
export type RunLevel    = 'beginner' | 'intermediate' | 'advanced'

// HYROX
export type HyroxExperience = 'never' | 'once_twice' | 'multiple'
export type HyroxStation    = 'skierg' | 'sled_push' | 'sled_pull' | 'burpee_broad' | 'rowing' | 'farmer_carry' | 'sandbag_lunges' | 'wall_balls' | 'running'
export type StrengthCardioBalance = 1 | 2 | 3 | 4 | 5

// Shared
export type PreferredTime   = 'morning' | 'afternoon' | 'evening' | 'flexible'
export type SessionDuration = '45' | '60' | '75' | '90' | '90+'
export type InjuryZone      = 'knee_right' | 'knee_left' | 'hip' | 'lower_back' | 'shoulder_right' | 'shoulder_left' | 'elbow_wrist' | 'neck' | 'ankle_foot' | 'none'

export interface OnboardingData {
  // Paso 1
  first_name: string
  last_name:  string

  // Paso 2
  program_type: ProgramType | ''

  // Paso 3 — GYM
  gym_goal:        GymGoal | ''
  gym_level:       GymLevel | ''
  equipment:       EquipmentType | ''
  priority_muscles: MuscleGroup[]

  // Paso 3 — RUN
  run_distance:         RunDistance | ''
  run_race_date:        string   // ISO date or ''
  run_no_date:          boolean
  run_current_5k_time:  string   // MM:SS
  run_current_10k_time: string   // MM:SS
  run_weekly_km:        string   // '0-10' | '10-20' | '20-35' | '35-50' | '50+'
  run_level:            RunLevel | ''

  // Paso 3 — HYROX
  hyrox_experience:             HyroxExperience | ''
  hyrox_race_date:              string  // ISO date or ''
  hyrox_no_date:                boolean
  hyrox_last_time:              string  // H:MM:SS
  hyrox_target_time:            string  // H:MM:SS
  hyrox_weak_stations:          HyroxStation[]
  hyrox_strength_cardio_balance: StrengthCardioBalance | null

  // Paso 4
  age:    string
  weight: string
  height: string

  // Paso 5
  injuries:                 InjuryZone[]
  injury_notes:             string
  low_intensity_preference: boolean

  // Paso 6
  training_days:   string[]
  preferred_time:  PreferredTime | ''
  session_duration: SessionDuration | ''
}
