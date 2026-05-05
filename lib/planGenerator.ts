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

  program_type?:    'gym' | 'run' | 'hyrox' | string
  session_duration?: string
  injuries?:         string[]

  gym_goal?:         string
  priority_muscles?: string[]

  run_distance?:     string
  run_weekly_km?:    string

  hyrox_experience?:     string
  hyrox_weak_stations?:  string[]
  hyrox_strength_cardio?: number
}

export interface GeneratedPlan {
  plan:     PlanInsert
  workouts: Omit<WorkoutInsert, 'plan_id'>[]
}

// ─── Workout library ──────────────────────────────────────────────────────────

interface LibraryVariant {
  id:        string
  name:      string
  duration:  number
  format?:   string
  exercises?: string[]
  stations?:  string[]
  blocks?:    string[]
  rounds?:    number
  rest?:      string
  pace?:      string
  hr_zone?:   number
}

const LIBRARY: Record<string, LibraryVariant[]> = {
  // ── Fuerza piernas ────────────────────────────────────────────────────────
  strength_lower: [
    {
      id: 'SL_A', name: 'Piernas: Peso muerto', duration: 55,
      format: 'Trabaja con peso desafiante. Descansa 2-3 min en los ejercicios compuestos y 90s en los accesorios.',
      exercises: [
        'Peso muerto 4x5',
        'Sentadilla búlgara 3x8',
        'Peso muerto rumano 3x10',
        'Saltos al cajón 4x5',
        'Plancha abdominal 3x45s',
      ],
    },
    {
      id: 'SL_B', name: 'Piernas: Sentadilla trasera', duration: 55,
      format: 'Trabaja con peso desafiante. Descansa 2-3 min en los compuestos y 90s en accesorios.',
      exercises: [
        'Sentadilla trasera 4x5',
        'Step-up con mancuernas 3x10',
        'Buenos días con barra 3x12',
        'Saltos de longitud 3x4',
        'Estabilidad lumbar (dead bug) 3x10',
      ],
    },
    {
      id: 'SL_C', name: 'Piernas: Resistencia muscular', duration: 50,
      format: 'Ritmo constante. Descansa 90s entre series.',
      exercises: [
        'Sentadilla frontal 4x6',
        'Estocadas caminando con mancuernas 4x12',
        'Peso muerto a una pierna 3x10',
        'Saltos al cajón 3x6',
        'Swing con pesa rusa 3x15',
      ],
    },
    {
      id: 'SL_D', name: 'Piernas: Cadena posterior', duration: 50,
      format: 'Énfasis en glúteo e isquiotibiales. Descansa 2 min en compuestos y 60s en accesorios.',
      exercises: [
        'Peso muerto sumo 4x5',
        'Hip thrust con barra 4x10',
        'Curl nórdico 3x6',
        'Swing con pesa rusa 4x15',
        'Hollow body 3x30s',
      ],
    },
    {
      id: 'SL_E', name: 'Piernas: Potencia y explosividad', duration: 55,
      format: 'Enfocado en potencia. Descansa 2 min entre series. Los saltos van con máxima intención.',
      exercises: [
        'Sentadilla frontal 4x6',
        'Peso muerto a una pierna 4x8',
        'Swing con pesa rusa (explosivo) 4x15',
        'Farmer carry (caminata con carga) 4x30m',
        'Saltos laterales de rebote 3x10 por lado',
      ],
    },
    {
      id: 'SL_F', name: 'Piernas: Preparación HYROX', duration: 55,
      format: 'Movimientos con transferencia directa a competencia. Descansa 2-3 min.',
      exercises: [
        'Sentadilla trasera 4x5-6',
        'Peso muerto 3x3-5',
        'Sentadilla con salto 3x6-8',
        'Estocadas con mancuernas 3x8 por pierna',
        'Elevaciones de gemelo 3x15',
      ],
    },
  ],

  // ── Fuerza tren superior ──────────────────────────────────────────────────
  strength_upper: [
    {
      id: 'SU_A', name: 'Tren superior: Empuje y jalones A', duration: 52,
      format: 'Alterna empuje y jalón. Descansa 90s entre series.',
      exercises: [
        'Press de banca 4x6',
        'Dominadas 4x6',
        'Press de hombro con mancuernas 3x10',
        'Remo en polea 3x10',
        'Fondos en paralelas 2x12',
        'Hollow body hold 3x30s',
      ],
    },
    {
      id: 'SU_B', name: 'Tren superior: Empuje y jalones B', duration: 50,
      format: 'Variante con press inclinado y remo con barra. Descansa 90s.',
      exercises: [
        'Press inclinado con mancuernas 4x8',
        'Remo con barra 4x6',
        'Press Arnold 3x10',
        'Remo en polea cara (face pull) 3x15',
        'Dominadas con supinación 3x max',
      ],
    },
    {
      id: 'SU_C', name: 'Tren superior: Resistencia funcional', duration: 45,
      format: 'Énfasis en resistencia muscular. Descansa 60s entre series.',
      exercises: [
        'Flexiones de pecho 4x20',
        'Remo en TRX 4x15',
        'Farmer carry 4x40m',
        'Battle ropes 4x30s',
        'Hollow body hold 3x30s',
      ],
    },
    {
      id: 'SU_D', name: 'Tren superior: Press horizontal y vertical', duration: 50,
      format: 'Enfocado en pecho, hombro y trícep. Descansa 90s-2 min.',
      exercises: [
        'Press de banca 4x5-6',
        'Press inclinado con mancuernas 3x6-8',
        'Press militar con barra 3x5-6',
        'Fondos en paralelas 3x6-8',
        'Extensiones de trícep en polea 3x8-10',
      ],
    },
    {
      id: 'SU_E', name: 'Tren superior: Jalones y espalda', duration: 50,
      format: 'Enfocado en espalda y bícep. Descansa 60s-2 min.',
      exercises: [
        'Dominadas o jalón al pecho 4x5-6',
        'Remo con barra 4x5-6',
        'Remo con mancuerna a una mano 3x8-10 por brazo',
        'Curl de bícep con barra 3x6-8',
        'Remo en polea cara (face pull) 3x12-15',
      ],
    },
    {
      id: 'SU_F', name: 'Tren superior: Funcional para HYROX', duration: 55,
      format: 'Movimientos con transferencia directa a competencia. Descansa 90s-2 min.',
      exercises: [
        'Press de hombro sentado 4x10-12',
        'Remo con barra o mancuerna 4x10',
        'Press de pecho 3x8-10',
        'Dominadas o jalón al pecho 3x8-10',
        'Farmer carry rápido 4x30-40m',
        'Burpees 3x10',
      ],
    },
  ],

  // ── Series de velocidad (carrera) ─────────────────────────────────────────
  run_intervals: [
    {
      id: 'INT_A', name: 'Series de velocidad: 400m', duration: 50,
      format: 'Calentamiento 15 min → 6 repeticiones de 400m a tu ritmo de 5K → Enfriamiento 10 min.\nDescansa 90 seg trotando suave entre cada 400m.',
      rest: '90s', pace: 'Esfuerzo 8-9 de 10',
    },
    {
      id: 'INT_B', name: 'Series de velocidad: 1000m', duration: 55,
      format: 'Calentamiento 15 min → 5 repeticiones de 1000m a ritmo fuerte → Enfriamiento 10 min.\nDescansa 2 min trotando entre cada 1000m.',
      rest: '2 min', pace: 'Esfuerzo 8 de 10',
    },
    {
      id: 'INT_C', name: 'Pirámide de distancias', duration: 55,
      format: 'Corre en pirámide: 400m · 800m · 1200m · 800m · 400m.\nDescansa entre 90s y 2 min trotando suave entre cada repetición.',
      rest: '90s-2 min', pace: 'Esfuerzo 8-9 de 10',
    },
    {
      id: 'INT_D', name: 'Series cortas: 200m', duration: 45,
      format: 'Calentamiento 15 min → 10 repeticiones de 200m a ritmo máximo sostenible → Enfriamiento.\nDescansa 60 seg entre cada 200m.',
      rest: '60s', pace: 'Esfuerzo 9 de 10',
    },
    {
      id: 'INT_E', name: 'Cambios de ritmo (fartlek)', duration: 45,
      format: 'Corre 30 min alternando libremente:\n· 2 min a ritmo rápido (apenas puedes hablar)\n· 3 min a ritmo suave (conversación normal)\nNo hay estructura rígida — escucha tu cuerpo.',
    },
  ],

  // ── Carrera suave zona 2 ──────────────────────────────────────────────────
  run_z2: [
    {
      id: 'Z2_A', name: 'Carrera suave: 45 min', duration: 45,
      format: '45 min a ritmo conversacional constante.\nDebes poder mantener una conversación sin problemas durante toda la carrera.',
      hr_zone: 2,
    },
    {
      id: 'Z2_B', name: 'Carrera suave + técnica de carrera', duration: 50,
      format: '35 min a ritmo conversacional → 10 min de técnica:\n· Elevación de rodillas (A-skip)\n· Talón al glúteo (B-skip)\n· 4 aceleraciones cortas de 20m',
      hr_zone: 2,
    },
    {
      id: 'Z2_C', name: 'Carrera suave + core', duration: 55,
      format: '40 min a ritmo conversacional → 15 min de ejercicios de core al terminar.',
      hr_zone: 2,
    },
    {
      id: 'Z2_D', name: 'Carrera suave + movilidad', duration: 60,
      format: '45 min a ritmo conversacional → 15 min de movilidad dinámica post-carrera.',
      hr_zone: 2,
    },
  ],

  // ── Carrera a ritmo tempo ─────────────────────────────────────────────────
  run_tempo: [
    {
      id: 'TMP_A', name: 'Tempo continuo', duration: 50,
      format: '15 min suave para calentar → 25 min a ritmo tempo (puedes decir frases cortas, no conversación) → 10 min suave para enfriar.',
      pace: 'Esfuerzo 7 de 10',
    },
    {
      id: 'TMP_B', name: 'Bloques de tempo', duration: 50,
      format: '3 bloques de 10 min a ritmo tempo.\nEntre cada bloque: 2 min trotando suave.',
      pace: 'Esfuerzo 7 de 10',
    },
    {
      id: 'TMP_C', name: 'Carrera progresiva', duration: 40,
      format: 'Corre 20 min empezando a ritmo suave y aumentando gradualmente.\nLos últimos 5 min deben sentirse moderado-fuertes.',
    },
  ],

  // ── Rodaje largo ──────────────────────────────────────────────────────────
  run_long: [
    {
      id: 'LR_A', name: 'Rodaje largo: 70 min', duration: 70,
      format: '70 min continuos a ritmo conversacional.\nEs el entrenamiento más importante de la semana — no te apures, disfruta el ritmo.',
      pace: 'Esfuerzo 5 de 10',
    },
    {
      id: 'LR_B', name: 'Rodaje largo con final acelerado', duration: 75,
      format: '60 min a ritmo suave → últimos 15 min a ritmo moderado-fuerte.',
    },
    {
      id: 'LR_C', name: 'Rodaje largo con aceleraciones', duration: 80,
      format: '65 min a ritmo suave → al terminar: 6 aceleraciones cortas de 20m (trota 40s entre cada una).',
    },
    {
      id: 'LR_D', name: 'Largo con bloques de ritmo medio', duration: 75,
      format: '45 min a ritmo suave → 3 bloques de:\n· 5 min a ritmo moderado\n· 5 min a ritmo suave',
    },
  ],

  // ── Recuperación activa ───────────────────────────────────────────────────
  recovery: [
    {
      id: 'REC_A', name: 'Recuperación activa', duration: 30,
      format: '20 min de caminata suave + 10 min de foam rolling y estiramientos estáticos.',
    },
    {
      id: 'REC_B', name: 'Movilidad y estiramientos', duration: 30,
      format: '15 min de movilidad dinámica + 15 min de estiramientos post-esfuerzo.',
    },
  ],

  // ── Carrera corta de recuperación ────────────────────────────────────────
  run_recovery: [
    {
      id: 'Z2_SHORT', name: 'Carrera de recuperación', duration: 22,
      format: '20-25 min a ritmo muy suave, sin presión de tiempo.\nEl objetivo es mover las piernas, no el rendimiento.',
      hr_zone: 2,
    },
  ],

  // ── Simulacros y entrenamientos HYROX ────────────────────────────────────
  hyrox_sim: [
    {
      id: 'HX_A', name: 'Simulacro completo: 8 rondas', duration: 75,
      format: 'Completa 8 rondas seguidas.\nCada ronda: 400m corriendo + la estación indicada.\nDescansa lo mínimo posible entre rondas.',
      stations: ['SkiErg 250m', 'Empuje de trineo 25m', 'Arrastre de trineo 25m', 'Saltos de rana con burpee 20m', 'Remo en máquina 250m', 'Farmer carry 50m', 'Estocadas caminando con saco 25m', 'Wall balls 25 repeticiones'],
    },
    {
      id: 'HX_B', name: 'Simulacro parcial: 4 rondas', duration: 50,
      format: 'Completa 4 rondas.\nCada ronda: 400m corriendo + la estación indicada.',
      stations: ['SkiErg 250m', 'Empuje o arrastre de trineo 25m', 'Saltos de rana con burpee 20m', 'Farmer carry 50m'],
    },
    {
      id: 'HX_C', name: 'Circuito de estaciones: 3 rondas', duration: 48,
      format: 'Completa 3 rondas del circuito.\nDescansa 90 seg entre cada estación.',
      exercises: ['SkiErg 500m', 'Empuje de trineo 50m', 'Burpees 20 repeticiones', 'Farmer carry 80m', 'Wall balls 30 repeticiones', 'Estocadas caminando 50m'],
      rounds: 3, rest: '90s entre estaciones',
    },
    {
      id: 'HX_D', name: 'Carrera con trabajo funcional', duration: 55,
      format: 'Completa 4 bloques en orden.\nEn cada bloque: corre 1km a ritmo vivo, luego haz el ejercicio asignado.',
      blocks: ['1km a ritmo vivo → 15 burpees', '1km a ritmo vivo → 20 estocadas caminando', '1km a ritmo vivo → 30 wall balls', '1km a ritmo suave (enfriamiento)'],
    },
    {
      id: 'HX_E', name: 'Entrenamiento por tiempo: Volumen descendente', duration: 65,
      format: 'PARTE 1 — Máximo rondas en 8 min:\n· 100m en máquina de cardio + 5 sentadillas + 5 flexiones de pecho\n\nPARTE 2 — Contra el reloj, series descendentes de 50-40-30-20-10 repeticiones de cada ejercicio.\n\nPARTE 3 — 12 min alternando: 1 min de sprint en máquina / 1 min de plancha.',
      exercises: ['Máquina de cardio (remo, ski o bici) — ajusta la distancia', 'Jalón de potencia con mancuerna', 'Press sobre la cabeza con mancuerna'],
    },
    {
      id: 'HX_F', name: 'Circuito con carreras: Series ascendentes', duration: 45,
      format: 'CALENTAMIENTO — Máximo rondas en 9 min:\n· 5 remo + 5 swing + 5 press + 5 giro ruso\n\nTRABAJO PRINCIPAL — 26 min:\nSeries 10-20-30-40-50 repeticiones de cada ejercicio. Corre 200m entre cada serie.',
      exercises: ['Remo con mancuerna', 'Swing con press sobre la cabeza', 'Press con mancuerna', 'Giro ruso con mancuerna'],
    },
    {
      id: 'HX_G', name: 'Intervalos cada minuto + circuito final', duration: 55,
      format: 'PARTE 1 — Durante 20 min, rota cada minuto:\nMin 1: 45s en máquina de cardio\nMin 2: 8 estocadas frontales con peso (por lado)\nMin 3: 45s bicicleta abdominal\nMin 4: 4 man makers con mancuernas\n\nPARTE 2 — Máximo rondas en 14 min:\n8 peso muerto rumano · 20s plancha a una mano · 15 burpees',
    },
    {
      id: 'HX_H', name: 'Cada 3 minutos: cardio y core', duration: 45,
      format: 'PARTE 1 — 4 veces, cada 3 min:\nFlexiones laterales · Círculos de tronco · 45s cardio moderado en máquina.\n\nPARTE 2 — 19 min con cambios de 5-4-3-2-1 minutos:\nAlterna máquina de cardio con: swing con pesa rusa, remo vertical, arrastre lateral con mancuerna, bisagra de cadera.',
    },
    {
      id: 'HX_I', name: 'Intervalos 2 min trabajo / 1 min descanso', duration: 55,
      format: 'Trabaja 2 min en una estación, descansa 1 min, luego corre 400m a trote antes de cambiar.\nRepite en todas las estaciones.',
      stations: ['Remo en máquina', 'Wall balls', 'Burpee con plato al suelo', 'Farmer carry', 'Estocadas caminando'],
    },
    {
      id: 'HX_J', name: 'Preparación para carrera: 4 rondas', duration: 60,
      format: 'Completa 4 rondas lo más rápido posible.\nEntre cada ronda: 400m corriendo o 22 calorías en máquina.',
      exercises: ['18 calorías en máquina (remo, ski o bici)', '40 wall balls', '40m de estocadas caminando', '40 burpees con plato al suelo'],
      rounds: 4,
    },
  ],
}

