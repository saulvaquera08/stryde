'use client'

import { useState } from 'react'
import { Dumbbell, TrendingUp, Zap, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import type { ProgramType, RunGoal, Variant } from '@/lib/programs/types'
import { GYM_PROGRAM } from '@/lib/programs/gym'
import { RUN_PROGRAMS } from '@/lib/programs/run'
import { HYROX_PROGRAM } from '@/lib/programs/hyrox'
import GymDayDetail from './GymDayDetail'
import RunDayDetail from './RunDayDetail'
import HyroxDayDetail from './HyroxDayDetail'

// ── Helpers ───────────────────────────────────────────────────────────────────

const RUN_GOALS: { value: RunGoal; label: string; sub: string }[] = [
  { value: '5k',  label: '5K',         sub: '~25-35 min' },
  { value: '10k', label: '10K',        sub: '~50-70 min' },
  { value: '15k', label: '15K',        sub: '~80-100 min' },
  { value: '21k', label: 'Media Maratón', sub: '~1:45-2:30 h' },
  { value: '42k', label: 'Maratón',    sub: '~3:30-5:00 h' },
]

type Screen =
  | { type: 'home' }
  | { type: 'run-goal' }
  | { type: 'week'; program: ProgramType; runGoal?: RunGoal }
  | { type: 'day'; program: ProgramType; runGoal?: RunGoal; dayIndex: number; variant: Variant }

// ── Program selection card ────────────────────────────────────────────────────

function ProgramCard({
  icon, label, sub, color, onClick,
}: {
  icon: React.ReactNode; label: string; sub: string; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-[#1E1E1E] bg-[#111] active:opacity-70 transition-opacity text-left"
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-[15px]">{label}</p>
        <p className="text-[#555] text-[12px] mt-0.5">{sub}</p>
      </div>
      <ChevronRight size={16} className="text-[#444] shrink-0" />
    </button>
  )
}

// ── Variant pill ──────────────────────────────────────────────────────────────

function VariantPill({
  v, active, color, onClick,
}: {
  v: Variant; active: boolean; color: string; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 rounded-xl font-mono text-[11px] font-bold tracking-[0.12em] transition-all active:scale-95"
      style={active
        ? { background: `${color}22`, color, border: `1px solid ${color}55` }
        : { background: '#141414', color: '#555', border: '1px solid #222' }
      }
    >
      {v}
    </button>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProgramsClient() {
  const [screen, setScreen] = useState<Screen>({ type: 'home' })

  // ── Home ──────────────────────────────────────────────────────────────────
  if (screen.type === 'home') {
    return (
      <div className="pt-6 pb-8 px-5">
        <h1 className="text-[28px] font-bold text-white tracking-tight mb-1">Programas</h1>
        <p className="text-[#555] text-[13px] mb-6">Elige tu objetivo de entrenamiento</p>

        <div className="flex flex-col gap-3">
          <ProgramCard
            icon={<Dumbbell size={22} strokeWidth={2} />}
            label="GYM"
            sub="Hipertrofia 6 días — Lunes a Sábado"
            color="#A78BFA"
            onClick={() => setScreen({ type: 'week', program: 'gym' })}
          />
          <ProgramCard
            icon={<TrendingUp size={22} strokeWidth={2} />}
            label="RUN"
            sub="Entrenamiento de carrera — 5K a Maratón"
            color="#60A5FA"
            onClick={() => setScreen({ type: 'run-goal' })}
          />
          <ProgramCard
            icon={<Zap size={22} strokeWidth={2} />}
            label="HYROX"
            sub="Competencia funcional — 6 días específicos"
            color="#FF6B35"
            onClick={() => setScreen({ type: 'week', program: 'hyrox' })}
          />
        </div>
      </div>
    )
  }

  // ── Run goal selection ────────────────────────────────────────────────────
  if (screen.type === 'run-goal') {
    return (
      <div className="pt-6 pb-8 px-5">
        <button
          onClick={() => setScreen({ type: 'home' })}
          className="flex items-center gap-1.5 text-[#555] mb-5 active:opacity-50"
        >
          <ChevronLeft size={16} />
          <span className="text-[13px]">Programas</span>
        </button>

        <h2 className="text-[22px] font-bold text-white tracking-tight mb-1">Objetivo Run</h2>
        <p className="text-[#555] text-[13px] mb-6">¿Cuál es tu meta de distancia?</p>

        <div className="flex flex-col gap-3">
          {RUN_GOALS.map(g => (
            <button
              key={g.value}
              onClick={() => setScreen({ type: 'week', program: 'run', runGoal: g.value })}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-[#1E1E1E] bg-[#111] active:opacity-70 transition-opacity"
            >
              <div>
                <p className="text-white font-bold text-[15px] text-left">{g.label}</p>
                <p className="text-[#555] text-[12px] mt-0.5">{g.sub}</p>
              </div>
              <ChevronRight size={16} className="text-[#444]" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Week view ─────────────────────────────────────────────────────────────
  if (screen.type === 'week') {
    const { program, runGoal } = screen

    const color  = program === 'gym' ? '#A78BFA' : program === 'run' ? '#60A5FA' : '#FF6B35'
    const title  = program === 'gym' ? 'GYM' : program === 'run' ? `RUN — ${RUN_GOALS.find(g => g.value === runGoal)?.label ?? ''}` : 'HYROX'

    const days =
      program === 'gym'   ? GYM_PROGRAM :
      program === 'hyrox' ? HYROX_PROGRAM :
      RUN_PROGRAMS.find(p => p.goal === runGoal)?.days ?? []

    const [selectedVariants, setSelectedVariants] = useState<Record<number, Variant>>(
      Object.fromEntries(days.map((_, i) => [i, 'A']))
    )

    const back = () => program === 'run' ? setScreen({ type: 'run-goal' }) : setScreen({ type: 'home' })

    const TYPE_COLORS: Record<string, string> = {
      strength:   '#A78BFA',
      cardio:     '#60A5FA',
      simulation: '#FF6B35',
      rest:       '#333',
    }

    return (
      <div className="pt-6 pb-8">
        {/* Header */}
        <div className="px-5 mb-5">
          <button onClick={back} className="flex items-center gap-1.5 text-[#555] mb-4 active:opacity-50">
            <ChevronLeft size={16} />
            <span className="text-[13px]">Programas</span>
          </button>
          <h2 className="text-[22px] font-bold text-white tracking-tight">{title}</h2>
          <p className="text-[#555] text-[12px] font-mono mt-1">PLAN SEMANAL</p>
        </div>

        {/* Day list */}
        <div className="flex flex-col px-5 gap-2">
          {days.map((day, i) => {
            const isRest = ('isRest' in day && day.isRest) || ('type' in day && day.type === 'rest')
            const title  = 'muscle' in day ? day.muscle : 'title' in day ? day.title : ''
            const dayColor = 'type' in day && !('muscle' in day) ? (TYPE_COLORS[day.type as string] ?? color) : color
            const variant = selectedVariants[i] ?? 'A'

            return (
              <div key={i} className="rounded-2xl border border-[#1E1E1E] bg-[#111] overflow-hidden">
                {/* Day header */}
                <div className="flex items-center gap-3 px-4 pt-3.5 pb-2">
                  <div>
                    <p className="font-mono text-[9px] font-bold tracking-[0.15em]" style={{ color: isRest ? '#333' : dayColor }}>
                      {('dow' in day ? day.dow : '')}
                    </p>
                    <p className={`text-[13px] font-semibold leading-snug ${isRest ? 'text-[#333]' : 'text-white'}`}>
                      {isRest ? 'Descanso' : title}
                    </p>
                  </div>
                </div>

                {!isRest && (
                  <>
                    {/* Variant pills */}
                    <div className="flex gap-2 px-4 pb-2">
                      {(['A', 'B', 'C'] as Variant[]).map(v => (
                        <VariantPill
                          key={v}
                          v={v}
                          active={variant === v}
                          color={dayColor}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [i]: v }))}
                        />
                      ))}
                    </div>

                    {/* Open detail */}
                    <button
                      onClick={() => setScreen({ type: 'day', program, runGoal, dayIndex: i, variant })}
                      className="w-full flex items-center justify-between px-4 py-3 border-t border-[#1A1A1A] active:opacity-50"
                    >
                      <span className="font-mono text-[10px] text-[#555] tracking-[0.12em]">VER ENTRENAMIENTO</span>
                      <ChevronRight size={14} className="text-[#444]" />
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Day detail ────────────────────────────────────────────────────────────
  if (screen.type === 'day') {
    const { program, runGoal, dayIndex, variant } = screen
    const back = () => setScreen({ type: 'week', program, runGoal })

    if (program === 'gym') {
      const day = GYM_PROGRAM[dayIndex]
      return <GymDayDetail day={day} variant={variant} onBack={back} />
    }
    if (program === 'run') {
      const prog = RUN_PROGRAMS.find(p => p.goal === runGoal)
      const day  = prog?.days[dayIndex]
      if (!day) return null
      return <RunDayDetail day={day} variant={variant} goalLabel={RUN_GOALS.find(g => g.value === runGoal)?.label ?? ''} onBack={back} />
    }
    if (program === 'hyrox') {
      const day = HYROX_PROGRAM[dayIndex]
      return <HyroxDayDetail day={day} onBack={back} />
    }
  }

  return null
}
