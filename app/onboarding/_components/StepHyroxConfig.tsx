'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { OnboardingData, HyroxExperience, HyroxStation, StrengthCardioBalance } from '../types'

// ── Data ──────────────────────────────────────────────────────────────────────

const EXPERIENCES: { type: HyroxExperience; icon: string; label: string; desc: string }[] = [
  { type: 'never',       icon: '❓', label: 'Nunca he competido', desc: 'Es mi primer HYROX o aún no me he inscrito' },
  { type: 'once_twice',  icon: '🥈', label: '1-2 veces',         desc: 'Tengo experiencia básica de competencia' },
  { type: 'multiple',    icon: '🏅', label: 'Múltiples veces',   desc: 'Soy competidor regular, busco mejorar tiempos' },
]

const STATIONS: { type: HyroxStation; label: string }[] = [
  { type: 'skierg',          label: 'SkiErg' },
  { type: 'sled_push',       label: 'Sled Push' },
  { type: 'sled_pull',       label: 'Sled Pull' },
  { type: 'burpee_broad',    label: 'Burpee Broad Jumps' },
  { type: 'rowing',          label: 'Rowing' },
  { type: 'farmer_carry',    label: 'Farmer Carry' },
  { type: 'sandbag_lunges',  label: 'Sandbag Lunges' },
  { type: 'wall_balls',      label: 'Wall Balls' },
  { type: 'running',         label: 'Running (general)' },
]

const BALANCE_OPTIONS: { value: StrengthCardioBalance; label: string; icon: string }[] = [
  { value: 1, icon: '💪💪', label: 'Mucho más fuerte que rápido' },
  { value: 2, icon: '💪',   label: 'Algo más fuerte' },
  { value: 3, icon: '⚖️',   label: 'Equilibrado' },
  { value: 4, icon: '🫁',   label: 'Algo más rápido' },
  { value: 5, icon: '🫁🫁', label: 'Mucho más rápido que fuerte' },
]

const subSlide = {
  enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d < 0 ? 24 : -24, opacity: 0 }),
}

