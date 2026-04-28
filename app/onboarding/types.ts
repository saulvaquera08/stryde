export type GoalType = 'hyrox' | '21k' | '5k' | '10k' | 'strength' | 'recomp'
export type EquipmentType = 'full_gym' | 'basic_gym' | 'home' | 'none'
export type LevelType = 'beginner' | 'intermediate' | 'advanced'

export interface GoalSelection {
  type: GoalType
  race_date?: string
}

export interface OnboardingData {
  first_name: string
  last_name: string
  goals: GoalSelection[]
  level: LevelType | ''
  training_days: string[]
  age: string
  weight: string
  height: string
  current_5k_time: string
  current_10k_time: string
  equipment: EquipmentType | ''
}