// ─── Calentamientos por tipo de día ──────────────────────────────────────────

const STRENGTH_LOWER_WARMUPS: WorkoutBlock[] = [
  {
    type: 'warmup', label: 'Calentamiento',
    format: '8 min de activación de cadera y tren inferior — haz cada ejercicio de forma controlada y sin peso',
    exercises: [
      { name: 'Sentadilla profunda al aire (lenta, pausa abajo)', sets: 2, reps: '10' },
      { name: 'Estocada hacia adelante alternada', sets: 1, reps: '8 por pierna' },
      { name: 'Puente de glúteo en el suelo', sets: 2, reps: '15' },
      { name: 'Apertura de cadera lateral (clamshell)', sets: 1, reps: '12 por lado' },
    ],
  },
  {
    type: 'warmup', label: 'Calentamiento',
    format: '8 min de movilidad de cadera y activación — sin peso, movimientos amplios y controlados',
    exercises: [
      { name: 'Bisagra de cadera sin peso (hip hinge)', sets: 2, reps: '10' },
      { name: 'Estocada lateral con toque al suelo', sets: 1, reps: '8 por lado' },
      { name: 'Extensión de pierna hacia atrás en cuadrupedia', sets: 2, reps: '12 por pierna' },
      { name: 'Marcha en el lugar elevando rodillas', reps: '30 segundos' },
    ],
  },
  {
    type: 'warmup', label: 'Calentamiento',
    format: '8 min de activación antes de levantar peso',
    exercises: [
      { name: 'Rotaciones amplias de cadera de pie', sets: 1, reps: '10 por lado' },
      { name: 'Sentadilla al aire con pausa en el fondo', sets: 2, reps: '10' },
      { name: 'Buenos días sin peso (bisagra de cadera)', sets: 2, reps: '10' },
      { name: 'Saltos suaves en el lugar', reps: '20 segundos' },
    ],
  },
]

