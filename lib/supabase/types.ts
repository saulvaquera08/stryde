export type GoalType = 'hyrox' | '21k' | '5k' | '10k' | 'strength' | 'recomp'
export type IntensityLevel = 'low' | 'moderate' | 'high'

export interface WorkoutBlock {
  type: string
  label: string
  exercises?: ExerciseItem[]
  format?: string
  duration_min?: number
  duration_max?: number
  rpe?: string
  hr_zone?: number
  rounds?: number
  rest?: string
}

export interface ExerciseItem {
  name: string
  sets?: number
  reps?: number | string
  rest?: string
  notes?: string
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          age: number | null
          weight: number | null
          height: number | null
          level: string | null
          available_days: number[] | null
          equipment: string[] | null
          injuries: string[] | null
          current_5k_time: string | null
          current_10k_time: string | null
          created_at: string
        }
        Insert: {
          id: string
          age?: number | null
          weight?: number | null
          height?: number | null
          level?: string | null
          available_days?: number[] | null
          equipment?: string[] | null
          injuries?: string[] | null
          current_5k_time?: string | null
          current_10k_time?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          age?: number | null
          weight?: number | null
          height?: number | null
          level?: string | null
          available_days?: number[] | null
          equipment?: string[] | null
          injuries?: string[] | null
          current_5k_time?: string | null
          current_10k_time?: string | null
          created_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          user_id: string
          type: GoalType
          race_date: string | null
          priority: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: GoalType
          race_date?: string | null
          priority?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: GoalType
          race_date?: string | null
          priority?: number
          created_at?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          id: string
          user_id: string
          start_date: string
          end_date: string
          total_weeks: number
          structure: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          start_date: string
          end_date: string
          total_weeks: number
          structure?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          start_date?: string
          end_date?: string
          total_weeks?: number
          structure?: Record<string, unknown>
          created_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          plan_id: string
          user_id: string
          scheduled_date: string
          week_number: number
          day_type: string
          blocks: WorkoutBlock[]
          duration_minutes: number | null
          intensity: IntensityLevel
          goals_tags: string[]
          is_rest_day: boolean
        }
        Insert: {
          id?: string
          plan_id: string
          user_id: string
          scheduled_date: string
          week_number: number
          day_type: string
          blocks?: WorkoutBlock[]
          duration_minutes?: number | null
          intensity: IntensityLevel
          goals_tags?: string[]
          is_rest_day?: boolean
        }
        Update: {
          id?: string
          plan_id?: string
          user_id?: string
          scheduled_date?: string
          week_number?: number
          day_type?: string
          blocks?: WorkoutBlock[]
          duration_minutes?: number | null
          intensity?: IntensityLevel
          goals_tags?: string[]
          is_rest_day?: boolean
        }
        Relationships: []
      }
      completed_workouts: {
        Row: {
          id: string
          workout_id: string
          user_id: string
          completed_at: string
          rating: number | null
          notes: string | null
          metrics: Record<string, unknown>
        }
        Insert: {
          id?: string
          workout_id: string
          user_id: string
          completed_at?: string
          rating?: number | null
          notes?: string | null
          metrics?: Record<string, unknown>
        }
        Update: {
          id?: string
          workout_id?: string
          user_id?: string
          completed_at?: string
          rating?: number | null
          notes?: string | null
          metrics?: Record<string, unknown>
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      goal_type: GoalType
      intensity_level: IntensityLevel
    }
    CompositeTypes: Record<string, never>
  }
}
