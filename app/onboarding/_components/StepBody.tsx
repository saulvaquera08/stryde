'use client'

import { ChevronLeft } from 'lucide-react'
import type { OnboardingData } from '../types'

interface FieldProps {
  label:       string
  value:       string
  onChange:    (v: string) => void
  placeholder?: string
  unit?:       string
}

function Field({ label, value, onChange, placeholder, unit }: FieldProps) {
  return (
    <div className="flex-1">
      <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">{label}</label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:outline-none focus:border-[#C8FF00] transition-colors text-base"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] text-xs pointer-events-none">{unit}</span>
        )}
      </div>
    </div>
  )
}

const SUBTITLES: Record<string, string> = {
  gym: 'Calculamos cargas relativas y progresión de peso',
  run: 'Estimamos tu VO₂max y zonas de frecuencia cardíaca',
}

interface Props {
  data:     OnboardingData
  onChange: (data: OnboardingData) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepBody({ data, onChange, onNext, onBack }: Props) {
  const subtitle = SUBTITLES[data.program_type] ?? 'Para personalizar tu carga de entrenamiento'

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">Tu perfil físico</h1>
        <p className="text-[#888] text-sm mb-8">{subtitle}</p>

        <div className="flex gap-3 mb-4">
          <Field label="Edad"   value={data.age}    onChange={v => onChange({ ...data, age: v })}    placeholder="28"  unit="años" />
          <Field label="Peso"   value={data.weight} onChange={v => onChange({ ...data, weight: v })} placeholder="75"  unit="kg" />
          <Field label="Altura" value={data.height} onChange={v => onChange({ ...data, height: v })} placeholder="178" unit="cm" />
        </div>

        <div className="rounded-xl border border-[#1E1E1E] bg-[#111] px-4 py-3">
          <p className="text-[#555] text-xs leading-relaxed">
            Con estos datos tu plan será mucho más preciso — todos los campos son opcionales.
          </p>
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
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {data.age || data.weight || data.height ? 'Continuar →' : 'Continuar sin datos →'}
        </button>
      </div>
    </div>
  )
}
