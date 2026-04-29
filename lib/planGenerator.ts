import type { Database, WorkoutBlock, ExerciseItem, IntensityLevel } from '@/lib/supabase/types'

type PlanInsert    = Database['public']['Tables']['plans']['Insert']
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert']

// ─── Public types ─────────────────────────────────────────────────────────────

export type DayType = 'strength_lower_day' | 'strength_upper_day' | 'run_day' | 'hyrox_day' | 'rest_day' | 'race_day' | 'recovery_day'

export type TrainingPhase = 'base' | 'build' | 'specific' | 'peak' | 'taper' | 'recovery'

export const PHASE_LABELS: Record<TrainingPhase, string> = {
  base:     'BASE',
  build:    'BUILD',
  specific: 'SPECIFIC',
  peak:     'PEAK',
  taper:    'TAPER',
  recovery: 'RECUPERACIÓN',
}

export const PHASE_COLORS: Record<TrainingPhase, string> = {
  base:     '#888888',
  build:    '#2563EB',
  specific: '#A78BFA',
  peak:     '#FF6B35',
  taper:    '#C8FF00',
  recovery: '#888888',
}

export interface PlanProfile {
  level:         string
  training_days: string[]
  equipment:     string
  goals:         Array<{ type: string; race_date?: string }>
}

export interface GeneratedPlan {
  plan:     PlanInsert
  workouts: Omit<WorkoutInsert, 'plan_id'>[]
}

// ─── Workout library ──────────────────────────────────────────────────────────

interface LibraryVariant {
  id:         string
  name:       string
  subtitle?:  string
  format?:    string
  structure?: string
  exercises?: string[]
  stations?:  string[]
  blocks?:    string[]
  rounds?:    number
  rest?:      string
  pace?:      string
  hr_zone?:   number
  duration:   number
}

