export type GoalType = "hyrox" | "21k" | "5k" | "10k" | "strength" | "recomp";
export type IntensityLevel = "low" | "moderate" | "high";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          age: number | null;
          weight: number | null;
          height: number | null;
          level: string | null;
          available_days: number[] | null;
          equipment: string[] | null;
          injuries: string[] | null;
          current_5k_time: string | null;
          current_10k_time: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          type: GoalType;
          race_date: string | null;
          priority: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["goals"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
      };
      plans: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          total_weeks: number;
          structure: Record<string, unknown>;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["plans"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
      };
      workouts: {
        Row: {
          id: string;
          plan_id: string;
          user_id: string;
          scheduled_date: string;
          week_number: number;
          day_type: string;
          blocks: WorkoutBlock[];
          duration_minutes: number | null;
          intensity: IntensityLevel;
          goals_tags: string[];
          is_rest_day: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["workouts"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
      };
      completed_workouts: {
        Row: {
          id: string;
          workout_id: string;
          user_id: string;
          completed_at: string;
          rating: number | null;
          notes: string | null;
          metrics: Record<string, unknown>;
        };
        Insert: Omit<Database["public"]["Tables"]["completed_workouts"]["Row"], "id" | "completed_at"> & {
          id?: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["completed_workouts"]["Insert"]>;
      };
    };
  };
}

export interface WorkoutBlock {
  type: string;
  label: string;
  exercises?: ExerciseItem[];
  format?: string;
  duration_min?: number;
  duration_max?: number;
  rpe?: string;
  hr_zone?: number;
  rounds?: number;
  rest?: string;
}

export interface ExerciseItem {
  name: string;
  sets?: number;
  reps?: number | string;
  rest?: string;
  notes?: string;
}