const STRENGTH_UPPER_WARMUPS: WorkoutBlock[] = [
  {
    type: 'warmup', label: 'Calentamiento',
    format: '8 min de activación de hombros y espalda — movimientos suaves, sin peso o muy ligero',
    exercises: [
      { name: 'Rotaciones de hombro hacia adelante y atrás', sets: 1, reps: '10 por lado' },
      { name: 'Apertura de pecho con brazos extendidos', sets: 2, reps: '12' },
      { name: 'Remo con banda elástica (activación dorsal)', sets: 2, reps: '15' },
      { name: 'Elevaciones laterales muy ligeras (activación)', sets: 2, reps: '12' },
    ],
  },
  {
    type: 'warmup', label: 'Calentamiento',
    format: '8 min de movilidad torácica y activación de espalda',
    exercises: [
      { name: 'Apertura torácica en el suelo (rotación lateral)', sets: 1, reps: '8 por lado' },
      { name: 'Separación de brazos con banda elástica', sets: 2, reps: '15' },
      { name: 'Flexiones de pecho con rango parcial (calentamiento)', sets: 2, reps: '8' },
      { name: 'Círculos de muñeca y codo', reps: '20 segundos cada articulación' },
    ],
  },
]

const HYROX_WARMUPS: WorkoutBlock[] = [
  {
    type: 'warmup', label: 'Calentamiento',
    format: '8-10 min de activación completa — prepara el cuerpo para trabajo de alta intensidad',
    exercises: [
      { name: 'Trote suave', reps: '3 min' },
      { name: 'Sentadillas al aire', sets: 2, reps: '10' },
      { name: 'Estocadas alternas hacia adelante', sets: 1, reps: '8 por pierna' },
      { name: 'Flexiones de pecho', sets: 2, reps: '10' },
      { name: 'Saltos suaves en el lugar', reps: '20 segundos' },
    ],
  },
  {
    type: 'warmup', label: 'Calentamiento',
    format: '8 min de activación funcional completa',
    exercises: [
      { name: 'Salteo lateral (de lado a lado)', reps: '30 segundos' },
      { name: 'Sentadilla profunda con pausa', sets: 2, reps: '8' },
      { name: 'Apertura de cadera de pie (rotación)', sets: 1, reps: '8 por lado' },
      { name: 'Remo con banda elástica', sets: 2, reps: '12' },
    ],
  },
]

