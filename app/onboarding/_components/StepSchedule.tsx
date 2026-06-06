'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { OnboardingData, LevelType, EquipmentType } from '../types'

const LEVELS: { type: LevelType; label: string; desc: string }[] = [
  { type: 'beginner',     label: 'Principiante', desc: 'Menos de 1 año entrenando consistentemente' },
  { type: 'intermediate', label: 'Intermedio',   desc: '1–3 años, entrenas con regularidad' },
  { type: 'advanced',     label: 'Avanzado',     desc: '+3 años, experiencia sólida' },
]

const DAYS_OF_WEEK = [
  { key: 'monday',    label: 'L' },
  { key: 'tuesday',   label: 'M' },
  { key: 'wednesday', label: 'X' },
  { key: 'thursday',  label: 'J' },
  { key: 'friday',    label: 'V' },
  { key: 'saturday',  label: 'S' },
  { key: 'sunday',    label: 'D' },
]

// Solo para GYM
const EQUIPMENT: { type: EquipmentType; label: string; desc: string; icon: string }[] = [
  { type: 'full_gym',  label: 'Gym completo', desc: 'Barras · Sled · Máquinas · Cables', icon: '🏋️' },
  { type: 'basic_gym', label: 'Gym básico',   desc: 'Pesas libres · Barras · Pull-up',  icon: '💪' },
  { type: 'home',      label: 'En casa',      desc: 'Mancuernas · Kettlebell · Bandas', icon: '🏠' },
]

interface Props {
  data: OnboardingData
  onChange: (d: OnboardingData) => void
  onNext: () => void
  onBack: () => void
}

export default function StepSchedule({ data, onChange, onNext, onBack }: Props) {
  const isGym = data.program_type === 'gym'

  const maxSecondaryDays = Math.max(0, 6 - data.training_days.length)

  function toggleDay(key: string) {
    const sel = data.training_days
    if (sel.includes(key)) {
      if (sel.length <= 3) return // min 3
      onChange({ ...data, training_days: sel.filter(d => d !== key) })
    } else {
      if (sel.length >= 6) return // max 6
      // Clamp secondary_program_days si el nuevo total excedería 6
      const newPrimaryCount = sel.length + 1
      const newMaxSecondary = Math.max(0, 6 - newPrimaryCount)
      const clampedSecondary = Math.min(data.secondary_program_days, newMaxSecondary)
      onChange({ ...data, training_days: [...sel, key], secondary_program_days: clampedSecondary })
    }
  }

  // Para RUN, el equipo no aplica
  const equipmentValid = !isGym || !!data.equipment
  const canContinue = !!data.level && data.training_days.length >= 3 && equipmentValid

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-1">
            Tu disponibilidad
          </h1>
          <p className="text-[#888888] text-sm">
            El plan se adapta exactamente a tu horario
          </p>
        </div>

        {/* Nivel */}
        <div>
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Nivel de experiencia</p>
          <div className="space-y-2">
            {LEVELS.map(({ type, label, desc }) => {
              const sel = data.level === type
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, level: type })}
                  className={`w-full p-4 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] ${
                    sel ? 'bg-[#C8FF00]/[0.06] border-[#C8FF00]' : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className={`font-semibold text-sm ${sel ? 'text-[#C8FF00]' : 'text-white'}`}>{label}</div>
                  <div className="text-[#888888] text-xs mt-0.5">{desc}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Días disponibles */}
        <div>
          <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">Días de entrenamiento</p>
          <p className="text-[#555555] text-[11px] mb-3">Mínimo 3, máximo 6</p>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const sel = data.training_days.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleDay(key)}
                  className={`
                    aspect-square rounded-xl text-sm font-bold transition-all duration-200 active:scale-95
                    ${sel
                      ? 'bg-[#C8FF00] text-black'
                      : 'bg-[#141414] border border-[#222222] text-[#555555] hover:border-[#3a3a3a] hover:text-[#888888]'
                    }
                  `}
                >
                  {label}
                </button>
              )
            })}
          </div>
          <p className="text-[#444444] text-[11px] mt-2 text-center">
            {data.training_days.length} días seleccionados
          </p>
        </div>

        {/* Mix & Match — solo mostrar si hay días disponibles */}
        {maxSecondaryDays > 0 && (
          <div>
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-1">
              {isGym ? 'Agregar días de running' : 'Agregar días de gym'}
            </p>
            <p className="text-[#555555] text-[11px] mb-3">
              {isGym
                ? 'Easy runs para complementar tu fuerza — recuperación activa y base aeróbica'
                : 'Full body compacto para complementar tu running — fuerza funcional sin sobrecarga'
              }
            </p>
            <div className="flex gap-2">
              {Array.from({ length: maxSecondaryDays + 1 }, (_, i) => i).map(n => {
                const sel = data.secondary_program_days === n
                return (
                  <button
                    key={n}
                    onClick={() => onChange({ ...data, secondary_program_days: n })}
                    className={`
                      flex-1 py-3 rounded-xl border text-sm font-bold transition-all duration-200 active:scale-95
                      ${sel
                        ? 'bg-[#C8FF00] text-black border-[#C8FF00]'
                        : 'bg-[#141414] border-[#222222] text-[#555555] hover:border-[#3a3a3a] hover:text-[#888888]'
                      }
                    `}
                  >
                    {n === 0 ? 'No' : `${n} día${n > 1 ? 's' : ''}`}
                  </button>
                )
              })}
            </div>
            {data.secondary_program_days > 0 && (
              <div className="mt-3 px-4 py-3 bg-[#141414] border border-[#222222] rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#888888]">
                    {isGym ? '🏋️ GYM' : '🏃 RUN'} principal
                  </span>
                  <span className="text-white font-bold">{data.training_days.length} días</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1.5">
                  <span className="text-[#888888]">
                    {isGym ? '🏃 RUN' : '🏋️ GYM'} complemento
                  </span>
                  <span className="text-[#C8FF00] font-bold">{data.secondary_program_days} días</span>
                </div>
                <div className="border-t border-[#222222] mt-2 pt-2 flex items-center justify-between text-xs">
                  <span className="text-[#888888]">Total semanal</span>
                  <span className="text-white font-bold">
                    {data.training_days.length + data.secondary_program_days} días activos
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Equipo — solo para GYM */}
        {isGym && (
          <div>
            <p className="text-xs text-[#888888] uppercase tracking-widest mb-3">Equipamiento disponible</p>
            <div className="space-y-2">
              {EQUIPMENT.map(({ type, label, desc, icon }) => {
                const sel = data.equipment === type
                return (
                  <button
                    key={type}
                    onClick={() => onChange({ ...data, equipment: type })}
                    className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all duration-200 active:scale-[0.99] ${
                      sel ? 'bg-[#C8FF00]/[0.06] border-[#C8FF00]' : 'bg-[#141414] border-[#222222] hover:border-[#3a3a3a]'
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <div className="flex-1">
                      <div className={`font-semibold text-sm ${sel ? 'text-[#C8FF00]' : 'text-white'}`}>{label}</div>
                      <div className="text-[#555555] text-[11px] mt-0.5">{desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${sel ? 'border-[#C8FF00]' : 'border-[#444444]'}`}>
                      {sel && <div className="w-2.5 h-2.5 rounded-full bg-[#C8FF00]" />}
                    </div>
                  </button>
                )
              })}
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
