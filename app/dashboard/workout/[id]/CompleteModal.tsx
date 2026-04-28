'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Timer } from 'lucide-react'
import { completeWorkout } from './actions'

interface Props {
  workoutId: string
  elapsedSeconds: number
  onClose: () => void
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m} min ${s} seg`
  return `${s} seg`
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Muy fácil', 2: 'Fácil', 3: 'Ligero', 4: 'Moderado', 5: 'Desafiante',
  6: 'Duro', 7: 'Muy duro', 8: 'Intenso', 9: 'Máximo', 10: 'Al límite',
}

export default function CompleteModal({ workoutId, elapsedSeconds, onClose }: Props) {
  const [difficulty, setDifficulty] = useState(0)
  const [notes, setNotes]           = useState('')
  const [isPending, start]          = useTransition()
  const router                      = useRouter()

  const handleSubmit = () => {
    if (difficulty === 0) return
    start(async () => {
      await completeWorkout(workoutId, difficulty, notes, elapsedSeconds)
      router.push('/dashboard')
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4 pb-8">
      <div className="w-full max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">Workout completado</h2>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Elapsed time */}
        <div className="flex items-center justify-between bg-[#0E0E0E] border border-[#222222] rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center gap-2 text-[#555555]">
            <Timer size={16} />
            <span className="text-xs font-semibold uppercase tracking-widest">Tiempo</span>
          </div>
          <span className="text-[#C8FF00] text-xl font-bold tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Difficulty 1-10 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[#888888] text-sm">Nivel de dificultad</p>
            {difficulty > 0 && (
              <span className="text-[#C8FF00] text-sm font-semibold">
                {difficulty} — {DIFFICULTY_LABELS[difficulty]}
              </span>
            )}
          </div>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setDifficulty(n)}
                className="aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all active:scale-95"
                style={{
                  background: n <= difficulty ? '#C8FF00' : '#1A1A1A',
                  color:      n <= difficulty ? '#000000' : '#555555',
                  border:     `1px solid ${n === difficulty ? '#C8FF00' : n < difficulty ? '#C8FF0060' : '#2A2A2A'}`,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <p className="text-[#888888] text-sm mb-2">Notas (opcional)</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="¿Cómo fue el entreno? ¿Algo a mejorar?"
          rows={3}
          className="w-full bg-[#0E0E0E] border border-[#2A2A2A] rounded-xl px-4 py-3 text-white placeholder-[#444444] text-sm focus:outline-none focus:border-[#C8FF00] transition-colors resize-none mb-5"
        />

        <button
          onClick={handleSubmit}
          disabled={difficulty === 0 || isPending}
          className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : 'Guardar entrenamiento'}
        </button>
      </div>
    </div>
  )
}
