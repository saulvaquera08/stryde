'use client'

import { useState } from 'react'
import { Zap, Dumbbell, TrendingUp, Clock, Check } from 'lucide-react'

type Tab = 'week' | 'month' | 'year'

interface PeriodStats {
  sessions: number
  minutes: number
  avgIntensity: number | null
}

interface HistoryItem {
  completed_at: string
  duration_seconds: number | null
  rating: number | null
  day_type: string
  label: string
}

interface ProgressClientProps {
  hasData: boolean
  bars: { week: number[]; month: number[]; year: number[] }
  stats: { week: PeriodStats; month: PeriodStats; year: PeriodStats }
  history: HistoryItem[]
}

const DAY_TYPE_COLOR: Record<string, string> = {
  run_day:              '#C8FF00',
  strength_lower_day:   '#A78BFA',
  strength_upper_day:   '#A78BFA',
  hyrox_day:            '#FF6B35',
}

const DAY_TYPE_LABEL: Record<string, string> = {
  run_day:              'RUN',
  strength_lower_day:   'LIFT',
  strength_upper_day:   'LIFT',
  hyrox_day:            'HYROX',
}

function WorkoutIcon({ dayType, size = 14 }: { dayType: string; size?: number }) {
  if (dayType === 'hyrox_day') return <Zap size={size} className="text-current" />
  if (dayType === 'run_day')   return <TrendingUp size={size} className="text-current" />
  return <Dumbbell size={size} className="text-current" />
}

const BAR_LABELS: Record<Tab, string[]> = {
  week:  ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  month: ['W1', 'W2', 'W3', 'W4'],
  year:  ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
}

