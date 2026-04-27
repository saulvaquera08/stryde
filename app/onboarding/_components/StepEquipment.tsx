'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { OnboardingData, EquipmentType } from '../types'

const EQUIPMENT: {
  type: EquipmentType
  label: string
  desc: string
  icon: string
  items: string
}[] = [
  {
    type: 'full_gym',
    label: 'Gym Completo',
    desc: 'Acceso a todo el equipo',
    icon: '🏋️',
    items: 'Barras olímpicas · Sled · Máquinas · Cables',
  },
  {
    type: 'basic_gym',
    label: 'Gym Básico',
    desc: 'Equipo libre esencial',
    icon: '💪',
    items: 'Pesas libres · Barras · Banco · Pull-up bar',
  },
  {
    type: 'home',
    label: 'En Casa',
    desc: 'Equipo doméstico',
    icon: '🏠',
    items: 'Mancuernas · Kettlebell · Bandas · TRX',
  },
  {
    type: 'none',
    label: 'Sin Equipo',
    desc: 'Solo peso corporal',
    icon: '🏃',
    items: 'Cardio · Calistenia · Movilidad',
  },
]

interface Props {
  data: OnboardingData
  onChange: (data: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepEquipment({ data, onChange, onNext, onBack }: Props) {
  const canContinue = !!data.equipment

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      <div className="flex-1">
        <h1 className="text-[2rem] font-bold text-white leading-tight mb-2">
          ¿Con qué equipo cuentas?
        </h1>
        <p className="text-[#888888] text-sm mb-8">
          Adaptamos cada sesión a lo que tienes disponible
        </p>

        <div className="space-y-3">
          {EQUIPMENT.map(({ type, label, desc, icon, items }) => {
            const selected = data.equipment === type
            return (
              <button
                key={type}
                onClick={() => onChange({ ...data, equipment: type })}
                className={`
                  w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all duration-200 active:scale-[0.99]
                  ${selected
                    ? 'bg-[#C8FF00]/[0.08] border-[#C8FF00]'
                    : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'
                  }
                `}
              >
                <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${selected ? 'text-[#C8FF00]' : 'text-white'}`}>
                    {label}
                  </div>
                  <div className="text-[#888888] text-xs mt-0.5">{desc}</div>
                  <div className="text-[#555555] text-[11px] mt-1 leading-relaxed">{items}</div>
                </div>
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all
                    ${selected ? 'bg-[#C8FF00] border-[#C8FF00]' : 'border-[#333333]'}
                  `}
                >
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5L4 7L8 3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
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
          disabled={!canContinue}
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Continuar <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
