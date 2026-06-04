'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { OnboardingData } from '../types'

// ─── Objetivo GYM ─────────────────────────────────────────────────────────────
const GYM_GOALS = [
  { type: 'strength'        as const, label: 'Ganar fuerza',    desc: 'Levanta más cada semana',        emoji: '⚡' },
  { type: 'recomp'          as const, label: 'Recomposición',   desc: 'Más músculo, menos grasa',       emoji: '🔥' },
  { type: 'general_fitness' as const, label: 'Fitness general', desc: 'Salud, energía y consistencia',  emoji: '💚' },
]

// ─── Split GYM ────────────────────────────────────────────────────────────────
const GYM_SPLITS = [
  {
    type: 'ppl' as const,
    label: 'Push / Pull / Legs',
    desc: '5-6 días por semana',
    detail: 'El más popular de Jeff Nippard. Cada grupo muscular 2x/semana.',
  },
  {
    type: 'upper_lower' as const,
    label: 'Upper / Lower',
    desc: '4 días por semana',
    detail: 'Distribución equilibrada. Ideal para fuerza e hipertrofia.',
  },
  {
    type: 'full_body' as const,
    label: 'Full Body',
    desc: '3 días por semana',
    detail: 'Máxima frecuencia por grupo muscular. Ideal para principiantes.',
  },
]

interface Props {
  data: OnboardingData
  onChange: (d: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepGym({ data, onChange, onNext, onBack }: Props) {
  const canContinue = !!data.gym_goal && !!data.gym_split

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-1">
            Tu entrenamiento GYM
          </h1>
          <p className="text-[#888888] text-sm">
            Basado en principios de Jeff Nippard — evidencia, progresión, resultados
          </p>
        </div>

        {/* Sección 1: Objetivo */}
        <div>
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">
            Objetivo principal
          </p>
          <div className="space-y-2">
            {GYM_GOALS.map(({ type, label, desc, emoji }) => {
              const sel = data.gym_goal === type
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, gym_goal: type })}
                  className={`
                    w-full p-4 rounded-xl border text-left flex items-center gap-4
                    transition-all duration-200 active:scale-[0.99]
                    ${sel ? 'bg-[#C8FF00]/[0.06] border-[#C8FF00]' : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'}
                  `}
                >
                  <span className="text-xl">{emoji}</span>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${sel ? 'text-[#C8FF00]' : 'text-white'}`}>{label}</div>
                    <div className="text-[#888888] text-xs mt-0.5">{desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${sel ? 'border-[#C8FF00]' : 'border-[#444444]'}`}>
                    {sel && <div className="w-2.5 h-2.5 rounded-full bg-[#C8FF00]" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sección 2: Split */}
        <div>
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">
            Estructura de entrenamiento
          </p>
          <div className="space-y-2">
            {GYM_SPLITS.map(({ type, label, desc, detail }) => {
              const sel = data.gym_split === type
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, gym_split: type })}
                  className={`
                    w-full p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.99]
                    ${sel ? 'bg-[#C8FF00]/[0.06] border-[#C8FF00]' : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'}
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`font-semibold text-sm ${sel ? 'text-[#C8FF00]' : 'text-white'}`}>{label}</div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-md ${sel ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : 'bg-[#1E1E1E] text-[#555555]'}`}>
                      {desc}
                    </span>
                  </div>
                  <div className="text-[#555555] text-[11px] leading-relaxed">{detail}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8 pt-4">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-14 py-4 rounded-xl border border-[#222222] text-[#888888] hover:border-[#444444] transition-colors active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