export default function ProgressClient({ hasData, bars, stats, history }: ProgressClientProps) {
  const [tab, setTab] = useState<Tab>('week')
  const d = stats[tab]

  const maxBar  = Math.max(...bars[tab], 1)
  const totalH  = Math.floor(d.minutes / 60)
  const totalM  = d.minutes % 60
  const durationStr = d.minutes >= 60 ? `${totalH}h ${totalM > 0 ? `${totalM}m` : ''}`.trim() : `${d.minutes}m`

  const rpeToIntensity = (rpe: number) => {
    if (rpe <= 4) return 'low'
    if (rpe <= 7) return 'moderate'
    return 'high'
  }

  // Compute intensity distribution for the current tab
  let intensityLow = 0, intensityMod = 0, intensityHigh = 0
  if (hasData && d.avgIntensity !== null) {
    // Rough estimation based on avg intensity
    intensityLow  = Math.max(0, Math.round((1 - (d.avgIntensity - 1) / 9) * 40))
    intensityMod  = Math.round(40 - Math.abs(d.avgIntensity - 5) * 4)
    intensityHigh = Math.max(0, 100 - intensityLow - intensityMod)
  }

  return (
    <div className="px-5 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="inline-flex items-baseline font-black text-[22px] tracking-[0.04em] leading-none italic"
          style={{ transform: 'skewX(-6deg)' }}
        >
          <span className="text-white">STRYD</span>
          <span className="text-[#C8FF00]">E</span>
        </span>
        <span className="font-mono text-[10px] text-[#888] tracking-[0.15em]">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-[#888] text-[13px]">Your training</p>
        <h1 className="text-[38px] font-bold text-white leading-none mt-1 tracking-tight">
          Stats<span className="text-[#C8FF00]">.</span>
        </h1>
      </div>

      {/* Range tabs */}
      <div className="flex gap-1.5 p-1 bg-[#141414] border border-[#222] rounded-2xl mb-[18px]">
        {(['week', 'month', 'year'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-[12px] font-bold capitalize transition-all ${
              tab === t ? 'bg-[#C8FF00] text-black' : 'text-[#555] hover:text-white'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Bar chart card */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-[18px] mb-3">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="font-mono text-[10px] text-[#888] tracking-[0.2em] font-bold">TRAINING VOLUME</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-[44px] font-bold tracking-[-0.03em] leading-none text-white">
                {d.sessions}
              </span>
              <span className="font-mono text-[11px] text-[#888] tracking-[0.1em]">
                SESSION{d.sessions !== 1 ? 'S' : ''}
              </span>
            </div>
          </div>
          {hasData && (
            <span className="px-[10px] py-1.5 rounded-full bg-[#C8FF00]/10 text-[#C8FF00] font-mono text-[10px] font-bold tracking-[0.15em]">
              {durationStr}
            </span>
          )}
        </div>

        {/* Bars */}
        <div className="flex gap-1.5 items-end h-[50px] mb-2">
          {bars[tab].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-[3px] transition-all duration-300"
                style={{
                  height: `${(v / maxBar) * 40 + (v > 0 ? 2 : 0)}px`,
                  minHeight: v > 0 ? '4px' : '2px',
                  background: v > 0 ? '#C8FF00' : '#1F1F1F',
                  opacity: v > 0 ? 1 : 1,
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {BAR_LABELS[tab].map((l, i) => (
            <span key={i} className="flex-1 text-center font-mono text-[8px] text-[#444] font-semibold">{l}</span>
          ))}
        </div>
      </div>

      {/* 3 stat tiles */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-[14px]">
          <div className="flex items-center gap-1.5 mb-2">
            <Check size={12} className="text-[#C8FF00]" strokeWidth={2.2} />
            <span className="font-mono text-[9px] text-[#888] tracking-[0.15em] font-bold">DONE</span>
          </div>
          <p className="font-mono text-[24px] font-bold tracking-[-0.02em] leading-none">{d.sessions}</p>
        </div>
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-[14px]">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="text-[#C8FF00]" strokeWidth={2.2} />
            <span className="font-mono text-[9px] text-[#888] tracking-[0.15em] font-bold">TIME</span>
          </div>
          <p className="font-mono text-[24px] font-bold tracking-[-0.02em] leading-none">{durationStr || '—'}</p>
        </div>
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-[14px]">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-[#A78BFA]" strokeWidth={2.2} />
            <span className="font-mono text-[9px] text-[#888] tracking-[0.15em] font-bold">RPE</span>
          </div>
          <p className="font-mono text-[24px] font-bold tracking-[-0.02em] leading-none">
            {d.avgIntensity !== null ? d.avgIntensity.toFixed(1) : '—'}
          </p>
        </div>
      </div>

      {/* Intensity mix */}
      {hasData && d.avgIntensity !== null && (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-4 mb-3">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="font-mono text-[10px] text-[#888] tracking-[0.2em] font-bold">INTENSITY MIX</span>
            <span className="text-[11px] text-[#444]">80/20 target</span>
          </div>
          <div className="flex h-3 rounded-lg overflow-hidden mb-3">
            <div className="transition-all" style={{ flex: intensityLow,  background: '#C8FF00' }} />
            <div className="transition-all" style={{ flex: intensityMod,  background: '#A78BFA' }} />
            <div className="transition-all" style={{ flex: intensityHigh, background: '#FF6B35' }} />
          </div>
          <div className="flex justify-between gap-2">
            {[
              { k: 'low',  label: 'EASY', val: intensityLow,  color: '#C8FF00' },
              { k: 'mod',  label: 'MOD',  val: intensityMod,  color: '#A78BFA' },
              { k: 'high', label: 'HARD', val: intensityHigh, color: '#FF6B35' },
            ].map(b => (
              <div key={b.k} className="flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-[2px]" style={{ background: b.color }} />
                  <span className="font-mono text-[9px] text-[#888] font-bold tracking-[0.15em]">{b.label}</span>
                </div>
                <span className="font-mono text-[18px] font-bold">
                  {b.val}<span className="text-[11px] text-[#888]">%</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed workouts history */}
      {history.length > 0 && (
        <>
          <div className="flex justify-between items-baseline mb-3">
            <span className="font-mono text-[11px] text-[#888] tracking-[0.2em] font-bold">COMPLETED WORKOUTS</span>
            <span className="text-[11px] text-[#444]">{history.length} recent</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {history.map((w, i) => {
              const color = DAY_TYPE_COLOR[w.day_type] ?? '#888'
              const typeL = DAY_TYPE_LABEL[w.day_type] ?? w.day_type.toUpperCase()
              const mins  = w.duration_seconds != null ? Math.round(w.duration_seconds / 60) : null
              const date  = new Date(w.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

              return (
                <div
                  key={i}
                  className="bg-[#141414] border border-[#1F1F1F] rounded-2xl px-[14px] py-3 flex items-center gap-3"
                >
                  <div className="w-1 h-9 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <WorkoutIcon dayType={w.day_type} size={12} />
                      <span className="font-mono text-[9px] font-bold tracking-[0.15em]" style={{ color }}>
                        {typeL}
                      </span>
                      <span className="font-mono text-[10px] text-[#444] tracking-[0.05em]">{date}</span>
                    </div>
                    <p className="text-[14px] font-semibold text-white truncate">{w.label || typeL}</p>
                    {mins != null && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-[#444]" />
                        <span className="font-mono text-[11px] text-[#888]">{mins}m</span>
                      </div>
                    )}
                  </div>
                  {w.rating != null && (
                    <div
                      className="px-2 py-1 rounded-[4px] font-mono text-[9px] font-bold tracking-[0.1em] shrink-0"
                      style={{
                        background: `${w.rating >= 8 ? '#FF6B35' : w.rating >= 6 ? '#A78BFA' : '#C8FF00'}1F`,
                        color: w.rating >= 8 ? '#FF6B35' : w.rating >= 6 ? '#A78BFA' : '#C8FF00',
                      }}
                    >
                      RPE {w.rating}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {!hasData && (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-6 text-center mt-4">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-white font-semibold text-sm mb-1">No data yet</p>
          <p className="text-[#555] text-xs leading-relaxed">
            Complete your first workout to see your stats here.
          </p>
        </div>
      )}
    </div>
  )
}
