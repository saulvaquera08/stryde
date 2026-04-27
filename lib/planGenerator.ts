import type { Database, WorkoutBlock, IntensityLevel } from '@/lib/supabase/types'

type PlanInsert = Database['public']['Tables']['plans']['Insert']
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']

export interface PlanProfile {
  level: string
  available_days: number
  equipment: string
  goals: Array<{ type: string; race_date?: string }>
}

export interface GeneratedPlan {
  plan: PlanInsert
  workouts: Omit<WorkoutInsert, 'plan_id'>[]
}

// ─── Schedule templates (dayOfWeek: 1=Mon … 7=Sun) ───────────────────────────

const SCHEDULES: Record<number, { dayOfWeek: number; dayKey: string }[]> = {
  3: [
    { dayOfWeek: 1, dayKey: 'day_1' }, // Mon: Strength + Intervals (high)
    { dayOfWeek: 3, dayKey: 'day_3' }, // Wed: HYROX Sim (high)
    { dayOfWeek: 5, dayKey: 'day_2' }, // Fri: Z2 + Accessory (low)
  ],
  4: [
    { dayOfWeek: 1, dayKey: 'day_1' }, // Mon: Strength + Intervals (high)
    { dayOfWeek: 3, dayKey: 'day_2' }, // Wed: Z2 + Accessory (low)
    { dayOfWeek: 5, dayKey: 'day_3' }, // Fri: HYROX Sim (high)
    { dayOfWeek: 6, dayKey: 'day_4' }, // Sat: Upper + Tempo (moderate)
  ],
  5: [
    { dayOfWeek: 1, dayKey: 'day_1' }, // Mon: Strength + Intervals (high)
    { dayOfWeek: 2, dayKey: 'day_2' }, // Tue: Z2 + Accessory (low)
    { dayOfWeek: 3, dayKey: 'day_3' }, // Wed: HYROX Sim (high)
    { dayOfWeek: 5, dayKey: 'day_4' }, // Fri: Upper + Tempo (moderate)
    { dayOfWeek: 6, dayKey: 'day_5' }, // Sat: Long Endurance (moderate)
  ],
  6: [
    { dayOfWeek: 1, dayKey: 'day_1' }, // Mon: Strength + Intervals (high)
    { dayOfWeek: 2, dayKey: 'day_2' }, // Tue: Z2 + Accessory (low)
    { dayOfWeek: 3, dayKey: 'day_3' }, // Wed: HYROX Sim (high)
    { dayOfWeek: 4, dayKey: 'day_4' }, // Thu: Upper + Tempo (moderate)
    { dayOfWeek: 5, dayKey: 'day_5' }, // Fri: Long Endurance (moderate)
    { dayOfWeek: 6, dayKey: 'day_2' }, // Sat: Extra Z2 (low)
  ],
}

// ─── Day configurations ───────────────────────────────────────────────────────

const DAY_CONFIGS: Record<string, {
  label: string
  blocks: string[]
  intensity: IntensityLevel
  baseDuration: number
  goalsTags: string[]
}> = {
  day_1: {
    label: 'Strength Lower + Intervals',
    blocks: ['lower_heavy', 'explosive_power', 'short_intervals'],
    intensity: 'high',
    baseDuration: 70,
    goalsTags: ['strength', 'power', 'lactate_tolerance'],
  },
  day_2: {
    label: 'Z2 Run + Accessory',
    blocks: ['zone2_run', 'core', 'mobility'],
    intensity: 'low',
    baseDuration: 60,
    goalsTags: ['aerobic_base', 'recovery'],
  },
  day_3: {
    label: 'HYROX Simulation',
    blocks: ['hyrox_simulation'],
    intensity: 'high',
    baseDuration: 60,
    goalsTags: ['hyrox', 'race_specificity'],
  },
  day_4: {
    label: 'Upper Strength + Tempo',
    blocks: ['upper_push_pull', 'tempo_run'],
    intensity: 'moderate',
    baseDuration: 65,
    goalsTags: ['strength', 'sustained_effort'],
  },
  day_5: {
    label: 'Long Endurance',
    blocks: ['long_run'],
    intensity: 'moderate',
    baseDuration: 75,
    goalsTags: ['endurance', 'aerobic_base'],
  },
}

// ─── 6-week progression modifiers ────────────────────────────────────────────

const WEEK_MODS = [
  { phase: 'build_volume',       durationMod: 0.80 }, // week 1
  { phase: 'build_volume',       durationMod: 0.90 }, // week 2
  { phase: 'increase_intensity', durationMod: 1.00 }, // week 3
  { phase: 'increase_intensity', durationMod: 1.05 }, // week 4
  { phase: 'peak_simulation',    durationMod: 1.10 }, // week 5
  { phase: 'taper',              durationMod: 0.70 }, // week 6
]

// ─── Workout block templates (from stryde-rules.json) ─────────────────────────

