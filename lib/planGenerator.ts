import type { Database, WorkoutBlock, ExerciseItem, IntensityLevel } from '@/lib/supabase/types'

type PlanInsert    = Database['public']['Tables']['plans']['Insert']
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']

export interface PlanProfile {
  level: string
  training_days: string[]   // e.g. ['monday','wednesday','friday','saturday']
  equipment: string
  goals: Array<{ type: string; race_date?: string }>
}

export interface GeneratedPlan {
  plan: PlanInsert
  workouts: Omit<WorkoutInsert, 'plan_id'>[]
}

// ─── Workout library ──────────────────────────────────────────────────────────
// Each category holds ordered variants (A, B, C, D…).
// pickVariant() selects by (weekNum - 1) % variants.length → never the same
// workout_id two consecutive weeks in the same slot.

interface LibraryVariant {
  id: string
  name: string
  format?: string
  structure?: string
  exercises?: string[]
  stations?: string[]
  blocks?: string[]
  rounds?: number
  rest?: string
  pace?: string
  hr_zone?: number
  duration: number
  notes?: string
}

const LIBRARY: Record<string, LibraryVariant[]> = {
  strength_lower: [
    {
      id: 'SL_A', name: 'Power Lower A', duration: 55,
      exercises: ['Deadlift 4x5 @80%', 'Bulgarian split squat 3x8 cada pierna', 'Romanian deadlift 3x10', 'Box jumps 4x5'],
      rest: '2-3 min pesados / 90s accesorios',
      notes: 'Fuerza primero, potencia al final',
    },
    {
      id: 'SL_B', name: 'Power Lower B', duration: 55,
      exercises: ['Back squat 4x5 @80%', 'Step-ups con mancuernas 3x10', 'Good mornings 3x12', 'Broad jumps 3x4'],
      rest: '2-3 min / 90s',
    },
    {
      id: 'SL_C', name: 'Strength Endurance Lower', duration: 50,
      exercises: ['Front squat 4x6', 'Walking lunges con carga 4x12', 'Single leg RDL 3x10', 'Saltos al cajón 3x6'],
      rest: '90s',
    },
    {
      id: 'SL_D', name: 'Posterior Chain Focus', duration: 50,
      exercises: ['Sumo deadlift 4x5', 'Hip thrust 4x10', 'Nordic curl 3x6', 'Kettlebell swing 4x15'],
      rest: '2 min / 60s',
    },
  ],
  strength_upper: [
    {
      id: 'SU_A', name: 'Push/Pull A', duration: 52,
      exercises: ['Bench press 4x6', 'Pull-ups 4x6', 'DB shoulder press 3x10', 'Cable row 3x10', 'Tricep dips 2x12'],
      rest: '90s',
    },
    {
      id: 'SU_B', name: 'Push/Pull B', duration: 50,
      exercises: ['Incline DB press 4x8', 'Barbell row 4x6', 'Arnold press 3x10', 'Face pulls 3x15', 'Chin-ups 3x max'],
      rest: '90s',
    },
    {
      id: 'SU_C', name: 'Upper Endurance', duration: 45,
      exercises: ['Push-ups 4x20', 'TRX row 4x15', 'Farmer carry 4x40m', 'Battle ropes 4x30s', 'Hollow body hold 3x30s'],
      rest: '60s',
      notes: 'Alta repetición, simula fatiga HYROX',
    },
  ],
  hyrox_simulation: [
    {
      id: 'HX_A', name: 'HYROX Full Sim', duration: 75,
      format: '8 rounds: 400m run + 1 station',
      stations: ['SkiErg 250m', 'Sled push 25m', 'Sled pull 25m', 'Burpee broad jumps 20m', 'Remo 250m', 'Farmer carry 50m', 'Walking lunges con saco 25m', 'Wall balls 25 reps'],
      notes: 'Simula la carrera completa — pacing crítico',
    },
    {
      id: 'HX_B', name: 'HYROX Half Sim', duration: 50,
      format: '4 rounds: 400m run + 1 station',
      stations: ['SkiErg 250m', 'Sled push/pull 25m', 'Burpee broad jumps 20m', 'Farmer carry 50m'],
    },
    {
      id: 'HX_C', name: 'HYROX Stations Only', duration: 48,
      format: 'Circuito sin correr — técnica y resistencia muscular',
      exercises: ['SkiErg 500m', 'Sled push 50m', 'Burpees 20 reps', 'Farmer carry 80m', 'Wall balls 30 reps', 'Walking lunges 50m'],
      rounds: 3,
      rest: '90s entre estaciones',
    },
    {
      id: 'HX_D', name: 'Run + Fatigue', duration: 55,
      format: 'Carrera con estaciones intercaladas',
      blocks: ['1km tempo + 15 burpees', '1km tempo + 20 walking lunges', '1km tempo + 30 wall balls', '1km easy'],
      notes: 'Entrena como compites: run + fatigue muscular',
    },
  ],
  zone2_run: [
    { id: 'Z2_A', name: 'Easy Base Run',      duration: 45, pace: 'Z2 — RPE 3-4', hr_zone: 2 },
    { id: 'Z2_B', name: 'Easy Run + Drills',  duration: 50, structure: '35 min Z2 + 10 min drills (A-skip, B-skip, strides)', hr_zone: 2 },
    { id: 'Z2_C', name: 'Z2 + Core',          duration: 55, structure: '40 min Z2 + 15 min core', hr_zone: 2 },
    { id: 'Z2_D', name: 'Easy Run + Mobility', duration: 60, structure: '45 min Z2 + 15 min movilidad dinámica', hr_zone: 2 },
  ],
  intervals: [
    { id: 'INT_A', name: 'Track 400s',        duration: 50, format: 'Calentamiento 15 min + 6x400m al ritmo 5K + enfriamiento 10 min', rest: '90s', pace: 'RPE 8-9', notes: 'Mejora VO2max' },
    { id: 'INT_B', name: '1K Repeats',         duration: 55, format: 'Calentamiento 15 min + 5x1000m + enfriamiento 10 min', rest: '2 min', pace: 'RPE 8' },
    { id: 'INT_C', name: 'Pyramid Intervals',  duration: 55, format: '400m + 800m + 1200m + 800m + 400m', rest: '90s-2min', pace: 'RPE 8-9' },
    { id: 'INT_D', name: 'Short Speed',        duration: 45, format: 'Calentamiento 15 min + 10x200m + enfriamiento', rest: '60s', pace: 'RPE 9', notes: 'Potencia + economía de carrera' },
    { id: 'INT_E', name: 'Fartlek',            duration: 45, format: '30 min: alterna 2 min rápido / 3 min fácil', notes: 'Variedad no estructurada' },
  ],
  tempo: [
    { id: 'TMP_A', name: 'Classic Tempo',      duration: 50, format: '15 min easy + 25 min tempo continuo + 10 min easy', pace: 'RPE 7' },
    { id: 'TMP_B', name: 'Cruise Intervals',   duration: 50, format: '3x10 min tempo con 2 min descanso', pace: 'RPE 7' },
    { id: 'TMP_C', name: 'Progressive Tempo',  duration: 40, format: '20 min: empieza Z2, termina Z3-4 los últimos 5 min', notes: 'Bueno para semanas de menor carga' },
  ],
  long_run: [
    { id: 'LR_A', name: 'Easy Long Run',           duration: 70, pace: 'Z2 todo — RPE 5' },
    { id: 'LR_B', name: 'Long Run + Finish Fast',  duration: 75, structure: '60 min Z2 + últimos 15 min a tempo', notes: 'Simula el final de carrera con piernas cansadas' },
    { id: 'LR_C', name: 'Long Run + Strides',      duration: 80, structure: '65 min Z2 + 6 strides de 20s al final' },
    { id: 'LR_D', name: 'Hybrid Long',             duration: 75, structure: '45 min Z2 + 3 rondas (5 min Z3 + 5 min Z2)', notes: 'Para fase HYROX — mantiene base de 21K' },
  ],
  recovery: [
    { id: 'REC_A', name: 'Active Recovery', duration: 50, structure: '20 min caminata + 20 min foam rolling + 10 min stretching' },
    { id: 'REC_B', name: 'Mobility Flow',   duration: 45, structure: '30 min movilidad dinámica + 15 min yoga básico' },
  ],
}

