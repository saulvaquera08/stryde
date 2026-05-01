import type { GymDay } from './types'

export const GYM_PROGRAM: GymDay[] = [
  {
    dow: 'LUNES',
    muscle: 'Pecho – Hombro – Trícep',
    isRest: false,
    workouts: [
      {
        variant: 'A',
        focus: 'Enfoque Pecho',
        exercises: [
          { name: 'Press Banca Plano',          sets: 4, reps: '6',  weight: '110 kg', rest: 180 },
          { name: 'Flexión Inclinada Mancuerna', sets: 4, reps: '8',  weight: '45 kg',  rest: 120 },
          { name: 'Aperturas Cables Plano',      sets: 3, reps: '12', weight: '40 kg',  rest: 90  },
          { name: 'Press Hombro Mancuerna',      sets: 3, reps: '10', weight: '38 kg',  rest: 90  },
          { name: 'Elevación Lateral',           sets: 3, reps: '12', weight: '14 kg',  rest: 60  },
          { name: 'Fondos Banca Trícep',         sets: 3, reps: '8',  weight: '+20 kg', rest: 90  },
        ],
      },
      {
        variant: 'B',
        focus: 'Equilibrio',
        exercises: [
          { name: 'Press Banca Inclinado',    sets: 4, reps: '8',  weight: '95 kg',  rest: 120 },
          { name: 'Flexión Pecho Mancuerna',  sets: 3, reps: '10', weight: '40 kg',  rest: 90  },
          { name: 'Press Hombro Barra',       sets: 4, reps: '8',  weight: '70 kg',  rest: 120 },
          { name: 'Pájaros Inverso Rear Delt',sets: 3, reps: '12', weight: '15 kg',  rest: 60  },
          { name: 'Aperturas Cables Altas',   sets: 3, reps: '12', weight: '35 kg',  rest: 90  },
          { name: 'Extensión Trícep Cuerda',  sets: 4, reps: '12', weight: '40 kg',  rest: 60  },
        ],
      },
      {
        variant: 'C',
        focus: 'Volumen',
        exercises: [
          { name: 'Máquina Pectoral',           sets: 4, reps: '10', weight: '140 kg', rest: 90 },
          { name: 'Flexión Pecho Máquina Smith', sets: 3, reps: '12', weight: '80 kg',  rest: 90 },
          { name: 'Pec Deck',                   sets: 3, reps: '12', weight: '130 kg', rest: 60 },
          { name: 'Lateral Raise Machine',       sets: 4, reps: '12', weight: '90 kg',  rest: 60 },
          { name: 'Elevación Frontal Mancuerna', sets: 3, reps: '12', weight: '12 kg',  rest: 60 },
          { name: 'Extensión Trícep Máquina',   sets: 3, reps: '15', weight: '110 kg', rest: 60 },
        ],
      },
    ],
  },
  {
    dow: 'MARTES',
    muscle: 'Espalda – Bícep',
    isRest: false,
    workouts: [
      {
        variant: 'A',
        focus: 'Enfoque Espalda',
        exercises: [
          { name: 'Peso Muerto Convencional',  sets: 3, reps: '5',  weight: '150 kg', rest: 180 },
          { name: 'Remo Barra',                sets: 4, reps: '6',  weight: '110 kg', rest: 120 },
          { name: 'Remo Máquina T-Bar',        sets: 4, reps: '8',  weight: '140 kg', rest: 90  },
          { name: 'Remo Unilateral Mancuerna', sets: 3, reps: '8',  weight: '55 kg',  rest: 90  },
          { name: 'Curl Barra Z',              sets: 3, reps: '10', weight: '55 kg',  rest: 90  },
          { name: 'Curl Máquina Aislada',      sets: 3, reps: '12', weight: '100 kg', rest: 60  },
        ],
      },
      {
        variant: 'B',
        focus: 'Equilibrio',
        exercises: [
          { name: 'Peso Muerto Sumo',          sets: 3, reps: '6',  weight: '140 kg',    rest: 180 },
          { name: 'Remo Pendlay',               sets: 4, reps: '8',  weight: '95 kg',     rest: 120 },
          { name: 'Pull-ups Asistidas',         sets: 4, reps: '8',  weight: 'Peso Corp', rest: 90  },
          { name: 'Remo Máquina',               sets: 3, reps: '12', weight: '130 kg',    rest: 90  },
          { name: 'Curl Mancuerna Alternada',   sets: 4, reps: '10', weight: '22 kg',     rest: 60  },
          { name: 'Curl Martillo',              sets: 3, reps: '12', weight: '18 kg',     rest: 60  },
        ],
      },
      {
        variant: 'C',
        focus: 'Volumen',
        exercises: [
          { name: 'Smith Remo',                sets: 4, reps: '10', weight: '100 kg', rest: 90 },
          { name: 'Lat Pulldown',              sets: 4, reps: '10', weight: '120 kg', rest: 90 },
          { name: 'Remo Máquina Horizontal',   sets: 3, reps: '12', weight: '140 kg', rest: 60 },
          { name: 'Pájaros Invertidos',        sets: 3, reps: '12', weight: '30 kg',  rest: 60 },
          { name: 'Curl Máquina',              sets: 4, reps: '12', weight: '95 kg',  rest: 60 },
          { name: 'Curl Predicador Máquina',   sets: 3, reps: '15', weight: '80 kg',  rest: 45 },
        ],
      },
    ],
  },
  {
    dow: 'MIÉRCOLES',
    muscle: 'Pierna',
    isRest: false,
    workouts: [
      {
        variant: 'A',
        focus: 'Fuerza',
        exercises: [
          { name: 'Sentadilla Barra',            sets: 4, reps: '5',  weight: '130 kg', rest: 180 },
          { name: 'Peso Muerto Pierna Rígida',   sets: 3, reps: '6',  weight: '140 kg', rest: 120 },
          { name: 'Leg Press 45',                sets: 3, reps: '8',  weight: '220 kg', rest: 120 },
          { name: 'Hack Squat',                  sets: 3, reps: '10', weight: '180 kg', rest: 90  },
          { name: 'Leg Curl Tumbada',            sets: 3, reps: '10', weight: '110 kg', rest: 90  },
          { name: 'Extensión Cuádriceps',        sets: 3, reps: '12', weight: '110 kg', rest: 60  },
        ],
      },
      {
        variant: 'B',
        focus: 'Volumen',
        exercises: [
          { name: 'Sentadilla Búlgara',          sets: 4, reps: '10', weight: '50 kg',  rest: 90 },
          { name: 'Prensa Pierna 45',            sets: 4, reps: '10', weight: '200 kg', rest: 90 },
          { name: 'Smith Sentadilla',            sets: 3, reps: '12', weight: '100 kg', rest: 90 },
          { name: 'Leg Press Angosto',           sets: 3, reps: '12', weight: '180 kg', rest: 60 },
          { name: 'Leg Curl de Pie',             sets: 3, reps: '12', weight: '100 kg', rest: 60 },
          { name: 'Extensión Cuádriceps Máquina',sets: 3, reps: '15', weight: '100 kg', rest: 45 },
        ],
      },
      {
        variant: 'C',
        focus: 'Híbrido',
        exercises: [
          { name: 'Sentadilla Goblet',    sets: 4, reps: '12', weight: '32 kg',  rest: 90 },
          { name: 'Prensa Máquina',       sets: 3, reps: '12', weight: '210 kg', rest: 90 },
          { name: 'Smith Estocadas',      sets: 3, reps: '10', weight: '70 kg',  rest: 90 },
          { name: 'Leg Press Máquina',    sets: 3, reps: '12', weight: '190 kg', rest: 60 },
          { name: 'Curl Pierna Acostada', sets: 4, reps: '10', weight: '105 kg', rest: 60 },
          { name: 'Pantorrillas Máquina', sets: 4, reps: '15', weight: '130 kg', rest: 45 },
        ],
      },
    ],
  },
  {
    dow: 'JUEVES',
    muscle: 'Hombro – Pecho – Trícep',
    isRest: false,
    workouts: [
      {
        variant: 'A',
        focus: 'Hombro Fuerza',
        exercises: [
          { name: 'Press Hombro Barra',       sets: 4, reps: '6',  weight: '75 kg', rest: 150 },
          { name: 'Elevación Frontal Barra',  sets: 4, reps: '8',  weight: '45 kg', rest: 90  },
          { name: 'Press Inclinado Barra',    sets: 3, reps: '8',  weight: '90 kg', rest: 120 },
          { name: 'Elevación Lateral',        sets: 3, reps: '12', weight: '16 kg', rest: 60  },
          { name: 'Pájaros Inversos',         sets: 3, reps: '12', weight: '17 kg', rest: 60  },
          { name: 'Extensión Trícep Overhead',sets: 3, reps: '12', weight: '40 kg', rest: 60  },
        ],
      },
      {
        variant: 'B',
        focus: 'Hombro Volumen',
        exercises: [
          { name: 'Press Hombro Mancuerna',       sets: 4, reps: '10', weight: '42 kg',  rest: 90 },
          { name: 'Lateral Raise Machine',        sets: 4, reps: '12', weight: '95 kg',  rest: 60 },
          { name: 'Flexión Inclinada Máquina',    sets: 3, reps: '12', weight: '135 kg', rest: 90 },
          { name: 'Pájaros Inversos Máquina',     sets: 3, reps: '12', weight: '95 kg',  rest: 60 },
          { name: 'Elevación Frontal Máquina',    sets: 3, reps: '12', weight: '75 kg',  rest: 60 },
          { name: 'Extensión Trícep Cuerda Máq.', sets: 3, reps: '15', weight: '90 kg',  rest: 45 },
        ],
      },
      {
        variant: 'C',
        focus: 'Equilibrio',
        exercises: [
          { name: 'Press Hombro Alternado',   sets: 4, reps: '10', weight: '35 kg',  rest: 90 },
          { name: 'Elevación Lateral Mancuerna',sets:4, reps: '12', weight: '15 kg',  rest: 60 },
          { name: 'Press Banca Máquina',      sets: 4, reps: '10', weight: '130 kg', rest: 90 },
          { name: 'Pec Deck',                 sets: 3, reps: '12', weight: '130 kg', rest: 60 },
          { name: 'Remo Alto Barra',          sets: 3, reps: '10', weight: '70 kg',  rest: 90 },
          { name: 'Fondos Máquina Asistida',  sets: 3, reps: '12', weight: '-30 kg', rest: 60 },
        ],
      },
    ],
  },
  {
    dow: 'VIERNES',
    muscle: 'Brazos – Espalda',
    isRest: false,
    workouts: [
      {
        variant: 'A',
        focus: 'Bícep Fuerza',
        exercises: [
          { name: 'Curl Barra Z Olímpica',   sets: 4, reps: '6',  weight: '60 kg',  rest: 120 },
          { name: 'Curl Barra Recta',        sets: 4, reps: '8',  weight: '55 kg',  rest: 90  },
          { name: 'Curl Mancuerna Alternada',sets: 3, reps: '10', weight: '24 kg',  rest: 60  },
          { name: 'Remo Barra',              sets: 3, reps: '8',  weight: '100 kg', rest: 120 },
          { name: 'Remo Máquina',            sets: 3, reps: '10', weight: '130 kg', rest: 90  },
          { name: 'Curl Máquina Aislada',    sets: 3, reps: '12', weight: '100 kg', rest: 60  },
        ],
      },
      {
        variant: 'B',
        focus: 'Trícep Volumen',
        exercises: [
          { name: 'Extensión Trícep Cuerda',         sets: 4, reps: '10', weight: '45 kg',  rest: 90 },
          { name: 'Extensión Trícep Mancuerna Over.', sets: 4, reps: '12', weight: '20 kg',  rest: 60 },
          { name: 'Fondos Banca',                    sets: 3, reps: '12', weight: '+15 kg', rest: 90 },
          { name: 'Curl Martillo Mancuerna',         sets: 4, reps: '12', weight: '18 kg',  rest: 60 },
          { name: 'Curl Predicador Máquina',         sets: 3, reps: '12', weight: '80 kg',  rest: 60 },
          { name: 'Remo Máquina T-Bar',              sets: 3, reps: '10', weight: '140 kg', rest: 90 },
        ],
      },
      {
        variant: 'C',
        focus: 'Brazos Equilibrio',
        exercises: [
          { name: 'Curl Araña',           sets: 4, reps: '10', weight: '50 kg',    rest: 90  },
          { name: 'Curl Máquina',         sets: 4, reps: '12', weight: '95 kg',    rest: 60  },
          { name: 'Curl Martillo Máquina',sets: 3, reps: '12', weight: '75 kg',    rest: 60  },
          { name: 'Extensión Trícep Máq.',sets: 4, reps: '12', weight: '110 kg',   rest: 60  },
          { name: 'Pull-ups',             sets: 3, reps: '8',  weight: 'Peso Corp', rest: 90 },
          { name: 'Remo Pendlay',         sets: 3, reps: '8',  weight: '95 kg',    rest: 120 },
        ],
      },
    ],
  },
  {
    dow: 'SÁBADO',
    muscle: 'Full Body',
    isRest: false,
    workouts: [
      {
        variant: 'A',
        focus: 'Full Body Fuerza',
        exercises: [
          { name: 'Sentadilla Barra',      sets: 3, reps: '5', weight: '130 kg', rest: 180 },
          { name: 'Press Banca',           sets: 3, reps: '6', weight: '110 kg', rest: 120 },
          { name: 'Peso Muerto ROM Corto', sets: 3, reps: '5', weight: '150 kg', rest: 180 },
          { name: 'Remo Barra',            sets: 3, reps: '6', weight: '100 kg', rest: 120 },
          { name: 'Press Hombro Mancuerna',sets: 3, reps: '8', weight: '40 kg',  rest: 90  },
          { name: 'Curl Barra Z',          sets: 3, reps: '10',weight: '50 kg',  rest: 60  },
        ],
      },
      {
        variant: 'B',
        focus: 'Full Body Volumen',
        exercises: [
          { name: 'Leg Press',            sets: 3, reps: '12', weight: '210 kg', rest: 90 },
          { name: 'Flexión Pecho Máquina',sets: 3, reps: '12', weight: '135 kg', rest: 90 },
          { name: 'Leg Curl Acostada',    sets: 3, reps: '12', weight: '110 kg', rest: 60 },
          { name: 'Lat Pulldown',         sets: 3, reps: '12', weight: '120 kg', rest: 90 },
          { name: 'Lateral Raise Máquina',sets: 3, reps: '12', weight: '90 kg',  rest: 60 },
          { name: 'Extensión Trícep Cuerd',sets:3, reps: '12', weight: '45 kg',  rest: 60 },
        ],
      },
      {
        variant: 'C',
        focus: 'Full Body Metabólico',
        exercises: [
          { name: 'Sentadilla Goblet',       sets: 4, reps: '12', weight: '32 kg',    rest: 90 },
          { name: 'Push-ups Banco Inclinado', sets: 3, reps: '15', weight: 'Peso Corp', rest: 60 },
          { name: 'Remo Máquina',             sets: 3, reps: '12', weight: '130 kg',   rest: 90 },
          { name: 'Prensa de Pierna',         sets: 3, reps: '15', weight: '190 kg',   rest: 60 },
          { name: 'Pec Deck',                 sets: 3, reps: '15', weight: '130 kg',   rest: 60 },
          { name: 'Curl Máquina',             sets: 3, reps: '15', weight: '95 kg',    rest: 45 },
        ],
      },
    ],
  },
  {
    dow: 'DOMINGO',
    muscle: 'Descanso',
    isRest: true,
    workouts: [],
  },
]
