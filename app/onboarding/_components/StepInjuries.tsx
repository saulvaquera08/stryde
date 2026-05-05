'use client'

import { ChevronLeft } from 'lucide-react'
import type { OnboardingData, InjuryZone } from '../types'

const ZONES: { type: InjuryZone; label: string }[] = [
  { type: 'knee_right',     label: 'Rodilla derecha' },
  { type: 'knee_left',      label: 'Rodilla izquierda' },
  { type: 'hip',            label: 'Cadera' },
  { type: 'lower_back',     label: 'Lumbar' },
  { type: 'shoulder_right', label: 'Hombro derecho' },
  { type: 'shoulder_left',  label: 'Hombro izquierdo' },
  { type: 'elbow_wrist',    label: 'Codo / Muñeca' },
  { type: 'neck',           label: 'Cuello' },
  { type: 'ankle_foot',     label: 'Tobillo / Pie' },
  { type: 'none',           label: 'Sin lesiones' },
]

interface Props {
  data:     OnboardingData
  onChange: (data: OnboardingData) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepInjuries({ data, onChange, onNext, onBack }: Props) {
  const toggle = (zone: InjuryZone) => {
    if (zone === 'none') {
      onChange({ ...data, injuries: ['none'] })
      return
    }
    // Deselect 'none' when a real injury is picked
    const cur = data.injuries.filter(z => z !== 'none')
    if (cur.includes(zone)) {
      const next = cur.filter(z => z !== zone)
      onChange({ ...data, injuries: next.length === 0 ? [] : next })
    } else {
      onChange({ ...data, injuries: [...cur, zone] })
    }
  }

  const hasInjury = data.injuries.length > 0 && !data.injuries.includes('none')
  const canContinue = data.injuries.length > 0

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          Lesiones y limitaciones
        </h1>
        <p className="text-[#888] text-sm mb-8">
          Adaptamos los ejercicios para que entrenes de forma segura
        </p>

        {/* Zone chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ZONES.map(({ type, label }) => {
            const sel     = data.injuries.includes(type)
            const isNone  = type === 'none'
            return (
              <button
                key={type}
                onClick={() => toggle(type)}
                className={`px-4 py-2.5 rounded-full border font-medium text-sm transition-all active:scale-95 ${
                  sel
                    ? isNone
                      ? 'bg-[#C8FF00]/15 border-[#C8FF00] text-[#C8FF00]'
                      : 'bg-red-500/15 border-red-500/60 text-red-400'
                    : 'border-[#333] text-[#888]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Notes — only when has injury */}
        {hasInjury && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">
              ¿Algo específico que debamos saber?
            </label>
            <textarea
              value={data.injury_notes}
              onChange={e => onChange({ ...data, injury_notes: e.target.value })}
              placeholder="Ej: Tendinitis rotuliana, no puedo hacer sentadilla profunda"
              rows={3}
              className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:outline-none focus:border-[#C8FF00] transition-colors text-sm resize-none"
            />
          </div>
        )}

        {/* Low intensity toggle */}
        <button
          onClick={() => onChange({ ...data, low_intensity_preference: !data.low_intensity_preference })}
          className={`mt-5 flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border transition-all ${
            data.low_intensity_preference ? 'border-[#555] bg-[#1A1A1A]' : 'border-[#222] bg-transparent'
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
            data.low_intensity_preference ? 'bg-[#555] border-[#555]' : 'border-[#444]'
          }`}>
            {data.low_intensity_preference && (
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                <path d="M2 4.5L4 6.5L7.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="text-left">
            <p className="text-sm text-white font-medium">Prefiero baja intensidad por salud general</p>
            <p className="text-xs text-[#555] mt-0.5">El plan usará cargas y ritmos más conservadores</p>
          </div>
        </button>
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