const LIBRARY: Record<string, LibraryVariant[]> = {
  // ── Strength Lower (no running, no cardio) ───────────────────────────────
  strength_lower: [
    {
      id: 'SL_A', name: 'Power Lower A', duration: 55,
      subtitle: 'Deadlift focus',
      exercises: ['Deadlift 4x5 @80%', 'Bulgarian split squat 3x8 cada pierna', 'Romanian deadlift 3x10', 'Box jumps 4x5', 'Core: plancha 3x45s'],
      rest: '2-3 min pesados / 90s accesorios',
    },
    {
      id: 'SL_B', name: 'Power Lower B', duration: 55,
      subtitle: 'Squat focus',
      exercises: ['Back squat 4x5 @80%', 'Step-ups con mancuernas 3x10', 'Good mornings 3x12', 'Broad jumps 3x4', 'Core: dead bug 3x10'],
      rest: '2-3 min / 90s',
    },
    {
      id: 'SL_C', name: 'Strength Endurance Lower', duration: 50,
      subtitle: 'Front squat + lunges',
      exercises: ['Front squat 4x6', 'Walking lunges con carga 4x12', 'Single leg RDL 3x10', 'Saltos al cajón 3x6', 'Kettlebell swings 3x15'],
      rest: '90s',
    },
    {
      id: 'SL_D', name: 'Posterior Chain Focus', duration: 50,
      subtitle: 'Hip thrust · Nordic curl',
      exercises: ['Sumo deadlift 4x5', 'Hip thrust 4x10', 'Nordic curl 3x6', 'Kettlebell swing 4x15', 'Core: hollow body 3x30s'],
      rest: '2 min / 60s',
    },
    {
      id: 'SL_E', name: 'Lower Power Real', duration: 55,
      subtitle: 'Front squat · Farmer carry · SL hops',
      exercises: ['Front squat 6 reps', 'SB squeeze 20 reps', 'KB swings 20 reps explosivo', 'Band hip flexor 8/8', 'Trap bar farmer carry 30m', 'Kneeling paloff 8/8', 'SL RDL 8/8', 'SL hops/bounds 15m explosivo'],
      rest: '2 min / 90s',
    },
    {
      id: 'SL_F', name: 'Strength Lower Clásico HYROX', duration: 55,
      subtitle: 'Back squat · Deadlift · Box jumps',
      exercises: ['Back squats 4x5-6', 'Deadlifts 3x3-5', 'Box jumps o jump squats 3x6-8', 'Lunges con mancuernas 3x8 por pierna', 'Calf raises 3x12-15'],
      rest: '2-3 min / 60s',
    },
  ],

  // ── Strength Upper (no running, no squats pesados) ───────────────────────
  strength_upper: [
    {
      id: 'SU_A', name: 'Push/Pull A', duration: 52,
      subtitle: 'Bench · Pull-ups',
      exercises: ['Bench press 4x6', 'Pull-ups 4x6', 'DB shoulder press 3x10', 'Cable row 3x10', 'Tricep dips 2x12', 'Hollow body hold 3x30s'],
      rest: '90s',
    },
    {
      id: 'SU_B', name: 'Push/Pull B', duration: 50,
      subtitle: 'Incline press · Barbell row',
      exercises: ['Incline DB press 4x8', 'Barbell row 4x6', 'Arnold press 3x10', 'Face pulls 3x15', 'Chin-ups 3x max'],
      rest: '90s',
    },
    {
      id: 'SU_C', name: 'Upper Endurance', duration: 45,
      subtitle: 'Farmer carry · Battle ropes',
      exercises: ['Push-ups 4x20', 'TRX row 4x15', 'Farmer carry 4x40m', 'Battle ropes 4x30s', 'Hollow body hold 3x30s'],
      rest: '60s',
    },
    {
      id: 'SU_D', name: 'Upper Push Focus', duration: 50,
      subtitle: 'Bench · OHP · Dips',
      exercises: ['Bench press 4x5-6', 'Incline bench press o DB press 3x6-8', 'Overhead press 3x5-6', 'Dips ponderado o corporal 3x6-8', 'Tricep rope pushdowns o skull crushers 3x8-10'],
      rest: '90s-2 min',
    },
    {
      id: 'SU_E', name: 'Upper Pull Focus', duration: 50,
      subtitle: 'Pull-ups · Barbell rows · Curls',
      exercises: ['Pull-ups o lat pulldowns 4x5-6', 'Barbell rows 4x5-6', 'Dumbbell rows 3x8-10 por brazo', 'Barbell curls 3x6-8', 'Face pulls o reverse pec deck 3x12-15'],
      rest: '60s-2 min',
    },
    {
      id: 'SU_F', name: 'Upper HYROX Functional', duration: 55,
      subtitle: 'Shoulder press · Burpee box jump · Farmer carry',
      exercises: ['Seated shoulder press 15 reps', 'Kneeling wall balls 8 reps explosivo', 'LM row 10/10', 'Cuban press 8 reps', 'Burpee box jump 4x6-8', 'Farmer carry sprint 4x30-40m', 'Sled push o push-ups explosivos 4x20-30m', 'Rope climb o pull-up explosivo 3x4-5', 'Battle ropes o underbar crawl 3x30s'],
      rest: '2 min / 90s',
    },
  ],

  // ── Run — Intervals (solo running, no gym) ───────────────────────────────
  run_intervals: [
    { id: 'INT_A', name: 'Track 400s',        duration: 50, subtitle: '6×400m · RPE 8-9',      format: 'Calentamiento 15 min · 6×400m al ritmo 5K · enfriamiento 10 min',   rest: '90s', pace: 'RPE 8-9' },
    { id: 'INT_B', name: '1K Repeats',         duration: 55, subtitle: '5×1000m · RPE 8',        format: 'Calentamiento 15 min · 5×1000m · enfriamiento 10 min',              rest: '2 min', pace: 'RPE 8' },
    { id: 'INT_C', name: 'Pyramid Intervals',  duration: 55, subtitle: '400+800+1200+800+400',    format: '400m + 800m + 1200m + 800m + 400m con descansos',                   rest: '90s-2min', pace: 'RPE 8-9' },
    { id: 'INT_D', name: 'Short Speed',        duration: 45, subtitle: '10×200m · RPE 9',         format: 'Calentamiento 15 min · 10×200m · enfriamiento',                     rest: '60s', pace: 'RPE 9' },
    { id: 'INT_E', name: 'Fartlek',            duration: 45, subtitle: '30 min sin estructura',   format: '30 min: alterna 2 min rápido / 3 min fácil' },
  ],

  // ── Run — Z2 (solo running, no gym) ─────────────────────────────────────
  run_z2: [
    { id: 'Z2_A', name: 'Easy Base Run',       duration: 45, subtitle: '45 min · Z2',           format: '45 min continuo en Zona 2',                                         hr_zone: 2 },
    { id: 'Z2_B', name: 'Easy Run + Drills',   duration: 50, subtitle: '35 min Z2 + drills',    format: '35 min Z2 · 10 min drills (A-skip, B-skip, strides)',                hr_zone: 2 },
    { id: 'Z2_C', name: 'Z2 + Core',           duration: 55, subtitle: '40 min Z2 + core',      format: '40 min Z2 · 15 min core funcional',                                 hr_zone: 2 },
    { id: 'Z2_D', name: 'Easy Run + Mobility', duration: 60, subtitle: '45 min Z2 + movilidad', format: '45 min Z2 · 15 min movilidad dinámica post-carrera',                 hr_zone: 2 },
  ],

  // ── Run — Tempo (solo running, no gym) ──────────────────────────────────
  run_tempo: [
    { id: 'TMP_A', name: 'Classic Tempo',     duration: 50, subtitle: '25 min tempo continuo', format: '15 min easy · 25 min tempo continuo · 10 min easy',  pace: 'RPE 7' },
    { id: 'TMP_B', name: 'Cruise Intervals',  duration: 50, subtitle: '3×10 min tempo',        format: '3×10 min tempo con 2 min descanso activo',            pace: 'RPE 7' },
    { id: 'TMP_C', name: 'Progressive Tempo', duration: 40, subtitle: '20 min progresivo',     format: '20 min: empieza Z2, termina Z3-4 los últimos 5 min' },
  ],

  // ── Run — Long (solo running, no gym) ───────────────────────────────────
  run_long: [
    { id: 'LR_A', name: 'Easy Long Run',          duration: 70, subtitle: '70 min · todo Z2',         format: '70 min continuo en Zona 2',                                       pace: 'RPE 5' },
    { id: 'LR_B', name: 'Long Run + Finish Fast', duration: 75, subtitle: '60 min Z2 · 15 min tempo', format: '60 min Z2 · últimos 15 min a ritmo tempo' },
    { id: 'LR_C', name: 'Long Run + Strides',     duration: 80, subtitle: '65 min Z2 · strides',      format: '65 min Z2 · 6 strides de 20s al final' },
    { id: 'LR_D', name: 'Hybrid Long',            duration: 75, subtitle: '45 min Z2 + bloques Z3',   format: '45 min Z2 · 3×(5 min Z3 + 5 min Z2)' },
  ],

  // ── Recovery (movilidad suave, sin carga) ───────────────────────────────
  recovery: [
    {
      id: 'REC_A', name: 'Active Recovery', duration: 30,
      subtitle: 'Caminata + foam rolling',
      format: '20 min caminata suave + 10 min foam rolling y estiramientos',
    },
    {
      id: 'REC_B', name: 'Mobility Flow', duration: 30,
      subtitle: '30 min movilidad suave',
      format: '15 min movilidad dinámica + 15 min estiramientos post-carrera',
    },
  ],

  // ── Post-race short run (solo para semana de recuperación) ──────────────
  run_recovery: [
    {
      id: 'Z2_SHORT', name: 'Easy Recovery Run', duration: 22,
      subtitle: '20-25 min · sin presión de ritmo',
      format: '20-25 min continuo Z2 muy suave — el objetivo es mover las piernas, no el tiempo',
      hr_zone: 2,
    },
  ],

  // ── HYROX (running + funcional juntos — único día que mezcla) ───────────
  hyrox_sim: [
    {
      id: 'HX_A', name: 'HYROX Full Sim', duration: 75,
      subtitle: '8×400m + estación',
      format: '8 rondas: 400m run + 1 estación',
      stations: ['SkiErg 250m', 'Sled push 25m', 'Sled pull 25m', 'Burpee broad jumps 20m', 'Remo 250m', 'Farmer carry 50m', 'Walking lunges con saco 25m', 'Wall balls 25 reps'],
    },
    {
      id: 'HX_B', name: 'HYROX Half Sim', duration: 50,
      subtitle: '4×400m + estación',
      format: '4 rondas: 400m run + 1 estación',
      stations: ['SkiErg 250m', 'Sled push/pull 25m', 'Burpee broad jumps 20m', 'Farmer carry 50m'],
    },
    {
      id: 'HX_C', name: 'HYROX Stations Only', duration: 48,
      subtitle: '3 rondas · sin correr',
      format: '3 rondas de estaciones — sin running',
      exercises: ['SkiErg 500m', 'Sled push 50m', 'Burpees 20 reps', 'Farmer carry 80m', 'Wall balls 30 reps', 'Walking lunges 50m'],
      rounds: 3, rest: '90s entre estaciones',
    },
    {
      id: 'HX_D', name: 'Run + Fatigue', duration: 55,
      subtitle: '4×1km tempo + funcional',
      format: '4 bloques: 1km tempo + ejercicio funcional',
      blocks: ['1km tempo · 15 burpees', '1km tempo · 20 walking lunges', '1km tempo · 30 wall balls', '1km easy'],
    },
    {
      id: 'HX_E', name: 'WOD Descending Ladder', duration: 65,
      subtitle: 'AMRAP 8 · FOR TIME 50-40-30-20-10 · AMRAP 12',
      format: 'Warmup AMRAP 8 · Main: FOR TIME Ladder 50-40-30-20-10 · Finisher AMRAP 12 min alternos (sprint/plank)',
      exercises: ['Cal máquina o 500/400/300/200/100m run', 'DB Power Clean', 'DB Push Press'],
    },
    {
      id: 'HX_F', name: 'WOD Stations 400m', duration: 45,
      subtitle: 'AMRAP 9 warmup · AMRAP 26 ladder 10-20-30-40-50',
      format: 'Warmup AMRAP 9 · Main AMRAP 26: Ladder 10-20-30-40-50',
      exercises: ['DB Row', 'DB Swing to Snatch', 'DB Press', 'DB Russian Twist'],
    },
    {
      id: 'HX_G', name: 'EMOM + AMRAP Hybrid', duration: 55,
      subtitle: 'EMOM 20 min · AMRAP 14 min',
      format: 'Block 1 EMOM 20: 45s cardio | 8/8 front rack lunges | 45s bicycle crunch | 4 man makers\nBlock 2 AMRAP 14: 8 RDL | 20/20s single arm plank | 15 burpees',
    },
    {
      id: 'HX_H', name: 'E3MOM Core + Cardio Intervals', duration: 45,
      subtitle: 'E3MOM x4 · Intervalos cardio+fuerza 19 min',
      format: 'Block 1 E3MOM x4 (12 min): side bends | windmills | cardio moderado\nBlock 2 Intervalos 19 min: 5-4-3-2-1 min cardio alternado con KB swings, upright row, DB drag, heels over DB',
    },
    {
      id: 'HX_I', name: 'Sled + Stations WOD', duration: 55,
      subtitle: '2 min ON / 1 min OFF · 400m entre estaciones',
      format: '2 min ON / 1 min OFF · 400m entre cada cambio de estación',
      stations: ['Ergs (remo)', 'Wall balls', 'B2P (burpee to plate)', 'Farmer carry', 'Walking lunges'],
    },
    {
      id: 'HX_J', name: 'HYROX Race Prep WOD', duration: 60,
      subtitle: 'FOR TIME · 4 rondas · 400m entre rondas',
      format: '4 rondas FOR TIME · 400m run o 22 cal entre rondas',
      exercises: ['18 cal (máquina)', '40 wall balls', '40m walking lunges', '40 B2P (burpee to plate)'],
      rounds: 4,
    },
  ],
}

