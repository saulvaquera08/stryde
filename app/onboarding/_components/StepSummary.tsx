'use client'

import { Loader2, ChevronLeft } from 'lucide-react'
import type { OnboardingData } from '../types'

const DAY_ORDER  = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS: Record<string, string> = { monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié', thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom' }

const LEVEL_LABELS: Record<string, string>     = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' }
const EQUIPMENT_LABELS: Record<string, string>  = { full_gym: 'Gym completo', basic_gym: 'Gym básico', home: 'En casa', none: 'Sin equipo' }
const GYM_GOAL_LABELS: Record<string, string>   = { strength: 'Ganar fuerza', recomp: 'Recomposición', general_fitness: 'Fitness general' }
const GYM_SPLIT_LABELS: Record<string, string>  = { ppl: 'Push / Pull / Legs', upper_lower: 'Upper / Lower', full_body: 'Full Body' }
const RUN_GOAL_LABELS: Record<string, string>   = { '5k': '5K', '10k': '10K', half_marathon: 'Media Maratón', marathon: 'Maratón' }

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-[#1E1E1E] last:border-0 gap-4">
      <span className="text-[#888888] text-sm shrink-0">{label}</span>
      <span className="text-white text-sm font-medium text-right">{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">{title}</p>
      <div className="bg-[#141414] rounded-xl border border-[#222222] px-4">
        {children}
      </div>
    </div>
  )
}

interface Props {
  data: OnboardingData
  onBack: () => void
  onSubmit: () => void
  isPending: boolean
}

export default function StepSummary({ data, onBack, onSubmit, isPending }: Props) {
  const isGym = data.program_type === 'gym'
  const sortedDays = DAY_ORDER.filter(d => data.training_days.includes(d)).map(d => DAY_LABELS[d]).join(' · ')

  const profile = [
    data.age    ? `${data.age} años`  : null,
    data.weight ? `${data.weight} kg` : null,
    data.height ? `${data.height} cm` : null,
  ].filter(Boolean).join('  ·  ')

  const raceDate = data.run_race_date
    ? new Date(data.run_race_date + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Sin fecha definida'

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
      <div className="flex-1 space-y-5">
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-1">
            Todo listo, {data.first_name}
          </h1>
          <p className="text-[#888888] text-sm">
            Revisa tu perfil antes de generar el plan
          </p>
        </div>

        {/* Badge de programa */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${
          isGym ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : 'bg-blue-500/10 text-blue-400'
        }`}>
          {isGym ? '🏋️ GYM' : '🏃 RUNNING'}
        </div>

        {/* Sección programa-específica */}
        {isGym ? (
          <Section title="Programa GYM">
            <Row label="Objetivo" value={GYM_GOAL_LABELS[data.gym_goal] ?? data.gym_goal} />
            <Row label="Split"    value={GYM_SPLIT_LABELS[data.gym_split] ?? data.gym_split} />
            <Row label="Equipo"   value={EQUIPMENT_LABELS[data.equipment] ?? data.equipment} />
          </Section>
        ) : (
          <Section title="Programa RUN">
            <Row label="Objetivo" value={RUN_GOAL_LABELS[data.run_goal] ?? data.run_goal} />
            <Row label="Fecha"    value={raceDate} />
            {data.current_5k_time  && <Row label="Tiempo 5K"  value={data.current_5k_time} />}
            {data.current_10k_time && <Row label="Tiempo 10K" value={data.current_10k_time} />}
            {data.current_hm_time  && <Row label="Tiempo 21K" value={data.current_hm_time} />}
          </Section>
        )}

        <Section title="Perfil">
          <Row label="Nivel"  value={LEVEL_LABELS[data.level] ?? data.level} />
          {profile && <Row label="Medidas" value={profile} />}
          <Row label="Días"   value={sortedDays || '—'} />
        </Section>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          disabled={isPending}
          className="flex items-center justify-center w-14 py-4 rounded-xl border border-[#222222] text-[#888888] hover:border-[#444444] transition-colors active:scale-95 disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Generando tu plan...</>
          ) : (
            'Generar mi plan →'
          )}
        </button>
      </div>
    </div>
  )
}