const RUN_WARMUP_BLOCKS: WorkoutBlock[] = [
  {
    type: 'warmup', label: 'Calentamiento',
    format: '5 min de activación dinámica antes de correr',
    exercises: [
      { name: 'Elevación de rodillas en el lugar', reps: '10' },
      { name: 'Talón al glúteo en el lugar', reps: '10' },
      { name: 'Saltos suaves en el lugar (pogo jumps)', reps: '10' },
      { name: 'Aceleraciones cortas de 20m', reps: '4' },
    ],
  },
  {
    type: 'warmup', label: 'Calentamiento',
    format: '5 min de activación y técnica de carrera',
    exercises: [
      { name: 'Elevación de rodillas caminando (A-skip) 20m', reps: '2 veces' },
      { name: 'Talón al glúteo caminando (B-skip) 20m', reps: '2 veces' },
      { name: 'Pasos laterales cruzados 20m', reps: '2 veces' },
      { name: 'Aceleraciones cortas de 20m', reps: '2' },
    ],
  },
  {
    type: 'warmup', label: 'Calentamiento',
    format: '7 min de activación y movilidad para correr',
    exercises: [
      { name: 'Trote muy suave', reps: '1 min' },
      { name: 'Estocada hacia adelante con toque al suelo', reps: '10 por lado' },
      { name: 'Buenos días sin peso (movilidad de isquiotibial)', reps: '10' },
      { name: 'Aceleraciones cortas de 20m', reps: '3' },
    ],
  },
]