// ─── Run warmups ──────────────────────────────────────────────────────────────

const RUN_WARMUPS = [
  { id: 'RW_A', duration: 5, exercises: ['10 high knees', '10 butt kicks', '10 pogo jumps', '4 strides de 20 seg'] },
  { id: 'RW_B', duration: 5, exercises: ['A-skip 20m', 'B-skip 20m', 'High knees 20m', '2 strides'] },
  { id: 'RW_C', duration: 7, exercises: ['1 min trote suave', '10/10 front lunges', '10 good mornings', '3 strides'] },
]

// ─── Slot definitions ─────────────────────────────────────────────────────────
// SL/SL2 = strength lower (SL2 uses +3 index offset for variety)
// SU/SU2 = strength upper (SU2 uses +3 offset)
// RI/RI2 = run intervals (RI2 uses +2 offset, placed non-adjacent)
// RT     = run tempo
// HX     = hyrox simulation
// RL     = long run
// RZ     = zone 2 easy run

type SlotKey = 'SL' | 'SL2' | 'RI' | 'RI2' | 'HX' | 'SU' | 'SU2' | 'RL' | 'RZ' | 'RT'

const SLOT_DAY_TYPE: Record<SlotKey, DayType> = {
  SL:  'strength_lower_day', SL2: 'strength_lower_day',
  SU:  'strength_upper_day', SU2: 'strength_upper_day',
  RI:  'run_day',            RI2: 'run_day',
  HX:  'hyrox_day',
  RL:  'run_day',
  RZ:  'run_day',
  RT:  'run_day',
}

