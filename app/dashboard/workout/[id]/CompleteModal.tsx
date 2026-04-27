'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Star, Loader2 } from 'lucide-react'
import { completeWorkout } from './actions'

interface Props {
  workoutId: string
  onClose: () => void
}

export default function CompleteModal({ workoutId, onClose }: Props) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [notes, setNotes]     = useState('')
  const [isPending, start]    = useTransition()
  const router                = useRouter()

  const handleSubmit = () => {
    if (rating === 0) return
    start(async () => {
      await completeWorkout(workoutId, rating, notes)
      onClose()
      router.push('/dashboard')
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4 pb-8">
      <div className="w-full max-w-lg bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-lg font-bold">¡Workout completado!</h2>
          <button onClick={onClose} className="text-[#555555] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Stars */}
        <p className="text-[#888888] text-sm mb-3">¿Cómo te sentiste?</p>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
              className="flex-1 py-3 rounded-xl border transition-all"
              style={{
                borderColor: n <= (hovered || rating) ? '#C8FF00' : '#2A2A2A',
                background:  n <= (hovered || rating) ? '#C8FF00/10' : 'transparent',
              }}
            >
              <Star
                size={22}
                className="mx-auto"
                style={{
                  color: n <= (hovered || rating) ? '#C8FF00' : '#333333',
                  fill:  n <= (hovered || rating) ? '#C8FF00' : 'none',
                }}
              />
            </button>
          ))}
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
          disabled={rating === 0 || isPending}
          className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
