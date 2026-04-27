'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { OnboardingData } from '../types'

interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  optional?: boolean
  unit?: string
}

function Field({ label, value, onChange, placeholder, type = 'number', optional, unit }: FieldProps) {
  return (
    <div className="flex-1">
      <label className="block text-xs text-[#888888] uppercase tracking-widest mb-2">
        {label}
        {optional && <span className="normal-case tracking-normal text-[#444444] ml-1">(opcional)</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : 'text'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#141414] border border-[#222222] rounded-xl px-4 py-3.5 text-white placeholder-[#444444] focus:outline-none focus:border-[#C8FF00] transition-colors text-base"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] text-xs pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

interface Props {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepBody({ data, onChange, onNext, onBack }: Props) {
  const canContinue = !!data.age && !!data.weight && !!data.height

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          Cuéntanos sobre ti
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Para personalizar tu carga de entrenamiento
        </p>

        <div className="space-y-6">
          <div className="flex gap-3">
            <Field
              label="Edad"
              value={data.age}
              onChange={v => onChange({ ...data, age: v })}
              placeholder="28"
              unit="años"
            />
            <Field
              label="Peso"
              value={data.weight}
              onChange={v => onChange({ ...data, weight: v })}
              placeholder="75"
              unit="kg"
            />
            <Field
              label="Altura"
              value={data.height}
              onChange={v => onChange({ ...data, height: v })}
              placeholder="178"
              unit="cm"
            />
          </div>

          <div className="border-t border-[#1E1E1E] pt-6">
            <p className="text-white text-sm font-semibold mb-1">
              Tiempos de referencia
            </p>
            <p className="text-[#888888] text-xs mb-4 leading-relaxed">
              Ayuda al AI coach a calibrar tus cargas de cardio. Puedes omitirlos si no los conoces.
            </p>
            <div className="flex gap-3">
              <Field
                label="Tiempo en 5K"
                value={data.current_5k_time}
                onChange={v => onChange({ ...data, current_5k_time: v })}
                type="text"
                placeholder="25:00"
                optional
              />
              <Field
                label="Tiempo en 10K"
                value={data.current_10k_time}
                onChange={v => onChange({ ...data, current_10k_time: v })}
                type="text"
                placeholder="55:00"
                optional
              />
            </div>
          </div>
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
