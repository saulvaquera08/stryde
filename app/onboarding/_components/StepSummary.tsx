'use client'

import { Loader2, ChevronLeft, Zap, Dumbbell, TrendingUp } from 'lucide-react'
import type { OnboardingData } from '../types'

// ── Label maps ────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
  thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom',
}
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const GYM_GOAL_LABEL: Record<string, string> = {
  strength: 'Fuerza Máxima', hypertrophy: 'Hipertrofia', recomp: 'Recomposición', general: 'General / Salud',
}
const GYM_LEVEL_LABEL: Record<string, string> = {
  beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado',
}
const EQUIPMENT_LABEL: Record<string, string> = {
  full_gym: 'Gym Completo', basic_gym: 'Gym Básico', home: 'En Casa',
}
const MUSCLE_LABEL: Record<string, string> = {
  chest: 'Pecho', back: 'Espalda', legs: 'Piernas',
  shoulders: 'Hombros', arms: 'Brazos', core: 'Core',
}
const RUN_DISTANCE_LABEL: Record<string, string> = {
  '5k': '5K', '10k': '10K', '15k': '15K', '21k': 'Media Maratón', '42k': 'Maratón',
}
const RUN_LEVEL_LABEL: Record<string, string> = {
  beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado',
}
const HYROX_EXP_LABEL: Record<string, string> = {
  never: 'Sin competencias previas', once_twice: '1-2 competencias', multiple: 'Competidor regular',
}
const STATION_LABEL: Record<string, string> = {
  skierg: 'SkiErg', sled_push: 'Sled Push', sled_pull: 'Sled Pull',
  burpee_broad: 'Burpee Broad Jumps', rowing: 'Rowing', farmer_carry: 'Farmer Carry',
  sandbag_lunges: 'Sandbag Lunges', wall_balls: 'Wall Balls', running: 'Running',
}
const BALANCE_LABEL: Record<number, string> = {
  1: 'Mucho más fuerte', 2: 'Algo más fuerte', 3: 'Equilibrado',
  4: 'Algo más rápido', 5: 'Mucho más rápido',
}
const TIME_LABEL: Record<string, string> = {
  morning: 'Mañana', afternoon: 'Tarde', evening: 'Noche', flexible: 'Flexible',
}

// ── Plan summary bullets per program ─────────────────────────────────────────

function gymBullets(data: OnboardingData): string[] {
  const days = data.training_days.length
  const goal = data.gym_goal
  const bullets: string[] = []
  if (days === 3) bullets.push('Estructura Push / Pull / Legs')
  else if (days === 4) bullets.push('Estructura Upper / Lower (4 días)')
  else bullets.push(`Split de ${days} días por grupo muscular`)
  if (goal === 'strength')    bullets.push('Énfasis en grandes compuestos (4-6 reps)')
  if (goal === 'hypertrophy') bullets.push('Alto volumen, reps 8-15 por serie')
  if (goal === 'recomp')      bullets.push('Densidad metabólica + déficit calórico')
  if (goal === 'general')     bullets.push('Entrenamiento equilibrado y variado')
  if (data.equipment === 'home') bullets.push('Adaptado para entrenamiento en casa')
  if (data.priority_muscles.length > 0)
    bullets.push(`Prioridad extra: ${data.priority_muscles.map(m => MUSCLE_LABEL[m]).join(', ')}`)
  return bullets
}

function runBullets(data: OnboardingData): string[] {
  const dist    = data.run_distance
  const days    = data.training_days.length
  const bullets: string[] = []
  bullets.push(`Distancia objetivo: ${RUN_DISTANCE_LABEL[dist] ?? dist}`)
  if (data.run_race_date) {
    const d = new Date(data.run_race_date + 'T12:00:00')
    bullets.push(`Periodizado hacia ${d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`)
  } else {
    bullets.push('Plan base de 8 semanas')
  }
  if (days >= 4) bullets.push('Incluye día de fuerza y movilidad')
  bullets.push('Series, tempo y rodajes largos diferenciados')
  return bullets
}

function hyroxBullets(data: OnboardingData): string[] {
  const days    = data.training_days.length
  const balance = data.hyrox_strength_cardio_balance
  const bullets: string[] = []
  bullets.push('2 días de fuerza funcional (superior + inferior)')
  bullets.push('2 días de cardio / running')
  if (days >= 5) bullets.push('1 día de simulación HYROX específica')
  if (balance && balance <= 2) bullets.push('Cardio extra — compensar ventaja de fuerza')
  if (balance && balance >= 4) bullets.push('Fuerza extra — compensar ventaja de velocidad')
  if (data.hyrox_weak_stations.length > 0)
    bullets.push(`Bloques enfocados en: ${data.hyrox_weak_stations.map(s => STATION_LABEL[s]).join(', ')}`)
  return bullets
}

function weaknessBullets(data: OnboardingData): string[] | null {
  if (data.program_type !== 'hyrox') return null
  const bullets: string[] = []
  if (data.hyrox_weak_stations.length > 0)
    bullets.push(`${data.hyrox_weak_stations.map(s => STATION_LABEL[s]).join(' · ')} (tus débiles)`)
  if (data.hyrox_strength_cardio_balance) {
    if (data.hyrox_strength_cardio_balance >= 4)
      bullets.push('Más fuerza — eres más rápido que fuerte')
    if (data.hyrox_strength_cardio_balance <= 2)
      bullets.push('Más cardio — eres más fuerte que rápido')
  }
  return bullets.length > 0 ? bullets : null
}

