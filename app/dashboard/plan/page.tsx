import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronLeft, ChevronRight, Zap, TrendingUp, Dumbbell } from 'lucide-react'
import { getDayTypeLabel, getDayTypeColor } from '@/lib/workout-utils'
import { PHASE_LABELS, PHASE_COLORS, type TrainingPhase } from '@/lib/planGenerator'
import { LogActivityFAB, MoveWorkoutButton } from './PlanActions'

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function weekDates(weekOffset: number): Date[] {
  const today  = new Date()
  const day    = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function WorkoutTypeIcon({ dayType, size = 18 }: { dayType: string; size?: number }) {
  if (dayType === 'hyrox_day' || dayType === 'race_day') return <Zap size={size} className="text-current" />
  if (dayType === 'run_day')                             return <TrendingUp size={size} className="text-current" />
  if (dayType === 'strength_lower_day' || dayType === 'strength_upper_day') return <Dumbbell size={size} className="text-current" />
  return <Zap size={size} className="text-current" />
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week: weekParam } = await searchParams
  const weekOffset = parseInt(weekParam ?? '0', 10)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dates      = weekDates(weekOffset)
  const rangeStart = dates[0].toISOString().split('T')[0]
  const rangeEnd   = dates[6].toISOString().split('T')[0]
  const todayISO   = new Date().toISOString().split('T')[0]

  const [workoutsRes, completedRes, planRes] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, scheduled_date, day_type, duration_minutes, intensity, is_rest_day, goals_tags, blocks')
      .eq('user_id', user.id)
      .gte('scheduled_date', rangeStart)
      .lte('scheduled_date', rangeEnd)
      .order('scheduled_date', { ascending: true }),
    supabase
      .from('completed_workouts')
      .select('workout_id')
      .eq('user_id', user.id),
    supabase
      .from('plans')
      .select('start_date, total_weeks, structure')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ])

  const workouts       = workoutsRes.data ?? []
  const completedSet   = new Set((completedRes.data ?? []).map(c => c.workout_id))
  const workoutByDate  = Object.fromEntries(workouts.map(w => [w.scheduled_date, w]))
  const plan           = planRes.data

  let activeWeek = 1
  if (plan) {
    const planStart = new Date(plan.start_date + 'T00:00:00')
    const daysDiff  = Math.floor((new Date().getTime() - planStart.getTime()) / 86_400_000)
    activeWeek = daysDiff < 0 ? 1 : Math.min(Math.floor(daysDiff / 7) + 1, plan.total_weeks)
  }

  const phaseMap     = (plan?.structure as Record<string, unknown> | null)?.phase_map as Record<string, string> | undefined
  const currentPhase = (phaseMap?.[String(activeWeek)] ?? null) as TrainingPhase | null

  const monthLabel = dates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

  const activeWorkouts = workouts.filter(w => !w.is_rest_day)
  const weekDone = activeWorkouts.filter(w => completedSet.has(w.id)).length

  return (
    <div className="px-5 pt-5 pb-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="font-mono text-[11px] text-[#444] tracking-[0.18em] mb-1">{monthLabel}</p>
          <h1 className="text-[28px] font-bold text-white leading-none tracking-tight">Plan</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/plan?week=${weekOffset - 1}`}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-[#888] hover:text-white transition-colors active:opacity-60"
          >
            <ChevronLeft size={16} />
          </Link>
          <Link
            href={`/dashboard/plan?week=${weekOffset + 1}`}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-[#888] hover:text-white transition-colors active:opacity-60"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Phase pill */}
      {plan && (
        <div className="flex items-center gap-3 mb-4">
          <span
            className="inline-flex items-center text-[10px] font-bold tracking-[0.18em] px-[10px] py-[5px] rounded-full font-mono"
            style={{
              background: currentPhase ? `${PHASE_COLORS[currentPhase]}15` : '#C8FF00/10',
              color: currentPhase ? PHASE_COLORS[currentPhase] : '#C8FF00',
            }}
          >
            WEEK {activeWeek}/{plan.total_weeks}
            {currentPhase ? ` · ${PHASE_LABELS[currentPhase]}` : ''}
          </span>
          <span className="font-mono text-[11px] text-[#888]">
            {dates[0].getDate()} — {dates[6].getDate()} {dates[0].toLocaleDateString('en-US', { month: 'short' })}
          </span>
        </div>
      )}

      {/* Week strip */}
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {dates.map((date, i) => {
          const iso     = date.toISOString().split('T')[0]
          const workout = workoutByDate[iso]
          const isToday = iso === todayISO
          const isDone  = workout && completedSet.has(workout.id)
          const color   = workout && !workout.is_rest_day ? getDayTypeColor(workout.day_type) : null

          return (
            <div key={iso} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-semibold font-mono tracking-[0.1em] ${isToday ? 'text-[#C8FF00]' : 'text-[#444]'}`}>
                {DOW[i]}
              </span>
              <div
                className={`w-full aspect-square rounded-[10px] flex items-center justify-center text-xs font-bold border transition-all relative ${
                  isToday
                    ? 'border-[#C8FF00] bg-[#C8FF00]/10 text-[#C8FF00]'
                    : isDone
                    ? 'border-[#1E3300] bg-[#C8FF00]/8 text-[#C8FF00]'
                    : workout && !workout.is_rest_day
                    ? 'border-[#222] bg-[#141414] text-white'
                    : 'border-[#1A1A1A] bg-transparent text-[#333]'
                }`}
              >
                {isDone ? <Check size={11} strokeWidth={3} /> : date.getDate()}
                {color && !isDone && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: color }} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Section label */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#444] tracking-[0.18em] font-semibold uppercase">This week</span>
          <span className="font-mono text-[10px] text-[#444] tracking-[0.1em]">
            {weekDone} DONE · {activeWorkouts.length - weekDone} LEFT
          </span>
        </div>
        <LogActivityFAB />
      </div>

      {/* Workout rows */}
      <div className="flex flex-col gap-2">
        {dates.map(date => {
          const iso     = date.toISOString().split('T')[0]
          const workout = workoutByDate[iso]
          const isToday = iso === todayISO
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()

          if (!workout) {
            return (
              <div key={iso} className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] opacity-50">
                <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center bg-[#141414] font-mono text-[11px] font-bold text-[#444]">
                  {date.getDate()}
                </div>
                <div className="flex-1">
                  <p className="text-[#555] text-[12px] font-semibold">{dayName}</p>
                  <p className="font-mono text-[10px] text-[#333] tracking-[0.1em]">REST DAY</p>
                </div>
              </div>
            )
          }

          if (workout.is_rest_day) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const restLabel = (workout.blocks as any)?.[0]?.format ?? 'Rest'
            return (
              <div key={iso} className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-[#0E0E0E] border border-[#1A1A1A] opacity-50">
                <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center bg-[#141414] font-mono text-[11px] font-bold text-[#444]">
                  {date.getDate()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#555] text-[12px] font-semibold">{dayName}</p>
                  <p className="text-[#333] text-[10px] truncate max-w-[200px]">{restLabel}</p>
                </div>
              </div>
            )
          }

          const color  = getDayTypeColor(workout.day_type)
          const label  = getDayTypeLabel(workout.day_type)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const blockLabel = (workout.blocks as any)?.[0]?.label ?? label
          const isDone = completedSet.has(workout.id)

          return (
            <Link
              key={iso}
              href={`/dashboard/workout/${workout.id}`}
              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-[0.99] relative overflow-hidden ${
                isToday ? 'border-[#C8FF00]/20 bg-[#141414]' : 'border-[#1A1A1A] bg-[#141414]'
              }`}
            >
              {isToday && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#C8FF00] rounded-l-2xl" />
              )}
              <div
                className="w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${color}15`, color }}
              >
                <WorkoutTypeIcon dayType={workout.day_type} size={17} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color }}>
                    {label.toUpperCase()}
                  </span>
                  <span className="font-mono text-[10px] text-[#444] tracking-[0.05em]">
                    {dayName} {date.getDate()}
                  </span>
                </div>
                <p className="text-white text-[14px] font-semibold leading-snug">{blockLabel}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="font-mono text-[12px] text-[#888] font-semibold">
                  {workout.duration_minutes}m
                </span>
                {isDone && (
                  <div className="w-5 h-5 rounded-full bg-[#C8FF00]/20 flex items-center justify-center">
                    <Check size={11} className="text-[#C8FF00]" strokeWidth={3} />
                  </div>
                )}
                {!isDone && (
                  <MoveWorkoutButton
                    workoutId={workout.id}
                    currentDate={workout.scheduled_date!}
                    workoutLabel={blockLabel}
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
