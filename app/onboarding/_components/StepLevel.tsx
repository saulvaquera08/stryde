'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { OnboardingData, LevelType } from '../types'

const LEVELS: { type: LevelType; label: string; desc: string }[] = [
  { type: 'beginner',     label: 'Principiante', desc: 'Menos de 1 año entrenando consistentemente' },
  { type: 'intermediate', label: 'Intermedio',   desc: '1–3 años, entrenas con regularidad' },
  { type: 'advanced',     label: 'Avanzado',     desc: '+3 años, compites o tienes experiencia en carreras' },
]

const DAYS_OF_WEEK: { key: string; label: string }[] = [
  { key: 'monday',    label: 'L' },
  { key: 'tuesday',   label: 'M' },
  { key: 'wednesday', label: 'X' },
  { key: 'thursday',  label: 'J' },
  { key: 'friday',    label: 'V' },
  { key: 'saturday',  label: 'S' },
  { key: 'sunday',    label: 'D' },
]

interface Props {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepLevel({ data, onChange, onNext, onBack }: Props) {
  const selected = data.training_days

  function toggleDay(key: string) {
    if (selected.includes(key)) {
      if (selected.length <= 3) return // enforce min 3
      onChange({ ...data, training_days: selected.filter(d => d !== key) })
    } else {
      if (selected.length >= 6) return // enforce max 6
      onChange({ ...data, training_days: [...selected, key] })
    }
  }

  const canContinue = !!data.level && selected.length >= 3

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1 space-y-10">

        {/* Level */}
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
            Tu nivel de entrenamiento
          </h1>
          <p className="text-[#888888] text-sm mb-6">
            Define la carga inicial y la progresión de tu plan
          </p>

          <div className="space-y-3">
            {LEVELS.map(({ type, label, desc }) => {
              const isSelected = data.level === type
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, level: type })}
                  className={`
                    w-full p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.99]
                    ${isSelected
                      ? 'bg-[#C8FF00]/[0.08] border-[#C8FF00]'
                      : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'
                    }
                  `}
                >
                  <div className={`font-semibold text-sm ${isSelected ? 'text-[#C8FF00]' : 'text-white'}`}>
                    {label}
                  </div>
                  <div className="text-[#888888] text-xs mt-0.5">{desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Day picker */}
        <div>
          <p className="text-white font-semibold mb-1">
            ¿Qué días puedes entrenar?
          </p>
          <p className="text-[#888888] text-xs mb-5">
            Toca los días disponibles · mín. 3, máx. 6
          </p>

          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const isSelected = selected.includes(key)
              const isDisabled = !isSelected && selected.length >= 6
              return (
                <button
                  key={key}
                  onClick={() => toggleDay(key)}
                  disabled={isDisabled}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-xl border
                    font-bold text-base transition-all duration-150 active:scale-90
                    ${isSelected
                      ? 'bg-[#C8FF00] border-[#C8FF00] text-black'
                      : isDisabled
                        ? 'bg-[#0F0F0F] border-[#1A1A1A] text-[#333333] cursor-not-allowed'
                        : 'bg-[#141414] border-[#222222] text-[#888888] hover:border-[#444444]'
                    }
                  `}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <p className="text-[#555555] text-xs mt-3 text-center">
            {selected.length} {selected.length === 1 ? 'día seleccionado' : 'días seleccionados'}
          </p>
        </div>

      </div>

      <div className="flex gap-3 mt-8">
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