// ─── Goal-specific slot maps ──────────────────────────────────────────────────
// Ordered to avoid consecutive high-intensity days.

// HYROX: hybrid — strength + running + hyrox sim
const HYROX_SLOTS: Record<number, SlotKey[]> = {
  3: ['SL', 'HX', 'RL'],
  4: ['SL', 'RI', 'HX', 'RL'],
  5: ['SL', 'RI', 'HX', 'SU', 'RL'],
  6: ['SL', 'RI', 'HX', 'SU', 'RL', 'RZ'],
}

// RUNNING (21k / 10k / 5k): pure running — long + intervals + tempo + easy
// Intervals (H) are never adjacent: RL(M)·RI(H)·RZ(L)·RT(M)·RI2(H)·RZ(L)
const RUNNING_SLOTS: Record<number, SlotKey[]> = {
  3: ['RL', 'RI', 'RZ'],
  4: ['RL', 'RI', 'RT', 'RZ'],
  5: ['RL', 'RI', 'RZ', 'RT', 'RI2'],
  6: ['RL', 'RI', 'RZ', 'RT', 'RI2', 'RZ'],
}

// STRENGTH: pure gym — lower + upper alternated with easy cardio
const STRENGTH_SLOTS: Record<number, SlotKey[]> = {
  3: ['SL', 'SU', 'SL2'],
  4: ['SL', 'SU', 'SL2', 'SU2'],
  5: ['SL', 'SU', 'RZ', 'SL2', 'SU2'],
  6: ['SL', 'SU', 'RZ', 'SL2', 'SU2', 'RZ'],
}

// RECOMP: strength-dominant with cardio
const RECOMP_SLOTS: Record<number, SlotKey[]> = {
  3: ['SL', 'SU', 'RZ'],
  4: ['SL', 'SU', 'SL2', 'RZ'],
  5: ['SL', 'SU', 'RZ', 'SL2', 'SU2'],
  6: ['SL', 'SU', 'RZ', 'SL2', 'SU2', 'RI'],
}