const COOLDOWN_BLOCKS: WorkoutBlock[] = [
  {
    type: 'cooldown', label: 'Enfriamiento',
    format: '5-8 min de estiramientos al terminar — mantén cada posición sin rebotar',
    exercises: [
      { name: 'Estiramiento de cuádriceps de pie', reps: '30 seg por pierna' },
      { name: 'Estiramiento de isquiotibiales sentado', reps: '30 seg por pierna' },
      { name: 'Apertura de cadera (posición de paloma en el suelo)', reps: '45 seg por lado' },
      { name: 'Estiramiento de pantorrilla contra la pared', reps: '30 seg por pierna' },
    ],
  },
  {
    type: 'cooldown', label: 'Enfriamiento',
    format: '5-8 min de recuperación activa post-entrenamiento',
    exercises: [
      { name: 'Estiramiento de pectoral en pared o esquina', reps: '30 seg por lado' },
      { name: 'Estiramiento de trapecio y cuello', reps: '20 seg por lado' },
      { name: 'Flexión de tronco hacia adelante relajada', reps: '40 segundos' },
      { name: 'Respiración profunda (inhala 4 seg – exhala 4 seg)', reps: '6 respiraciones' },
    ],
  },
]

// ─── Slot definitions ─────────────────────────────────────────────────────────

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