// ─── Zone distribution by goal ───────────────────────────────────────────────

const ZONE_DIST: Record<string, { highPct: number }> = {
  hyrox:         { highPct: 0.25 }, // 25% z4/z5
  '21k':         { highPct: 0.10 }, // 10% z4/z5 — mostly aerobic
  '5k':          { highPct: 0.20 },
  '10k':         { highPct: 0.15 },
  strength:      { highPct: 0.25 },
  recomp:        { highPct: 0.15 },
}

// ─── Day-of-week helpers ──────────────────────────────────────────────────────

const DAY_TO_NUM: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 7,
}

// Slot sequences: ordered by training importance so high/low alternate naturally.
// The first slot always gets the heaviest session; the rest fill in.
const SLOT_SEQUENCES: Record<number, string[]> = {
  3: ['strength_intervals', 'hyrox_or_tempo', 'zone2'],
  4: ['strength_intervals', 'zone2', 'hyrox_or_tempo', 'upper_tempo'],
  5: ['strength_intervals', 'zone2', 'hyrox_or_tempo', 'upper_tempo', 'long_run'],
  6: ['strength_intervals', 'zone2', 'hyrox_or_tempo', 'upper_tempo', 'long_run', 'zone2'],
}

function buildSchedule(trainingDays: string[]): { dayOfWeek: number; slot: string }[] {
  const count   = Math.min(Math.max(trainingDays.length, 3), 6)
  const slots   = SLOT_SEQUENCES[count] ?? SLOT_SEQUENCES[4]
  const sorted  = [...trainingDays]
    .sort((a, b) => (DAY_TO_NUM[a] ?? 0) - (DAY_TO_NUM[b] ?? 0))
    .slice(0, count)

  return sorted.map((day, i) => ({
    dayOfWeek: DAY_TO_NUM[day] ?? i + 1,
    slot:      slots[i],
  }))
}

