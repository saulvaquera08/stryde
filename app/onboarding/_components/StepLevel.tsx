'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { OnboardingData, LevelType } from '../types'

const LEVELS: { type: LevelType; label: string; desc: string }[] = [
  { type: 'beginner',     label: 'Principiante', desc: 'Menos de 1 año entrenando consistentemente' },
  { type: 'intermediate', label: 'Intermedio',   desc: '1–3 años, entrenas con regularidad' },
  { type: 'advanced',     label: 'Avanzado',     desc: '+3 años, compites o tienes experiencia en carreras' },
]

const DAYS = [3, 4, 5, 6]

interface Props {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepLevel({ data, onChange, onNext, onBack }: Props) {
  const canContinue = !!data.level

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1 space-y-10">
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
            Tu nivel de entrenamiento
          </h1>
          <p className="text-[#888888] text-sm mb-6">
            Define la carga inicial y la progresión de tu plan
          </p>

          <div className="space-y-3">
            {LEVELS.map(({ type, label, desc }) => {
              const selected = data.level === type
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, level: type })}
                  className={`
                    w-full p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.99]
                    ${selected
                      ? 'bg-[#C8FF00]/[0.08] border-[#C8FF00]'
                      : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'
                    }
                  `}
                >
                  <div className={`font-semibold text-sm ${selected ? 'text-[#C8FF00]' : 'text-white'}`}>
                    {label}
                  </div>
                  <div className="text-[#888888] text-xs mt-0.5">{desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-white font-semibold mb-1">
            Días disponibles por semana
          </p>
          <p className="text-[#888888] text-xs mb-4">
            ¿Cuántos días puedes entrenar?
          </p>
          <div className="grid grid-cols-4 gap-3">
            {DAYS.map(d => {
              const selected = data.available_days === d
              return (
                <button
                  key={d}
                  onClick={() => onChange({ ...data, available_days: d })}
                  className={`
                    py-4 rounded-xl border font-bold text-xl transition-all duration-200 active:scale-95
                    ${selected
                      ? 'bg-[#C8FF00] border-[#C8FF00] text-black'
                      : 'bg-[#141414] border-[#222222] text-[#888888] hover:border-[#3a3a3a]'
                    }
                  `}
                >
                  {d}
                </button>
              )
            })}
          </div>
          <p className="text-[#555555] text-xs mt-2 text-center">
            días por semana
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
