'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check, RefreshCw } from 'lucide-react'
import { updateTrainingDays } from './actions'

const DAYS = [
  { key: 'monday',    label: 'Lunes',     short: 'L' },
  { key: 'tuesday',   label: 'Martes',    short: 'M' },
  { key: 'wednesday', label: 'Miércoles', short: 'X' },
  { key: 'thursday',  label: 'Jueves',    short: 'J' },
  { key: 'friday',    label: 'Viernes',   short: 'V' },
  { key: 'saturday',  label: 'Sábado',    short: 'S' },
  { key: 'sunday',    label: 'Domingo',   short: 'D' },
]

interface Props {
  initialDays: string[]
}

export default function SettingsClient({ initialDays }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(initialDays))
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const toggle = (day: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(day)) {
        if (next.size <= 3) return prev // enforce minimum
        next.delete(day)
      } else {
        if (next.size >= 6) return prev // enforce maximum
        next.add(day)
      }
      return next
    })
    setError(null)
    setSuccess(false)
  }

  const hasChanged = JSON.stringify([...selected].sort()) !== JSON.stringify([...initialDays].sort())

  const save = () => {
    startTransition(async () => {
      try {
        const ordered = DAYS.map(d => d.key).filter(d => selected.has(d))
        await updateTrainingDays(ordered)
        setSuccess(true)
        setTimeout(() => router.push('/dashboard/plan'), 1200)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  return (
    <div className="px-5 pt-5 pb-6 min-h-screen" style={{ background: '#0A0A0A' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-[#888] hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-[22px] font-bold text-white tracking-tight">Días de entrenamiento</h1>
      </div>

      <p className="text-[#888] text-[14px] leading-relaxed mb-6">
        Selecciona entre 3 y 6 días. Al guardar se regenera tu plan completo manteniendo tu objetivo y nivel.
      </p>

      {/* Day picker */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {DAYS.map(day => {
          const active = selected.has(day.key)
          return (
            <button
              key={day.key}
              onClick={() => toggle(day.key)}
              className={`aspect-square rounded-xl flex items-center justify-center font-mono text-[13px] font-bold border transition-all ${
                active
                  ? 'bg-[#C8FF00]/10 border-[#C8FF00]/40 text-[#C8FF00]'
                  : 'bg-[#141414] border-[#222] text-[#444]'
              }`}
            >
              {day.short}
            </button>
          )
        })}
      </div>

      {/* Count badge */}
      <div className="flex items-center gap-2 mb-8">
        <div className="px-3 py-1.5 rounded-full bg-[#141414] border border-[#222]">
          <span className="font-mono text-[12px] font-bold text-white">{selected.size}</span>
          <span className="font-mono text-[12px] text-[#888]"> días / semana</span>
        </div>
        {selected.size < 3 && (
          <span className="font-mono text-[11px] text-[#FF6B35]">mínimo 3</span>
        )}
      </div>

      {/* Day list */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] overflow-hidden mb-8">
        {DAYS.map((day, i) => {
          const active = selected.has(day.key)
          return (
            <button
              key={day.key}
              onClick={() => toggle(day.key)}
              className={`w-full flex items-center gap-3 px-4 py-[14px] transition-colors hover:bg-white/5 ${
                i < DAYS.length - 1 ? 'border-b border-[#1F1F1F]' : ''
              }`}
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center border transition-all ${
                  active
                    ? 'bg-[#C8FF00] border-[#C8FF00]'
                    : 'bg-transparent border-[#333]'
                }`}
              >
                {active && <Check size={13} className="text-black" strokeWidth={3} />}
              </div>
              <span className={`text-[15px] font-medium flex-1 text-left ${active ? 'text-white' : 'text-[#555]'}`}>
                {day.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20">
          <p className="text-[#FF6B35] text-[13px]">{error}</p>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={save}
        disabled={!hasChanged || isPending || selected.size < 3 || success}
        className={`w-full h-[52px] rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] transition-all ${
          success
            ? 'bg-[#C8FF00]/20 border border-[#C8FF00]/40 text-[#C8FF00]'
            : hasChanged && selected.size >= 3 && !isPending
            ? 'bg-[#C8FF00] text-black'
            : 'bg-[#141414] border border-[#222] text-[#444]'
        }`}
      >
        {success ? (
          <>
            <Check size={18} strokeWidth={3} />
            Plan regenerado
          </>
        ) : isPending ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Regenerando plan…
          </>
        ) : (
          'Guardar y regenerar plan'
        )}
      </button>

      <p className="text-center text-[#555] text-[11px] mt-4 font-mono">
        Esto reemplazará tu plan actual
      </p>
    </div>
  )
}
