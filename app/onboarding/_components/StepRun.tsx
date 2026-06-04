'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { OnboardingData } from '../types'

const RUN_GOALS = [
  { type: '5k'            as const, label: '5K',            emoji: '💨', weeks: '8 semanas',  desc: 'Velocidad + base aeróbica'   },
  { type: '10k'           as const, label: '10K',           emoji: '⚡', weeks: '10 semanas', desc: 'Resistencia + tempo runs'    },
  { type: 'half_marathon' as const, label: 'Media Maratón', emoji: '🏃', weeks: '12 semanas', desc: 'Long runs + zonas cardíacas' },
  { type: 'marathon'      as const, label: 'Maratón',       emoji: '🏆', weeks: '16 semanas', desc: 'Periodización completa'      },
]

// Tiempos a mostrar según objetivo
const TIME_FIELDS: Record<string, { key: keyof OnboardingData; label: string; placeholder: string }[]> = {
  '5k':            [{ key: 'current_5k_time',       label: 'Tiempo actual en 5K',          placeholder: '25:00' }],
  '10k':           [{ key: 'current_5k_time',       label: 'Tiempo actual en 5K',          placeholder: '25:00' },
                    { key: 'current_10k_time',       label: 'Tiempo actual en 10K',         placeholder: '55:00' }],
  'half_marathon': [{ key: 'current_10k_time',      label: 'Tiempo actual en 10K',          placeholder: '55:00' },
                    { key: 'current_hm_time',        label: 'Tiempo en media (si tienes)',   placeholder: '2:05:00' }],
  'marathon':      [{ key: 'current_hm_time',       label: 'Tiempo en media maratón',       placeholder: '2:05:00' },
                    { key: 'current_marathon_time',  label: 'Tiempo en maratón (si tienes)', placeholder: '4:30:00' }],
}

interface Props {
  data: OnboardingData
  onChange: (d: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepRun({ data, onChange, onNext, onBack }: Props) {
  const canContinue = !!data.run_goal

  // Fecha mínima = hoy + 3 semanas
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 21)
  const minDateStr = minDate.toISOString().split('T')[0]

  const timeFields = data.run_goal ? TIME_FIELDS[data.run_goal] ?? [] : []

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-1">
            Tu objetivo de carrera
          </h1>
          <p className="text-[#888888] text-sm">
            El plan se construye hacia tu fecha de carrera
          </p>
        </div>

        {/* Sección 1: Objetivo */}
        <div>
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">
            Distancia objetivo
          </p>
          <div className="grid grid-cols-2 gap-3">
            {RUN_GOALS.map(({ type, label, emoji, weeks, desc }) => {
              const sel = data.run_goal === type
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, run_goal: type })}
                  className={`
                    p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.98]
                    ${sel ? 'bg-[#C8FF00]/[0.06] border-[#C8FF00]' : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'}
                  `}
                >
                  <div className="text-2xl mb-2">{emoji}</div>
                  <div className={`font-bold text-lg ${sel ? 'text-[#C8FF00]' : 'text-white'}`}>{label}</div>
                  <div className={`text-[11px] mt-1 ${sel ? 'text-[#C8FF00]/70' : 'text-[#555555]'}`}>{weeks}</div>
                  <div className="text-[#888888] text-[11px] mt-1 leading-relaxed">{desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sección 2: Fecha de carrera (opcional) */}
        {data.run_goal && (
          <div>
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">
              Fecha de carrera
            </p>
            <p className="text-[#555555] text-[11px] mb-3">
              Opcional — si tienes fecha, el plan se ajusta automáticamente al taper perfecto
            </p>
            <div className="relative">
              <input
                type="date"
                min={minDateStr}
                value={data.run_race_date}
                onChange={e => onChange({ ...data, run_race_date: e.target.value })}
                className="w-full bg-[#141414] border border-[#222222] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#C8FF00] transition-colors text-base appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        )}

        {/* Sección 3: Tiempos actuales (opcionales) */}
        {timeFields.length > 0 && (
          <div>
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">
              Tiempos de referencia
            </p>
            <p className="text-[#555555] text-[11px] mb-3">
              Opcionales — el coach los usa para calibrar tus paces de entrenamiento
            </p>
            <div className="space-y-3">
              {timeFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-[#888888] mb-1.5">{label}</label>
                  <input
                    type="text"
                    inputMode="text"
                    value={data[key] as string}
                    onChange={e => onChange({ ...data, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-[#141414] border border-[#222222] rounded-xl px-4 py-3.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#C8FF00] transition-colors text-base"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
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
