'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Play, Timer } from 'lucide-react'
import CompleteModal from './CompleteModal'

interface Props {
  workoutId: string
  alreadyDone: boolean
}

type State = 'idle' | 'running' | 'finishing'

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function WorkoutClient({ workoutId, alreadyDone }: Props) {
  const [state, setState]     = useState<State>('idle')
  const [elapsed, setElapsed] = useState(0)
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (state === 'running') {
      intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [state])

  if (alreadyDone) {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] font-semibold py-4 rounded-xl">
        <CheckCircle2 size={18} className="text-[#C8FF00]" />
        Completado
      </div>
    )
  }

  if (state === 'idle') {
    return (
      <button
        onClick={() => setState('running')}
        className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        <Play size={18} strokeWidth={2.5} />
        Comenzar workout
      </button>
    )
  }

  return (
    <>
      {/* Sticky timer bar */}
      <div className="w-full bg-[#141414] border border-[#2A2A2A] rounded-2xl px-5 py-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[#C8FF00]">
          <Timer size={18} />
          <span className="text-xs font-semibold uppercase tracking-widest text-[#555555]">En curso</span>
        </div>
        <span className="text-white text-2xl font-bold tabular-nums">{formatTime(elapsed)}</span>
      </div>

      <button
        onClick={() => setState('finishing')}
        className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        Finalizar workout
      </button>

      {state === 'finishing' && (
        <CompleteModal
          workoutId={workoutId}
          elapsedSeconds={elapsed}
          onClose={() => setState('running')}
        />
      )}
    </>
  )
}