// ─── Slot → category mapping ──────────────────────────────────────────────────
// For endurance-primary goals, hyrox_or_tempo resolves to a running session.
// For hyrox/strength goals, it resolves to the HYROX simulation.

function resolveSlotCategories(
  slot: string,
  primaryGoal: string,
  weekNum: number,
  isTaper: boolean,
): string[] {
  if (isTaper) {
    // Taper: all high-intensity slots become zone2 or recovery
    if (slot === 'hyrox_or_tempo') return ['tempo']
    if (slot === 'strength_intervals') return ['strength_lower']
    if (slot === 'upper_tempo') return ['strength_upper']
  }

  const isEnduranceGoal = ['21k', '5k', '10k'].includes(primaryGoal)

  switch (slot) {
    case 'strength_intervals':
      // Concurrent order: endurance goals → intervals first, then strength
      return isEnduranceGoal
        ? ['intervals', 'strength_lower']
        : ['strength_lower', 'intervals']

    case 'hyrox_or_tempo':
      // Endurance goals skip HYROX sim — use tempo or intervals instead
      return isEnduranceGoal ? ['tempo'] : ['hyrox_simulation']

    case 'upper_tempo':
      // Endurance goals: cardio first
      return isEnduranceGoal
        ? ['tempo', 'strength_upper']
        : ['strength_upper', 'tempo']

    case 'zone2':
      return ['zone2_run']

    case 'long_run':
      return ['long_run']

    default:
      return ['zone2_run']
  }
}

// ─── Variant picker ───────────────────────────────────────────────────────────
// Cycles through A/B/C/D so the same slot never has the same workout_id
// on consecutive weeks.

function pickVariant(category: string, weekNum: number, isTaper: boolean): LibraryVariant {
  const variants = LIBRARY[category] ?? LIBRARY.zone2_run
  if (isTaper) {
    // Taper: use the shortest variant (last one tends to be the lighter option)
    return variants[variants.length - 1]
  }
  // Weeks 1-4 cycle A→B→C→D; week 5 = A (same as week 1, peak volume)
  const idx = (weekNum - 1) % variants.length
  return variants[idx]
}

// ─── Variant → WorkoutBlock ───────────────────────────────────────────────────

function parseExerciseLine(line: string): ExerciseItem {
  // "Deadlift 4x5 @80%" → { name, sets, reps, notes }
  const match = line.match(/^(.+?)\s+(\d+)x(\S+)\s*(.*)$/)
  if (match) {
    const repsRaw = match[3]
    const reps: number | string = /^\d+$/.test(repsRaw) ? parseInt(repsRaw) : repsRaw
    return { name: match[1].trim(), sets: parseInt(match[2]), reps, notes: match[4] || undefined }
  }
  return { name: line.trim() }
}

function variantToBlock(variant: LibraryVariant, category: string): WorkoutBlock {
  const typeMap: Record<string, string> = {
    strength_lower:    'strength',
    strength_upper:    'strength',
    hyrox_simulation:  'hyrox',
    zone2_run:         'cardio',
    intervals:         'cardio',
    tempo:             'cardio',
    long_run:          'cardio',
    recovery:          'mobility',
  }

  const exercises: ExerciseItem[] | undefined =
    variant.exercises?.map(parseExerciseLine) ??
    variant.stations?.map(s => ({ name: s })) ??
    variant.blocks?.map(b => ({ name: b }))

  return {
    type:         typeMap[category] ?? 'cardio',
    label:        variant.name,
    format:       variant.format ?? variant.structure,
    exercises,
    rounds:       variant.rounds,
    rest:         variant.rest,
    rpe:          variant.pace,
    hr_zone:      variant.hr_zone,
    duration_min: variant.duration,
    duration_max: variant.duration,
  }
}

// ─── Slot → day metadata ──────────────────────────────────────────────────────

