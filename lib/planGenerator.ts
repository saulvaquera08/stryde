import type { Database, WorkoutBlock, ExerciseItem, IntensityLevel } from '@/lib/supabase/types'

type PlanInsert    = Database['public']['Tables']['plans']['Insert']
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 1 — TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

export type DayType =
  | 'strength_push_day'
  | 'strength_pull_day'
  | 'strength_legs_day'
  | 'strength_upper_day'
  | 'strength_lower_day'
  | 'strength_full_body_day'
  | 'run_easy_day'
  | 'run_tempo_day'
  | 'run_intervals_day'
  | 'run_long_day'
  | 'run_fartlek_day'
  | 'rest_day'
  | 'race_day'
  | 'recovery_day'

export type ProgramType = 'gym' | 'run'

export type GymPhase = 'familiarization' | 'accumulation' | 'intensification' | 'deload'
export type RunPhase = 'base' | 'build' | 'peak' | 'taper' | 'recovery'
export type TrainingPhase = GymPhase | RunPhase

export const PHASE_LABELS: Record<TrainingPhase, string> = {
  familiarization: 'ADAPTACIÓN',
  accumulation:    'VOLUMEN',
  intensification: 'INTENSIDAD',
  deload:          'DELOAD',
  base:            'BASE',
  build:           'DESARROLLO',
  peak:            'PEAK',
  taper:           'TAPER',
  recovery:        'RECUPERACIÓN',
}

export const PHASE_COLORS: Record<TrainingPhase, string> = {
  familiarization: '#888888',
  accumulation:    '#2563EB',
  intensification: '#FF6B35',
  deload:          '#C8FF00',
  base:            '#888888',
  build:           '#2563EB',
  peak:            '#FF6B35',
  taper:           '#C8FF00',
  recovery:        '#888888',
}

export interface PlanProfile {
  level:         string
  training_days: string[]
  equipment:     string
  goals:         Array<{ type: string; race_date?: string }>

  program_type?:    ProgramType | string
  session_duration?: string
  injuries?:         string[]

  gym_goal?:         string
  gym_split?:        'ppl' | 'upper_lower' | 'full_body' | string
  priority_muscles?: string[]

  run_distance?:     string
  run_weekly_km?:    string

  secondary_program_days?: number   // 0 = pure, 1-3 = mix & match
}

export interface GeneratedPlan {
  plan:     PlanInsert
  workouts: Omit<WorkoutInsert, 'plan_id'>[]
}

