'use client'

import { useState } from 'react'
import { Flame, Clock, Star } from 'lucide-react'

type Tab = 'week' | 'month' | 'year'

interface PeriodStats {
  sessions: number
  minutes: number
  avgRating: number | null
}

interface ProgressClientProps {
  hasData: boolean
  bars: { week: number[]; month: number[]; year: number[] }
  stats: { week: PeriodStats; month: PeriodStats; year: PeriodStats }
}

function BarChart({ values, color = '#C8FF00' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1)
  const gap = 3
  const bw  = (100 - gap * (values.length - 1)) / values.length

  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-full h-20">
      {values.map((v, i) => {
        const h = (v / max) * 52
        const x = i * (bw + gap)
        return (
          <rect
            key={i}
            x={x}
            y={60 - h}
            width={bw}
            height={Math.max(h, v > 0 ? 2 : 0)}
            rx="2"
            fill={color}
            fillOpacity={v > 0 ? 0.9 : 0.12}
          />
        )
      })}
    </svg>
  )
}

const TAB_LABELS: Record<Tab, string> = { week: 'Semana', month: 'Mes', year: 'Año' }
const BAR_LABELS: Record<Tab, string[]> = {
  week:  ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  month: ['S1', 'S2', 'S3', 'S4'],
  year:  ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
}

export default function ProgressClient({ hasData, bars, stats }: ProgressClientProps) {
  const [tab, setTab] = useState<Tab>('week')
  const d = stats[tab]

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-white mb-6">Progreso</h1>

      {/* Tabs */}
      <div className="flex bg-[#141414] border border-[#222222] rounded-xl p-1 mb-6">
        {(['week', 'month', 'year'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'bg-[#C8FF00] text-black' : 'text-[#555555] hover:text-white'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4">
          <Flame size={16} className="text-[#FF6B35] mb-2" />
          <p className="text-white font-bold text-lg">{d.sessions}</p>
          <p className="text-[#555555] text-xs">sesiones</p>
        </div>
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4">
          <Clock size={16} className="text-[#C8FF00] mb-2" />
          <p className="text-white font-bold text-lg">
            {d.minutes >= 60
              ? `${Math.floor(d.minutes / 60)}h${d.minutes % 60 > 0 ? ` ${d.minutes % 60}m` : ''}`
              : `${d.minutes}m`}
          </p>
          <p className="text-[#555555] text-xs">tiempo</p>
        </div>
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4">
          <Star size={16} className="text-[#A78BFA] mb-2" />
          <p className="text-white font-bold text-lg">
            {d.avgRating !== null ? d.avgRating.toFixed(1) : '—'}
          </p>
          <p className="text-[#555555] text-xs">calificación</p>
        </div>
      </div>

      {/* Volume chart */}
      <div className="bg-[#141414] border border-[#222222] rounded-2xl p-5 mb-4">
        <p className="text-white font-semibold text-sm mb-1">Volumen de entrenamiento</p>
        <p className="text-[#555555] text-xs mb-4">Minutos activos por período</p>

        {hasData ? (
          <>
            <BarChart values={bars[tab]} />
            <div className="flex justify-between mt-1.5">
              {BAR_LABELS[tab].map((l, i) => (
                <span key={i} className="text-[#444444] text-[9px] flex-1 text-center">{l}</span>
              ))}
            </div>
          </>
        ) : (
          <div className="h-20 flex items-center justify-center">
            <BarChart values={Array(BAR_LABELS[tab].length).fill(0)} />
          </div>
        )}
      </div>

      {/* Empty state or hint */}
      {!hasData ? (
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-6 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-white font-semibold text-sm mb-1">Sin datos aún</p>
          <p className="text-[#555555] text-xs leading-relaxed">
            Completa tu primer entrenamiento para ver tu progreso aquí.
          </p>
        </div>
      ) : (
        <div className="bg-[#0C1400] border border-[#C8FF00]/15 rounded-xl p-4">
          <p className="text-[#C8FF00] text-xs font-semibold uppercase tracking-widest mb-1">
            Datos reales
          </p>
          <p className="text-[#888888] text-xs leading-relaxed">
            Cada barra refleja los minutos de entrenamientos completados en ese período.
          </p>
        </div>
      )}
    </div>
  )
}