// ── Program icon + color ──────────────────────────────────────────────────────

function programMeta(type: string): { icon: React.ReactNode; color: string; label: string } {
  if (type === 'gym')   return { icon: <Dumbbell size={16} strokeWidth={2} />, color: '#A78BFA', label: 'GYM' }
  if (type === 'run')   return { icon: <TrendingUp size={16} strokeWidth={2} />, color: '#60A5FA', label: 'RUN' }
  return { icon: <Zap size={16} strokeWidth={2} />, color: '#FF6B35', label: 'HYROX' }
}

// ── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[#1E1E1E] last:border-0 gap-4">
      <span className="text-[#555] text-xs uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-white text-sm font-medium text-right">{value}</span>
    </div>
  )
}

function Bullet({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-[#888] text-xs leading-snug">{text}</span>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  data:      OnboardingData
  onBack:    () => void
  onSubmit:  () => void
  isPending: boolean
}

export default function StepSummary({ data, onBack, onSubmit, isPending }: Props) {
  const meta      = programMeta(data.program_type)
  const daysStr   = DAY_ORDER.filter(d => data.training_days.includes(d)).map(d => DAY_LABELS[d]).join(' · ') || '—'
  const planBullets =
    data.program_type === 'gym'   ? gymBullets(data)   :
    data.program_type === 'run'   ? runBullets(data)   :
    hyroxBullets(data)
  const focusBullets = weaknessBullets(data)

  // Secondary info line per program
  let programDetail = ''
  if (data.program_type === 'gym') {
    const parts = [
      GYM_GOAL_LABEL[data.gym_goal] ?? '',
      GYM_LEVEL_LABEL[data.gym_level] ?? '',
      EQUIPMENT_LABEL[data.equipment] ?? '',
    ].filter(Boolean)
    programDetail = parts.join(' · ')
  } else if (data.program_type === 'run') {
    const parts: string[] = [
      RUN_DISTANCE_LABEL[data.run_distance] ?? '',
      RUN_LEVEL_LABEL[data.run_level] ?? '',
    ].filter(Boolean)
    if (data.run_race_date) {
      const d = new Date(data.run_race_date + 'T12:00:00')
      parts.push(d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }))
    }
    programDetail = parts.join(' · ')
  } else if (data.program_type === 'hyrox') {
    const parts: string[] = [HYROX_EXP_LABEL[data.hyrox_experience] ?? ''].filter(Boolean)
    if (data.hyrox_race_date) {
      const d = new Date(data.hyrox_race_date + 'T12:00:00')
      parts.push(d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' }))
    }
    programDetail = parts.join(' · ')
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
      <div className="flex-1">
        {/* Athlete card */}
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#111] overflow-hidden mb-5">
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b border-[#1E1E1E]">
            <p className="text-[#555] text-xs mb-1">Tu plan personalizado está listo</p>
            <h2 className="text-[1.4rem] font-bold text-white leading-tight">
              {data.first_name} {data.last_name}
            </h2>
          </div>

          {/* Key fields */}
          <div className="px-5 py-1">
            <Row label="Objetivo"  value={`${meta.label}${programDetail ? `  ·  ${programDetail}` : ''}`} />
            <Row label="Días"      value={daysStr} />
            <Row label="Sesiones"  value={data.session_duration ? `${data.session_duration === '90+' ? '+90' : data.session_duration} min` : '—'} />
            {data.preferred_time  && <Row label="Horario"   value={TIME_LABEL[data.preferred_time] ?? ''} />}
            {(data.age || data.weight || data.height) && (
              <Row label="Perfil" value={[
                data.age    ? `${data.age} años`   : null,
                data.weight ? `${data.weight} kg`  : null,
                data.height ? `${data.height} cm`  : null,
              ].filter(Boolean).join('  ·  ')} />
            )}
          </div>
        </div>

        {/* Plan bullets */}
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-5 py-4 mb-3">
          <p className="font-mono text-[9px] font-bold tracking-[0.18em] mb-3" style={{ color: meta.color }}>
            TU PLAN INCLUYE
          </p>
          <div className="flex flex-col gap-2">
            {planBullets.map((b, i) => <Bullet key={i} text={b} color={meta.color} />)}
          </div>
        </div>

        {/* Focus bullets — HYROX only */}
        {focusBullets && focusBullets.length > 0 && (
          <div className="rounded-2xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 px-5 py-4 mb-3">
            <p className="font-mono text-[9px] font-bold tracking-[0.18em] text-[#FF6B35] mb-3">FOCALIZAMOS EN</p>
            <div className="flex flex-col gap-2">
              {focusBullets.map((b, i) => <Bullet key={i} text={b} color="#FF6B35" />)}
            </div>
          </div>
        )}

        {/* Injuries note */}
        {data.injuries.length > 0 && !data.injuries.includes('none') && (
          <div className="rounded-xl border border-[#333] bg-[#141414] px-4 py-3 mb-3">
            <p className="text-[#555] text-xs">
              ⚠️ Adaptaciones por lesiones activadas — los ejercicios serán ajustados
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          disabled={isPending}
          className="flex items-center justify-center w-14 py-4 rounded-xl border border-[#222] text-[#888] disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="flex-1 text-black font-bold py-4 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: meta.color }}
        >
          {isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Generando tu plan...</>
          ) : (
            <><span style={{ color: 'inherit' }}>Generar mi plan</span> <Zap size={16} /></>
          )}
        </button>
      </div>
    </div>
  )
}
