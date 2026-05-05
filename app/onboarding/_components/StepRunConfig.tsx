'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { OnboardingData, RunDistance, RunLevel } from '../types'

// ── Data ──────────────────────────────────────────────────────────────────────

const DISTANCES: { type: RunDistance; label: string; desc: string }[] = [
  { type: '5k',  label: '5K',        desc: 'La distancia perfecta para empezar' },
  { type: '10k', label: '10K',       desc: 'El clásico de las carreras populares' },
  { type: '15k', label: '15K',       desc: 'Un reto intermedio' },
  { type: '21k', label: 'Media Maratón', desc: 'El gran salto — 21 km' },
  { type: '42k', label: 'Maratón',   desc: 'El desafío máximo — 42 km' },
]

const WEEKLY_KM: { value: string; label: string }[] = [
  { value: '0-10',  label: '0–10 km' },
  { value: '10-20', label: '10–20 km' },
  { value: '20-35', label: '20–35 km' },
  { value: '35-50', label: '35–50 km' },
  { value: '50+',   label: '+50 km' },
]

const RUN_LEVELS: { type: RunLevel; icon: string; label: string; desc: string }[] = [
  { type: 'beginner',     icon: '🌱', label: 'Principiante', desc: 'Corro menos de 6 meses o de forma irregular' },
  { type: 'intermediate', icon: '🏃', label: 'Intermedio',   desc: 'Entreno 3-4x por semana, he corrido alguna carrera' },
  { type: 'advanced',     icon: '🏆', label: 'Avanzado',     desc: 'Corro +5x semana, tengo tiempos objetivo específicos' },
]

