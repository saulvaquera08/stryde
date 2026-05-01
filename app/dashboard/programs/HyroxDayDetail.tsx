'use client'

import { ChevronLeft } from 'lucide-react'
import type { HyroxDay, HyroxExercise, HyroxSegment } from '@/lib/programs/types'

const TYPE_COLORS: Record<string, string> = {
  strength:   '#A78BFA',
  cardio:     '#60A5FA',
  simulation: '#FF6B35',
  rest:       '#333',
}

function isSegment(block: HyroxExercise | HyroxSegment): block is HyroxSegment {
  return 'time' in block
}

export default function HyroxDayDetail({
  day, onBack,
}: {
  day: HyroxDay; onBack: () => void
}) {
  const color = TYPE_COLORS[day.type] ?? '#FF6B35'

  return (
    <div className="pt-6 pb-10 px-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[#555] mb-5 active:opacity-50">
        <ChevronLeft size={16} />
        <span className="text-[13px]">Plan semanal</span>
      </button>

      <div className="mb-5">
        <p className="font-mono text-[9px] font-bold tracking-[0.2em] mb-1" style={{ color }}>
          {day.dow} · HYROX
        </p>
        <h2 className="text-[22px] font-bold text-white tracking-tight leading-snug">{day.title}</h2>
        <p className="text-[#555] text-[13px] mt-1">{day.description}</p>
      </div>

      {day.type === 'rest' ? (
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-4 py-5 text-center">
          <p className="text-[#333] font-mono text-[11px] tracking-[0.15em]">DESCANSO — MOVILIDAD Y RECUPERACIÓN</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {day.blocks.map((block, i) => {
            if (isSegment(block)) {
              return (
                <div key={i} className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[9px] text-[#555] tracking-[0.12em]">{block.time}</p>
                      <p className="text-white font-semibold text-[14px] leading-snug mt-0.5">{block.segment}</p>
                    </div>
                    <span className="font-mono text-[10px] font-bold shrink-0 mt-1" style={{ color }}>{block.duration}</span>
                  </div>
                  <p className="text-[13px] font-semibold" style={{ color }}>{block.station}</p>
                  <p className="text-[#888] text-[12px] mt-1">{block.volume}</p>
                  {block.notes && <p className="text-[#444] text-[11px] mt-1 font-mono">{block.notes}</p>}
                </div>
              )
            }

            const ex = block as HyroxExercise
            return (
              <div key={i} className="rounded-2xl border border-[#1E1E1E] bg-[#111] px-4 py-3.5">
                <p className="text-white font-semibold text-[14px] leading-snug">{ex.name}</p>
                <p className="font-mono text-[9px] text-[#555] tracking-[0.12em] mt-0.5">{ex.type}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  <Stat label="Volumen" value={ex.volume} color={color} />
                  {ex.weight !== '—' && <Stat label="Peso" value={ex.weight} color={color} />}
                  {ex.rest !== '—' && <Stat label="Descanso" value={ex.rest} color="#555" />}
                </div>
                {ex.notes && <p className="text-[#444] text-[11px] mt-2 font-mono">{ex.notes}</p>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="font-mono text-[8px] tracking-[0.15em] text-[#555]">{label.toUpperCase()}</p>
      <p className="font-mono text-[12px] font-bold" style={{ color }}>{value}</p>
    </div>
  )
}