function getSlotMap(primaryGoal: string): Record<number, SlotKey[]> {
  if (['21k', '10k', '5k'].includes(primaryGoal)) return RUNNING_SLOTS
  if (primaryGoal === 'strength')                  return STRENGTH_SLOTS
  if (primaryGoal === 'recomp')                    return RECOMP_SLOTS
  return HYROX_SLOTS
}

const DAY_TO_NUM: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 7,
}

function buildSchedule(trainingDays: string[], primaryGoal: string): { dayOfWeek: number; slot: SlotKey }[] {
  const count   = Math.min(Math.max(trainingDays.length, 3), 6)
  const slotMap = getSlotMap(primaryGoal)
  const slots   = slotMap[count] ?? slotMap[5]
  const sorted  = [...trainingDays]
    .sort((a, b) => (DAY_TO_NUM[a] ?? 0) - (DAY_TO_NUM[b] ?? 0))
    .slice(0, count)

  return sorted.map((day, i) => ({
    dayOfWeek: DAY_TO_NUM[day] ?? i + 1,
    slot:      slots[i],
  }))
}

// ─── Duration calculation ─────────────────────────────────────────────────────

export function calcTotalWeeks(goals: PlanProfile['goals']): number {
  // Use plan start (next Monday) so the race_date falls in the final (taper) week.
  const planStart = getPlanStartMonday()

  const upcoming = goals
    .filter(g => g.race_date)
    .map(g => {
      const raceDate = new Date(g.race_date! + 'T12:00:00')
      const daysDiff = Math.floor((raceDate.getTime() - planStart.getTime()) / 86_400_000)
      return daysDiff > 0 ? Math.floor(daysDiff / 7) + 1 : 0
    })
    .filter(w => w > 1)
    .sort((a, b) => a - b)

  if (!upcoming.length) return 8
  return Math.min(Math.max(upcoming[0], 3), 40)
}

// ─── Periodization ────────────────────────────────────────────────────────────
// Taper is ALWAYS the final week. Remaining weeks are distributed across phases.

export function buildPeriodization(totalWeeks: number): Array<{ phase: TrainingPhase; durationMod: number }> {
  const trainingWeeks = totalWeeks - 1 // last week = taper

  type BlockCfg = { phase: TrainingPhase; pct: number; baseMod: number }

  let blocks: BlockCfg[]

  if (totalWeeks <= 5) {
    // 3-5 weeks: Peak 100% of training weeks
    blocks = [{ phase: 'peak', pct: 1, baseMod: 1.0 }]
  } else if (totalWeeks <= 8) {
    // 6-8 weeks: Build 55% · Peak 45%
    blocks = [
      { phase: 'build', pct: 0.55, baseMod: 0.85 },
      { phase: 'peak',  pct: 0.45, baseMod: 1.05 },
    ]
  } else if (totalWeeks <= 12) {
    // 9-12 weeks: Base 33% · Build 44% · Peak 23%
    blocks = [
      { phase: 'base',  pct: 0.33, baseMod: 0.75 },
      { phase: 'build', pct: 0.44, baseMod: 0.88 },
      { phase: 'peak',  pct: 0.23, baseMod: 1.05 },
    ]
  } else if (totalWeeks <= 20) {
    // 13-20 weeks: Base 37% · Build 37% · Peak 26%
    blocks = [
      { phase: 'base',  pct: 0.37, baseMod: 0.72 },
      { phase: 'build', pct: 0.37, baseMod: 0.88 },
      { phase: 'peak',  pct: 0.26, baseMod: 1.05 },
    ]
  } else {
    // 21+ weeks: Base 40% · Build 30% · Specific 20% · Peak 10%
    blocks = [
      { phase: 'base',     pct: 0.40, baseMod: 0.70 },
      { phase: 'build',    pct: 0.30, baseMod: 0.85 },
      { phase: 'specific', pct: 0.20, baseMod: 1.00 },
      { phase: 'peak',     pct: 0.10, baseMod: 1.10 },
    ]
  }

  const result: Array<{ phase: TrainingPhase; durationMod: number }> = []
  let used = 0

  for (let i = 0; i < blocks.length; i++) {
    const isLast = i === blocks.length - 1
    const count  = isLast ? trainingWeeks - used : Math.round(trainingWeeks * blocks[i].pct)
    for (let w = 0; w < count; w++) {
      const mod = Math.min(1.20, blocks[i].baseMod + w * 0.05)
      result.push({ phase: blocks[i].phase, durationMod: Math.round(mod * 100) / 100 })
    }
    used += isLast ? trainingWeeks - used : Math.round(trainingWeeks * blocks[i].pct)
  }

  // Taper is always the final week (-35% volume)
  result.push({ phase: 'taper', durationMod: 0.65 })
  return result.slice(0, totalWeeks)
}

// ─── Variant selection ────────────────────────────────────────────────────────
// Rotation: week % 4 === 1 → A, === 2 → B, === 3 → C, === 0 → D
// PEAK phase → most intense variant (last in pool)
// TAPER phase → lowest volume (first in pool / stations-only for hyrox)

