'use client'

import { ChevronLeft, Clock } from 'lucide-react'
import type { GymDay, Variant } from '@/lib/programs/types'

const VARIANT_COLORS = { A: '#A78BFA', B: '#60A5FA', C: '#34D399' }

export default function GymDayDetail({
  day, variant, onBack,
}: {
  day: GymDay; variant: Variant; onBack: () => void
}) {
  const workout = day.workouts.find(w => w.variant === variant)
  const color   = VARIANT_COLORS[variant]

  return (
    <div className="pt-6 pb-10 px-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[#555] mb-5 active:opacity-50">
        <ChevronLeft size={16} />
        <span className="text-[13px]">Plan semanal</span>
      </button>

      {/* Header */}
      <div className="mb-5">
        <p className="font-mono text-[9px] font-bold tracking-[0.2em] mb-1" style={{ color }}>
          {day.dow} · VARIANTE {variant}
        </p>
        <h2 className="text-[22px] font-bold text-white tracking-tight leading-snug">{day.muscle}</h2>
        {workout && (
          <p className="text-[#555] text-[13px] mt-1">{workout.focus}</p>
        )}
      </div>

      {/* Exercise list */}
      {workout ? (
        <div className="flex flex-col gap-3">
          {workout.exercises.map((ex, i) => (
            <div key={i} className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-4 py-3.5">
              <p className="text-white font-semibold text-[14px] leading-snug">{ex.name}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <Stat label="Series" value={String(ex.sets)} color={color} />
                <Stat label="Reps" value={ex.reps} color={color} />
                <Stat label="Peso" value={ex.weight} color={color} />
                <Stat label="Descanso" value={`${ex.rest}s`} color="#555" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[#444] text-[13px]">No hay datos para esta variante.</p>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="font-mono text-[8px] tracking-[0.15em]" style={{ color: '#555' }}>{label.toUpperCase()}</p>
      <p className="font-mono text-[12px] font-bold" style={{ color }}>{value}</p>
    </div>
  )
}
