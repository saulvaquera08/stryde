'use client'

import { Dumbbell, TrendingUp, Zap, ChevronLeft } from 'lucide-react'
import type { OnboardingData, ProgramType } from '../types'

const PROGRAMS: {
  type:  ProgramType
  icon:  React.ReactNode
  label: string
  tags:  string
  desc:  string
  color: string
}[] = [
  {
    type:  'gym',
    icon:  <Dumbbell size={22} strokeWidth={2} />,
    label: 'GYM',
    tags:  'Fuerza · Hipertrofia · Composición',
    desc:  'Entrena con pesas para construir músculo, ganar fuerza o cambiar tu composición corporal',
    color: '#A78BFA',
  },
  {
    type:  'run',
    icon:  <TrendingUp size={22} strokeWidth={2} />,
    label: 'RUN',
    tags:  '5K · 10K · 15K · 21K · 42K',
    desc:  'Prepárate para tu próxima carrera. Planes específicos por distancia',
    color: '#60A5FA',
  },
  {
    type:  'hyrox',
    icon:  <Zap size={22} strokeWidth={2} />,
    label: 'HYROX',
    tags:  'Fuerza + Cardio · Competencia',
    desc:  'Entrena para competir en HYROX. Combina fuerza funcional y running',
    color: '#FF6B35',
  },
]

interface Props {
  data:     OnboardingData
  onChange: (data: OnboardingData) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepProgram({ data, onChange, onNext, onBack }: Props) {
  const select = (type: ProgramType) => {
    onChange({ ...data, program_type: type })
  }

  const canContinue = data.program_type !== ''

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          ¿Cuál es tu objetivo?
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Tu plan completo se construye alrededor de esto
        </p>

        <div className="flex flex-col gap-3">
          {PROGRAMS.map(({ type, icon, label, tags, desc, color }) => {
            const selected = data.program_type === type
            return (
              <button
                key={type}
                onClick={() => select(type)}
                className={`w-full p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.99] ${
                  selected
                    ? 'border-[color:var(--c)] bg-[color:var(--bg)]'
                    : 'border-[#222] bg-[#141414]'
                }`}
                style={{
                  '--c':  color,
                  '--bg': `${color}12`,
                } as React.CSSProperties}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}20`, color: selected ? color : '#666' }}
                  >
                    {icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="font-mono text-[11px] font-bold tracking-[0.15em]"
                        style={{ color: selected ? color : '#888' }}
                      >
                        {label}
                      </span>
                      {selected && (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: color }}
                        >
                          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                            <path d="M1.5 4L3.5 6L7 2" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-[#555] tracking-[0.08em] mb-1.5">{tags}</p>
                    <p className="text-[#888] text-[12px] leading-snug">{desc}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-14 py-4 rounded-xl border border-[#222] text-[#888] active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