const GOALS_TAGS: Record<DayType, string[]> = {
  strength_push_day:      ['strength', 'hypertrophy', 'push'],
  strength_pull_day:      ['strength', 'hypertrophy', 'pull'],
  strength_legs_day:      ['strength', 'hypertrophy', 'legs'],
  strength_upper_day:     ['strength', 'upper_body'],
  strength_lower_day:     ['strength', 'lower_body'],
  strength_full_body_day: ['strength', 'full_body'],
  run_easy_day:           ['endurance', 'aerobic_base', 'recovery'],
  run_tempo_day:          ['endurance', 'threshold', 'speed'],
  run_intervals_day:      ['endurance', 'vo2max', 'speed'],
  run_long_day:           ['endurance', 'aerobic_base', 'mental_toughness'],
  run_fartlek_day:        ['endurance', 'speed', 'fun'],
  rest_day:               ['recovery'],
  race_day:               ['race'],
  recovery_day:           ['recovery', 'mobility'],
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 2 — LIBRERÍA GYM (Jeff Nippard)
// ═══════════════════════════════════════════════════════════════════════════════

type GymSplit = 'ppl' | 'upper_lower' | 'full_body'

const GYM_RIR: Record<GymPhase, string> = {
  familiarization: '@3 RIR',
  accumulation:    '@2 RIR',
  intensification: '@1 RIR',
  deload:          '@4 RIR',
}

const GYM_COMPOUND_SETS: Record<GymPhase, number> = {
  familiarization: 3,
  accumulation:    4,
  intensification: 5,
  deload:          2,
}

function getGymPhase(weekNum: number, totalWeeks: number): GymPhase {
  if (weekNum === totalWeeks) return 'deload'
  const ratio = weekNum / totalWeeks
  if (ratio <= 0.25) return 'familiarization'
  if (ratio <= 0.70) return 'accumulation'
  return 'intensification'
}

function gymIntensity(phase: GymPhase): IntensityLevel {
  if (phase === 'deload' || phase === 'familiarization') return 'low'
  if (phase === 'accumulation') return 'moderate'
  return 'high'
}

// ── Exercise template type ───────────────────────────────────────────────────

interface GymExercise {
  name: string
  sets: number
  reps: string
  rest: string
  tempo?: string
  notes?: string
}

interface GymVariant {
  warmupSetsExercise: string
  warmupSetsSteps: string[]
  blockA: GymExercise[]
  blockB: GymExercise[]
  blockC: GymExercise[]
  duration: number
}

// ── PPL Library ──────────────────────────────────────────────────────────────

const PUSH_A: GymVariant = {
  warmupSetsExercise: 'Bench Press',
  warmupSetsSteps: ['Barra vacía x10', '50% x8', '80% x3'],
  blockA: [
    { name: 'Bench Press', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
  ],
  blockB: [
    { name: 'Incline DB Press', sets: 3, reps: '10-12', rest: '2 min', tempo: '3-0-1-0' },
    { name: 'Cable Fly (low to high)', sets: 3, reps: '12-15', rest: '75s', tempo: '2-0-1-1' },
  ],
  blockC: [
    { name: 'Lateral Raise (cable o mancuerna)', sets: 4, reps: '15-20', rest: '60s' },
    { name: 'Overhead Tricep Extension (cuerda)', sets: 3, reps: '12-15', rest: '60s', tempo: '2-0-1-0' },
    { name: 'Tricep Pushdown (barra recta)', sets: 3, reps: '15-20', rest: '45s' },
  ],
  duration: 60,
}

const PUSH_B: GymVariant = {
  warmupSetsExercise: 'Overhead Press',
  warmupSetsSteps: ['Barra vacía x10', '50% x6', '80% x3'],
  blockA: [
    { name: 'Overhead Press (barra)', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
  ],
  blockB: [
    { name: 'Incline Barbell Press', sets: 3, reps: '8-10', rest: '2 min', tempo: '3-1-1-0' },
    { name: 'Machine Chest Press', sets: 3, reps: '12-15', rest: '90s', tempo: '2-0-1-1' },
  ],
  blockC: [
    { name: 'Lateral Raise (máquina o cable)', sets: 4, reps: '15-20', rest: '60s' },
    { name: 'Cable Lateral Raise', sets: 3, reps: '15-20', rest: '45s', notes: 'Superset opcional' },
    { name: 'Tricep Dip (asistido o libre)', sets: 3, reps: '10-15', rest: '90s', tempo: '2-1-1-0' },
    { name: 'Skull Crusher (EZ bar)', sets: 3, reps: '12-15', rest: '60s', tempo: '3-0-1-0' },
  ],
  duration: 60,
}

const PULL_A: GymVariant = {
  warmupSetsExercise: 'Barbell Row',
  warmupSetsSteps: ['Barra vacía x10', '50% x8', '80% x3'],
  blockA: [
    { name: 'Barbell Row (Pendlay o Bent-over)', sets: 4, reps: '6-8', rest: '3 min', tempo: '1-1-2-0' },
  ],
  blockB: [
    { name: 'Lat Pulldown (agarre ancho)', sets: 3, reps: '10-12', rest: '2 min', tempo: '2-1-1-0' },
    { name: 'Cable Row (agarre neutro)', sets: 3, reps: '12-15', rest: '90s', tempo: '2-1-1-0' },
  ],
  blockC: [
    { name: 'Face Pull (cuerda, a la frente)', sets: 3, reps: '15-20', rest: '60s' },
    { name: 'Incline DB Curl', sets: 3, reps: '10-12', rest: '60s', tempo: '3-0-1-1' },
    { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '45s' },
  ],
  duration: 60,
}

const PULL_B: GymVariant = {
  warmupSetsExercise: 'Pull-up / Lat Pulldown',
  warmupSetsSteps: ['5 reps cuerpo', '60% x6', '80% x3'],
  blockA: [
    { name: 'Weighted Pull-up (o Lat Pulldown)', sets: 4, reps: '6-8', rest: '3 min', tempo: '2-1-1-0' },
  ],
  blockB: [
    { name: 'Single-Arm DB Row', sets: 3, reps: '10-12 c/lado', rest: '2 min', tempo: '2-1-1-0' },
    { name: 'Chest-Supported Row (máquina o mancuerna)', sets: 3, reps: '12-15', rest: '90s' },
  ],
  blockC: [
    { name: 'Rear Delt Fly (cable o máquina)', sets: 3, reps: '15-20', rest: '60s', tempo: '2-0-1-1' },
    { name: 'Preacher Curl (barra EZ o máquina)', sets: 3, reps: '10-12', rest: '75s', tempo: '3-1-1-0' },
    { name: 'Cable Curl (polea baja)', sets: 3, reps: '12-15', rest: '45s' },
  ],
  duration: 60,
}

const LEGS_A: GymVariant = {
  warmupSetsExercise: 'Back Squat',
  warmupSetsSteps: ['Barra vacía x10', '50% x6', '75% x3', '85% x1'],
  blockA: [
    { name: 'Back Squat', sets: 4, reps: '5-7', rest: '3-4 min', tempo: '3-1-1-0' },
  ],
  blockB: [
    { name: 'Bulgarian Split Squat (mancuernas)', sets: 3, reps: '8-10 c/pierna', rest: '2 min', tempo: '3-0-1-0' },
    { name: 'Leg Press', sets: 3, reps: '12-15', rest: '2 min', tempo: '3-0-1-0' },
  ],
  blockC: [
    { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '2 min', tempo: '3-1-1-0' },
    { name: 'Leg Curl (tumbado o sentado)', sets: 3, reps: '12-15', rest: '90s', tempo: '3-1-1-0' },
    { name: 'Calf Raise (prensa o máquina)', sets: 4, reps: '12-15', rest: '60s', tempo: '2-2-1-0' },
  ],
  duration: 65,
}

const LEGS_B: GymVariant = {
  warmupSetsExercise: 'Romanian Deadlift',
  warmupSetsSteps: ['Barra vacía x10', '50% x8', '75% x3'],
  blockA: [
    { name: 'Romanian Deadlift (barra)', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
  ],
  blockB: [
    { name: 'Hip Thrust (barra o máquina)', sets: 4, reps: '10-12', rest: '2 min', tempo: '1-2-1-0' },
    { name: 'Walking Lunge (mancuernas)', sets: 3, reps: '10-12 c/pierna', rest: '2 min' },
  ],
  blockC: [
    { name: 'Leg Extension (máquina)', sets: 3, reps: '15-20', rest: '60s', tempo: '2-2-1-0' },
    { name: 'Nordic Curl (o leg curl)', sets: 3, reps: '6-10', rest: '90s', tempo: '4-0-1-0' },
    { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '60s', tempo: '2-2-1-0' },
  ],
  duration: 65,
}

// ── Upper/Lower Library ──────────────────────────────────────────────────────

const UPPER_A: GymVariant = {
  warmupSetsExercise: 'Bench Press',
  warmupSetsSteps: ['Barra vacía x10', '50% x8', '80% x3'],
  blockA: [
    { name: 'Bench Press', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
    { name: 'Barbell Row', sets: 4, reps: '6-8', rest: '2 min', tempo: '2-1-1-0' },
  ],
  blockB: [
    { name: 'Overhead Press', sets: 3, reps: '10-12', rest: '2 min', tempo: '2-0-1-0' },
    { name: 'Lat Pulldown', sets: 3, reps: '10-12', rest: '90s', tempo: '2-1-1-0' },
  ],
  blockC: [
    { name: 'Lateral Raise', sets: 4, reps: '15-20', rest: '60s' },
    { name: 'Face Pull', sets: 3, reps: '15-20', rest: '60s' },
    { name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest: '60s' },
    { name: 'Bicep Curl', sets: 3, reps: '12-15', rest: '60s' },
  ],
  duration: 65,
}

const UPPER_B: GymVariant = {
  warmupSetsExercise: 'Incline Barbell Press',
  warmupSetsSteps: ['Barra vacía x10', '50% x8', '80% x3'],
  blockA: [
    { name: 'Incline Barbell Press', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
    { name: 'Weighted Pull-up', sets: 4, reps: '6-8', rest: '2 min', tempo: '2-1-1-0' },
  ],
  blockB: [
    { name: 'Machine Shoulder Press', sets: 3, reps: '10-12', rest: '2 min', tempo: '2-0-1-0' },
    { name: 'Cable Row', sets: 3, reps: '12-15', rest: '90s', tempo: '2-1-1-0' },
  ],
  blockC: [
    { name: 'Cable Lateral Raise', sets: 4, reps: '15-20', rest: '60s' },
    { name: 'Rear Delt Fly', sets: 3, reps: '15-20', rest: '60s' },
    { name: 'Skull Crusher', sets: 3, reps: '10-12', rest: '60s', tempo: '3-0-1-0' },
    { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '60s' },
  ],
  duration: 65,
}

const LOWER_A: GymVariant = {
  warmupSetsExercise: 'Back Squat',
  warmupSetsSteps: ['Barra vacía x10', '50% x6', '75% x3'],
  blockA: [
    { name: 'Back Squat', sets: 4, reps: '5-7', rest: '3-4 min', tempo: '3-1-1-0' },
  ],
  blockB: [
    { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '2 min', tempo: '3-1-1-0' },
    { name: 'Leg Press', sets: 3, reps: '12-15', rest: '2 min', tempo: '3-0-1-0' },
  ],
  blockC: [
    { name: 'Leg Curl', sets: 3, reps: '12-15', rest: '90s', tempo: '3-1-1-0' },
    { name: 'Calf Raise', sets: 4, reps: '12-15', rest: '60s', tempo: '2-2-1-0' },
  ],
  duration: 55,
}

const LOWER_B: GymVariant = {
  warmupSetsExercise: 'Romanian Deadlift (barra)',
  warmupSetsSteps: ['Barra vacía x10', '50% x8', '75% x3'],
  blockA: [
    { name: 'Deadlift', sets: 4, reps: '4-6', rest: '3-4 min', tempo: '1-1-1-0' },
  ],
  blockB: [
    { name: 'Hip Thrust', sets: 4, reps: '10-12', rest: '2 min', tempo: '1-2-1-0' },
    { name: 'Bulgarian Split Squat', sets: 3, reps: '8-10 c/pierna', rest: '2 min', tempo: '3-0-1-0' },
  ],
  blockC: [
    { name: 'Leg Extension', sets: 3, reps: '15-20', rest: '60s', tempo: '2-2-1-0' },
    { name: 'Nordic Curl', sets: 3, reps: '6-8', rest: '90s', tempo: '4-0-1-0' },
    { name: 'Seated Calf Raise', sets: 4, reps: '15-20', rest: '60s', tempo: '2-2-1-0' },
  ],
  duration: 60,
}

// ── Full Body Library ────────────────────────────────────────────────────────

const FULL_A: GymVariant = {
  warmupSetsExercise: 'Back Squat',
  warmupSetsSteps: ['Barra vacía x10', '50% x6', '80% x3'],
  blockA: [
    { name: 'Back Squat', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
    { name: 'Bench Press', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
    { name: 'Barbell Row', sets: 4, reps: '6-8', rest: '2 min', tempo: '2-1-1-0' },
  ],
  blockB: [
    { name: 'OHP', sets: 3, reps: '10-12', rest: '2 min', tempo: '2-0-1-0' },
    { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '2 min', tempo: '3-1-1-0' },
  ],
  blockC: [
    { name: 'Lateral Raise', sets: 3, reps: '15-20', rest: '60s' },
    { name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest: '60s' },
    { name: 'Bicep Curl', sets: 3, reps: '12-15', rest: '60s' },
  ],
  duration: 70,
}

const FULL_B: GymVariant = {
  warmupSetsExercise: 'Romanian Deadlift',
  warmupSetsSteps: ['Barra vacía x10', '50% x8', '80% x3'],
  blockA: [
    { name: 'Romanian Deadlift', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
    { name: 'Overhead Press', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
    { name: 'Pull-up', sets: 4, reps: '6-8', rest: '2 min', tempo: '2-1-1-0' },
  ],
  blockB: [
    { name: 'Leg Press', sets: 3, reps: '12-15', rest: '2 min', tempo: '3-0-1-0' },
    { name: 'Incline DB Press', sets: 3, reps: '10-12', rest: '2 min', tempo: '2-0-1-0' },
  ],
  blockC: [
    { name: 'Face Pull', sets: 3, reps: '15-20', rest: '60s' },
    { name: 'Hammer Curl', sets: 3, reps: '12-15', rest: '60s' },
    { name: 'Calf Raise', sets: 4, reps: '12-15', rest: '60s', tempo: '2-2-1-0' },
  ],
  duration: 70,
}

const FULL_C: GymVariant = {
  warmupSetsExercise: 'Front Squat (o Goblet Squat)',
  warmupSetsSteps: ['Barra vacía x10', '50% x6', '80% x3'],
  blockA: [
    { name: 'Front Squat', sets: 4, reps: '6-8', rest: '3 min', tempo: '3-1-1-0' },
    { name: 'Single-Arm DB Row', sets: 4, reps: '8-10', rest: '2 min', tempo: '2-1-1-0' },
    { name: 'Incline Barbell Press', sets: 4, reps: '8-10', rest: '2 min', tempo: '3-1-1-0' },
  ],
  blockB: [
    { name: 'Hip Thrust', sets: 3, reps: '10-12', rest: '2 min', tempo: '1-2-1-0' },
    { name: 'Cable Row', sets: 3, reps: '12-15', rest: '90s', tempo: '2-1-1-0' },
  ],
  blockC: [
    { name: 'Rear Delt Fly', sets: 3, reps: '15-20', rest: '60s' },
    { name: 'Skull Crusher', sets: 3, reps: '10-12', rest: '60s', tempo: '3-0-1-0' },
    { name: 'Preacher Curl', sets: 3, reps: '10-12', rest: '60s', tempo: '3-1-1-0' },
  ],
  duration: 70,
}

// ── Gym block builders ───────────────────────────────────────────────────────

function buildGymWarmup(variant: GymVariant): WorkoutBlock {
  return {
    type: 'warmup',
    label: 'Calentamiento',
    duration_min: 5,
    exercises: [
      { name: 'Movilidad dinámica', sets: 1, reps: '5 min', notes: 'Movilidad hombros + t-spine + cadera' },
    ],
  }
}

function buildWarmupSets(variant: GymVariant): WorkoutBlock {
  return {
    type: 'warmup_sets',
    label: `Sets de calentamiento — ${variant.warmupSetsExercise}`,
    exercises: variant.warmupSetsSteps.map(step => ({
      name: variant.warmupSetsExercise,
      sets: 1,
      reps: step,
    })),
  }
}

function buildGymBlock(
  label: string,
  exercises: GymExercise[],
  phase: GymPhase,
  isBlockA: boolean,
): WorkoutBlock {
  const rir = GYM_RIR[phase]
  return {
    type: 'main',
    label,
    exercises: exercises.map(ex => {
      const sets = isBlockA ? GYM_COMPOUND_SETS[phase] : ex.sets
      const tempoStr = ex.tempo ? `Tempo ${ex.tempo} | ` : ''
      const notesBase = ex.notes ? ` | ${ex.notes}` : ''
      return {
        name: ex.name,
        sets,
        reps: ex.reps,
        rest: ex.rest,
        notes: `${tempoStr}${rir}${notesBase}`,
      }
    }),
  }
}

function buildGymCooldown(): WorkoutBlock {
  return {
    type: 'cooldown',
    label: 'Enfriamiento',
    duration_min: 5,
    exercises: [
      { name: 'Estiramiento estático', sets: 1, reps: '5 min', notes: 'Grupos musculares trabajados' },
    ],
  }
}

function buildGymWorkoutBlocks(variant: GymVariant, phase: GymPhase): WorkoutBlock[] {
  const blocks: WorkoutBlock[] = []

  blocks.push(buildGymWarmup(variant))
  blocks.push(buildWarmupSets(variant))
  blocks.push(buildGymBlock('Bloque A — Compuesto Principal', variant.blockA, phase, true))
  blocks.push(buildGymBlock('Bloque B — Compuesto Secundario', variant.blockB, phase, false))

  if (phase !== 'deload') {
    blocks.push(buildGymBlock('Bloque C — Aislamiento', variant.blockC, phase, false))
  }

  blocks.push(buildGymCooldown())
  return blocks
}

// ── Gym slot definitions ─────────────────────────────────────────────────────

type GymSlotKey = 'PUSH' | 'PULL' | 'LEGS' | 'UPPER' | 'LOWER' | 'FULL'

interface GymSlotDef {
  key: GymSlotKey
  dayType: DayType
  variantA: GymVariant
  variantB: GymVariant
}

const PPL_SLOT_DEFS: GymSlotDef[] = [
  { key: 'PUSH', dayType: 'strength_push_day', variantA: PUSH_A, variantB: PUSH_B },
  { key: 'PULL', dayType: 'strength_pull_day', variantA: PULL_A, variantB: PULL_B },
  { key: 'LEGS', dayType: 'strength_legs_day', variantA: LEGS_A, variantB: LEGS_B },
]

const UL_SLOT_DEFS: GymSlotDef[] = [
  { key: 'UPPER', dayType: 'strength_upper_day', variantA: UPPER_A, variantB: UPPER_B },
  { key: 'LOWER', dayType: 'strength_lower_day', variantA: LOWER_A, variantB: LOWER_B },
]

const FB_VARIANTS: GymVariant[] = [FULL_A, FULL_B, FULL_C]

const GYM_PPL_SLOTS: Record<number, GymSlotKey[]> = {
  3: ['PUSH', 'LEGS', 'PULL'],
  4: ['PUSH', 'LEGS', 'PULL', 'PUSH'],
  5: ['PUSH', 'LEGS', 'PULL', 'PUSH', 'LEGS'],
  6: ['PUSH', 'PULL', 'LEGS', 'PUSH', 'PULL', 'LEGS'],
}

const GYM_UPPER_LOWER_SLOTS: Record<number, GymSlotKey[]> = {
  3: ['UPPER', 'LOWER', 'UPPER'],
  4: ['UPPER', 'LOWER', 'UPPER', 'LOWER'],
  5: ['UPPER', 'LOWER', 'UPPER', 'LOWER', 'UPPER'],
  6: ['UPPER', 'LOWER', 'UPPER', 'LOWER', 'UPPER', 'LOWER'],
}

const GYM_FULL_BODY_SLOTS: Record<number, number[]> = {
  3: [0, 1, 2],
  4: [0, 1, 2, 0],
}

function getGymSchedule(split: GymSplit, nDays: number): Array<{ dayType: DayType; getVariant: (week: number) => GymVariant; duration: number }> {
  if (split === 'full_body') {
    const indices = GYM_FULL_BODY_SLOTS[Math.min(nDays, 4)] ?? GYM_FULL_BODY_SLOTS[3]
    return indices.map(idx => ({
      dayType: 'strength_full_body_day' as DayType,
      getVariant: () => FB_VARIANTS[idx],
      duration: FB_VARIANTS[idx].duration,
    }))
  }

  if (split === 'upper_lower') {
    const keys = GYM_UPPER_LOWER_SLOTS[Math.min(nDays, 6)] ?? GYM_UPPER_LOWER_SLOTS[4]
    const slotMap: Record<string, GymSlotDef> = {}
    for (const d of UL_SLOT_DEFS) slotMap[d.key] = d
    return keys.map(key => {
      const def = slotMap[key]
      return {
        dayType: def.dayType,
        getVariant: (week: number) => week % 2 === 1 ? def.variantA : def.variantB,
        duration: def.variantA.duration,
      }
    })
  }

  // PPL
  const keys = GYM_PPL_SLOTS[Math.min(nDays, 6)] ?? GYM_PPL_SLOTS[6]
  const slotMap: Record<string, GymSlotDef> = {}
  for (const d of PPL_SLOT_DEFS) slotMap[d.key] = d
  return keys.map(key => {
    const def = slotMap[key]
    return {
      dayType: def.dayType,
      getVariant: (week: number) => week % 2 === 1 ? def.variantA : def.variantB,
      duration: def.variantA.duration,
    }
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 3 — LIBRERÍA RUN (Runna)
// ═══════════════════════════════════════════════════════════════════════════════

type RunGoalType = '5k' | '10k' | 'half_marathon' | 'marathon'

function getRunPhase(weekNum: number, totalWeeks: number, goalType: string): RunPhase {
  if (weekNum === totalWeeks) return 'recovery'
  const taperStart = totalWeeks - (goalType === 'marathon' ? 3 : goalType === 'half_marathon' ? 2 : 1)
  if (weekNum >= taperStart) return 'taper'
  const ratio = weekNum / taperStart
  if (ratio <= 0.30) return 'base'
  if (ratio <= 0.75) return 'build'
  return 'peak'
}

function runIntensity(slot: RunSlotKey, phase: RunPhase): IntensityLevel {
  if (phase === 'taper' || phase === 'recovery') return 'low'
  if (slot === 'INTERVALS') return 'high'
  if (slot === 'TEMPO') return 'moderate'
  if (slot === 'LONG' && phase === 'peak') return 'high'
  if (slot === 'LONG') return 'moderate'
  return 'low'
}

// ── Run session builders ─────────────────────────────────────────────────────

function buildEasyRun(weekNum: number, phase: RunPhase): WorkoutBlock[] {
  const durationMap: Record<RunPhase, [number, number]> = {
    base:     [25, 35],
    build:    [30, 45],
    peak:     [30, 40],
    taper:    [20, 25],
    recovery: [20, 25],
  }
  const [lo, hi] = durationMap[phase]
  const progress  = phase === 'taper' || phase === 'recovery' ? 0 : Math.min(weekNum / 12, 1)
  const duration  = Math.round(lo + progress * (hi - lo))

  return [
    {
      type: 'warmup', label: 'Calentamiento', duration_min: 5,
      exercises: [{ name: 'Caminata', reps: '5 min', notes: 'Ritmo cómodo para activar' }],
    },
    {
      type: 'main', label: 'Easy Run', hr_zone: 2,
      exercises: [{
        name: 'Carrera fácil conversacional',
        reps: `${duration} min`,
        notes: 'Z2 — conversacional. Pace ~70-80s más lento que tu 5K goal pace. Si no puedes hablar, vas muy rápido.',
      }],
    },
    {
      type: 'cooldown', label: 'Enfriamiento', duration_min: 5,
      exercises: [{ name: 'Caminata + estiramiento', reps: '5 min' }],
    },
  ]
}

function buildTempoRun(weekNum: number, phase: RunPhase): WorkoutBlock[] {
  const durationMap: Record<RunPhase, [number, number]> = {
    base:     [15, 18],
    build:    [18, 25],
    peak:     [25, 30],
    taper:    [15, 15],
    recovery: [15, 15],
  }
  const [lo, hi] = durationMap[phase]
  const progress  = phase === 'taper' || phase === 'recovery' ? 0 : Math.min(weekNum / 12, 1)
  const tempoDur  = Math.round(lo + progress * (hi - lo))

  return [
    {
      type: 'warmup', label: 'Calentamiento',
      exercises: [
        { name: 'Caminata', reps: '5 min' },
        { name: 'Easy jog', reps: '10 min', notes: 'Z2' },
      ],
    },
    {
      type: 'main', label: 'Tempo', hr_zone: 4,
      exercises: [{
        name: 'Tempo continuo',
        reps: `${tempoDur} min`,
        notes: 'Z4 — "comfortably hard". Puedes pronunciar palabras sueltas pero no frases. ~10-15s más rápido que tu pace objetivo.',
      }],
    },
    {
      type: 'cooldown', label: 'Enfriamiento',
      exercises: [
        { name: 'Easy jog', reps: '10 min', notes: 'Z2' },
        { name: 'Caminata', reps: '5 min' },
      ],
    },
  ]
}

function buildIntervals(weekNum: number, phase: RunPhase, goalType: RunGoalType): WorkoutBlock[] {
  const configs: Record<RunGoalType, { baseReps: number; dist: string; rest: string; pace: string }> = {
    '5k':            { baseReps: 6, dist: '800m',  rest: '90s recovery jog',     pace: '5K goal pace' },
    '10k':           { baseReps: 5, dist: '1000m', rest: '2 min recovery jog',   pace: '10K goal pace' },
    'half_marathon': { baseReps: 4, dist: '1600m', rest: '2:30 min recovery jog', pace: 'HM goal pace' },
    'marathon':      { baseReps: 3, dist: '3200m', rest: '3 min recovery jog',   pace: 'Marathon pace + 20s/km' },
  }
  const cfg = configs[goalType]

  let reps = cfg.baseReps
  if (phase === 'base') reps = Math.max(2, Math.ceil(cfg.baseReps * 0.6))
  else if (phase === 'build') reps = cfg.baseReps
  else if (phase === 'peak') reps = cfg.baseReps + 1
  else if (phase === 'taper') reps = Math.max(2, Math.ceil(cfg.baseReps * 0.5))

  return [
    {
      type: 'warmup', label: 'Calentamiento',
      exercises: [
        { name: 'Easy jog', reps: '15 min', notes: 'Z1-Z2' },
        { name: 'Strides 4x100m', reps: '4 repeticiones', notes: 'Aceleración progresiva, trota de regreso' },
      ],
    },
    {
      type: 'main', label: 'Intervalos', hr_zone: 5,
      exercises: [{
        name: `${reps}x${cfg.dist}`,
        sets: reps,
        reps: cfg.dist,
        rest: cfg.rest,
        notes: `@ ${cfg.pace}. RPE 8-9/10 en cada rep. Recuperación al trote, no caminando. Si no puedes mantener el pace en la última rep, para.`,
      }],
    },
    {
      type: 'cooldown', label: 'Enfriamiento',
      exercises: [{ name: 'Easy jog', reps: '10-15 min', notes: 'Z1' }],
    },
  ]
}

function buildLongRun(weekNum: number, totalWeeks: number, phase: RunPhase, goalType: RunGoalType): WorkoutBlock[] {
  const baseDurations: Record<RunGoalType, number> = {
    '5k': 30, '10k': 40, 'half_marathon': 60, 'marathon': 90,
  }
  const peakDurations: Record<RunGoalType, number> = {
    '5k': 50, '10k': 70, 'half_marathon': 100, 'marathon': 180,
  }

  const base = baseDurations[goalType]
  const peak = peakDurations[goalType]
  const progress = Math.min(1, weekNum / Math.max(totalWeeks - 2, 1))
  let duration = Math.round(base + progress * (peak - base))

  if (phase === 'taper') duration = Math.round(duration * 0.6)
  if (phase === 'recovery') duration = Math.round(base * 0.7)

  const addFinalPace = (goalType === 'marathon' || goalType === 'half_marathon') && phase === 'peak'

  return [
    {
      type: 'main', label: 'Long Run', hr_zone: 2,
      exercises: [{
        name: 'Long run fácil',
        reps: `${duration} min`,
        notes: `Z2 todo el recorrido. No importa el pace, importa el tiempo en pie.${addFinalPace ? ' Últimos 15-20 min @ race pace si te sientes bien.' : ''}`,
      }],
    },
  ]
}

function buildFartlek(weekNum: number, phase: RunPhase): WorkoutBlock[] {
  let duration = Math.min(35, 20 + weekNum * 2)
  if (phase === 'taper') duration = 20

  return [
    {
      type: 'warmup', label: 'Calentamiento',
      exercises: [{ name: 'Easy jog', reps: '10 min', notes: 'Z2' }],
    },
    {
      type: 'main', label: 'Fartlek', hr_zone: 3,
      exercises: [{
        name: 'Fartlek — surge & recover',
        reps: `${duration} min total`,
        notes: 'Alterna libremente: 1-2 min fuerte (Z4, sientes que estás corriendo) + 1-2 min suave (Z2, recuperas). Sin reloj en los surges, escucha tu cuerpo.',
      }],
    },
    {
      type: 'cooldown', label: 'Enfriamiento',
      exercises: [{ name: 'Easy jog + caminata', reps: '10 min' }],
    },
  ]
}

// ── Run slots ────────────────────────────────────────────────────────────────

type RunSlotKey = 'EASY' | 'TEMPO' | 'INTERVALS' | 'LONG' | 'FARTLEK'

const RUN_SLOT_TO_DAYTYPE: Record<RunSlotKey, DayType> = {
  EASY:      'run_easy_day',
  TEMPO:     'run_tempo_day',
  INTERVALS: 'run_intervals_day',
  LONG:      'run_long_day',
  FARTLEK:   'run_fartlek_day',
}

const RUN_SLOTS: Record<number, RunSlotKey[]> = {
  3: ['LONG', 'INTERVALS', 'EASY'],
  4: ['LONG', 'INTERVALS', 'EASY', 'TEMPO'],
  5: ['LONG', 'INTERVALS', 'EASY', 'TEMPO', 'EASY'],
  6: ['LONG', 'INTERVALS', 'EASY', 'TEMPO', 'FARTLEK', 'EASY'],
}

function getRunSchedule(nDays: number): RunSlotKey[] {
  return RUN_SLOTS[Math.min(Math.max(nDays, 3), 6)] ?? RUN_SLOTS[3]
}

function buildRunBlocks(
  slot: RunSlotKey,
  weekNum: number,
  totalWeeks: number,
  goalType: RunGoalType,
  phase: RunPhase,
): WorkoutBlock[] {
  switch (slot) {
    case 'EASY':      return buildEasyRun(weekNum, phase)
    case 'TEMPO':     return buildTempoRun(weekNum, phase)
    case 'INTERVALS': return buildIntervals(weekNum, phase, goalType)
    case 'LONG':      return buildLongRun(weekNum, totalWeeks, phase, goalType)
    case 'FARTLEK':   return buildFartlek(weekNum, phase)
  }
}

function calcBlockDuration(blocks: WorkoutBlock[]): number {
  let total = 0
  for (const b of blocks) {
    if (b.duration_min) { total += b.duration_min; continue }
    for (const ex of b.exercises ?? []) {
      const match = String(ex.reps ?? '').match(/(\d+)\s*min/)
      if (match) { total += parseInt(match[1]); continue }
    }
    if (!b.duration_min && !(b.exercises ?? []).some(ex => String(ex.reps ?? '').includes('min'))) {
      total += 10
    }
  }
  return total
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 4 — SCHEDULE & HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const DAY_TO_NUM: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 7,
}

function detectProgramType(profile: PlanProfile): ProgramType {
  if (profile.program_type === 'gym' || profile.program_type === 'run') return profile.program_type
  const runGoals = ['5k', '10k', 'half_marathon', 'marathon']
  const hasRunGoal = profile.goals.some(g => runGoals.includes(g.type))
  return hasRunGoal ? 'run' : 'gym'
}

function detectGymSplit(profile: PlanProfile): GymSplit {
  if (profile.gym_split === 'ppl' || profile.gym_split === 'upper_lower' || profile.gym_split === 'full_body') {
    return profile.gym_split
  }
  const days = profile.training_days.length
  if (days <= 3) return 'full_body'
  if (days === 4) return 'upper_lower'
  return 'ppl'
}

function getPrimaryGoal(goals: PlanProfile['goals']): string {
  if (!goals.length) return 'general_fitness'
  const sorted = [...goals].sort((a, b) => {
    if (!a.race_date) return 1
    if (!b.race_date) return -1
    return new Date(a.race_date).getTime() - new Date(b.race_date).getTime()
  })
  return sorted[0].type
}

function getPlanStartMonday(): Date {
  const today = new Date()
  const day   = today.getDay()
  const d     = new Date(today)
  d.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0]
}

function ensureNoConsecutiveHardDays(
  sortedDays: string[],
  slots: RunSlotKey[],
): RunSlotKey[] {
  const result = [...slots]
  for (let i = 0; i < result.length - 1; i++) {
    const currDay = DAY_TO_NUM[sortedDays[i]] ?? 0
    const nextDay = DAY_TO_NUM[sortedDays[i + 1]] ?? 0
    const consecutive = nextDay - currDay === 1 || (currDay === 7 && nextDay === 1)

    if (consecutive) {
      const a = result[i]
      const b = result[i + 1]
      if ((a === 'INTERVALS' && b === 'LONG') || (a === 'LONG' && b === 'INTERVALS')) {
        const easyIdx = result.findIndex((s, j) => j > i + 1 && s === 'EASY')
        if (easyIdx !== -1) {
          ;[result[i + 1], result[easyIdx]] = [result[easyIdx], result[i + 1]]
        }
      }
    }
  }
  return result
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 4B — MIXED SCHEDULE (Mix & Match)
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/**
 * Maps GymPhase → RunPhase for secondary run workouts when primary is gym.
 * familiarization/accumulation → base, intensification → build, deload → taper
 */
function gymPhaseToRunPhase(gymPhase: GymPhase): RunPhase {
  switch (gymPhase) {
    case 'familiarization': return 'base'
    case 'accumulation':    return 'base'
    case 'intensification': return 'build'
    case 'deload':          return 'taper'
  }
}

/**
 * Maps RunPhase → GymPhase for secondary gym workouts when primary is run.
 * base → familiarization, build → accumulation, peak → intensification, taper/recovery → deload
 */
function runPhaseToGymPhase(runPhase: RunPhase): GymPhase {
  switch (runPhase) {
    case 'base':     return 'familiarization'
    case 'build':    return 'accumulation'
    case 'peak':     return 'intensification'
    case 'taper':    return 'deload'
    case 'recovery': return 'deload'
  }
}

interface ScheduleSlot {
  dayOfWeek:    number
  dayKey:       string
  slotProgram:  'gym' | 'run'
  isSecondary:  boolean
  slotIndex:    number
  // Exactly one of these is set depending on slotProgram
  gymSlot?:     { dayType: DayType; getVariant: (week: number) => GymVariant; duration: number }
  runSlotKey?:  RunSlotKey
}

/**
 * Determines if a slot has high intensity (for cross-program conflict detection).
 */
function isHighIntensitySlot(
  slotProgram: 'gym' | 'run',
  gymSlotDayType?: DayType,
  runSlotKey?: RunSlotKey,
): boolean {
  if (slotProgram === 'run') {
    return runSlotKey === 'INTERVALS'
  }
  // GYM: LEGS and PUSH have heavy compounds → high in accumulation/intensification
  return gymSlotDayType === 'strength_legs_day' || gymSlotDayType === 'strength_push_day'
}

/**
 * Picks the best days for secondary workouts, maximizing distance from
 * high-intensity primary days (circular week distance).
 */
function pickBestSecondaryDays(
  availDays: string[],
  highIntensityDayNums: number[],
  count: number,
): string[] {
  const scored = availDays.map(day => {
    const dayNum = DAY_TO_NUM[day]
    const minDist = highIntensityDayNums.length > 0
      ? Math.min(...highIntensityDayNums.map(h => {
          const diff = Math.abs(dayNum - h)
          return Math.min(diff, 7 - diff) // circular week
        }))
      : 7
    return { day, score: minDist }
  })
  return scored
    .sort((a, b) => b.score - a.score) // mayor distancia primero
    .slice(0, count)
    .map(s => s.day)
    .sort((a, b) => (DAY_TO_NUM[a] ?? 0) - (DAY_TO_NUM[b] ?? 0))
}

/**
 * Returns secondary slot keys for the opposite program.
 * Gym primary → run secondary (easy runs + maybe tempo)
 * Run primary → gym secondary (full body)
 */
function getSecondaryRunSlots(count: number): RunSlotKey[] {
  // 1 day: easy, 2 days: easy + tempo, 3 days: easy + tempo + easy
  const pool: RunSlotKey[] = ['EASY', 'TEMPO', 'EASY']
  return pool.slice(0, count)
}

function getSecondaryGymSchedule(count: number): Array<{ dayType: DayType; getVariant: (week: number) => GymVariant; duration: number }> {
  // Always full body, rotating A/B/C variants
  return Array.from({ length: count }, (_, i) => ({
    dayType: 'strength_full_body_day' as DayType,
    getVariant: () => FB_VARIANTS[i % FB_VARIANTS.length],
    duration: FB_VARIANTS[i % FB_VARIANTS.length].duration,
  }))
}

/**
 * Auto-fix consecutive high-intensity days across any program mix.
 * If two adjacent days are both high, degrade the secondary one (or the second if both primary).
 */
function fixConsecutiveHighIntensity(slots: ScheduleSlot[]): ScheduleSlot[] {
  for (let i = 0; i < slots.length - 1; i++) {
    const curr = slots[i]
    const next = slots[i + 1]
    const gap  = next.dayOfWeek - curr.dayOfWeek
    if (gap !== 1) continue

    const currHigh = isHighIntensitySlot(curr.slotProgram, curr.gymSlot?.dayType, curr.runSlotKey)
    const nextHigh = isHighIntensitySlot(next.slotProgram, next.gymSlot?.dayType, next.runSlotKey)
    if (!currHigh || !nextHigh) continue

    // Prefer degrading the secondary one
    const target = next.isSecondary ? i + 1 : curr.isSecondary ? i : i + 1
    const s = slots[target]
    if (s.slotProgram === 'run') {
      slots[target] = { ...s, runSlotKey: 'EASY' }
    } else if (s.gymSlot) {
      // Degrade to full body
      slots[target] = {
        ...s,
        gymSlot: {
          dayType: 'strength_full_body_day',
          getVariant: () => FB_VARIANTS[s.slotIndex % FB_VARIANTS.length],
          duration: FB_VARIANTS[s.slotIndex % FB_VARIANTS.length].duration,
        },
      }
    }
  }
  return slots
}

/**
 * Builds a unified weekly schedule that handles both pure and mixed programs.
 * When secondary_program_days === 0, returns only primary slots (identical to before).
 */
function buildMixedSchedule(profile: PlanProfile): ScheduleSlot[] {
  const programType    = detectProgramType(profile)
  const gymSplit       = programType === 'gym' ? detectGymSplit(profile) : null
  const secondaryCount = Math.min(profile.secondary_program_days ?? 0, 3)

  const primaryDays = [...profile.training_days]
    .sort((a, b) => (DAY_TO_NUM[a] ?? 0) - (DAY_TO_NUM[b] ?? 0))
  const nDays = Math.min(Math.max(primaryDays.length, 3), 6)

  // ── 1. Build primary slots ────────────────────────────────────────────────
  const primarySlots: ScheduleSlot[] = []

  if (programType === 'gym') {
    const gymSchedule = getGymSchedule(gymSplit!, nDays)
    for (let i = 0; i < Math.min(gymSchedule.length, primaryDays.length); i++) {
      primarySlots.push({
        dayOfWeek:   DAY_TO_NUM[primaryDays[i]],
        dayKey:      primaryDays[i],
        slotProgram: 'gym',
        isSecondary: false,
        slotIndex:   i,
        gymSlot:     gymSchedule[i],
      })
    }
  } else {
    const runSchedule = getRunSchedule(nDays)
    const safeSlots   = ensureNoConsecutiveHardDays(primaryDays, runSchedule)
    for (let i = 0; i < Math.min(safeSlots.length, primaryDays.length); i++) {
      primarySlots.push({
        dayOfWeek:   DAY_TO_NUM[primaryDays[i]],
        dayKey:      primaryDays[i],
        slotProgram: 'run',
        isSecondary: false,
        slotIndex:   i,
        runSlotKey:  safeSlots[i],
      })
    }
  }

  if (secondaryCount === 0) return primarySlots

  // ── 2. Clamp: total active days never exceed 6 ────────────────────────────
  const effectiveSecondary = Math.min(secondaryCount, Math.max(0, 6 - primaryDays.length))
  if (effectiveSecondary === 0) return primarySlots

  // ── 3. Pick secondary days from unused weekdays ───────────────────────────
  const usedDays = new Set(primaryDays)
  const availDays = ALL_DAYS.filter(d => !usedDays.has(d))

  const highIntensityPrimaryDays = primarySlots
    .filter(s => isHighIntensitySlot(s.slotProgram, s.gymSlot?.dayType, s.runSlotKey))
    .map(s => s.dayOfWeek)

  const secondaryDays = pickBestSecondaryDays(availDays, highIntensityPrimaryDays, effectiveSecondary)

  // ── 4. Assign secondary slots ─────────────────────────────────────────────
  const secondarySlots: ScheduleSlot[] = []
  const secondaryProgram: 'gym' | 'run' = programType === 'gym' ? 'run' : 'gym'

  if (secondaryProgram === 'run') {
    const runKeys = getSecondaryRunSlots(effectiveSecondary)
    for (let i = 0; i < secondaryDays.length; i++) {
      secondarySlots.push({
        dayOfWeek:   DAY_TO_NUM[secondaryDays[i]],
        dayKey:      secondaryDays[i],
        slotProgram: 'run',
        isSecondary: true,
        slotIndex:   i,
        runSlotKey:  runKeys[i],
      })
    }
  } else {
    const gymSecondary = getSecondaryGymSchedule(effectiveSecondary)
    for (let i = 0; i < secondaryDays.length; i++) {
      secondarySlots.push({
        dayOfWeek:   DAY_TO_NUM[secondaryDays[i]],
        dayKey:      secondaryDays[i],
        slotProgram: 'gym',
        isSecondary: true,
        slotIndex:   i,
        gymSlot:     gymSecondary[i],
      })
    }
  }

  // ── 5. Merge and sort by day of week ──────────────────────────────────────
  const allSlots = [...primarySlots, ...secondarySlots]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  // ── 6. Auto-fix consecutive high intensity ────────────────────────────────
  return fixConsecutiveHighIntensity(allSlots)
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 5 — calcTotalWeeks
// ═══════════════════════════════════════════════════════════════════════════════

export function calcTotalWeeks(goals: PlanProfile['goals'], programType?: string): number {
  if (programType === 'gym') {
    const defaults: Record<string, number> = {
      strength: 8, recomp: 8, general_fitness: 6,
    }
    return defaults[goals[0]?.type ?? 'strength'] ?? 8
  }

  const planStart = getPlanStartMonday()

  const upcoming = goals
    .filter(g => g.race_date)
    .map(g => {
      const raceDate = new Date(g.race_date! + 'T12:00:00')
      const daysDiff = Math.floor((raceDate.getTime() - planStart.getTime()) / 86_400_000)
      return daysDiff > 0 ? Math.ceil(daysDiff / 7) : 0
    })
    .filter(w => w >= 3)
    .sort((a, b) => a - b)

  if (upcoming.length) return Math.min(upcoming[0], 40)

  const goalType = goals[0]?.type ?? 'strength'
  const defaults: Record<string, number> = {
    '5k': 8, '10k': 10, 'half_marathon': 12, 'marathon': 16,
    strength: 8, recomp: 8, general_fitness: 6,
  }
  return defaults[goalType] ?? 8
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 6 — validatePlan
// ═══════════════════════════════════════════════════════════════════════════════

export function validatePlan(
  workouts: Omit<WorkoutInsert, 'plan_id'>[],
  trainingDaysPerWeek: number,
  totalActiveDays?: number,
): void {
  const effectiveDays = totalActiveDays ?? trainingDaysPerWeek
  if (effectiveDays >= 7) {
    throw new Error('El total de días activos no puede ser 7 — necesitas al menos 1 día de descanso')
  }

  const byWeek = new Map<number, Omit<WorkoutInsert, 'plan_id'>[]>()
  for (const w of workouts.filter(w => !w.is_rest_day)) {
    const wk = w.week_number ?? 0
    if (!byWeek.has(wk)) byWeek.set(wk, [])
    byWeek.get(wk)!.push(w)
  }

  for (const [week, wws] of byWeek) {
    const sorted = [...wws].sort((a, b) =>
      (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''))

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].intensity === 'high' && sorted[i + 1].intensity === 'high') {
        const d1 = new Date(sorted[i].scheduled_date ?? '')
        const d2 = new Date(sorted[i + 1].scheduled_date ?? '')
        const gap = Math.round((d2.getTime() - d1.getTime()) / 86_400_000)
        if (gap === 1) {
          sorted[i + 1].intensity = 'moderate'
        }
      }
    }

    const hasIntervals = wws.some(w => w.day_type === 'run_intervals_day')
    const hasLong      = wws.some(w => w.day_type === 'run_long_day')
    if (hasIntervals && hasLong) {
      const intW = wws.find(w => w.day_type === 'run_intervals_day')!
      const lngW = wws.find(w => w.day_type === 'run_long_day')!
      const d1 = new Date(intW.scheduled_date ?? '')
      const d2 = new Date(lngW.scheduled_date ?? '')
      const gap = Math.abs(Math.round((d2.getTime() - d1.getTime()) / 86_400_000))
      if (gap <= 1) {
        console.warn(`[validatePlan] W${week}: INTERVALS y LONG demasiado cercanos (${gap}d)`)
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTE 7 — generatePlan
// ═══════════════════════════════════════════════════════════════════════════════

export function generatePlan(userId: string, profile: PlanProfile): GeneratedPlan {
  const programType    = detectProgramType(profile)
  const startDate      = getPlanStartMonday()
  const totalWeeks     = calcTotalWeeks(profile.goals, programType)
  const endDate        = addDays(startDate, totalWeeks * 7 - 1)
  const primary        = getPrimaryGoal(profile.goals)
  const gymSplit       = programType === 'gym' ? detectGymSplit(profile) : null
  const secondaryCount = profile.secondary_program_days ?? 0
  const totalActiveDays = profile.training_days.length + Math.min(secondaryCount, Math.max(0, 6 - profile.training_days.length))

  const phaseMap: Record<number, TrainingPhase> = {}
  for (let w = 1; w <= totalWeeks; w++) {
    phaseMap[w] = programType === 'gym'
      ? getGymPhase(w, totalWeeks)
      : getRunPhase(w, totalWeeks, primary)
  }

  const plan: PlanInsert = {
    user_id:     userId,
    start_date:  toDateStr(startDate),
    end_date:    toDateStr(endDate),
    total_weeks: totalWeeks,
    structure: {
      program_type:           programType,
      gym_split:              gymSplit,
      secondary_program_days: secondaryCount,
      is_mixed:               secondaryCount > 0,
      available_days:         profile.training_days.length,
      total_active_days:      totalActiveDays,
      level:                  profile.level,
      equipment:              profile.equipment,
      goals:                  profile.goals.map(g => g.type),
      primary_goal:           primary,
      training_days:          profile.training_days,
      phase_map:              phaseMap,
      generated_at:           new Date().toISOString(),
    },
  }

  const workouts: Omit<WorkoutInsert, 'plan_id'>[] = []
  const schedule = buildMixedSchedule(profile)
  const runGoal  = (primary as RunGoalType) || '5k'

  // ── Unified workout loop ─────────────────────────────────────────────────
  for (let week = 1; week <= totalWeeks; week++) {
    const weekStart = addDays(startDate, (week - 1) * 7)
    const gymPhase  = phaseMap[week] as GymPhase
    const runPhase  = phaseMap[week] as RunPhase

    for (const slot of schedule) {
      const workoutDate = addDays(weekStart, slot.dayOfWeek - 1)

      if (slot.slotProgram === 'gym' && slot.gymSlot) {
        // When primary is run, phaseMap has RunPhase values → map to GymPhase for secondary gym
        const baseGymPhase: GymPhase = slot.isSecondary && programType === 'run'
          ? runPhaseToGymPhase(runPhase)
          : gymPhase

        // Secondary gym always uses familiarization-level intensity (low/moderate)
        const effectivePhase: GymPhase = slot.isSecondary
          ? (baseGymPhase === 'deload' ? 'deload' : 'familiarization')
          : baseGymPhase

        const variant = slot.gymSlot.getVariant(week)
        const blocks  = buildGymWorkoutBlocks(variant, effectivePhase)

        let duration = slot.gymSlot.duration
        if (effectivePhase === 'deload') duration = Math.round(duration * 0.7)
        if (slot.isSecondary) duration = Math.min(duration, 50) // cap secondary gym at 50 min

        let intensity = gymIntensity(effectivePhase)
        if (slot.isSecondary && intensity === 'high') intensity = 'moderate'

        workouts.push({
          user_id:              userId,
          scheduled_date:       toDateStr(workoutDate),
          week_number:          week,
          day_type:             slot.gymSlot.dayType,
          blocks,
          duration_minutes:     duration,
          intensity,
          goals_tags:           [
            ...(GOALS_TAGS[slot.gymSlot.dayType] ?? []),
            ...(slot.isSecondary ? ['supplementary'] : []),
          ],
          is_rest_day:          false,
          is_secondary_program: slot.isSecondary,
        })
      }

      if (slot.slotProgram === 'run' && slot.runSlotKey) {
        // Secondary run: force EASY/TEMPO only (no INTERVALS, no LONG)
        let effectiveSlot = slot.runSlotKey
        if (slot.isSecondary && (effectiveSlot === 'INTERVALS' || effectiveSlot === 'LONG')) {
          effectiveSlot = 'EASY'
        }

        // When primary is gym, phaseMap has GymPhase values → map to RunPhase for secondary run
        const effectiveRunPhase: RunPhase = slot.isSecondary && programType === 'gym'
          ? gymPhaseToRunPhase(gymPhase)
          : runPhase

        const blocks  = buildRunBlocks(effectiveSlot, week, totalWeeks, runGoal, effectiveRunPhase)
        const dayType = RUN_SLOT_TO_DAYTYPE[effectiveSlot]

        let duration = calcBlockDuration(blocks)
        if (slot.isSecondary) duration = Math.min(duration, effectiveSlot === 'TEMPO' ? 35 : 30)

        let intensity = runIntensity(effectiveSlot, effectiveRunPhase)
        if (slot.isSecondary && intensity === 'high') intensity = 'moderate'

        workouts.push({
          user_id:              userId,
          scheduled_date:       toDateStr(workoutDate),
          week_number:          week,
          day_type:             dayType,
          blocks,
          duration_minutes:     duration,
          intensity,
          goals_tags:           [
            ...(GOALS_TAGS[dayType] ?? []),
            ...(slot.isSecondary ? ['supplementary'] : []),
          ],
          is_rest_day:          false,
          is_secondary_program: slot.isSecondary,
        })
      }
    }
  }

  // ── Race day + recovery week (only when primary is run) ──────────────────
  if (programType === 'run') {
    const raceGoal = profile.goals
      .filter(g => g.race_date)
      .sort((a, b) => new Date(a.race_date!).getTime() - new Date(b.race_date!).getTime())[0]

    if (raceGoal?.race_date) {
      const raceDateStr = raceGoal.race_date
      if (raceDateStr >= toDateStr(startDate) && raceDateStr <= toDateStr(endDate)) {
        const raceDate = new Date(raceDateStr + 'T12:00:00')
        const daysDiff = Math.floor((raceDate.getTime() - startDate.getTime()) / 86_400_000)
        const raceWeek = Math.min(Math.floor(daysDiff / 7) + 1, totalWeeks)

        const existingIdx = workouts.findIndex(w => w.scheduled_date === raceDateStr)
        if (existingIdx !== -1) workouts.splice(existingIdx, 1)

        workouts.push({
          user_id:              userId,
          scheduled_date:       raceDateStr,
          week_number:          raceWeek,
          day_type:             'race_day',
          blocks:               [{
            type:  'cardio',
            label: '¡Es el día de la carrera!',
            format: `Objetivo: ${raceGoal.type.replace(/_/g, ' ').toUpperCase()}`,
            duration_min: 120,
          }],
          duration_minutes:     120,
          intensity:            'high',
          goals_tags:           ['race'],
          is_rest_day:          false,
          is_secondary_program: false,
        })

        const recoveryWeek = totalWeeks + 1
        const recoverySlots: Array<{
          offset: number; dayType: DayType; isRest: boolean;
          label: string; format: string; duration: number
        }> = [
          { offset: 1, dayType: 'rest_day',     isRest: true,  label: 'Descanso completo',      format: 'Descanso completo. Tu cuerpo lo necesita.', duration: 0 },
          { offset: 2, dayType: 'recovery_day', isRest: false, label: 'Movilidad y estiramientos', format: '15 min de movilidad dinámica + 15 min de estiramientos', duration: 30 },
          { offset: 3, dayType: 'recovery_day', isRest: false, label: 'Recuperación activa',     format: '20 min de caminata suave + 10 min de foam rolling', duration: 30 },
          { offset: 4, dayType: 'rest_day',     isRest: true,  label: 'Descanso',               format: 'La recuperación es parte del entrenamiento.', duration: 0 },
          { offset: 5, dayType: 'run_easy_day', isRest: false, label: 'Carrera de recuperación', format: '20-25 min a ritmo muy suave (Z1-Z2)', duration: 25 },
          { offset: 6, dayType: 'recovery_day', isRest: false, label: 'Movilidad',              format: '15 min de movilidad dinámica + 15 min de estiramientos', duration: 30 },
          { offset: 7, dayType: 'rest_day',     isRest: true,  label: 'Fin de la recuperación',  format: '¿Listo para tu próximo objetivo?', duration: 0 },
        ]

        for (const rSlot of recoverySlots) {
          const slotDate = addDays(raceDate, rSlot.offset)
          workouts.push({
            user_id:              userId,
            scheduled_date:       toDateStr(slotDate),
            week_number:          recoveryWeek,
            day_type:             rSlot.dayType,
            is_rest_day:          rSlot.isRest,
            duration_minutes:     rSlot.duration,
            intensity:            'low',
            goals_tags:           ['recovery', raceGoal.type],
            is_secondary_program: false,
            blocks: rSlot.isRest
              ? [{ type: 'rest', label: rSlot.label, format: rSlot.format }]
              : [{
                  type: rSlot.dayType === 'run_easy_day' ? 'cardio' : 'mobility',
                  label: rSlot.label,
                  format: rSlot.format,
                  duration_min: rSlot.duration,
                }],
          })
        }

        plan.total_weeks = recoveryWeek
        plan.end_date    = toDateStr(addDays(raceDate, 7))
        ;(plan.structure as Record<string, unknown>)['phase_map'] = {
          ...(plan.structure as Record<string, unknown>)['phase_map'] as Record<string, string>,
          [recoveryWeek]: 'recovery',
        }
      }
    }
  }

  validatePlan(workouts, profile.training_days.length, totalActiveDays)
  return { plan, workouts }
}
