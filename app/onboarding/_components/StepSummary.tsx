'use client'

import { Loader2, ChevronLeft, Zap } from 'lucide-react'
import type { OnboardingData } from '../types'

const GOAL_LABELS: Record<string, string> = {
  hyrox: 'HYROX',
  '21k': 'Media Maratón 21K',
  '10k': '10 Kilómetros',
  '5k': '5 Kilómetros',
  strength: 'Fuerza',
  recomp: 'Recomposición corporal',
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

const EQUIPMENT_LABELS: Record<string, string> = {
  full_gym: 'Gym Completo',
  basic_gym: 'Gym Básico',
  home: 'En Casa',
  none: 'Sin Equipo',
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-[#1E1E1E] last:border-0 gap-4">
      <span className="text-[#888888] text-sm shrink-0">{label}</span>
      <span className="text-white text-sm font-medium text-right whitespace-pre-line">{value}</span>
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
  const goalsText = data.goals
    .map(g => {
      const label = GOAL_LABELS[g.type] ?? g.type
      if (!g.race_date) return label
      const d = new Date(g.race_date + 'T12:00:00')
      const formatted = d.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
      return `${label}  ·  ${formatted}`
    })
    .join('\n')

  const profile = [
    data.age    ? `${data.age} años`  : null,
    data.weight ? `${data.weight} kg` : null,
    data.height ? `${data.height} cm` : null,
  ].filter(Boolean).join('  ·  ')

  const times = [
    data.current_5k_time  ? `5K: ${data.current_5k_time}`   : null,
    data.current_10k_time ? `10K: ${data.current_10k_time}` : null,
  ].filter(Boolean).join('  ·  ')

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 bg-[#C8FF00]/10 border border-[#C8FF00]/20 rounded-full px-3 py-1 mb-6">
          <Zap size={12} className="text-[#C8FF00] fill-[#C8FF00]" />
          <span className="text-[#C8FF00] text-xs font-medium">Listo para generar</span>
        </div>

        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          Tu plan está casi listo
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Revisa tu información antes de continuar
        </p>

        <div className="bg-[#141414] border border-[#222222] rounded-2xl px-5 py-1 mb-5">
          <Row label="Nombre"        value={`${data.first_name} ${data.last_name}`} />
          <Row label="Objetivos"     value={goalsText} />
          <Row label="Nivel"         value={LEVEL_LABELS[data.level] ?? data.level} />
          <Row label="Días / semana" value={`${data.available_days} días de entrenamiento`} />
          <Row label="Perfil"        value={profile} />
          {times && <Row label="Tiempos" value={times} />}
          <Row label="Equipo"        value={EQUIPMENT_LABELS[data.equipment] ?? data.equipment} />
        </div>

        <div className="bg-[#0C1400] border border-[#C8FF00]/15 rounded-xl p-4">
          <p className="text-[#C8FF00] text-xs font-semibold mb-1.5 uppercase tracking-widest">
            ¿Qué pasa ahora?
          </p>
          <p className="text-[#888888] text-xs leading-relaxed">
            El AI coach generará tu plan de 6 semanas siguiendo las reglas de STRYDE: sin días de alta intensidad consecutivos, base aeróbica garantizada y progresión semanal controlada.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          disabled={isPending}
          className="flex items-center justify-center w-14 py-4 rounded-xl border border-[#222222] text-[#888888] hover:border-[#444444] transition-colors disabled:opacity-30 active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-60 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generando tu plan...
            </>
          ) : (
            'Generar mi plan →'
          )}
        </button>
      </div>
    </div>
  )
}