function pickVariant(slot: SlotKey, weekNum: number, phase: TrainingPhase): LibraryVariant {
  // Hyrox: rotate through all 10 variants (week % 10), taper always gets stations-only (HX_C)
  if (slot === 'HX') {
    if (phase === 'taper') return LIBRARY.hyrox_sim[2] // HX_C: stations only, moderate
    const idx = (weekNum - 1) % LIBRARY.hyrox_sim.length
    return LIBRARY.hyrox_sim[idx]
  }

  // Pick pool + optional index offset based on slot
  let pool: LibraryVariant[]
  let offset = 0

  switch (slot) {
    case 'SL':  pool = LIBRARY.strength_lower; break
    case 'SL2': pool = LIBRARY.strength_lower; offset = 3; break
    case 'SU':  pool = LIBRARY.strength_upper; break
    case 'SU2': pool = LIBRARY.strength_upper; offset = 3; break
    case 'RI':  pool = (phase === 'taper') ? LIBRARY.run_tempo : LIBRARY.run_intervals; break
    case 'RI2': pool = (phase === 'taper') ? LIBRARY.run_tempo : LIBRARY.run_intervals; offset = 2; break
    case 'RT':  pool = LIBRARY.run_tempo; break
    case 'RZ':  pool = LIBRARY.run_z2; break
    case 'RL':
      if (phase === 'taper')     pool = LIBRARY.run_tempo
      else if (phase === 'base') pool = LIBRARY.run_z2
      else                       pool = LIBRARY.run_long
      break
    default: pool = LIBRARY.run_z2
  }

  if (phase === 'taper') return pool[0]               // always lowest volume
  if (phase === 'peak')  return pool[pool.length - 1] // always most intense

  // Rotation with optional offset for variety between sibling slots
  const idx = ((weekNum - 1) + offset) % pool.length
  return pool[idx]
}

// ─── Intensity ────────────────────────────────────────────────────────────────

function slotIntensity(slot: SlotKey, phase: TrainingPhase): IntensityLevel {
  if (phase === 'taper') return 'low'
  if (phase === 'base') {
    if (slot === 'RZ') return 'low'
    return 'low' // base is all low-moderate
  }
  if (phase === 'peak' || phase === 'specific') {
    if (slot === 'RI' || slot === 'RI2') return 'high'
    if (slot === 'HX') return 'moderate'
    if (slot === 'SL' || slot === 'SL2' || slot === 'SU' || slot === 'SU2') return 'moderate'
    if (slot === 'RL' || slot === 'RT') return 'moderate'
    return 'low'
  }
  // build
  if (slot === 'RI' || slot === 'RI2') return 'moderate'
  if (slot === 'HX') return 'moderate'
  if (slot === 'RT') return 'moderate'
  if (slot === 'RZ') return 'low'
  return 'moderate'
}

// ─── Goals tags ───────────────────────────────────────────────────────────────

const GOALS_TAGS: Record<DayType, string[]> = {
  strength_lower_day: ['strength', 'power'],
  strength_upper_day: ['strength', 'functional'],
  run_day:            ['endurance', 'cardio'],
  hyrox_day:          ['hyrox', 'race_specificity'],
  rest_day:           ['recovery'],
  race_day:           ['race'],
  recovery_day:       ['recovery', 'mobility'],
}

// ─── Variant → WorkoutBlock ───────────────────────────────────────────────────

function parseExerciseLine(line: string): ExerciseItem {
  const match = line.match(/^(.+?)\s+(\d+)x(\S+)\s*(.*)$/)
  if (match) {
    const repsRaw = match[3]
    const reps: number | string = /^\d+$/.test(repsRaw) ? parseInt(repsRaw) : repsRaw
    return { name: match[1].trim(), sets: parseInt(match[2]), reps, notes: match[4] || undefined }
  }
  return { name: line.trim() }
}

function variantToBlock(variant: LibraryVariant, dayType: DayType): WorkoutBlock {
  const typeMap: Record<DayType, string> = {
    strength_lower_day: 'strength',
    strength_upper_day: 'strength',
    run_day:            'cardio',
    hyrox_day:          'hyrox',
    rest_day:           'rest',
    race_day:           'cardio',
    recovery_day:       'mobility',
  }

  const exercises: ExerciseItem[] | undefined =
    variant.exercises?.map(parseExerciseLine) ??
    variant.stations?.map(s => ({ name: s })) ??
    (variant.blocks as string[] | undefined)?.map(b => ({ name: b }))

  return {
    type:         typeMap[dayType] ?? 'cardio',
    label:        variant.name,
    format:       variant.subtitle ? `${variant.subtitle}\n${variant.format ?? ''}`.trim() : variant.format ?? variant.structure,
    exercises,
    rounds:       variant.rounds,
    rest:         variant.rest,
    rpe:          variant.pace,
    hr_zone:      variant.hr_zone,
    duration_min: variant.duration,
    duration_max: variant.duration,
  }
}

