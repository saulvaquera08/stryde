'use client'

import { ChevronLeft } from 'lucide-react'
import type { OnboardingData, ProgramType } from '../types'

const PROGRAMS: {
  type: ProgramType
  emoji: string
  title: string
  subtitle: string
  tags: string[]
}[] = [
  {
    type: 'gym',
    emoji: '🏋️',
    title: 'GYM',
    subtitle: 'Fuerza e hipertrofia',
    tags: ['Push · Pull · Legs', 'Upper / Lower', 'Progresión científica'],
  },
  {
    type: 'run',
    emoji: '🏃',
    title: 'RUNNING',
    subtitle: 'Carreras y resistencia',
    tags: ['5K · 10K · 21K · 42K', 'Zonas cardíacas', 'Plan por fecha de carrera'],
  },
]

interface Props {
  data: OnboardingData
  onChange: (d: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepProgram({ data, onChange, onNext, onBack }: Props) {
  const select = (type: ProgramType) => {
    // Reset program-specific fields when switching
    onChange({
      ...data,
      program_type: type,
      gym_goal: '',  gym_split: '',
      run_goal: '',  run_race_date: '',
      current_5k_time: '', current_10k_time: '',
      current_hm_time: '', current_marathon_time: '',
    })
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          ¿Qué tipo de atleta eres?
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Tu plan se construirá desde cero para este objetivo
        </p>

        <div className="space-y-4">
          {PROGRAMS.map(({ type, emoji, title, subtitle, tags }) => {
            const selected = data.program_type === type
            return (
              <button
                key={type}
                onClick={() => select(type)}
                className={`
                  w-full p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99]
                  ${selected
                    ? 'bg-[#C8FF00]/[0.06] border-[#C8FF00]'
                    : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'
                  }
                `}
              >
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-3xl">{emoji}</span>
                  <div>
                    <div className={`text-xl font-bold tracking-tight ${selected ? 'text-[#C8FF00]' : 'text-white'}`}>
                      {title}
                    </div>
                    <div className="text-[#888888] text-sm">{subtitle}</div>
                  </div>

                  {/* Radio indicator */}
                  <div className={`
                    ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                    ${selected ? 'border-[#C8FF00]' : 'border-[#444444]'}
                  `}>
                    {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#C8FF00]" />}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className={`
                        text-[11px] px-2 py-1 rounded-md font-medium
                        ${selected ? 'bg-[#C8FF00]/10 text-[#C8FF00]' : 'bg-[#1E1E1E] text-[#555555]'}
                      `}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
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
          disabled={!data.program_type}
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
