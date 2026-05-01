'use client'

import { ChevronLeft } from 'lucide-react'
import type { RunDay, Variant } from '@/lib/programs/types'

const VARIANT_COLORS = { A: '#60A5FA', B: '#34D399', C: '#FBBF24' }

export default function RunDayDetail({
  day, variant, goalLabel, onBack,
}: {
  day: RunDay; variant: Variant; goalLabel: string; onBack: () => void
}) {
  const session = day.sessions.find(s => s.variant === variant)
  const color   = VARIANT_COLORS[variant]

  return (
    <div className="pt-6 pb-10 px-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[#555] mb-5 active:opacity-50">
        <ChevronLeft size={16} />
        <span className="text-[13px]">Plan semanal</span>
      </button>

      <div className="mb-5">
        <p className="font-mono text-[9px] font-bold tracking-[0.2em] mb-1" style={{ color }}>
          {day.dow} · VARIANTE {variant} · {goalLabel}
        </p>
        {session && (
          <>
            <h2 className="text-[22px] font-bold text-white tracking-tight leading-snug">{session.type}</h2>
            <p className="text-[#555] text-[13px] mt-1">{session.description}</p>
          </>
        )}
      </div>

      {session && !day.isRest ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatCard label="Distancia" value={`${session.distanceKm} km`} color={color} />
            <StatCard label="Duración" value={`${session.durationMin} min`} color={color} />
            <StatCard label="Ritmo" value={session.pacePerKm} color={color} />
          </div>

          {/* Intensity & notes */}
          <div className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-4 py-4 flex flex-col gap-3">
            <Row label="Intensidad" value={session.intensity} color={color} />
            <div className="border-t border-[#1A1A1A]" />
            <Row label="Notas" value={session.notes} color="#888" />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-4 py-5 text-center">
          <p className="text-[#333] font-mono text-[11px] tracking-[0.15em]">DESCANSO</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-3 py-3 text-center">
      <p className="font-mono text-[8px] tracking-[0.15em] text-[#555] mb-1">{label.toUpperCase()}</p>
      <p className="font-bold text-[13px]" style={{ color }}>{value}</p>
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <p className="font-mono text-[10px] tracking-[0.12em] text-[#444] shrink-0">{label.toUpperCase()}</p>
      <p className="text-[13px] text-right" style={{ color }}>{value}</p>
    </div>
  )
}