const subSlide = {
  enter: (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (d: number) => ({ x: d < 0 ? 24 : -24, opacity: 0 }),
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calcPace(timeStr: string, distKm: number): string {
  if (!timeStr || !timeStr.includes(':')) return ''
  const [mm, ss] = timeStr.split(':').map(Number)
  if (isNaN(mm) || isNaN(ss)) return ''
  const totalSec = mm * 60 + ss
  const paceSec  = totalSec / distKm
  const pm = Math.floor(paceSec / 60)
  const ps = Math.round(paceSec % 60).toString().padStart(2, '0')
  return `${pm}:${ps} /km`
}

function needsBothTimes(d: RunDistance | '') {
  return d === '15k' || d === '21k' || d === '42k'
}

interface Props {
  data:     OnboardingData
  onChange: (data: OnboardingData) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepRunConfig({ data, onChange, onNext, onBack }: Props) {
  const [sub, setSub] = useState(0)
  const [dir, setDir] = useState(1)
  const TOTAL_SUBS    = 4

  const goSub = (n: number) => { setDir(n > sub ? 1 : -1); setSub(n) }

  const canA = !!data.run_distance
  const canB = data.run_no_date || !!data.run_race_date
  const canD = !!data.run_level

  const dist = data.run_distance
  const show5k  = dist === '5k'
  const show10k = dist === '10k'
  const showBoth = needsBothTimes(dist)

  const pace5k  = calcPace(data.run_current_5k_time, 5)
  const pace10k = calcPace(data.run_current_10k_time, 10)

  const subTitles = ['Distancia objetivo', 'Fecha de carrera', 'Rendimiento actual', 'Tu nivel como corredor']
  const subSubs   = [
    '¿Para qué distancia quieres prepararte?',
    'Generamos un plan periodizado hacia esa fecha',
    'Calibramos tus zonas de entrenamiento y ritmos',
    'Define el volumen inicial y la progresión',
  ]

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full">
      {/* Sub-step dots */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: TOTAL_SUBS }).map((_, i) => (
          <div key={i} className="flex-1 h-[2px] rounded-full transition-all duration-300"
            style={{ background: i <= sub ? '#60A5FA' : '#222' }} />
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

            {/* A — Distance */}
            {sub === 0 && (
              <div className="flex flex-col gap-2.5">
                {DISTANCES.map(({ type, label, desc }) => {
                  const sel = data.run_distance === type
                  return (
                    <button
                      key={type}
                      onClick={() => onChange({ ...data, run_distance: type })}
                      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-all active:scale-[0.99] ${
                        sel ? 'border-[#60A5FA] bg-[#60A5FA]/[0.08]' : 'border-[#222] bg-[#141414]'
                      }`}
                    >
                      <div>
                        <p className={`font-bold text-[15px] ${sel ? 'text-[#60A5FA]' : 'text-white'}`}>{label}</p>
                        <p className="text-[#555] text-[12px] mt-0.5">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        sel ? 'bg-[#60A5FA] border-[#60A5FA]' : 'border-[#333]'
                      }`}>
                        {sel && (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M2 4.5L4 6.5L7.5 2.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* B — Race date */}
            {sub === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">
                    Fecha de carrera
                  </label>
                  <input
                    type="date"
                    value={data.run_race_date}
                    onChange={e => onChange({ ...data, run_race_date: e.target.value, run_no_date: false })}
                    disabled={data.run_no_date}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-[#60A5FA] transition-colors [color-scheme:dark] disabled:opacity-30"
                  />
                </div>

                <button
                  onClick={() => onChange({ ...data, run_no_date: !data.run_no_date, run_race_date: '' })}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                    data.run_no_date ? 'border-[#60A5FA] bg-[#60A5FA]/10' : 'border-[#222] bg-[#141414]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                    data.run_no_date ? 'bg-[#60A5FA] border-[#60A5FA]' : 'border-[#444]'
                  }`}>
                    {data.run_no_date && (
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M2 4.5L4 6.5L7.5 2.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${data.run_no_date ? 'text-[#60A5FA]' : 'text-[#888]'}`}>
                    No tengo carrera programada — plan de 8 semanas base
                  </span>
                </button>
              </div>
            )}

            {/* C — Times */}
            {sub === 2 && (
              <div className="flex flex-col gap-5">
                {(show5k || showBoth) && (
                  <div>
                    <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">
                      Tu mejor tiempo en 5K
                    </label>
                    <input
                      type="text"
                      value={data.run_current_5k_time}
                      onChange={e => onChange({ ...data, run_current_5k_time: e.target.value })}
                      placeholder="25:30"
                      className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:outline-none focus:border-[#60A5FA] transition-colors text-base"
                    />
                    {pace5k && (
                      <p className="text-[#60A5FA] text-xs mt-2 font-mono">
                        Tu ritmo: ~{pace5k} · Zona fácil: ~{calcPace(data.run_current_5k_time, 5.5) || '—'} · Tempo: —
                      </p>
                    )}
                  </div>
                )}

                {(show10k || showBoth) && (
                  <div>
                    <label className="block text-xs text-[#888] uppercase tracking-widest mb-2">
                      Tu mejor tiempo en 10K
                    </label>
                    <input
                      type="text"
                      value={data.run_current_10k_time}
                      onChange={e => onChange({ ...data, run_current_10k_time: e.target.value })}
                      placeholder="55:00"
                      className="w-full bg-[#141414] border border-[#222] rounded-xl px-4 py-3.5 text-white placeholder-[#444] focus:outline-none focus:border-[#60A5FA] transition-colors text-base"
                    />
                    {pace10k && (
                      <p className="text-[#60A5FA] text-xs mt-2 font-mono">Tu ritmo: ~{pace10k}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs text-[#888] uppercase tracking-widest mb-3">
                    Kilómetros por semana actualmente
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKLY_KM.map(({ value, label }) => {
                      const sel = data.run_weekly_km === value
                      return (
                        <button
                          key={value}
                          onClick={() => onChange({ ...data, run_weekly_km: value })}
                          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${
                            sel ? 'bg-[#60A5FA]/15 border-[#60A5FA] text-[#60A5FA]' : 'border-[#333] text-[#888]'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <p className="text-[#444] text-xs">Puedes saltarte los tiempos si no los conoces</p>
              </div>
            )}

            {/* D — Level */}
            {sub === 3 && (
              <div className="flex flex-col gap-3">
                {RUN_LEVELS.map(({ type, icon, label, desc }) => {
                  const sel = data.run_level === type
                  return (
                    <button
                      key={type}
                      onClick={() => onChange({ ...data, run_level: type })}
                      className={`w-full p-4 rounded-xl border text-left transition-all active:scale-[0.99] ${
                        sel ? 'bg-[#60A5FA]/[0.08] border-[#60A5FA]' : 'bg-[#141414] border-[#222]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{icon}</span>
                        <div>
                          <p className={`font-semibold text-sm ${sel ? 'text-[#60A5FA]' : 'text-white'}`}>{label}</p>
                          <p className="text-[#888] text-xs mt-0.5">{desc}</p>
                        </div>
                      </div>
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
            disabled={sub === 0 ? !canA : sub === 1 ? !canB : false}
            className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            {sub === 2 ? 'Siguiente →' : 'Siguiente'} <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canD}
            className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            Continuar →
          </button>
        )}
      </div>
    </div>
  )
}
