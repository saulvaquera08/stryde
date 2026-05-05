'use client'

import { ChevronLeft } from 'lucide-react'
import type { OnboardingData, PreferredTime, SessionDuration } from '../types'

const DAYS: { key: string; label: string }[] = [
  { key: 'monday',    label: 'L' },
  { key: 'tuesday',   label: 'M' },
  { key: 'wednesday', label: 'X' },
  { key: 'thursday',  label: 'J' },
  { key: 'friday',    label: 'V' },
  { key: 'saturday',  label: 'S' },
  { key: 'sunday',    label: 'D' },
]

const TIMES: { type: PreferredTime; icon: string; label: string }[] = [
  { type: 'morning',   icon: '🌅', label: 'Mañana (6–11am)' },
  { type: 'afternoon', icon: '☀️', label: 'Tarde (11am–5pm)' },
  { type: 'evening',   icon: '🌙', label: 'Noche (5–10pm)' },
  { type: 'flexible',  icon: '🔄', label: 'Flexible' },
]

const DURATIONS: SessionDuration[] = ['45', '60', '75', '90', '90+']

// Smart feedback per program + day count
function smartFeedback(program: string, days: number): { ok: boolean; msg: string } | null {
  if (days < 3) return { ok: false, msg: 'Selecciona al menos 3 días' }
  if (program === 'gym') {
    if (days === 3) return { ok: true,  msg: '✓ Perfecto para un plan Push/Pull/Legs' }
    if (days === 4) return { ok: true,  msg: '✓ Ideal: Upper/Lower + Full body + extra' }
    if (days === 5) return { ok: true,  msg: '✓ Excelente: máximo volumen por grupo muscular' }
    if (days >= 6)  return { ok: true,  msg: '✓ Programa de alto volumen — descansa bien' }
  }
  if (program === 'run') {
    if (days === 3) return { ok: true,  msg: '✓ Perfecto: 2 runs de calidad + 1 largo' }
    if (days === 4) return { ok: true,  msg: '✓ Ideal: 3 runs + 1 día de fuerza' }
    if (days === 5) return { ok: true,  msg: '✓ Muy completo: volumen + calidad + fuerza' }
    if (days >= 6)  return { ok: true,  msg: '✓ Entrenador de alto rendimiento — prioriza el descanso' }
  }
  if (program === 'hyrox') {
    if (days === 3) return { ok: false, msg: '⚠️ Recomendamos mín. 4 días para HYROX' }
    if (days === 4) return { ok: true,  msg: '✓ Aceptable: 2 fuerza + 1 cardio + 1 específico' }
    if (days === 5) return { ok: true,  msg: '✓ Óptimo: 2 fuerza + 2 cardio + 1 HYROX específico' }
    if (days >= 6)  return { ok: true,  msg: '✓ Programa competitivo completo de 6 días' }
  }
  return null
}

interface Props {
  data:     OnboardingData
  onChange: (data: OnboardingData) => void
  onNext:   () => void
  onBack:   () => void
}

export default function StepSchedule({ data, onChange, onNext, onBack }: Props) {
  const selected = data.training_days

  function toggleDay(key: string) {
    if (selected.includes(key)) {
      if (selected.length <= 3) return
      onChange({ ...data, training_days: selected.filter(d => d !== key) })
    } else {
      if (selected.length >= 6) return
      onChange({ ...data, training_days: [...selected, key] })
    }
  }

  const feedback = smartFeedback(data.program_type, selected.length)
  const canContinue = selected.length >= 3 && !!data.session_duration

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 max-w-lg mx-auto w-full overflow-y-auto">
      <div className="flex-1 space-y-8">

        {/* Days */}
        <div>
          <h1 className="text-[2rem] font-bold text-white leading-tight mb-1">
            Horario y disponibilidad
          </h1>
          <p className="text-[#888] text-sm mb-6">
            Define cuándo y cuánto tiempo puedes entrenar
          </p>

          <p className="text-white font-semibold text-sm mb-1">¿Qué días puedes entrenar?</p>
          <p className="text-[#888] text-xs mb-4">Toca los días disponibles · mín. 3, máx. 6</p>

          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map(({ key, label }) => {
              const isSel  = selected.includes(key)
              const maxed  = !isSel && selected.length >= 6
              return (
                <button
                  key={key}
                  onClick={() => toggleDay(key)}
                  disabled={maxed}
                  className={`aspect-square flex items-center justify-center rounded-xl border font-bold text-sm transition-all active:scale-90 ${
                    isSel
                      ? 'bg-[#C8FF00] border-[#C8FF00] text-black'
                      : maxed
                      ? 'bg-[#0F0F0F] border-[#1A1A1A] text-[#333] cursor-not-allowed'
                      : 'bg-[#141414] border-[#222] text-[#888]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {feedback && (
            <p className={`text-xs mt-3 font-mono ${feedback.ok ? 'text-[#C8FF00]/80' : 'text-orange-400'}`}>
              {feedback.msg}
            </p>
          )}
        </div>

        {/* Preferred time */}
        <div>
          <p className="text-white font-semibold text-sm mb-1">Horario preferido</p>
          <p className="text-[#888] text-xs mb-4">Para recordatorios personalizados</p>
          <div className="grid grid-cols-2 gap-2">
            {TIMES.map(({ type, icon, label }) => {
              const sel = data.preferred_time === type
              return (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, preferred_time: type })}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.99] ${
                    sel ? 'border-[#C8FF00] bg-[#C8FF00]/10' : 'border-[#222] bg-[#141414]'
                  }`}
                >
                  <span className="text-base">{icon}</span>
                  <span className={`text-sm font-medium ${sel ? 'text-[#C8FF00]' : 'text-white'}`}>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Session duration */}
        <div>
          <p className="text-white font-semibold text-sm mb-1">Duración por sesión</p>
          <p className="text-[#888] text-xs mb-4">Esto ajusta el volumen y la selección de ejercicios</p>
          <div className="flex gap-2">
            {DURATIONS.map(dur => {
              const sel = data.session_duration === dur
              return (
                <button
                  key={dur}
                  onClick={() => onChange({ ...data, session_duration: dur })}
                  className={`flex-1 py-3 rounded-xl border font-mono text-sm font-bold transition-all active:scale-95 ${
                    sel ? 'border-[#C8FF00] bg-[#C8FF00]/10 text-[#C8FF00]' : 'border-[#222] bg-[#141414] text-[#888]'
                  }`}
                >
                  {dur === '90+' ? '+90' : dur}
                  {dur !== '90+' && <span className="font-sans text-[10px] ml-0.5 opacity-70">m</span>}
                </button>
              )
            })}
          </div>
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
          disabled={!canContinue}
          className="flex-1 bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
