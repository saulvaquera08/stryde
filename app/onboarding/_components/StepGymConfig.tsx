'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { OnboardingData, GymGoal, GymLevel, EquipmentType, MuscleGroup } from '../types'

// ── Sub-step data ─────────────────────────────────────────────────────────────

const GYM_GOALS: { type: GymGoal; icon: string; label: string; desc: string }[] = [
  { type: 'strength',    icon: '💪', label: 'Fuerza Máxima',     desc: 'Levanta más. Grandes compuestos y pesos máximos' },
  { type: 'hypertrophy', icon: '🔥', label: 'Hipertrofia',       desc: 'Más músculo. Volumen alto, reps 8-15' },
  { type: 'recomp',      icon: '⚖️', label: 'Recomposición',     desc: 'Perder grasa y ganar músculo simultáneamente' },
  { type: 'general',     icon: '🎯', label: 'General / Salud',   desc: 'Entrenamiento equilibrado sin objetivo específico' },
]

const GYM_LEVELS: { type: GymLevel; icon: string; label: string; desc: string }[] = [
  { type: 'beginner',     icon: '🌱', label: 'Principiante', desc: 'Menos de 1 año entrenando con pesas consistentemente' },
  { type: 'intermediate', icon: '💪', label: 'Intermedio',   desc: '1–3 años, conoces los movimientos básicos' },
  { type: 'advanced',     icon: '🏆', label: 'Avanzado',     desc: '+3 años, manejas técnica y progresión' },
]

const EQUIPMENT: { type: EquipmentType; icon: string; label: string; items: string }[] = [
  { type: 'full_gym',  icon: '🏋️', label: 'Gym Completo', items: 'Barras olímpicas · Sled · Máquinas · Cables · Todo disponible' },
  { type: 'basic_gym', icon: '💪', label: 'Gym Básico',   items: 'Pesas libres · Barras · Banco · Pull-up bar' },
  { type: 'home',      icon: '🏠', label: 'En Casa',      items: 'Mancuernas · Kettlebell · Bandas · Peso corporal' },
]

const MUSCLES: { type: MuscleGroup; label: string }[] = [
  { type: 'chest',     label: 'Pecho' },
  { type: 'back',      label: 'Espalda' },
  { type: 'legs',      label: 'Piernas' },
  { type: 'shoulders', label: 'Hombros' },
  { type: 'arms',      label: 'Brazos' },
  { type: 'core',      label: 'Core' },
]

// ── Shared helpers ────────────────────────────────────────────────────────────

const subSlide = {
  enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d < 0 ? 24 : -24, opacity: 0 }),
}

