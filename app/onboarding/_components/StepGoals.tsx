'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { OnboardingData, GoalType } from '../types'

const GOALS: { type: GoalType; label: string; emoji: string; hasDate: boolean }[] = [
  { type: 'hyrox',    label: 'HYROX',          emoji: '🏋️', hasDate: true  },
  { type: '21k',      label: 'Media Maratón',   emoji: '🏃', hasDate: true  },
  { type: '10k',      label: '10K',             emoji: '⚡', hasDate: true  },
  { type: '5k',       label: '5K',              emoji: '💨', hasDate: true  },
  { type: 'strength', label: 'Fuerza',          emoji: '💪', hasDate: false },
  { type: 'recomp',   label: 'Recomposición',   emoji: '🔥', hasDate: false },
]

interface Props {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepGoals({ data, onChange, onNext, onBack }: Props) {
  const toggleGoal = (type: GoalType) => {
    const exists = data.goals.find(g => g.type === type)
    if (exists) {
      onChange({ ...data, goals: data.goals.filter(g => g.type !== type) })
    } else {
      onChange({ ...data, goals: [...data.goals, { type }] })
    }
  }

  const setDate = (type: GoalType, date: string) => {
    onChange({
      ...data,
      goals: data.goals.map(g => g.type === type ? { ...g, race_date: date } : g),
    })
  }

  const canContinue = data.goals.length > 0

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          ¿Qué quieres lograr?
        </h1>
        <p className="text-[#888888] mb-8 text-sm">
          Puedes seleccionar varios objetivos
        </p>

        <div className="grid grid-cols-2 gap-3">
          {GOALS.map(({ type, label, emoji, hasDate }) => {
            const selected = !!data.goals.find(g => g.type === type)
            const goal = data.goals.find(g => g.type === type)

            return (
              <div key={type} className="flex flex-col gap-2">
                <button
                  onClick={() => toggleGoal(type)}
                  className={`
                    relative p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.98]
                    ${selected
                      ? 'bg-[#C8FF00]/[0.08] border-[#C8FF00]'
                      : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className={`font-semibold text-sm leading-tight ${selected ? 'text-[#C8FF00]' : 'text-white'}`}>
                    {label}
                  </div>

                  {selected && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#C8FF00] flex items-center justify-center">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.5 6L7 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>

                {selected && hasDate && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="block text-[10px] text-[#888888] uppercase tracking-widest mb-1 pl-1">
                      Fecha de competencia
                    </label>
                    <input
                      type="date"
                      value={goal?.race_date ?? ''}
                      onChange={e => setDate(type, e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-[#1A1A1A] border border-[#333333] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8FF00] transition-colors [color-scheme:dark]"
                    />
                  </div>
                )}
              </div>
            )
          })}
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