function slotToMeta(
  slot: string,
  categories: string[],
  primaryGoal: string,
  isTaper: boolean,
): { label: string; intensity: IntensityLevel; goalsTags: string[] } {
  const isEnduranceGoal = ['21k', '5k', '10k'].includes(primaryGoal)

  if (isTaper) {
    return { label: 'Taper / Recuperación', intensity: 'low', goalsTags: ['recovery', 'taper'] }
  }

  switch (slot) {
    case 'strength_intervals':
      return {
        label:     'Fuerza + Intervalos',
        intensity: 'high',
        goalsTags: isEnduranceGoal
          ? ['lactate_tolerance', 'strength']
          : ['strength', 'power', 'lactate_tolerance'],
      }
    case 'hyrox_or_tempo':
      return isEnduranceGoal
        ? { label: 'Tempo Run',          intensity: 'moderate', goalsTags: ['sustained_effort', 'aerobic_base'] }
        : { label: 'HYROX Simulation',   intensity: 'high',     goalsTags: ['hyrox', 'race_specificity'] }
    case 'upper_tempo':
      return {
        label:     'Tren Superior + Tempo',
        intensity: 'moderate',
        goalsTags: ['strength', 'sustained_effort'],
      }
    case 'zone2':
      return { label: 'Carrera Z2',     intensity: 'low',      goalsTags: ['aerobic_base', 'recovery'] }
    case 'long_run':
      return { label: 'Rodaje Largo',   intensity: 'moderate', goalsTags: ['endurance', 'aerobic_base'] }
    default:
      return { label: slot,             intensity: 'low',      goalsTags: [] }
  }
}

// ─── 6-week progression ───────────────────────────────────────────────────────

const WEEK_MODS = [
  { phase: 'build_volume',       durationMod: 0.80 }, // week 1
  { phase: 'build_volume',       durationMod: 0.90 }, // week 2
  { phase: 'increase_intensity', durationMod: 1.00 }, // week 3
  { phase: 'increase_intensity', durationMod: 1.05 }, // week 4
  { phase: 'peak_simulation',    durationMod: 1.10 }, // week 5
  { phase: 'taper',              durationMod: 0.70 }, // week 6
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPrimaryGoal(goals: PlanProfile['goals']): string {
  if (!goals.length) return 'hyrox'
  const sorted = [...goals].sort((a, b) => {
    if (!a.race_date) return 1
    if (!b.race_date) return -1
    return new Date(a.race_date).getTime() - new Date(b.race_date).getTime()
  })
  return sorted[0].type
}

function getNextMonday(): Date {
  const today = new Date()
  const day = today.getDay()
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
  const startDate  = getNextMonday()
  const totalWeeks = 6
  const endDate    = addDays(startDate, totalWeeks * 7 - 1)

  const schedule = buildSchedule(profile.training_days)
  const primary  = getPrimaryGoal(profile.goals)

  const plan: PlanInsert = {
    user_id:     userId,
    start_date:  toDateStr(startDate),
    end_date:    toDateStr(endDate),
    total_weeks: totalWeeks,
    structure: {
      phase:          'initial',
      available_days: profile.training_days.length,
      level:          profile.level,
      equipment:      profile.equipment,
      goals:          profile.goals.map(g => g.type),
      primary_goal:   primary,
      training_days:  profile.training_days,
      zone_bias:      ZONE_DIST[primary] ?? ZONE_DIST.hyrox,
      progression:    WEEK_MODS.map(m => m.phase),
      generated_at:   new Date().toISOString(),
    },
  }

  const workouts: Omit<WorkoutInsert, 'plan_id'>[] = []

  for (let week = 1; week <= totalWeeks; week++) {
    const mod      = WEEK_MODS[week - 1]
    const isTaper  = mod.phase === 'taper'
    const weekStart = addDays(startDate, (week - 1) * 7)

    for (const { dayOfWeek, slot } of schedule) {
      const categories = resolveSlotCategories(slot, primary, week, isTaper)
      const meta       = slotToMeta(slot, categories, primary, isTaper)
      const workoutDate = addDays(weekStart, dayOfWeek - 1)

      // Build blocks — one block per category, each picking its week variant
      const blocks: WorkoutBlock[] = categories.map(cat => {
        const variant = pickVariant(cat, week, isTaper)
        return variantToBlock(variant, cat)
      })

      // Total duration = sum of chosen variant durations × week modifier
      const rawDuration = categories.reduce((sum, cat) => {
        const variant = pickVariant(cat, week, isTaper)
        return sum + variant.duration
      }, 0)

      workouts.push({
        user_id:          userId,
        scheduled_date:   toDateStr(workoutDate),
        week_number:      week,
        day_type:         meta.label,
        blocks,
        duration_minutes: Math.round(rawDuration * mod.durationMod),
        intensity:        meta.intensity,
        goals_tags:       meta.goalsTags,
        is_rest_day:      false,
      })
    }
  }

  return { plan, workouts }
}