interface Props {
  data:     OnboardingData
  onChange: (data: OnboardingData) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepHyroxConfig({ data, onChange, onNext, onBack }: Props) {
  const [sub, setSub] = useState(0)
  const [dir, setDir] = useState(1)

  const isNever = data.hyrox_experience === 'never'
  // Sub indices: 0=experience, 1=date, 2=times (skip if never), 3=stations, 4=balance
  // We dynamically skip sub 2 if experience=never
  const subKeys = isNever ? [0, 1, 3, 4] : [0, 1, 2, 3, 4]
  const TOTAL_SUBS = subKeys.length

  // The actual sub panel to show is subKeys[sub]
  const panel = subKeys[sub] ?? sub

  const goSub = (n: number) => { setDir(n > sub ? 1 : -1); setSub(n) }

  const toggleStation = (s: HyroxStation) => {
    const cur = data.hyrox_weak_stations
    if (cur.includes(s)) {
      onChange({ ...data, hyrox_weak_stations: cur.filter(x => x !== s) })
    } else if (cur.length < 3) {
      onChange({ ...data, hyrox_weak_stations: [...cur, s] })
    }
  }

  const canA = !!data.hyrox_experience
  const canB = data.hyrox_no_date || !!data.hyrox_race_date

  const subTitles: Record<number, string> = {
    0: '¿Has competido en HYROX?',
    1: 'Fecha de competencia',
    2: 'Tu tiempo de referencia',
    3: 'Estaciones más débiles',
    4: 'Fuerza vs velocidad',
  }
  const subSubs: Record<number, string> = {
    0: 'Esto calibra el nivel de especificidad del plan',
    1: 'Periodizamos el plan hacia la fecha de competencia',
    2: 'Usamos esto para fijar objetivos de tiempo',
    3: 'Focalizamos los bloques de entrenamiento aquí — máx. 3',
    4: 'Balanceamos los días de fuerza y cardio según tu perfil',
  }

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      {/* Sub-step dots */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: TOTAL_SUBS }).map((_, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full transition-all duration-300"
            style={{ background: i <= sub ? '#FF6B35' : '#222' }} />
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
            <h2 className="text-[1.6rem] font-bold text-white leading-tight mb-1">{subTitles[panel]}</h2>
            <p className="text-[#888] text-sm mb-6">{subSubs[panel]}</p>

            {/* Panel 0 — Experience */}
            {panel === 0 && (
              <div className="flex flex-col gap-3">
                {EXPERIENCES.map(({ type, icon, label, desc }) => {
                  const sel = data.hyrox_experience === type
                  return (
                    <button
                      key={type}
                      onClick={() => onChange({ ...data, hyrox_experience: type })}
                      className={`w-full p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${
                        sel ? 'bg-[#FF6B35]/[0.08] border-[#FF6B35]' : 'bg-[#141414] border-[#222]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{icon}</span>
                        <div>
                          <p className={`font-semibold text-sm ${sel ? 'text-[#FF6B35]' : 'text-white'}`}>{label}</p>
                          <p className="text-[#888] text-xs mt-0.5">{desc}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Panel 1 — Race date */}
            {panel === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">Fecha de competencia</label>
                  <input
                    type="date"
                    value={data.hyrox_race_date}
                    onChange={e => onChange({ ...data, hyrox_race_date: e.target.value, hyrox_no_date: false })}
                    disabled={data.hyrox_no_date}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#FF6B35] transition-colors [color-scheme:dark] disabled:opacity-30"
                  />
                </div>
                <button
                  onClick={() => onChange({ ...data, hyrox_no_date: !data.hyrox_no_date, hyrox_race_date: '' })}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                    data.hyrox_no_date ? 'border-[#FF6B35] bg-[#FF6B35]/10' : 'border-[#222] bg-[#141414]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    data.hyrox_no_date ? 'bg-[#FF6B35] border-[#FF6B35]' : 'border-[#444]'
                  }`}>
                    {data.hyrox_no_date && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M2 4.5L4 6.5L7.5 2.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${data.hyrox_no_date ? 'text-[#FF6B35]' : 'text-[#888]'}`}>
                    Sin fecha todavía — plan de 8 semanas base
                  </span>
                </button>
              </div>
            )}

            {/* Panel 2 — Times (experienced only) */}
            {panel === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">Tiempo en tu último HYROX</label>
                  <input
                    type="text"
                    value={data.hyrox_last_time}
                    onChange={e => onChange({ ...data, hyrox_last_time: e.target.value })}
                    placeholder="1:12:30"
                    className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:outline-none focus:border-[#FF6B35] transition-colors text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">
                    Tiempo objetivo <span className="normal-case text-[#444] tracking-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={data.hyrox_target_time}
                    onChange={e => onChange({ ...data, hyrox_target_time: e.target.value })}
                    placeholder="1:05:00"
                    className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:outline-none focus:border-[#FF6B35] transition-colors text-base"
                  />
                </div>
              </div>
            )}

            {/* Panel 3 — Stations */}
            {panel === 3 && (
              <div>
                <div className="flex flex-wrap gap-2">
                  {STATIONS.map(({ type, label }) => {
                    const sel    = data.hyrox_weak_stations.includes(type)
                    const maxed  = data.hyrox_weak_stations.length >= 3 && !sel
                    return (
                      <button
                        key={type}
                        onClick={() => toggleStation(type)}
                        disabled={maxed}
                        className={`px-3.5 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${
                          sel
                            ? 'bg-[#FF6B35]/15 border-[#FF6B35] text-[#FF6B35]'
                            : maxed
                            ? 'border-[#1A1A1A] text-[#333] cursor-not-allowed'
                            : 'border-[#333] text-[#888]'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[#444] text-xs mt-4">
                  {data.hyrox_weak_stations.length === 0
                    ? 'Ninguna seleccionada — plan equilibrado'
                    : `${data.hyrox_weak_stations.length}/3 seleccionadas`}
                </p>
              </div>
            )}

            {/* Panel 4 — Balance */}
            {panel === 4 && (
              <div className="flex flex-col gap-2.5">
                {BALANCE_OPTIONS.map(({ value, icon, label }) => {
                  const sel = data.hyrox_strength_cardio_balance === value
                  return (
                    <button
                      key={value}
                      onClick={() => onChange({ ...data, hyrox_strength_cardio_balance: value })}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all active:scale-[0.99] ${
                        sel ? 'bg-[#FF6B35]/[0.08] border-[#FF6B35]' : 'bg-[#141414] border-[#222]'
                      }`}
                    >
                      <span className="text-lg shrink-0 w-8 text-center">{icon}</span>
                      <span className={`text-sm font-medium ${sel ? 'text-[#FF6B35]' : 'text-white'}`}>{label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav */}
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
            disabled={panel === 0 ? !canA : panel === 1 ? !canB : false}
            className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Siguiente <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {data.hyrox_strength_cardio_balance ? 'Continuar →' : 'Saltar →'}
          </button>
        )}
      </div>
    </div>
  )
}