const HYROX_SLOTS: Record<number, SlotKey[]> = {
  3: ['SL', 'HX', 'RL'],
  4: ['SL', 'RI', 'HX', 'RL'],
  5: ['SL', 'RI', 'HX', 'SU', 'RL'],
  6: ['SL', 'RI', 'HX', 'SU', 'RL', 'RZ'],
}

const RUNNING_SLOTS: Record<number, SlotKey[]> = {
  3: ['RL', 'RI', 'RZ'],
  4: ['RL', 'RI', 'RT', 'RZ'],
  5: ['RL', 'RI', 'RZ', 'RT', 'RI2'],
  6: ['RL', 'RI', 'RZ', 'RT', 'RI2', 'RZ'],
}

const STRENGTH_SLOTS: Record<number, SlotKey[]> = {
  3: ['SL', 'SU', 'SL2'],
  4: ['SL', 'SU', 'SL2', 'SU2'],
  5: ['SL', 'SU', 'RZ', 'SL2', 'SU2'],
  6: ['SL', 'SU', 'RZ', 'SL2', 'SU2', 'RZ'],
}

const RECOMP_SLOTS: Record<number, SlotKey[]> = {
  3: ['SL', 'SU', 'RZ'],
  4: ['SL', 'SU', 'SL2', 'RZ'],
  5: ['SL', 'SU', 'RZ', 'SL2', 'SU2'],
  6: ['SL', 'SU', 'RZ', 'SL2', 'SU2', 'RI'],
}

