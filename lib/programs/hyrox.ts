import type { HyroxDay } from './types'

export const HYROX_PROGRAM: HyroxDay[] = [
  {
    dow: 'LUNES',
    type: 'strength',
    title: 'Fuerza Superior',
    description: 'Press, Rows, Overhead Work + Grip Strength',
    blocks: [
      // Warm up
      { name: 'Cardio Ligero (Bicicleta / Rower / SkiErg)', type: 'Cardio',   volume: '5 min', weight: '—', rest: '—',      notes: 'Baja intensidad' },
      { name: 'Arm Circles + Band Pulls + Good Mornings',   type: 'Movilidad',volume: '10 reps c/u', weight: '—', rest: '—', notes: 'Dinámica' },
      // Bloque 1
      { name: 'Dumbbell Bench Press',          type: 'Horizontal Push',    volume: '4×6-8',    weight: '40-45 kg c/mano', rest: '120 seg', notes: 'Fuerza máxima' },
      { name: 'Incline Dumbbell Press',        type: 'Incline Push',       volume: '3×8-10',   weight: '35-40 kg c/mano', rest: '90 seg',  notes: 'Pecho superior' },
      { name: 'Dumbbell Rows (Unilateral)',    type: 'Horizontal Pull',    volume: '4×8-10',   weight: '40-45 kg c/mano', rest: '90 seg',  notes: 'Espalda' },
      // Bloque 2
      { name: 'Overhead Press (Mancuerna)',    type: 'Vertical Push',      volume: '4×6-8',    weight: '30-35 kg c/mano', rest: '120 seg', notes: 'Press hombro' },
      { name: 'Face Pulls',                   type: 'Rear Delt/Rotator',  volume: '3×15-20',  weight: '15-20 kg',        rest: '60 seg',  notes: 'Salud hombro' },
      { name: 'Farmer Carry',                 type: 'Grip/Core',          volume: '3×200 m',  weight: '30-35 kg c/mano', rest: '2 min walk', notes: 'Resistencia grip' },
      // Bloque 3
      { name: 'Kettlebell Swings',            type: 'Explosive',          volume: '3×15-20',  weight: '20-24 kg', rest: '90 seg', notes: 'Potencia espalda' },
      { name: 'Plank Holds',                  type: 'Core',               volume: '3×45-60 s',weight: '—',        rest: '60 seg', notes: 'Resistencia core' },
    ],
  },
  {
    dow: 'MARTES',
    type: 'cardio',
    title: 'Cardio / Velocidad',
    description: 'Carrera Intervalada (8×1km @ 5K pace) + Transiciones',
    blocks: [
      { time: '00:00-10:00', duration: '10 min', segment: 'Warm Up',             station: 'Carrera fácil + dinámica movilidad', volume: '1 km',    notes: 'Z2 Easy (6:30) — preparación' },
      { time: '10:00-11:00', duration: '1 min',  segment: 'Build',               station: 'Progresivo hacia ritmo',             volume: '1 km',    notes: 'Z3 Gradual' },
      { time: '11:00-31:00', duration: '20 min', segment: 'INTERVALOS',          station: '8×1km @ 5K pace + 2min recovery',   volume: '8×1 km',  notes: 'Intensidad MUY ALTA — Z5' },
      { time: '31:00-33:00', duration: '2 min',  segment: 'Transición Práctica', station: 'Aceleración final (entrada estación)',volume: '400 m',  notes: 'Z4-Z5 — práctica transición' },
      { time: '33:00-38:00', duration: '5 min',  segment: 'Cool Down',           station: 'Carrera suave + recuperación',       volume: '1 km',    notes: 'Z2 Easy — normalización' },
    ],
  },
  {
    dow: 'MIÉRCOLES',
    type: 'strength',
    title: 'Fuerza Inferior',
    description: 'Squats, Lunges, Farmer Carry, Sandbag + Core',
    blocks: [
      // Warm up
      { name: 'Cardio Ligero (Bicicleta o Rower)', type: 'Cardio',   volume: '5 min',      weight: '—', rest: '—', notes: 'Baja intensidad' },
      { name: 'Leg Swings + Goblet Squats + Lunges Dinámicas', type: 'Movilidad', volume: '10 reps c/u', weight: '—', rest: '—', notes: 'Preparación piernas' },
      // Bloque 1
      { name: 'Front Squats o Goblet Squats',    type: 'Bilateral Squat',     volume: '4×6-8',   weight: '80-100 kg / 25-30 kg', rest: '120 seg',  notes: 'Fuerza cuad/core' },
      { name: 'Walking Lunges (Sandbag on Back)',type: 'Unilateral',          volume: '3×100 m', weight: '15-20 kg sandbag',      rest: '2 min walk',notes: 'Simulación HYROX' },
      { name: 'Leg Curl Machine',               type: 'Hamstring Iso',       volume: '3×10-12', weight: '120-140 kg',            rest: '90 seg',   notes: 'Balance muscular' },
      // Bloque 2
      { name: 'Heavy Farmer Carry',             type: 'Grip Strength',       volume: '3×200 m', weight: '30-35 kg c/mano',       rest: '2 min walk',notes: 'Resistencia grip HYROX' },
      { name: 'Kettlebell Waiter Walks',        type: 'Overhead Stability',  volume: '3×50 m',  weight: '15-20 kg',              rest: '60 seg',   notes: 'Estabilidad hombro' },
      { name: 'Dead Hangs',                    type: 'Grip Endurance',      volume: '3×20-30 s',weight: '—',                    rest: '90 seg',   notes: 'Forearm endurance' },
      // Bloque 3
      { name: 'Weighted Planks',               type: 'Core',                volume: '3×45-60 s',weight: '15-20 kg plate',        rest: '60 seg',   notes: 'Resistencia core' },
      { name: 'Cable Woodchops',               type: 'Rotational Core',     volume: '3×12 c/lado',weight: '20-25 kg',           rest: '60 seg',   notes: 'Estabilidad rotacional' },
    ],
  },
  {
    dow: 'JUEVES',
    type: 'simulation',
    title: 'Simulación HYROX Reducida',
    description: '4 km + 4 estaciones (EMOM) — práctica específica con volumen moderado',
    blocks: [
      { time: '00:00-07:00', duration: '7 min',  segment: 'WARM UP AMRAP',  station: 'General',           volume: '1 min cardio + 8/8 renegade row + 8 Z press + 8 GM', notes: 'Activación' },
      { time: '07:00-09:00', duration: '2 min',  segment: 'REST',           station: 'N/A',               volume: 'Descanso y respiración', notes: 'Recuperación' },
      { time: '09:00-19:00', duration: '10 min', segment: 'CARRERA 1 + EST',station: 'SkiErg',            volume: '1 km run + 1000 m SkiErg', notes: 'E2MOM' },
      { time: '19:00-29:00', duration: '10 min', segment: 'CARRERA 2 + EST',station: 'Wall Balls',        volume: '1 km run + 30 wall balls (6 kg)', notes: 'E2MOM' },
      { time: '29:00-39:00', duration: '10 min', segment: 'CARRERA 3 + EST',station: 'Farmer Carry',      volume: '1 km run + 200 m farmer (30 kg)', notes: 'E2MOM' },
      { time: '39:00-49:00', duration: '10 min', segment: 'CARRERA 4 + EST',station: 'Burpee Broad Jumps',volume: '1 km run + 80 m burpees', notes: 'E2MOM' },
      { time: '49:00-55:00', duration: '6 min',  segment: 'COOLDOWN',       station: 'General',           volume: 'Cardio suave + respiración', notes: 'Recuperación activa' },
    ],
  },
  {
    dow: 'VIERNES',
    type: 'cardio',
    title: 'Cardio / Resistencia',
    description: 'Carrera Larga (Easy Pace 5-6 km) + Técnica Transiciones',
    blocks: [
      { time: '00:00-10:00', duration: '10 min', segment: 'Warm Up',          station: 'Carrera fácil + movilidad',      volume: '1.5 km', notes: 'Preparación' },
      { time: '10:00-40:00', duration: '30 min', segment: 'LONG RUN',         station: 'Carrera larga de resistencia',  volume: '5 km',   notes: 'Base aeróbica' },
      { time: '40:00-42:00', duration: '2 min',  segment: 'Transición Práct.',station: 'Simula estación sin parar',     volume: '0.3 km', notes: 'Transición suave' },
      { time: '42:00-47:00', duration: '5 min',  segment: 'Cool Down',        station: 'Carrera muy suave',             volume: '0.7 km', notes: 'Normalización' },
    ],
  },
  {
    dow: 'SÁBADO',
    type: 'simulation',
    title: 'Simulación Completa HYROX',
    description: '8 km + 8 estaciones (ritmo de competencia)',
    blocks: [
      { time: '00:00-07:00',   duration: '7 min',  segment: 'WARM UP AMRAP', station: 'General',           volume: '1 min cardio + 8/8 renegade + 8 Z press + 8 GM', notes: 'Activación' },
      { time: '07:00-09:00',   duration: '2 min',  segment: 'REST',          station: 'N/A',               volume: 'Descanso y respiración', notes: 'Recuperación' },
      { time: '09:00-19:00',   duration: '10 min', segment: 'CARRERA 1',     station: 'SkiErg',            volume: '1 km + 1000 m SkiErg', notes: 'Competencia' },
      { time: '19:00-21:00',   duration: '2 min',  segment: 'EST 1',         station: 'SkiErg',            volume: '40 reps SkiErg', notes: 'Intensidad' },
      { time: '21:00-31:00',   duration: '10 min', segment: 'CARRERA 2',     station: 'Sled Push',         volume: '1 km + 50 m sled (152 kg)', notes: 'Competencia' },
      { time: '31:00-33:00',   duration: '2 min',  segment: 'EST 2',         station: 'Sled Push',         volume: '50 m sled push', notes: 'Fuerza máxima' },
      { time: '33:00-43:00',   duration: '10 min', segment: 'CARRERA 3',     station: 'Sled Pull',         volume: '1 km + 50 m sled pull', notes: 'Competencia' },
      { time: '43:00-45:00',   duration: '2 min',  segment: 'EST 3',         station: 'Sled Pull',         volume: '50 m sled pull', notes: 'Grip + espalda' },
      { time: '45:00-55:00',   duration: '10 min', segment: 'CARRERA 4',     station: 'Burpee Broad Jumps',volume: '1 km + 80 m burpees', notes: 'Competencia' },
      { time: '55:00-57:00',   duration: '2 min',  segment: 'EST 4',         station: 'Burpee Broad Jumps',volume: '80 m burpee broad jumps', notes: 'Explosividad' },
      { time: '57:00-67:00',   duration: '10 min', segment: 'CARRERA 5',     station: 'Row',               volume: '1 km + 1000 m rowing', notes: 'Competencia' },
      { time: '67:00-69:00',   duration: '2 min',  segment: 'EST 5',         station: 'Row',               volume: '1000 m row', notes: 'Poder + ritmo' },
      { time: '69:00-79:00',   duration: '10 min', segment: 'CARRERA 6',     station: 'Farmer Carry',      volume: '1 km + 200 m farmer (30 kg)', notes: 'Competencia' },
      { time: '79:00-81:00',   duration: '2 min',  segment: 'EST 6',         station: 'Farmer Carry',      volume: '200 m farmer carry', notes: 'Grip endurance' },
      { time: '81:00-91:00',   duration: '10 min', segment: 'CARRERA 7',     station: 'Sandbag Lunges',    volume: '1 km + 100 m lunges (20 kg)', notes: 'Competencia' },
      { time: '91:00-93:00',   duration: '2 min',  segment: 'EST 7',         station: 'Sandbag Lunges',    volume: '100 m lunges', notes: 'Quad endurance' },
      { time: '93:00-103:00',  duration: '10 min', segment: 'CARRERA 8',     station: 'Wall Balls',        volume: '1 km + 100 wall balls', notes: 'COMPETENCIA FINAL' },
      { time: '103:00-105:00', duration: '2 min',  segment: 'EST 8',         station: 'Wall Balls',        volume: '100 wall balls (6 kg)', notes: 'Mental toughness' },
      { time: '105:00-112:00', duration: '7 min',  segment: 'COOLDOWN',      station: 'General',           volume: 'Cardio suave + respiración', notes: 'Recuperación completa' },
    ],
  },
  {
    dow: 'DOMINGO',
    type: 'rest',
    title: 'Descanso',
    description: 'Movilidad, Foam Roll, Estiramiento — recuperación completa',
    blocks: [],
  },
]
