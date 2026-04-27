'use client'

import { useState } from 'react'
import { TrendingUp, Dumbbell, Flame } from 'lucide-react'

type Tab = 'week' | 'month' | 'year'

// Placeholder data — replace with real DB queries when completed_workouts fills up
const MOCK = {
  week: {
    runDays:    [0, 45, 0, 38, 0, 52, 0],
    volumeBars: [0, 48, 0, 52, 0, 60, 0],
    pace:       '5:42',
    strength:   1840,
    workouts:   3,
  },
  month: {
    runDays:    [32, 45, 38, 52, 40, 55, 48, 60, 42, 58, 35, 50],
    volumeBars: [40, 48, 52, 60, 44, 56, 50, 62, 45, 58, 38, 52],
    pace:       '5:38',
    strength:   7200,
    workouts:   14,
  },
  year: {
    runDays:    [30, 35, 42, 50, 45, 55, 60, 52, 48, 58, 44, 62],
    volumeBars: [35, 42, 48, 55, 50, 60, 65, 58, 52, 62, 48, 68],
    pace:       '5:52',
    strength:   38400,
    workouts:   58,
  },
}

function LineChart({ values, color = '#C8FF00' }: { values: number[]; color?: string }) {
  if (!values.length) return null
  const max  = Math.max(...values, 1)
  const w    = 100 / (values.length - 1)
  const pts  = values.map((v, i) => `${i * w},${100 - (v / max) * 80}`).join(' ')
  const area = `0,100 ${pts} ${(values.length - 1) * w},100`

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#grad)" />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={i * w}
          cy={100 - (v / max) * 80}
          r="2.5"
          fill={color}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}

function BarChart({ values, color = '#C8FF00' }: { values: number[]; color?: string }) {
  if (!values.length) return null
  const max = Math.max(...values, 1)
  const gap = 4
  const bw  = (100 - gap * (values.length - 1)) / values.length

  return (
    <svg viewBox={`0 0 100 60`} preserveAspectRatio="none" className="w-full h-16">
      {values.map((v, i) => {
        const h = (v / max) * 50
        const x = i * (bw + gap)
        return (
          <rect
            key={i}
            x={x}
            y={60 - h}
            width={bw}
            height={h}
            rx="2"
            fill={color}
            fillOpacity={v > 0 ? 0.85 : 0.15}
          />
        )
      })}
    </svg>
  )
}

export default function ProgressPage() {
  const [tab, setTab] = useState<Tab>('week')
  const data = MOCK[tab]

  const tabLabel: Record<Tab, string> = {
    week:  'Semana',
    month: 'Mes',
    year:  'Año',
  }

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
              tab === t
                ? 'bg-[#C8FF00] text-black'
                : 'text-[#555555] hover:text-white'
            }`}
          >
            {tabLabel[t]}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4">
          <TrendingUp size={16} className="text-[#C8FF00] mb-2" />
          <p className="text-white font-bold text-lg">{data.pace}</p>
          <p className="text-[#555555] text-xs">min/km</p>
        </div>
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4">
          <Dumbbell size={16} className="text-[#A78BFA] mb-2" />
          <p className="text-white font-bold text-lg">
            {data.strength >= 1000 ? `${(data.strength / 1000).toFixed(1)}t` : `${data.strength}`}
          </p>
          <p className="text-[#555555] text-xs">volumen kg</p>
        </div>
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4">
          <Flame size={16} className="text-[#FF6B35] mb-2" />
          <p className="text-white font-bold text-lg">{data.workouts}</p>
          <p className="text-[#555555] text-xs">sesiones</p>
        </div>
      </div>

      {/* Running pace chart */}
      <div className="bg-[#141414] border border-[#222222] rounded-2xl p-5 mb-4">
        <p className="text-white font-semibold text-sm mb-1">Ritmo de carrera</p>
        <p className="text-[#555555] text-xs mb-4">Promedio min/km</p>
        <LineChart values={data.runDays} color="#C8FF00" />
      </div>

      {/* Volume bars */}
      <div className="bg-[#141414] border border-[#222222] rounded-2xl p-5 mb-4">
        <p className="text-white font-semibold text-sm mb-1">Volumen semanal</p>
        <p className="text-[#555555] text-xs mb-4">Minutos activos</p>
        <BarChart values={data.volumeBars} color="#C8FF00" />
      </div>

      {/* Empty state note */}
      <div className="bg-[#0C1400] border border-[#C8FF00]/15 rounded-xl p-4">
        <p className="text-[#C8FF00] text-xs font-semibold uppercase tracking-widest mb-1">
          Datos reales
        </p>
        <p className="text-[#888888] text-xs leading-relaxed">
          Las gráficas mostrarán tus datos reales a medida que completes entrenamientos.
        </p>
      </div>
    </div>
  )
}
