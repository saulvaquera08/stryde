import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, Dumbbell, TrendingUp, Activity, Flag, Bell, ChevronRight } from 'lucide-react'
import { getDayTypeLabel, getDayTypeColor, getGreeting } from '@/lib/workout-utils'
import { getCoachMessage } from '@/lib/coach'
import { PHASE_LABELS, PHASE_COLORS, type TrainingPhase } from '@/lib/planGenerator'
import type { WorkoutBlock } from '@/lib/supabase/types'

const GOAL_LABELS: Record<string, string> = {
  hyrox:    'HYROX',
  '21k':    '21K',
  '5k':     '5K',
  '10k':    '10K',
  strength: 'Fuerza',
  recomp:   'Recomposición',
}

function Wordmark() {
  return (
    <span
      className="inline-flex items-baseline font-black text-[22px] tracking-[0.04em] leading-none italic"
      style={{ transform: 'skewX(-6deg)' }}
    >
      <span className="text-white">STRYD</span>
      <span className="text-[#C8FF00]">E</span>
    </span>
  )
}

function DayTypeIcon({ dayType, size = 22 }: { dayType: string; size?: number }) {
  if (dayType === 'hyrox_day' || dayType === 'race_day') return <Zap size={size} className="text-current" />
  if (dayType === 'run_day')                             return <TrendingUp size={size} className="text-current" />
  if (dayType === 'strength_lower_day')                  return <Dumbbell size={size} className="text-current" />
  if (dayType === 'strength_upper_day')                  return <Dumbbell size={size} className="text-current" />
  return <Activity size={size} className="text-current" />
}

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayISO = new Date().toISOString().split('T')[0]
  const hour     = new Date().getUTCHours()

  const now      = new Date()
  const weekday  = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const monthDay = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  const dateLabel = `${weekday} · ${monthDay}`

  const [profileRes, todayRes, planRes, goalsRes] = await Promise.all([
    supabase.from('users').select('first_name').eq('id', user.id).single(),
    supabase
      .from('workouts')
      .select('id, day_type, duration_minutes, goals_tags, intensity, is_rest_day, blocks')
      .eq('user_id', user.id)
      .eq('scheduled_date', todayISO)
      .eq('is_rest_day', false)
      .maybeSingle(),
    supabase
      .from('plans')
      .select('id, start_date, end_date, total_weeks, structure')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase.from('goals').select('type, race_date').eq('user_id', user.id),
  ])

  const firstName = profileRes.data?.first_name ?? ''
  const greeting  = getGreeting(hour)
  const plan      = planRes.data
  const goals     = goalsRes.data ?? []

  let activeWeek = 1
  if (plan) {
    const planStart = new Date(plan.start_date + 'T00:00:00')
    const daysDiff  = Math.floor((new Date().getTime() - planStart.getTime()) / 86_400_000)
    activeWeek = daysDiff < 0 ? 1 : Math.min(Math.floor(daysDiff / 7) + 1, plan.total_weeks)
  }

  const phaseMap     = (plan?.structure as Record<string, unknown> | null)?.phase_map as Record<string, string> | undefined
  const currentPhase = (phaseMap?.[String(activeWeek)] ?? null) as TrainingPhase | null

  const coachMessage = await getCoachMessage(user.id, currentPhase).catch(() => null)

  // Week workouts with day_type for hybrid load
  const weekWorkoutsRes = await supabase
    .from('workouts')
    .select('id, day_type')
    .eq('user_id', user.id)
    .eq('week_number', activeWeek)
    .eq('is_rest_day', false)

  const weekWorkouts = weekWorkoutsRes.data ?? []
  const weekWorkoutIds = weekWorkouts.map(w => w.id)

  const completedRes = await supabase
    .from('completed_workouts')
    .select('workout_id')
    .eq('user_id', user.id)
    .in('workout_id', weekWorkoutIds.length > 0 ? weekWorkoutIds : ['00000000-0000-0000-0000-000000000000'])

  const completedSet  = new Set((completedRes.data ?? []).map(c => c.workout_id))
  const weekCompleted = weekWorkoutIds.filter(id => completedSet.has(id)).length

  // Per-discipline counts
  const runW   = weekWorkouts.filter(w => w.day_type === 'run_day')
  const liftW  = weekWorkouts.filter(w => w.day_type === 'strength_lower_day' || w.day_type === 'strength_upper_day')
  const hyroxW = weekWorkouts.filter(w => w.day_type === 'hyrox_day')
  const runDone   = runW.filter(w => completedSet.has(w.id)).length
  const liftDone  = liftW.filter(w => completedSet.has(w.id)).length
  const hyroxDone = hyroxW.filter(w => completedSet.has(w.id)).length

  // Race goals sorted by proximity
  const goalsSorted = goals
    .filter(g => g.race_date)
    .map(g => ({
      ...g,
      daysLeft: Math.ceil((new Date(g.race_date! + 'T12:00:00').getTime() - Date.now()) / 86_400_000),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const upcomingGoals  = goalsSorted.filter(g => g.daysLeft >= 0)
  const primaryGoal    = upcomingGoals[0] ?? null
  const secondaryGoal  = upcomingGoals[1] ?? null

  // Recently raced (within 7 days)
  const recentRace = goalsSorted.find(g => g.daysLeft < 0 && g.daysLeft >= -7) ?? null

  // Today's / next workout
  let nextWorkout = todayRes.data
  let nextDate: string | null = null
  if (!nextWorkout && plan) {
    const nextRes = await supabase
      .from('workouts')
      .select('id, day_type, duration_minutes, goals_tags, intensity, is_rest_day, scheduled_date, blocks')
      .eq('user_id', user.id)
      .eq('is_rest_day', false)
      .gt('scheduled_date', todayISO)
      .order('scheduled_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    nextWorkout = nextRes.data
    nextDate    = nextRes.data?.scheduled_date ?? null
  }

  const isToday      = !nextDate
  const dayType      = nextWorkout?.day_type ?? ''
  const color        = dayType ? getDayTypeColor(dayType) : '#888888'
  const typeLabel    = dayType ? getDayTypeLabel(dayType) : null
  const isTodayDone  = todayRes.data ? completedSet.has(todayRes.data.id) : false
  const firstBlock   = nextWorkout ? ((nextWorkout.blocks ?? []) as WorkoutBlock[])[0] : null
  const variantName  = firstBlock?.label ?? typeLabel ?? ''
  const isRaceDay    = dayType === 'race_day'

  const intensityLabel = (i: string) =>
    ({ high: 'HIGH', moderate: 'MOD', low: 'LOW' })[i] ?? (i?.toUpperCase() ?? '—')

  const phaseColor = currentPhase ? (PHASE_COLORS[currentPhase] ?? '#C8FF00') : '#C8FF00'

  return (
    <div className="px-5 pt-5 pb-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-[18px]">
        <Wordmark />
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#888] tracking-[0.15em]">{dateLabel}</span>
          <Bell size={18} className="text-[#555]" strokeWidth={1.6} />
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-2">
        <p className="text-[#888] text-[13px]">{greeting},</p>
        <h1 className="text-[38px] font-bold text-white leading-none mt-1 tracking-tight">
          {firstName || 'Atleta'}.
        </h1>
      </div>

      {/* Coach message */}
      {coachMessage && (
        <div className="flex items-start gap-2 mt-[14px] mb-[18px]">
          <Zap size={13} className="text-[#C8FF00] shrink-0 mt-0.5" strokeWidth={2.2} />
          <p className="text-[#666] text-[13px] leading-relaxed">{coachMessage}</p>
        </div>
      )}

      {/* Race completed banner */}
      {recentRace && (
        <div className="bg-[#141414] border border-[#222] rounded-2xl p-4 mb-[18px]">
          <div className="flex items-center gap-2">
            <span className="text-sm">✅</span>
            <p className="text-white font-semibold text-sm">
              {GOAL_LABELS[recentRace.type] ?? recentRace.type.toUpperCase()} completado
            </p>
          </div>
          <p className="text-[#555] text-xs mt-1">Semana de recuperación activa.</p>
        </div>
      )}

      {/* Phase + race countdown card */}
      {plan && !recentRace && (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-4 mb-[18px]">
          <div className="flex justify-between items-start">
            <div>
              {primaryGoal ? (
                <>
                  <div className="inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-full bg-[#FF6B35]/10 text-[#FF6B35] font-mono text-[10px] font-bold tracking-[0.15em]">
                    <Flag size={11} />
                    {GOAL_LABELS[primaryGoal.type] ?? primaryGoal.type.toUpperCase()}
                  </div>
                  <div className="flex items-baseline gap-2 mt-2.5">
                    <span className="font-mono text-[32px] font-bold tracking-[-0.03em] leading-none text-white">
                      {primaryGoal.daysLeft}
                    </span>
                    <span className="font-mono text-[11px] text-[#888] tracking-[0.1em]">DAYS</span>
                  </div>
                </>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-[10px] py-[4px] rounded-full bg-[#C8FF00]/10 text-[#C8FF00] font-mono text-[10px] font-bold tracking-[0.15em]">
                  <Flag size={11} />
                  TRAINING
                </div>
              )}
            </div>

            {secondaryGoal && (
              <div className="text-right">
                <p className="font-mono text-[10px] text-[#444] tracking-[0.15em] mb-1">SECONDARY</p>
                <p className="font-mono text-[12px] text-[#888]">
                  {GOAL_LABELS[secondaryGoal.type] ?? secondaryGoal.type.toUpperCase()} · {secondaryGoal.daysLeft}d
                </p>
              </div>
            )}
          </div>

          {/* Phase track */}
          <div className="mt-[14px]">
            <div className="flex justify-between font-mono text-[9px] text-[#444] tracking-[0.15em] mb-1.5">
              <span>WEEK {activeWeek}/{plan.total_weeks}</span>
              {currentPhase && (
                <span style={{ color: phaseColor }}>
                  {PHASE_LABELS[currentPhase]} PHASE
                </span>
              )}
            </div>
            <div className="flex gap-[3px] h-1">
              {Array.from({ length: plan.total_weeks }, (_, i) => {
                const isPast    = i < activeWeek - 1
                const isCurrent = i === activeWeek - 1
                const isTaper   = i === plan.total_weeks - 1
                return (
                  <div
                    key={i}
                    className="flex-1 h-full rounded-[1px]"
                    style={{
                      background: isCurrent
                        ? '#C8FF00'
                        : isPast
                        ? '#C8FF0055'
                        : isTaper
                        ? '#FF6B3540'
                        : '#1F1F1F',
                    }}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* TODAY'S WORKOUT label */}
      <p className="font-mono text-[10px] text-[#444] tracking-[0.18em] font-semibold mb-[10px] uppercase">
        {isToday ? "Today's Workout" : 'Next Workout'}
      </p>

      {/* Hero workout card */}
      {isRaceDay ? (
        <div className="rounded-[22px] border border-[#FF6B35]/30 bg-[#FF6B35]/5 p-6 mb-[14px] text-center">
          <p className="text-3xl mb-2">🏁</p>
          <p className="text-[#FF6B35] font-bold tracking-widest text-sm font-mono">HOY ES EL DÍA</p>
          <p className="text-white text-sm mt-1">{firstBlock?.format ?? ''}</p>
        </div>
      ) : nextWorkout ? (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-[18px] mb-[14px] relative overflow-hidden">
          {/* Accent stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }}
          />

          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              {typeLabel && (
                <span
                  className="inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full font-mono text-[9px] font-bold tracking-[0.18em]"
                  style={{ background: `${color}18`, color }}
                >
                  {typeLabel.toUpperCase()}
                </span>
              )}
              {!isToday && nextDate && (
                <p className="text-[#555] text-xs mt-1">
                  {new Date(nextDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              )}
              <h2 className="font-bold leading-[1.05] mt-3 text-[26px] tracking-tight">
                {variantName}
              </h2>
              {firstBlock?.format && (
                <p className="text-[#888] text-[13px] mt-1 line-clamp-2">{firstBlock.format}</p>
              )}
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ml-3"
              style={{ background: `${color}15`, color }}
            >
              <DayTypeIcon dayType={dayType} size={22} />
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-[10px] mt-[18px] pt-[14px] border-t border-[#1F1F1F]">
            {[
              { k: 'TIME',   v: String(nextWorkout.duration_minutes), u: 'min' },
              { k: 'EFFORT', v: intensityLabel(nextWorkout.intensity),  u: '' },
              { k: 'WEEK',   v: `${activeWeek}/${plan?.total_weeks ?? '—'}`, u: '' },
            ].map(s => (
              <div key={s.k}>
                <p className="font-mono text-[9px] text-[#444] tracking-[0.15em]">{s.k}</p>
                <p className="font-mono text-[18px] font-bold tracking-[-0.02em] mt-0.5">
                  {s.v}
                  {s.u && <span className="text-[10px] text-[#888] font-medium ml-0.5">{s.u}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          {isTodayDone ? (
            <div className="mt-4 w-full h-[52px] bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl flex items-center justify-center text-[#888] font-semibold text-sm">
              ✓ Completado
            </div>
          ) : (
            <Link
              href={`/dashboard/workout/${nextWorkout.id}`}
              className="mt-4 flex items-center justify-center gap-1.5 w-full h-[52px] rounded-2xl font-bold text-[13px] tracking-[0.18em] transition-all active:scale-[0.98] hover:brightness-110"
              style={{ background: '#C8FF00', color: '#000' }}
            >
              START WORKOUT <ChevronRight size={15} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-[22px] border border-[#1F1F1F] bg-[#141414] p-6 mb-[14px] text-center">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-white font-semibold mb-1">Sin plan activo</p>
          <p className="text-[#888] text-sm">Completa el onboarding para generar tu plan.</p>
        </div>
      )}

      {/* Hybrid load card */}
      {plan && weekWorkouts.length > 0 && (
        <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-4">
          <div className="flex justify-between items-center mb-[14px]">
            <span className="font-mono text-[10px] text-[#444] tracking-[0.18em] font-semibold">
              HYBRID LOAD · WEEK {activeWeek}
            </span>
            <span className="font-mono text-[11px] text-[#888]">
              {weekCompleted}/{weekWorkouts.length} done
            </span>
          </div>

          <div className="flex flex-col gap-[10px]">
            {([
              { label: 'RUN',   Icon: TrendingUp, done: runDone,   list: runW,   color: '#C8FF00' },
              { label: 'LIFT',  Icon: Dumbbell,   done: liftDone,  list: liftW,  color: '#A78BFA' },
              { label: 'HYROX', Icon: Zap,        done: hyroxDone, list: hyroxW, color: '#FF6B35' },
            ] as const).map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${row.color}15`, color: row.color }}
                >
                  <row.Icon size={16} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-mono text-[12px] font-bold tracking-[0.05em]">{row.label}</span>
                    <span className="font-mono text-[11px] text-[#888]">{row.done}/{row.list.length}</span>
                  </div>
                  <div className="h-[3px] mt-1.5 bg-[#1F1F1F] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: row.list.length > 0 ? `${(row.done / row.list.length) * 100}%` : '0%',
                        background: row.color,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#444] mt-1">
                    {row.list.length === 0
                      ? 'No esta semana'
                      : row.done === row.list.length
                      ? '¡Completado!'
                      : `${row.list.length - row.done} restante${row.list.length - row.done !== 1 ? 's' : ''}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
