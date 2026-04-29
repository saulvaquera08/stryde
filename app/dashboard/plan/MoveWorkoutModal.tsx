'use client'

import { useState, useTransition } from 'react'
import { X, Check, Calendar } from 'lucide-react'
import { moveWorkout } from '../settings/actions'

interface Props {
  workoutId: string
  currentDate: string
  workoutLabel: string
  onClose: () => void
}

export default function MoveWorkoutModal({ workoutId, currentDate, workoutLabel, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0]

  const [newDate, setNewDate]         = useState(currentDate)
  const [isPending, startTransition]  = useTransition()
  const [done, setDone]               = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const hasChanged = newDate !== currentDate

  const submit = () => {
    if (!hasChanged) return
    startTransition(async () => {
      try {
        await moveWorkout(workoutId, newDate)
        setDone(true)
        setTimeout(onClose, 800)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al mover')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full rounded-t-[28px] border border-[#1F1F1F] px-5 pt-5 pb-10"
        style={{ background: '#111' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[18px] font-bold text-white">Mover entrenamiento</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#888]">
            <X size={14} />
          </button>
        </div>

        <p className="text-[#888] text-[13px] mb-5 truncate">{workoutLabel}</p>

        <p className="font-mono text-[10px] tracking-[0.18em] text-[#444] font-bold mb-2">NUEVA FECHA</p>
        <div className="bg-[#141414] border border-[#222] rounded-xl px-4 py-4 mb-6 flex items-center gap-3">
          <Calendar size={16} className="text-[#555]" />
          <input
            type="date"
            value={newDate}
            onChange={e => { setNewDate(e.target.value); setError(null) }}
            className="flex-1 bg-transparent text-white text-[16px] font-medium outline-none"
            style={{ colorScheme: 'dark' }}
          />
        </div>

        {error && <p className="text-[#FF6B35] text-[12px] mb-3 font-mono">{error}</p>}

        <button
          onClick={submit}
          disabled={!hasChanged || isPending || done}
          className={`w-full h-[52px] rounded-xl flex items-center justify-center gap-2 font-bold text-[15px] transition-all ${
            done
              ? 'bg-[#C8FF00]/20 text-[#C8FF00]'
              : hasChanged && !isPending
              ? 'bg-[#C8FF00] text-black'
              : 'bg-[#141414] border border-[#222] text-[#444]'
          }`}
        >
          {done ? <><Check size={18} strokeWidth={3} /> Movido</> : isPending ? 'Guardando…' : 'Mover entrenamiento'}
        </button>
      </div>
    </div>
  )
}
