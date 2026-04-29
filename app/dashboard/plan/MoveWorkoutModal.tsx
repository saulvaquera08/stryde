'use client'

import { useState, useTransition } from 'react'
import { X, Check, BanIcon, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { moveWorkout, skipWorkout } from '../settings/actions'

const DOW_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function getMondayOfWeek(dateStr: string): Date {
  const d = new Date(dateStr + 'T12:00:00')
  const dow = d.getDay() // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(d)
  monday.setDate(d.getDate() + offset)
  return monday
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(d.getDate() + n)
  return r
}

function toISO(d: Date) { return d.toISOString().split('T')[0] }

interface Props {
  workoutId: string
  currentDate: string
  workoutLabel: string
  onClose: () => void
}

export default function WorkoutOptionsModal({ workoutId, currentDate, workoutLabel, onClose }: Props) {
  const [view, setView]                = useState<'menu' | 'move' | 'skipped'>('menu')
  const [weekOffset, setWeekOffset]    = useState(0)
  const [pendingDate, setPendingDate]  = useState<string | null>(null)
  const [skipping, startSkip]          = useTransition()
  const [moving, startMove]            = useTransition()
  const [error, setError]              = useState<string | null>(null)

  const baseMonday = getMondayOfWeek(currentDate)
  const weekMonday = addDays(baseMonday, weekOffset * 7)
  const weekDays   = Array.from({ length: 7 }, (_, i) => addDays(weekMonday, i))

  const handleSkip = () => {
    startSkip(async () => {
      try {
        await skipWorkout(workoutId)
        setView('skipped')
        setTimeout(onClose, 900)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  const handleMove = (dateStr: string) => {
    if (dateStr === currentDate) return
    setPendingDate(dateStr)
    startMove(async () => {
      try {
        await moveWorkout(workoutId, dateStr)
        setTimeout(onClose, 700)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al mover')
        setPendingDate(null)
      }
    })
  }

  const weekLabel = (() => {
    const start = weekDays[0]
    const end   = weekDays[6]
    const sm    = start.toLocaleDateString('es-ES', { month: 'short' })
    const em    = end.toLocaleDateString('es-ES', { month: 'short' })
    return sm === em
      ? `${start.getDate()} – ${end.getDate()} ${sm}`
      : `${start.getDate()} ${sm} – ${end.getDate()} ${em}`
  })()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-[28px] border border-[#1F1F1F] px-5 pt-5 pb-10"
        style={{ background: '#111' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          {view === 'move' ? (
            <button onClick={() => setView('menu')} className="flex items-center gap-1.5 text-[#888] text-[13px]">
              <ChevronLeft size={14} /> Volver
            </button>
          ) : (
            <span className="text-[#555] text-[11px] font-mono tracking-[0.15em] font-bold">ENTRENAMIENTO</span>
          )}
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888]">
            <X size={14} />
          </button>
        </div>

        <p className="text-white text-[16px] font-semibold leading-snug mb-5 truncate pr-4">{workoutLabel}</p>

        {/* ── Main menu ─────────────────────────────────────────────────────── */}
        {view === 'menu' && (
          <div className="flex flex-col gap-2">
            {/* Move */}
            <button
              onClick={() => setView('move')}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-[#141414] border border-[#222] transition-all active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center shrink-0">
                <CalendarDays size={18} className="text-[#C8FF00]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-white text-[15px] font-semibold">Cambiar de día</p>
                <p className="text-[#555] text-[12px] mt-0.5">Mueve este entrenamiento a otro día</p>
              </div>
            </button>

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={skipping}
              className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-[#141414] border border-[#222] transition-all active:scale-[0.98] text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center shrink-0">
                <BanIcon size={18} className="text-[#FF6B35]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-white text-[15px] font-semibold">
                  {skipping ? 'Omitiendo…' : 'Omitir entrenamiento'}
                </p>
                <p className="text-[#555] text-[12px] mt-0.5">Elimina este día del plan</p>
              </div>
            </button>

            {error && <p className="text-[#FF6B35] text-[12px] font-mono px-1">{error}</p>}
          </div>
        )}

        {/* ── Skipped confirmation ────────────────────────────────────────────── */}
        {view === 'skipped' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-14 h-14 rounded-full bg-[#FF6B35]/15 flex items-center justify-center">
              <Check size={24} className="text-[#FF6B35]" strokeWidth={2.5} />
            </div>
            <p className="text-white text-[16px] font-semibold">Entrenamiento omitido</p>
          </div>
        )}

        {/* ── Day picker ─────────────────────────────────────────────────────── */}
        {view === 'move' && (
          <>
            {/* Week nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888] active:opacity-60"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono text-[11px] font-bold tracking-[0.12em] text-[#888] capitalize">
                {weekLabel}
              </span>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888] active:opacity-60"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {weekDays.map((day, i) => {
                const iso       = toISO(day)
                const isCurrent = iso === currentDate
                const isPending = iso === pendingDate
                const done      = isPending && !moving

                return (
                  <button
                    key={iso}
                    onClick={() => handleMove(iso)}
                    disabled={isCurrent || moving}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all active:scale-95 ${
                      isCurrent
                        ? 'border-[#333] bg-[#1A1A1A] opacity-40 cursor-not-allowed'
                        : done
                        ? 'border-[#C8FF00]/40 bg-[#C8FF00]/10'
                        : isPending
                        ? 'border-[#C8FF00]/30 bg-[#C8FF00]/8'
                        : 'border-[#222] bg-[#141414] hover:border-[#333]'
                    }`}
                  >
                    <span className={`font-mono text-[9px] font-bold tracking-[0.1em] ${
                      isCurrent ? 'text-[#444]' : done || isPending ? 'text-[#C8FF00]' : 'text-[#555]'
                    }`}>
                      {DOW_SHORT[i]}
                    </span>
                    <span className={`font-mono text-[13px] font-bold ${
                      isCurrent ? 'text-[#444]' : done || isPending ? 'text-[#C8FF00]' : 'text-white'
                    }`}>
                      {done ? <Check size={12} strokeWidth={3} /> : day.getDate()}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="text-center font-mono text-[10px] text-[#444] tracking-[0.12em]">
              Toca el día para moverlo ahí
            </p>

            {error && <p className="text-[#FF6B35] text-[12px] font-mono mt-3">{error}</p>}
          </>
        )}
      </div>
    </div>
  )
}
