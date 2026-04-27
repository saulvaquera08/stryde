'use client'

import { ChevronRight } from 'lucide-react'
import type { OnboardingData } from '../types'

interface Props {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
}

export default function StepName({ data, onChange, onNext }: Props) {
  const canContinue = data.first_name.trim().length > 0 && data.last_name.trim().length > 0

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          ¿Cómo te llamas?
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Tu plan de entrenamiento será personalizado para ti
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#888888] uppercase tracking-widest mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={data.first_name}
              onChange={e => onChange({ ...data, first_name: e.target.value })}
              placeholder="Carlos"
              autoFocus
              className="w-full bg-[#141414] border border-[#222222] rounded-xl px-4 py-3.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#C8FF00] transition-colors text-base"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888888] uppercase tracking-widest mb-2">
              Apellido
            </label>
            <input
              type="text"
              value={data.last_name}
              onChange={e => onChange({ ...data, last_name: e.target.value })}
              placeholder="García"
              className="w-full bg-[#141414] border border-[#222222] rounded-xl px-4 py-3.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#C8FF00] transition-colors text-base"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl mt-8 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        Continuar
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