const BLOCK_TEMPLATES: Record<string, WorkoutBlock> = {
  lower_heavy: {
    type: 'strength',
    label: 'Fuerza Tren Inferior',
    exercises: [
      { name: 'Deadlift',               sets: 4, reps: 5,  rest: '3 min' },
      { name: 'Bulgarian Split Squat',  sets: 3, reps: 8,  rest: '2 min' },
      { name: 'Romanian Deadlift',      sets: 3, reps: 10, rest: '2 min' },
    ],
    rest: '2-3 min',
  },
  explosive_power: {
    type: 'power',
    label: 'Potencia Explosiva',
    exercises: [
      { name: 'Box Jumps',    sets: 4, reps: 5, rest: '90 seg' },
      { name: 'Broad Jumps',  sets: 3, reps: 4, rest: '90 seg' },
    ],
    rest: '90 seg',
  },
  short_intervals: {
    type: 'cardio',
    label: 'Intervalos 400m',
    format: '6×400m al paso de 5K',
    rest: '90 seg entre series',
    rpe: '8-9/10',
  },
  zone2_run: {
    type: 'cardio',
    label: 'Carrera Zona 2',
    duration_min: 40,
    duration_max: 60,
    hr_zone: 2,
    rpe: '3-4/10',
  },
  core: {
    type: 'accessory',
    label: 'Core',
    exercises: [
      { name: 'Plank',          sets: 3, reps: '60 seg', rest: '60 seg' },
      { name: 'Dead Bug',       sets: 3, reps: 10,       rest: '60 seg' },
      { name: 'Pallof Press',   sets: 3, reps: 12,       rest: '60 seg' },
    ],
  },
  mobility: {
    type: 'mobility',
    label: 'Movilidad',
    exercises: [
      { name: 'Hip 90/90',                 sets: 2, reps: '60 seg/lado' },
      { name: 'Thoracic Rotation',         sets: 2, reps: 10 },
      { name: 'World Greatest Stretch',    sets: 2, reps: 5 },
    ],
  },
  hyrox_simulation: {
    type: 'hyrox',
    label: 'Simulación HYROX',
    rounds: 4,
    format: '200m carrera + estación',
    exercises: [
      { name: 'Sled Push',        notes: '25m → 200m carrera' },
      { name: 'Burpees Over Bar', notes: '10 reps → 200m carrera' },
      { name: 'Walking Lunges',   notes: '50m → 200m carrera' },
      { name: 'Sandbag Carry',    notes: '25m → 200m carrera' },
    ],
    rest: '2 min entre rondas',
  },
  upper_push_pull: {
    type: 'strength',
    label: 'Fuerza Tren Superior',
    exercises: [
      { name: 'Bench Press',      sets: 4, reps: 6,  rest: '90 seg' },
      { name: 'Pull-ups',         sets: 4, reps: 6,  rest: '90 seg' },
      { name: 'DB Shoulder Press', sets: 3, reps: 10, rest: '90 seg' },
      { name: 'Cable Row',        sets: 3, reps: 10, rest: '90 seg' },
    ],
    rest: '90 seg',
  },
  tempo_run: {
    type: 'cardio',
    label: 'Carrera Tempo',
    duration_min: 20,
    duration_max: 30,
    rpe: '7/10',
  },
  long_run: {
    type: 'cardio',
    label: 'Rodaje Largo',
    duration_min: 60,
    duration_max: 90,
    hr_zone: 2,
    rpe: '5/10',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNextMonday(): Date {
  const today = new Date()
  const day = today.getDay() // 0=Sun
  const daysToAdd = day === 0 ? 1 : 8 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + daysToAdd)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function generatePlan(userId: string, profile: PlanProfile): GeneratedPlan {
  const startDate = getNextMonday()
  const totalWeeks = 6
  const endDate = addDays(startDate, totalWeeks * 7 - 1)

  const days = Math.min(Math.max(profile.available_days, 3), 6)
  const schedule = SCHEDULES[days] ?? SCHEDULES[4]

  const plan: PlanInsert = {
    user_id: userId,
    start_date: toDateStr(startDate),
    end_date: toDateStr(endDate),
    total_weeks: totalWeeks,
    structure: {
      phase: 'initial',
      available_days: profile.available_days,
      level: profile.level,
      equipment: profile.equipment,
      goals: profile.goals.map(g => g.type),
      progression: WEEK_MODS.map(m => m.phase),
      generated_at: new Date().toISOString(),
    },
  }

  const workouts: Omit<WorkoutInsert, 'plan_id'>[] = []

  for (let week = 1; week <= totalWeeks; week++) {
    const mod = WEEK_MODS[week - 1]
    const weekStart = addDays(startDate, (week - 1) * 7)

    for (const { dayOfWeek, dayKey } of schedule) {
      const config = DAY_CONFIGS[dayKey] ?? DAY_CONFIGS.day_2
      const workoutDate = addDays(weekStart, dayOfWeek - 1)

      const blocks: WorkoutBlock[] = config.blocks.map(key => {
        const tmpl = BLOCK_TEMPLATES[key]
        return tmpl ?? { type: 'unknown', label: key }
      })

      workouts.push({
        user_id: userId,
        scheduled_date: toDateStr(workoutDate),
        week_number: week,
        day_type: config.label,
        blocks,
        duration_minutes: Math.round(config.baseDuration * mod.durationMod),
        intensity: config.intensity,
        goals_tags: config.goalsTags,
        is_rest_day: false,
      })
    }
  }

  return { plan, workouts }
}
