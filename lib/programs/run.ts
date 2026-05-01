import type { RunProgram } from './types'

const VARIANTS = ['A', 'B', 'C'] as const

// Helper to build a RunDay with 3 sessions (A/B/C) or a rest day
function restDay(dow: string) {
  return {
    dow,
    isRest: true,
    sessions: [
      { variant: 'A' as const, type: 'REST', description: 'Descanso total', distanceKm: 0, durationMin: 0, pacePerKm: '—', intensity: 'N/A', notes: 'Recuperación completa' },
      { variant: 'B' as const, type: 'EASY OPCIONAL', description: 'Carrera muy ligera opcional', distanceKm: 0, durationMin: 0, pacePerKm: '—', intensity: 'Muy Baja (Z1)', notes: 'Movilidad activa' },
      { variant: 'C' as const, type: 'REST', description: 'Descanso total', distanceKm: 0, durationMin: 0, pacePerKm: '—', intensity: 'N/A', notes: 'Recuperación completa' },
    ],
  }
}

export const RUN_PROGRAMS: RunProgram[] = [
  // ── 5K ────────────────────────────────────────────────────────────────────
  {
    goal: '5k',
    label: '5K',
    days: [
      {
        dow: 'LUNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',           description: 'Carrera de recuperación suave',    distanceKm: 5,   durationMin: 32, pacePerKm: '6:24', intensity: 'Baja (Z2)',         notes: 'Ritmo conversación' },
          { variant: 'B', type: 'TEMPO CORTO',    description: 'Trabajo de ritmo con cambios suaves',distanceKm: 5, durationMin: 28, pacePerKm: '5:36', intensity: 'Media (Z3)',        notes: 'Adaptación a ritmo' },
          { variant: 'C', type: 'FARTLEK LIGERO', description: 'Variaciones libres de ritmo',       distanceKm: 5.5,durationMin: 33, pacePerKm: '6:00', intensity: 'Media-Alta (Z3-Z4)',notes: 'Flexibilidad de ritmo' },
        ],
      },
      {
        dow: 'MARTES', isRest: false,
        sessions: [
          { variant: 'A', type: 'SERIES 400m', description: '8x400m @ 5K pace + 200m recovery', distanceKm: 4,   durationMin: 22, pacePerKm: '5:30', intensity: 'Muy Alta (Z5)', notes: 'Intensidad máxima' },
          { variant: 'B', type: 'SERIES 600m', description: '6x600m @ 5K pace + 300m recovery', distanceKm: 4.2, durationMin: 24, pacePerKm: '5:43', intensity: 'Muy Alta (Z5)', notes: 'Capacidad anaeróbica' },
          { variant: 'C', type: 'SERIES 800m', description: '5x800m @ 5K pace + 400m recovery', distanceKm: 4.4, durationMin: 26, pacePerKm: '5:54', intensity: 'Muy Alta (Z5)', notes: 'Potencia aeróbica' },
        ],
      },
      {
        dow: 'MIÉRCOLES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',          description: 'Carrera fácil de recuperación',   distanceKm: 4, durationMin: 26, pacePerKm: '6:30', intensity: 'Baja (Z2)', notes: 'Activa recuperación' },
          { variant: 'B', type: 'EASY LARGA',    description: 'Carrera larga de baja intensidad',distanceKm: 6, durationMin: 39, pacePerKm: '6:30', intensity: 'Baja (Z2)', notes: 'Base aeróbica' },
          { variant: 'C', type: 'EASY MODERADA', description: 'Carrera moderada de recuperación',distanceKm: 5, durationMin: 32, pacePerKm: '6:24', intensity: 'Baja (Z2)', notes: 'Regeneración' },
        ],
      },
      {
        dow: 'JUEVES', isRest: false,
        sessions: [
          { variant: 'A', type: 'TEMPO',             description: 'Ritmo umbral 20-25 minutos',              distanceKm: 6,   durationMin: 35, pacePerKm: '5:50', intensity: 'Alta (Z4)',         notes: 'Lactato umbral' },
          { variant: 'B', type: 'TEMPO PROGRESIVO',  description: '10min fácil + 15min tempo + 5min easy',   distanceKm: 6,   durationMin: 36, pacePerKm: '6:00', intensity: 'Media-Alta (Z3-Z4)',notes: 'Adaptación progresiva' },
          { variant: 'C', type: 'TEMPO CORTO x2',    description: '2x (10min tempo + 5min recovery)',         distanceKm: 5.5, durationMin: 33, pacePerKm: '6:00', intensity: 'Alta (Z4)',         notes: 'Bloques de esfuerzo' },
        ],
      },
      {
        dow: 'VIERNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',         description: 'Carrera fácil pre-competencia', distanceKm: 3,   durationMin: 19, pacePerKm: '6:20', intensity: 'Baja (Z2)', notes: 'Piernas frescas' },
          { variant: 'B', type: 'EASY + STRIDES',description: '3km easy + 6x100m strides',   distanceKm: 3.6, durationMin: 21, pacePerKm: '5:50', intensity: 'Baja (Z2)', notes: 'Activación neuromuscular' },
          { variant: 'C', type: 'EASY FLUIDA',  description: 'Carrera ligera y suave',       distanceKm: 4,   durationMin: 26, pacePerKm: '6:30', intensity: 'Baja (Z2)', notes: 'Recuperación activa' },
        ],
      },
      {
        dow: 'SÁBADO', isRest: false,
        sessions: [
          { variant: 'A', type: '5K CARRERA',     description: 'Carrera de 5K a ritmo de competencia', distanceKm: 5, durationMin: 25, pacePerKm: '5:00', intensity: 'Máxima (Z5)',         notes: 'CARRERA PRINCIPAL' },
          { variant: 'B', type: '5K TEMPO',       description: '5K a ritmo rápido pero controlado',    distanceKm: 5, durationMin: 27, pacePerKm: '5:24', intensity: 'Muy Alta (Z5)',        notes: 'Competencia simulada' },
          { variant: 'C', type: '5K PROGRESIVO',  description: 'Inicio suave, termina rápido',          distanceKm: 5, durationMin: 26, pacePerKm: '5:12', intensity: 'Media-Muy Alta (Z4-Z5)',notes: 'Finalización fuerte' },
        ],
      },
      restDay('DOMINGO'),
    ],
  },

  // ── 10K ───────────────────────────────────────────────────────────────────
  {
    goal: '10k',
    label: '10K',
    days: [
      {
        dow: 'LUNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',            description: 'Carrera de recuperación suave',    distanceKm: 6, durationMin: 39, pacePerKm: '6:30', intensity: 'Baja (Z2)',         notes: 'Ritmo conversación' },
          { variant: 'B', type: 'EASY LARGA',      description: 'Carrera larga para base aeróbica', distanceKm: 8, durationMin: 52, pacePerKm: '6:30', intensity: 'Baja (Z2)',         notes: 'Acumulación de volumen' },
          { variant: 'C', type: 'FARTLEK MODERADO',description: 'Variaciones de ritmo sin estructura',distanceKm: 7,durationMin: 42, pacePerKm: '6:00', intensity: 'Media-Alta (Z3-Z4)',notes: 'Flexibilidad de ritmo' },
        ],
      },
      {
        dow: 'MARTES', isRest: false,
        sessions: [
          { variant: 'A', type: 'SERIES 600m',  description: '8x600m @ 10K pace + 300m recovery', distanceKm: 5.4, durationMin: 32, pacePerKm: '5:56', intensity: 'Muy Alta (Z5)', notes: 'Capacidad anaeróbica' },
          { variant: 'B', type: 'SERIES 800m',  description: '6x800m @ 10K pace + 400m recovery', distanceKm: 5.6, durationMin: 34, pacePerKm: '6:05', intensity: 'Muy Alta (Z5)', notes: 'Potencia aeróbica' },
          { variant: 'C', type: 'SERIES 1000m', description: '5x1000m @ 10K pace + 500m recovery',distanceKm: 6.5, durationMin: 39, pacePerKm: '6:00', intensity: 'Muy Alta (Z5)', notes: 'Resistencia anaeróbica' },
        ],
      },
      {
        dow: 'MIÉRCOLES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',         description: 'Carrera de recuperación',     distanceKm: 5, durationMin: 33, pacePerKm: '6:36', intensity: 'Baja (Z2)', notes: 'Activa recuperación' },
          { variant: 'B', type: 'EASY MODERADA',description: 'Carrera moderada de recup',   distanceKm: 6, durationMin: 39, pacePerKm: '6:30', intensity: 'Baja (Z2)', notes: 'Base aeróbica' },
          { variant: 'C', type: 'EASY LARGA',   description: 'Carrera larga suave',         distanceKm: 7, durationMin: 46, pacePerKm: '6:34', intensity: 'Baja (Z2)', notes: 'Volumen sin esfuerzo' },
        ],
      },
      {
        dow: 'JUEVES', isRest: false,
        sessions: [
          { variant: 'A', type: 'TEMPO',            description: 'Ritmo umbral 25-30 minutos',            distanceKm: 7,   durationMin: 42, pacePerKm: '6:00', intensity: 'Alta (Z4)',         notes: 'Lactato umbral' },
          { variant: 'B', type: 'TEMPO PROGRESIVO', description: '10min easy + 20min tempo + 5min easy',  distanceKm: 7,   durationMin: 43, pacePerKm: '6:10', intensity: 'Media-Alta (Z3-Z4)',notes: 'Adaptación progresiva' },
          { variant: 'C', type: 'TEMPO LARGO',      description: 'Tempo de 30 minutos continuo',          distanceKm: 7.5, durationMin: 45, pacePerKm: '6:00', intensity: 'Alta (Z4)',         notes: 'Resistencia en tempo' },
        ],
      },
      {
        dow: 'VIERNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',          description: 'Carrera fácil pre-carrera',  distanceKm: 4,   durationMin: 26, pacePerKm: '6:30', intensity: 'Baja (Z2)',     notes: 'Piernas frescas' },
          { variant: 'B', type: 'EASY + STRIDES',description: '4km easy + 8x100m strides',  distanceKm: 4.8, durationMin: 29, pacePerKm: '6:02', intensity: 'Baja (Z2)',     notes: 'Activación neuromuscular' },
          { variant: 'C', type: 'RECUPERACIÓN',  description: 'Carrera muy ligera',          distanceKm: 3,   durationMin: 20, pacePerKm: '6:40', intensity: 'Muy Baja (Z1)',notes: 'Regeneración' },
        ],
      },
      {
        dow: 'SÁBADO', isRest: false,
        sessions: [
          { variant: 'A', type: '10K CARRERA',    description: 'Carrera de 10K a ritmo de competencia', distanceKm: 10, durationMin: 60, pacePerKm: '6:00', intensity: 'Máxima (Z5)',          notes: 'CARRERA PRINCIPAL' },
          { variant: 'B', type: '10K PROGRESIVO', description: 'Inicio suave, termina en ritmo',        distanceKm: 10, durationMin: 62, pacePerKm: '6:12', intensity: 'Media-Muy Alta (Z4-Z5)',notes: 'Finalización fuerte' },
          { variant: 'C', type: '10K TEMPO',      description: '10K a ritmo sostenido rápido',           distanceKm: 10, durationMin: 65, pacePerKm: '6:30', intensity: 'Muy Alta (Z5)',         notes: 'Competencia simulada' },
        ],
      },
      restDay('DOMINGO'),
    ],
  },

  // ── 15K ───────────────────────────────────────────────────────────────────
  {
    goal: '15k',
    label: '15K',
    days: [
      {
        dow: 'LUNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',        description: 'Carrera de recuperación suave',      distanceKm: 7, durationMin: 46, pacePerKm: '6:34', intensity: 'Baja (Z2)',         notes: 'Ritmo conversación' },
          { variant: 'B', type: 'EASY LARGA',  description: 'Carrera larga para base aeróbica',   distanceKm: 9, durationMin: 59, pacePerKm: '6:36', intensity: 'Baja (Z2)',         notes: 'Acumulación de volumen' },
          { variant: 'C', type: 'FARTLEK LARGO',description:'Variaciones de ritmo extensas',      distanceKm: 8, durationMin: 48, pacePerKm: '6:00', intensity: 'Media-Alta (Z3-Z4)',notes: 'Trabajo aeróbico-anaeróbico' },
        ],
      },
      {
        dow: 'MARTES', isRest: false,
        sessions: [
          { variant: 'A', type: 'SERIES 800m',  description: '8x800m @ 15K pace + 400m recovery',  distanceKm: 6.4, durationMin: 38, pacePerKm: '5:56', intensity: 'Muy Alta (Z5)', notes: 'Potencia aeróbica' },
          { variant: 'B', type: 'SERIES 1000m', description: '6x1000m @ 15K pace + 500m recovery', distanceKm: 6.6, durationMin: 40, pacePerKm: '6:06', intensity: 'Muy Alta (Z5)', notes: 'Resistencia anaeróbica' },
          { variant: 'C', type: 'SERIES 1200m', description: '5x1200m @ 15K pace + 600m recovery', distanceKm: 7,   durationMin: 42, pacePerKm: '6:00', intensity: 'Muy Alta (Z5)', notes: 'Capacidad de esfuerzo' },
        ],
      },
      {
        dow: 'MIÉRCOLES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',         description: 'Carrera de recuperación', distanceKm: 6, durationMin: 40, pacePerKm: '6:40', intensity: 'Baja (Z2)', notes: 'Activa recuperación' },
          { variant: 'B', type: 'EASY MODERADA',description: 'Carrera moderada de recup',distanceKm: 7,durationMin: 47, pacePerKm: '6:43', intensity: 'Baja (Z2)', notes: 'Base aeróbica' },
          { variant: 'C', type: 'EASY LARGA',   description: 'Carrera larga suave',     distanceKm: 8, durationMin: 53, pacePerKm: '6:37', intensity: 'Baja (Z2)', notes: 'Volumen sin esfuerzo' },
        ],
      },
      {
        dow: 'JUEVES', isRest: false,
        sessions: [
          { variant: 'A', type: 'TEMPO LARGO',       description: 'Ritmo umbral 30-35 minutos',               distanceKm: 8,   durationMin: 48, pacePerKm: '6:00', intensity: 'Alta (Z4)',         notes: 'Lactato umbral extendido' },
          { variant: 'B', type: 'TEMPO PROGRESIVO',  description: '10min easy + 25min tempo + 5min easy',     distanceKm: 8,   durationMin: 49, pacePerKm: '6:08', intensity: 'Media-Alta (Z3-Z4)',notes: 'Adaptación progresiva' },
          { variant: 'C', type: 'TEMPO + REPETIDAS', description: '20min tempo + 3x3min rápido',              distanceKm: 8.5, durationMin: 50, pacePerKm: '5:53', intensity: 'Alta-Muy Alta (Z4-Z5)',notes:'Trabajo combinado' },
        ],
      },
      {
        dow: 'VIERNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',          description: 'Carrera fácil pre-carrera',  distanceKm: 5,   durationMin: 34, pacePerKm: '6:48', intensity: 'Baja (Z2)',     notes: 'Piernas frescas' },
          { variant: 'B', type: 'EASY + STRIDES',description: '5km easy + 8x100m strides',  distanceKm: 5.8, durationMin: 36, pacePerKm: '6:12', intensity: 'Baja (Z2)',     notes: 'Activación neuromuscular' },
          { variant: 'C', type: 'EASY MODERADA', description: 'Carrera ligera',             distanceKm: 4,   durationMin: 27, pacePerKm: '6:45', intensity: 'Muy Baja (Z1)',notes: 'Regeneración' },
        ],
      },
      {
        dow: 'SÁBADO', isRest: false,
        sessions: [
          { variant: 'A', type: '15K CARRERA',    description: 'Carrera de 15K a ritmo de competencia', distanceKm: 15, durationMin: 90, pacePerKm: '6:00', intensity: 'Máxima (Z5)',          notes: 'CARRERA PRINCIPAL' },
          { variant: 'B', type: '15K PROGRESIVO', description: 'Inicio suave, termina rápido',           distanceKm: 15, durationMin: 93, pacePerKm: '6:12', intensity: 'Media-Muy Alta (Z4-Z5)',notes: 'Finalización fuerte' },
          { variant: 'C', type: '15K TEMPO LARGO',description: '15K a ritmo de tempo',                  distanceKm: 15, durationMin: 97, pacePerKm: '6:28', intensity: 'Muy Alta (Z5)',         notes: 'Esfuerzo sostenido' },
        ],
      },
      restDay('DOMINGO'),
    ],
  },

  // ── 21K ───────────────────────────────────────────────────────────────────
  {
    goal: '21k',
    label: 'Media Maratón',
    days: [
      {
        dow: 'LUNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',         description: 'Carrera de recuperación suave',     distanceKm: 8,  durationMin: 53, pacePerKm: '6:37', intensity: 'Baja (Z2)',         notes: 'Ritmo conversación' },
          { variant: 'B', type: 'EASY LARGA',   description: 'Carrera larga para base aeróbica',  distanceKm: 10, durationMin: 67, pacePerKm: '6:42', intensity: 'Baja (Z2)',         notes: 'Acumulación de volumen' },
          { variant: 'C', type: 'FARTLEK LARGO',description: 'Variaciones de ritmo extensas',     distanceKm: 9,  durationMin: 54, pacePerKm: '6:00', intensity: 'Media-Alta (Z3-Z4)',notes: 'Trabajo aeróbico-anaeróbico' },
        ],
      },
      {
        dow: 'MARTES', isRest: false,
        sessions: [
          { variant: 'A', type: 'SERIES 1000m', description: '6x1000m @ 21K pace + 500m recovery', distanceKm: 7.2, durationMin: 43, pacePerKm: '5:58', intensity: 'Muy Alta (Z5)', notes: 'Resistencia anaeróbica' },
          { variant: 'B', type: 'SERIES 1200m', description: '5x1200m @ 21K pace + 600m recovery', distanceKm: 7.4, durationMin: 45, pacePerKm: '6:05', intensity: 'Muy Alta (Z5)', notes: 'Potencia extendida' },
          { variant: 'C', type: 'SERIES 1500m', description: '4x1500m @ 21K pace + 700m recovery', distanceKm: 7.8, durationMin: 47, pacePerKm: '6:03', intensity: 'Muy Alta (Z5)', notes: 'Capacidad de resistencia' },
        ],
      },
      {
        dow: 'MIÉRCOLES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',         description: 'Carrera de recuperación', distanceKm: 7, durationMin: 47, pacePerKm: '6:43', intensity: 'Baja (Z2)', notes: 'Activa recuperación' },
          { variant: 'B', type: 'EASY MODERADA',description: 'Carrera moderada de recup',distanceKm: 8, durationMin: 54, pacePerKm: '6:45', intensity: 'Baja (Z2)', notes: 'Base aeróbica' },
          { variant: 'C', type: 'EASY LARGA',   description: 'Carrera larga suave',     distanceKm: 9, durationMin: 60, pacePerKm: '6:40', intensity: 'Baja (Z2)', notes: 'Volumen sin esfuerzo' },
        ],
      },
      {
        dow: 'JUEVES', isRest: false,
        sessions: [
          { variant: 'A', type: 'TEMPO LARGO',       description: 'Ritmo umbral 35-40 minutos',            distanceKm: 9,   durationMin: 54, pacePerKm: '6:00', intensity: 'Alta (Z4)',           notes: 'Lactato umbral extendido' },
          { variant: 'B', type: 'TEMPO PROGRESIVO',  description: '10min easy + 30min tempo + 5min easy',  distanceKm: 9,   durationMin: 55, pacePerKm: '6:07', intensity: 'Media-Alta (Z3-Z4)',  notes: 'Adaptación progresiva' },
          { variant: 'C', type: 'TEMPO + REPETIDAS', description: '25min tempo + 4x3min rápido',           distanceKm: 9.5, durationMin: 57, pacePerKm: '6:00', intensity: 'Alta-Muy Alta (Z4-Z5)',notes: 'Trabajo combinado' },
        ],
      },
      {
        dow: 'VIERNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',          description: 'Carrera fácil pre-carrera', distanceKm: 6,   durationMin: 41, pacePerKm: '6:50', intensity: 'Baja (Z2)',     notes: 'Piernas frescas' },
          { variant: 'B', type: 'EASY + STRIDES',description: '6km easy + 10x100m strides',distanceKm: 6.8, durationMin: 43, pacePerKm: '6:18', intensity: 'Baja (Z2)',     notes: 'Activación neuromuscular' },
          { variant: 'C', type: 'EASY MODERADA', description: 'Carrera ligera',            distanceKm: 5,   durationMin: 34, pacePerKm: '6:48', intensity: 'Muy Baja (Z1)',notes: 'Regeneración' },
        ],
      },
      {
        dow: 'SÁBADO', isRest: false,
        sessions: [
          { variant: 'A', type: '21K CARRERA',    description: 'Carrera de 21K (Media Maratón) competencia', distanceKm: 21, durationMin: 126, pacePerKm: '6:00', intensity: 'Máxima (Z5)',          notes: 'CARRERA PRINCIPAL' },
          { variant: 'B', type: '21K PROGRESIVO', description: 'Inicio suave, termina rápido',               distanceKm: 21, durationMin: 130, pacePerKm: '6:12', intensity: 'Media-Muy Alta (Z4-Z5)',notes: 'Finalización fuerte' },
          { variant: 'C', type: '21K TEMPO LARGO',description: '21K a ritmo de tempo (6:15)',                distanceKm: 21, durationMin: 131, pacePerKm: '6:15', intensity: 'Muy Alta (Z5)',         notes: 'Esfuerzo sostenido' },
        ],
      },
      restDay('DOMINGO'),
    ],
  },

  // ── 42K ───────────────────────────────────────────────────────────────────
  {
    goal: '42k',
    label: 'Maratón',
    days: [
      {
        dow: 'LUNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',         description: 'Carrera de recuperación suave',    distanceKm: 9,  durationMin: 60, pacePerKm: '6:40', intensity: 'Baja (Z2)',         notes: 'Ritmo conversación' },
          { variant: 'B', type: 'EASY LARGA',   description: 'Carrera larga para base aeróbica', distanceKm: 11, durationMin: 74, pacePerKm: '6:44', intensity: 'Baja (Z2)',         notes: 'Acumulación de volumen' },
          { variant: 'C', type: 'FARTLEK LARGO',description: 'Variaciones de ritmo extensas',    distanceKm: 10, durationMin: 60, pacePerKm: '6:00', intensity: 'Media-Alta (Z3-Z4)',notes: 'Trabajo aeróbico-anaeróbico' },
        ],
      },
      {
        dow: 'MARTES', isRest: false,
        sessions: [
          { variant: 'A', type: 'SERIES 1200m', description: '5x1200m @ Ritmo Maratón + 600m recovery', distanceKm: 7.8, durationMin: 47, pacePerKm: '6:02', intensity: 'Muy Alta (Z5)', notes: 'Potencia extendida' },
          { variant: 'B', type: 'SERIES 1500m', description: '4x1500m @ Ritmo Maratón + 700m recovery', distanceKm: 8.2, durationMin: 49, pacePerKm: '5:58', intensity: 'Muy Alta (Z5)', notes: 'Capacidad de resistencia' },
          { variant: 'C', type: 'SERIES 2000m', description: '3x2000m @ Ritmo Maratón + 800m recovery', distanceKm: 8.8, durationMin: 53, pacePerKm: '6:02', intensity: 'Muy Alta (Z5)', notes: 'Resistencia extrema' },
        ],
      },
      {
        dow: 'MIÉRCOLES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',         description: 'Carrera de recuperación', distanceKm: 8,  durationMin: 54, pacePerKm: '6:45', intensity: 'Baja (Z2)', notes: 'Activa recuperación' },
          { variant: 'B', type: 'EASY MODERADA',description: 'Carrera moderada de recup',distanceKm: 9, durationMin: 61, pacePerKm: '6:47', intensity: 'Baja (Z2)', notes: 'Base aeróbica' },
          { variant: 'C', type: 'EASY LARGA',   description: 'Carrera larga suave',     distanceKm: 10, durationMin: 67, pacePerKm: '6:42', intensity: 'Baja (Z2)', notes: 'Volumen sin esfuerzo' },
        ],
      },
      {
        dow: 'JUEVES', isRest: false,
        sessions: [
          { variant: 'A', type: 'TEMPO LARGO',       description: 'Ritmo umbral 40-45 minutos',            distanceKm: 10,   durationMin: 60, pacePerKm: '6:00', intensity: 'Alta (Z4)',           notes: 'Lactato umbral extendido' },
          { variant: 'B', type: 'TEMPO PROGRESIVO',  description: '10min easy + 35min tempo + 5min easy',  distanceKm: 10,   durationMin: 61, pacePerKm: '6:06', intensity: 'Media-Alta (Z3-Z4)',  notes: 'Adaptación progresiva' },
          { variant: 'C', type: 'TEMPO + REPETIDAS', description: '30min tempo + 4x4min rápido',           distanceKm: 10.5, durationMin: 63, pacePerKm: '6:00', intensity: 'Alta-Muy Alta (Z4-Z5)',notes: 'Trabajo combinado' },
        ],
      },
      {
        dow: 'VIERNES', isRest: false,
        sessions: [
          { variant: 'A', type: 'EASY',          description: 'Carrera fácil pre-carrera', distanceKm: 7,   durationMin: 47, pacePerKm: '6:43', intensity: 'Baja (Z2)',     notes: 'Piernas frescas' },
          { variant: 'B', type: 'EASY + STRIDES',description: '7km easy + 10x100m strides',distanceKm: 7.8, durationMin: 49, pacePerKm: '6:18', intensity: 'Baja (Z2)',     notes: 'Activación neuromuscular' },
          { variant: 'C', type: 'EASY MODERADA', description: 'Carrera ligera',            distanceKm: 6,   durationMin: 41, pacePerKm: '6:50', intensity: 'Muy Baja (Z1)',notes: 'Regeneración' },
        ],
      },
      {
        dow: 'SÁBADO', isRest: false,
        sessions: [
          { variant: 'A', type: 'LARGO MARATÓN',   description: 'Carrera larga 30-35km @ ritmo maratón', distanceKm: 32, durationMin: 192, pacePerKm: '6:00', intensity: 'Alta-Máxima (Z4-Z5)',  notes: 'CARRERA LARGA CLAVE' },
          { variant: 'B', type: 'MARATÓN SIMULADA',description: '42K a ritmo de carrera (competencia)',  distanceKm: 42, durationMin: 252, pacePerKm: '6:00', intensity: 'Máxima (Z5)',           notes: 'COMPETENCIA COMPLETA' },
          { variant: 'C', type: 'MARATÓN PROGRESIVA',description:'42K inicio suave, termina en ritmo',  distanceKm: 42, durationMin: 258, pacePerKm: '6:08', intensity: 'Media-Muy Alta (Z4-Z5)',notes: 'Finalización fuerte' },
        ],
      },
      restDay('DOMINGO'),
    ],
  },
]