// ─── validatePlan ─────────────────────────────────────────────────────────────

export function validatePlan(
  workouts: Omit<WorkoutInsert, 'plan_id'>[],
  trainingDaysPerWeek: number,
): void {
  if (trainingDaysPerWeek >= 7) {
    throw new Error('Se necesita mínimo 1 día de descanso por semana (máximo 6 días de entrenamiento)')
  }

  const byWeek = new Map<number, typeof workouts>()
  for (const w of workouts.filter(w => !w.is_rest_day && w.day_type !== 'race_day' && w.day_type !== 'recovery_day')) {
    const wk = w.week_number ?? 0
    if (!byWeek.has(wk)) byWeek.set(wk, [])
    byWeek.get(wk)!.push(w)
  }

  for (const [week, wws] of byWeek) {
    const hyroxCount = wws.filter(w => w.day_type === 'hyrox_day').length
    if (hyroxCount > 1) {
      throw new Error(`Semana ${week}: ${hyroxCount} hyrox_day encontrados — máximo 1 por semana`)
    }

    const sorted = [...wws].sort((a, b) =>
      (a.scheduled_date ?? '').localeCompare(b.scheduled_date ?? ''))

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].intensity === 'high' && sorted[i + 1].intensity === 'high') {
        const d1 = new Date(sorted[i].scheduled_date ?? '')
        const d2 = new Date(sorted[i + 1].scheduled_date ?? '')
        const gap = Math.round((d2.getTime() - d1.getTime()) / 86_400_000)
        if (gap === 1) {
          throw new Error(
            `Semana ${week}: alta intensidad consecutiva — ${sorted[i].scheduled_date} (${sorted[i].day_type}) y ${sorted[i + 1].scheduled_date} (${sorted[i + 1].day_type})`
          )
        }
      }
    }
  }
}

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

// ─── Main export ──────────────────────────────────────────────────────────────

