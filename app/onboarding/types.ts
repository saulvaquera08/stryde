export type GoalType =
  | '5k'
  | '10k'
  | 'half_marathon'
  | 'marathon'
  | 'strength'
  | 'recomp'
  | 'general_fitness'

export type ProgramType   = 'gym' | 'run'
export type GymSplitType  = 'ppl' | 'upper_lower' | 'full_body'
export type LevelType     = 'beginner' | 'intermediate' | 'advanced'
export type EquipmentType = 'full_gym' | 'basic_gym' | 'home' | 'none'

export interface GoalSelection {
  type: GoalType
  race_date?: string
}

export interface OnboardingData {
  // Step 1 — Nombre
  first_name: string
  last_name:  string

  // Step 2 — Programa
  program_type: ProgramType | ''

  // Step 3A — GYM específico
  gym_goal:  'strength' | 'recomp' | 'general_fitness' | ''
  gym_split: GymSplitType | ''

  // Step 3B — RUN específico
  run_goal:              '5k' | '10k' | 'half_marathon' | 'marathon' | ''
  run_race_date:         string
  current_5k_time:       string
  current_10k_time:      string
  current_hm_time:       string
  current_marathon_time: string

  // Step 4 — Datos físicos
  age:    string
  weight: string
  height: string

  // Step 5 — Horario
  level:         LevelType | ''
  training_days: string[]
  equipment:     EquipmentType | ''

  // Step 6 — Limitaciones (opcional)
  injuries: string[]

  // Computed para el plan generator
  goals: GoalSelection[]
}