function getSlotMap(primaryGoal: string): Record<number, SlotKey[]> {
  if (['21k', '10k', '5k', '15k', '42k'].includes(primaryGoal)) return RUNNING_SLOTS
  if (primaryGoal === 'strength' || primaryGoal === 'hypertrophy') return STRENGTH_SLOTS
  if (primaryGoal === 'recomp' || primaryGoal === 'general')       return RECOMP_SLOTS
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

export function buildPeriodization(totalWeeks: number): Array<{ phase: TrainingPhase; durationMod: number }> {
  const trainingWeeks = totalWeeks - 1

  type BlockCfg = { phase: TrainingPhase; pct: number; baseMod: number }

  let blocks: BlockCfg[]

  if (totalWeeks <= 5) {
    blocks = [{ phase: 'peak', pct: 1, baseMod: 1.0 }]
  } else if (totalWeeks <= 8) {
    blocks = [
      { phase: 'build', pct: 0.55, baseMod: 0.85 },
      { phase: 'peak',  pct: 0.45, baseMod: 1.05 },
    ]
  } else if (totalWeeks <= 12) {
    blocks = [
      { phase: 'base',  pct: 0.33, baseMod: 0.75 },
      { phase: 'build', pct: 0.44, baseMod: 0.88 },
      { phase: 'peak',  pct: 0.23, baseMod: 1.05 },
    ]
  } else if (totalWeeks <= 20) {
    blocks = [
      { phase: 'base',  pct: 0.37, baseMod: 0.72 },
      { phase: 'build', pct: 0.37, baseMod: 0.88 },
      { phase: 'peak',  pct: 0.26, baseMod: 1.05 },
    ]
  } else {
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

  result.push({ phase: 'taper', durationMod: 0.65 })
  return result.slice(0, totalWeeks)
}

// ─── Variant selection ────────────────────────────────────────────────────────

function pickVariant(slot: SlotKey, weekNum: number, phase: TrainingPhase): LibraryVariant {
  if (slot === 'HX') {
    if (phase === 'taper') return LIBRARY.hyrox_sim[2]
    const idx = (weekNum - 1) % LIBRARY.hyrox_sim.length
    return LIBRARY.hyrox_sim[idx]
  }

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

  if (phase === 'taper') return pool[0]
  if (phase === 'peak')  return pool[pool.length - 1]

  const idx = ((weekNum - 1) + offset) % pool.length
  return pool[idx]
}

// ─── Intensity ────────────────────────────────────────────────────────────────

function slotIntensity(slot: SlotKey, phase: TrainingPhase): IntensityLevel {
  if (phase === 'taper') return 'low'
  if (phase === 'base')  return 'low'
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

function variantToMainBlock(variant: LibraryVariant, dayType: DayType): WorkoutBlock {
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
    format:       variant.format,
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
      const warmupIdx   = (week - 1) % 2
      const cooldownIdx = (week - 1) % 2

      const blocks: WorkoutBlock[] = []

      // ── Calentamiento por tipo de día ──────────────────────────────────────
      if (dayType === 'strength_lower_day') {
        const idx = (week - 1) % STRENGTH_LOWER_WARMUPS.length
        blocks.push(STRENGTH_LOWER_WARMUPS[idx])
      } else if (dayType === 'strength_upper_day') {
        blocks.push(STRENGTH_UPPER_WARMUPS[warmupIdx])
      } else if (dayType === 'run_day') {
        const idx = (week - 1) % RUN_WARMUP_BLOCKS.length
        blocks.push(RUN_WARMUP_BLOCKS[idx])
      } else if (dayType === 'hyrox_day') {
        blocks.push(HYROX_WARMUPS[warmupIdx])
      }

      // ── Trabajo principal ──────────────────────────────────────────────────
      blocks.push(variantToMainBlock(variant, dayType))

      // ── Enfriamiento ───────────────────────────────────────────────────────
      if (dayType !== 'rest_day' && dayType !== 'race_day' && dayType !== 'recovery_day') {
        blocks.push(COOLDOWN_BLOCKS[cooldownIdx])
      }

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

  // ── Día de carrera + semana de recuperación ───────────────────────────────
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

      const recoveryWeek = totalWeeks + 1
      const goalTag      = raceGoal.type

      type RecoverySlot = {
        offset: number
        dayType: DayType
        isRest: boolean
        variantKey?: string
        label?: string
        format?: string
        duration?: number
      }

      const recoverySlots: RecoverySlot[] = [
        { offset: 1, dayType: 'rest_day',     isRest: true,  label: 'Descanso completo',        format: 'Descanso completo. Tu cuerpo lo necesita — no hay nada que hacer hoy.' },
        { offset: 2, dayType: 'recovery_day', isRest: false, variantKey: 'REC_B' },
        { offset: 3, dayType: 'recovery_day', isRest: false, variantKey: 'REC_A' },
        { offset: 4, dayType: 'rest_day',     isRest: true,  label: 'Descanso',                 format: 'Otro día de descanso. La recuperación es parte del entrenamiento.' },
        { offset: 5, dayType: 'run_day',      isRest: false, variantKey: 'Z2_SHORT' },
        { offset: 6, dayType: 'recovery_day', isRest: false, variantKey: 'REC_B' },
        { offset: 7, dayType: 'rest_day',     isRest: true,  label: 'Fin de la recuperación',   format: '¿Listo para tu próximo objetivo?' },
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
            ? [{ type: 'rest', label: slot.label ?? 'Descanso', format: slot.format }]
            : variant
            ? [variantToMainBlock(variant, slot.dayType)]
            : [],
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

  validatePlan(workouts, profile.training_days.length)

  return { plan, workouts }
}