export function generatePlan(userId: string, profile: PlanProfile): GeneratedPlan {
  const startDate     = getPlanStartMonday()
  const totalWeeks    = calcTotalWeeks(profile.goals)
  const endDate       = addDays(startDate, totalWeeks * 7 - 1)
  const periodization = buildPeriodization(totalWeeks)
  const primary       = getPrimaryGoal(profile.goals)
  const schedule      = buildSchedule(profile.training_days, primary)

  const phaseMap: Record<number, TrainingPhase> = {}
  periodization.forEach(({ phase }, i) => { phaseMap[i + 1] = phase })

  const plan: PlanInsert = {
    user_id:     userId,
    start_date:  toDateStr(startDate),
    end_date:    toDateStr(endDate),
    total_weeks: totalWeeks,
    structure: {
      available_days: profile.training_days.length,
      level:          profile.level,
      equipment:      profile.equipment,
      goals:          profile.goals.map(g => g.type),
      primary_goal:   primary,
      training_days:  profile.training_days,
      phase_map:      phaseMap,
      generated_at:   new Date().toISOString(),
    },
  }

  const workouts: Omit<WorkoutInsert, 'plan_id'>[] = []

  // Dev log: full variant matrix per week
  if (process.env.NODE_ENV !== 'production') {
    const phaseSummary: Record<string, number> = {}
    periodization.forEach(({ phase }) => { phaseSummary[phase] = (phaseSummary[phase] ?? 0) + 1 })
    const breakdown = Object.entries(phaseSummary).map(([p, n]) => `${p.toUpperCase()}(${n})`).join(' + ')
    console.log(`\n[planGenerator] ${totalWeeks}w · ${breakdown} · primary=${primary} · days=${profile.training_days.join(',')}`)
    for (let w = 1; w <= totalWeeks; w++) {
      const { phase } = periodization[w - 1]
      const ids = schedule.map(({ slot }) => pickVariant(slot, w, phase).id).join('  |  ')
      console.log(`  Week ${String(w).padStart(2)} [${phase.padEnd(8)}] ${ids}`)
    }
    console.log('')
  }

  for (let week = 1; week <= totalWeeks; week++) {
    const { phase, durationMod } = periodization[week - 1]
    const weekStart = addDays(startDate, (week - 1) * 7)

    for (const { dayOfWeek, slot } of schedule) {
      const dayType     = SLOT_DAY_TYPE[slot]
      const variant     = pickVariant(slot, week, phase)
      const workoutDate = addDays(weekStart, dayOfWeek - 1)
      const intensity   = slotIntensity(slot, phase)

      const blocks: WorkoutBlock[] = []
      if (dayType === 'run_day') {
        const rw = RUN_WARMUPS[(week - 1) % RUN_WARMUPS.length]
        blocks.push({
          type:      'cardio',
          label:     'Calentamiento',
          format:    `${rw.duration} min`,
          exercises: rw.exercises.map(e => ({ name: e })),
        })
      }
      blocks.push(variantToBlock(variant, dayType))

      workouts.push({
        user_id:          userId,
        scheduled_date:   toDateStr(workoutDate),
        week_number:      week,
        day_type:         dayType,
        blocks,
        duration_minutes: Math.round(variant.duration * durationMod),
        intensity,
        goals_tags:       GOALS_TAGS[dayType] ?? [],
        is_rest_day:      false,
      })
    }
  }

  // ── Race day + post-race recovery week ───────────────────────────────────
  const raceGoal = profile.goals
    .filter(g => g.race_date)
    .sort((a, b) => new Date(a.race_date!).getTime() - new Date(b.race_date!).getTime())[0]

  if (raceGoal?.race_date) {
    const raceDateStr = raceGoal.race_date
    if (raceDateStr >= toDateStr(startDate) && raceDateStr <= toDateStr(endDate)) {
      const raceDate = new Date(raceDateStr + 'T12:00:00')
      const daysDiff = Math.floor((raceDate.getTime() - startDate.getTime()) / 86_400_000)
      const raceWeek = Math.min(Math.floor(daysDiff / 7) + 1, totalWeeks)

      // Replace any workout already on race date
      const existingIdx = workouts.findIndex(w => w.scheduled_date === raceDateStr)
      if (existingIdx !== -1) workouts.splice(existingIdx, 1)

      workouts.push({
        user_id:          userId,
        scheduled_date:   raceDateStr,
        week_number:      raceWeek,
        day_type:         'race_day',
        blocks:           [{
          type:         'cardio',
          label:        '¡Es el día de la carrera!',
          format:       `Objetivo: ${raceGoal.type.toUpperCase()}`,
          duration_min: 120,
          duration_max: 120,
        }],
        duration_minutes: 120,
        intensity:        'high',
        goals_tags:       ['race'],
        is_rest_day:      false,
      })

      // ── Post-race recovery week (7 days after race) ─────────────────────
      // Fixed structure — ignores training_days. The body decides.
      const recoveryWeek = totalWeeks + 1
      const goalTag      = raceGoal.type

      type RecoverySlot = {
        offset: number
        dayType: DayType
        isRest: boolean
        variantKey?: string
        label?: string
        format?: string
        notes?: string
        duration?: number
      }

      const recoverySlots: RecoverySlot[] = [
        {
          offset: 1,
          dayType: 'rest_day',
          isRest: true,
          label: 'Descanso completo',
          format: 'Descanso completo. Tu cuerpo lo necesita.',
        },
        {
          offset: 2,
          dayType: 'recovery_day',
          isRest: false,
          variantKey: 'REC_B',
          notes: 'Movilidad suave. Sin impacto.',
        },
        {
          offset: 3,
          dayType: 'recovery_day',
          isRest: false,
          variantKey: 'REC_A',
        },
        {
          offset: 4,
          dayType: 'rest_day',
          isRest: true,
          label: 'Descanso',
          format: 'Otro día de descanso. La recuperación es parte del entrenamiento.',
        },
        {
          offset: 5,
          dayType: 'run_day',
          isRest: false,
          variantKey: 'Z2_SHORT',
          notes: 'Primer run post carrera. Muy suave, sin presión de ritmo.',
        },
        {
          offset: 6,
          dayType: 'recovery_day',
          isRest: false,
          variantKey: 'REC_B',
        },
        {
          offset: 7,
          dayType: 'rest_day',
          isRest: true,
          label: 'Fin de la recuperación',
          format: '¿Listo para tu próximo objetivo?',
        },
      ]

      const allRecoveryVariants: Record<string, LibraryVariant> = {
        REC_A:    LIBRARY.recovery[0],
        REC_B:    LIBRARY.recovery[1],
        Z2_SHORT: LIBRARY.run_recovery[0],
      }

      for (const slot of recoverySlots) {
        const slotDate = addDays(raceDate, slot.offset)
        const variant  = slot.variantKey ? allRecoveryVariants[slot.variantKey] : null

        workouts.push({
          user_id:          userId,
          scheduled_date:   toDateStr(slotDate),
          week_number:      recoveryWeek,
          day_type:         slot.dayType,
          is_rest_day:      slot.isRest,
          duration_minutes: variant ? variant.duration : 0,
          intensity:        'low',
          goals_tags:       ['recovery', goalTag],
          blocks: slot.isRest
            ? [{
                type:   'rest',
                label:  slot.label ?? 'Descanso',
                format: slot.format,
              }]
            : variant
            ? [variantToBlock(variant, slot.dayType)]
            : [],
        })
      }

      // Extend plan to cover recovery week
      plan.total_weeks = recoveryWeek
      plan.end_date    = toDateStr(addDays(raceDate, 7))
      ;(plan.structure as Record<string, unknown>)['phase_map'] = {
        ...(plan.structure as Record<string, unknown>)['phase_map'] as Record<string, string>,
        [recoveryWeek]: 'recovery',
      }
    }
  }

  validatePlan(workouts, profile.training_days.length)

  return { plan, workouts }
}