function CardOption({
  icon, label, desc, selected, onClick,
}: {
  icon?: string; label: string; desc?: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${
        selected ? 'bg-[#A78BFA]/[0.08] border-[#A78BFA]' : 'bg-[#141414] border-[#222]'
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="text-xl shrink-0 mt-0.5">{icon}</span>}
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${selected ? 'text-[#A78BFA]' : 'text-white'}`}>{label}</div>
          {desc && <div className="text-[#888] text-xs mt-0.5">{desc}</div>}
        </div>
        <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
          selected ? 'bg-[#A78BFA] border-[#A78BFA]' : 'border-[#333]'
        }`}>
          {selected && (
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M2 4.5L4 6.5L7.5 2.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  data:     OnboardingData
  onChange: (data: OnboardingData) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepGymConfig({ data, onChange, onNext, onBack }: Props) {
  const [sub, setSub]   = useState(0)   // 0=goal 1=level 2=equipment 3=muscles
  const [dir, setDir]   = useState(1)
  const TOTAL_SUBS      = 4

  const goSub = (n: number) => { setDir(n > sub ? 1 : -1); setSub(n) }

  const toggleMuscle = (m: MuscleGroup) => {
    const cur = data.priority_muscles
    if (cur.includes(m)) {
      onChange({ ...data, priority_muscles: cur.filter(x => x !== m) })
    } else if (cur.length < 3) {
      onChange({ ...data, priority_muscles: [...cur, m] })
    }
  }

  // Per-sub canContinue
  const canA = !!data.gym_goal
  const canB = !!data.gym_level
  const canC = !!data.equipment

  const subTitles = [
    'Tu objetivo en el gym',
    'Tu nivel de experiencia',
    'Equipo disponible',
    'Músculos prioritarios',
  ]
  const subSubs = [
    'Esto define el tipo de entrenamiento y las cargas',
    'Calibra la intensidad y complejidad del plan',
    'Adaptamos cada sesión a lo que tienes disponible',
    'Opcional — el plan cubre todo el cuerpo de igual manera',
  ]

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      {/* Sub-step indicator */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: TOTAL_SUBS }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-[2px] rounded-full transition-all duration-300"
            style={{ background: i <= sub ? '#A78BFA' : '#222' }}
          />
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={sub}
            custom={dir}
            variants={subSlide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
          >
            <h2 className="text-[1.6rem] font-bold text-white leading-tight mb-1">{subTitles[sub]}</h2>
            <p className="text-[#888] text-sm mb-6">{subSubs[sub]}</p>

            {/* Sub A — Goal */}
            {sub === 0 && (
              <div className="flex flex-col gap-3">
                {GYM_GOALS.map(({ type, icon, label, desc }) => (
                  <CardOption
                    key={type}
                    icon={icon}
                    label={label}
                    desc={desc}
                    selected={data.gym_goal === type}
                    onClick={() => onChange({ ...data, gym_goal: type })}
                  />
                ))}
              </div>
            )}

            {/* Sub B — Level */}
            {sub === 1 && (
              <div className="flex flex-col gap-3">
                {GYM_LEVELS.map(({ type, icon, label, desc }) => (
                  <CardOption
                    key={type}
                    icon={icon}
                    label={label}
                    desc={desc}
                    selected={data.gym_level === type}
                    onClick={() => onChange({ ...data, gym_level: type })}
                  />
                ))}
              </div>
            )}

            {/* Sub C — Equipment */}
            {sub === 2 && (
              <div className="flex flex-col gap-3">
                {EQUIPMENT.map(({ type, icon, label, items }) => (
                  <CardOption
                    key={type}
                    icon={icon}
                    label={label}
                    desc={items}
                    selected={data.equipment === type}
                    onClick={() => onChange({ ...data, equipment: type })}
                  />
                ))}
              </div>
            )}

            {/* Sub D — Muscles */}
            {sub === 3 && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {MUSCLES.map(({ type, label }) => {
                    const sel = data.priority_muscles.includes(type)
                    const maxed = data.priority_muscles.length >= 3 && !sel
                    return (
                      <button
                        key={type}
                        onClick={() => toggleMuscle(type)}
                        disabled={maxed}
                        className={`px-4 py-2.5 rounded-full border font-medium text-sm transition-all active:scale-95 ${
                          sel
                            ? 'bg-[#A78BFA]/15 border-[#A78BFA] text-[#A78BFA]'
                            : maxed
                            ? 'border-[#1A1A1A] text-[#333] cursor-not-allowed bg-transparent'
                            : 'border-[#333] text-[#888] bg-transparent'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[#444] text-xs mt-4">
                  {data.priority_muscles.length === 0
                    ? 'Ninguno seleccionado — plan equilibrado'
                    : `${data.priority_muscles.length}/3 seleccionados`}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => sub > 0 ? goSub(sub - 1) : onBack()}
          className="flex items-center justify-center w-14 py-4 rounded-xl border border-[#222] text-[#888] active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>

        {sub < TOTAL_SUBS - 1 ? (
          <button
            onClick={() => goSub(sub + 1)}
            disabled={sub === 0 ? !canA : sub === 1 ? !canB : !canC}
            className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Siguiente <ChevronRight size={18} />
          </button>
        ) : (
          /* Last sub-step: show skip or continue */
          <button
            onClick={onNext}
            className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {data.priority_muscles.length > 0 ? 'Continuar →' : 'Saltar →'}
          </button>
        )}
      </div>
    </div>
  )
}
