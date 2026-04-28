import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight, Moon } from 'lucide-react'
import { getDayTypeLabel, getDayTypeColor } from '@/lib/workout-utils'

const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function weekDates(weekOffset: number): Date[] {
  const today = new Date()
  const day   = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((day + 6) % 7) + weekOffset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
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

  const dates    = weekDates(weekOffset)
  const rangeStart = dates[0].toISOString().split('T')[0]
  const rangeEnd   = dates[6].toISOString().split('T')[0]
  const todayISO   = new Date().toISOString().split('T')[0]

  const [workoutsRes, completedRes] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, scheduled_date, day_type, duration_minutes, intensity, is_rest_day, goals_tags')
      .eq('user_id', user.id)
      .gte('scheduled_date', rangeStart)
      .lte('scheduled_date', rangeEnd)
      .order('scheduled_date', { ascending: true }),
    supabase
      .from('completed_workouts')
      .select('workout_id')
      .eq('user_id', user.id),
  ])

  const workouts     = workoutsRes.data ?? []
  const completedSet = new Set((completedRes.data ?? []).map(c => c.workout_id))

  const workoutByDate = Object.fromEntries(
    workouts.map(w => [w.scheduled_date, w])
  )

  const monthLabel = dates[0].toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  return (
    <div className="px-5 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Tu Plan</h1>
        <p className="text-[#555555] text-sm capitalize">{monthLabel}</p>
      </div>

      {/* Week nav */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href={`/dashboard/plan?week=${weekOffset - 1}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#222222] text-[#888888] hover:border-[#444444] transition-colors"
        >
          ‹
        </Link>
        <p className="text-white text-sm font-medium">
          {dates[0].getDate()} {dates[0].toLocaleDateString('es-MX', { month: 'short' })} —{' '}
          {dates[6].getDate()} {dates[6].toLocaleDateString('es-MX', { month: 'short' })}
        </p>
        <Link
          href={`/dashboard/plan?week=${weekOffset + 1}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#222222] text-[#888888] hover:border-[#444444] transition-colors"
        >
          ›
        </Link>
      </div>

      {/* Day pills */}
      <div className="grid grid-cols-7 gap-1.5 mb-6">
        {dates.map((date, i) => {
          const iso      = date.toISOString().split('T')[0]
          const workout  = workoutByDate[iso]
          const isToday  = iso === todayISO
          const isDone   = workout && completedSet.has(workout.id)
          const color    = workout && !workout.is_rest_day ? getDayTypeColor(workout.day_type) : null

          return (
            <div key={iso} className="flex flex-col items-center gap-1">
              <span className={`text-[10px] font-medium ${isToday ? 'text-[#C8FF00]' : 'text-[#555555]'}`}>
                {DOW[i]}
              </span>
              <div
                className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold border transition-all ${
                  isToday
                    ? 'border-[#C8FF00] bg-[#C8FF00] text-black'
                    : isDone
                    ? 'border-[#2A3A00] bg-[#C8FF00]/10 text-[#C8FF00]'
                    : workout && !workout.is_rest_day
                    ? 'border-[#2A2A2A] bg-[#141414] text-white'
                    : 'border-[#1A1A1A] text-[#333333]'
                }`}
              >
                {isDone ? <Check size={12} strokeWidth={3} /> : date.getDate()}
              </div>
              {color && (
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: color }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Workout list */}
      <div className="space-y-3">
        {dates.map(date => {
          const iso     = date.toISOString().split('T')[0]
          const workout = workoutByDate[iso]
          const isToday = iso === todayISO
          const isPast  = iso < todayISO

          if (!workout) {
            return (
              <div key={iso} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[#0E0E0E] border border-[#181818]">
                <Moon size={16} className="text-[#333333] shrink-0" />
                <div>
                  <p className="text-[#444444] text-sm">
                    {date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-[#333333] text-xs">Descanso</p>
                </div>
              </div>
            )
          }

          if (workout.is_rest_day) {
            return (
              <div key={iso} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-[#0E0E0E] border border-[#181818]">
                <Moon size={16} className="text-[#333333] shrink-0" />
                <p className="text-[#444444] text-sm">
                  {date.toLocaleDateString('es-MX', { weekday: 'long' })} · Descanso
                </p>
              </div>
            )
          }

          const color  = getDayTypeColor(workout.day_type)
          const label  = getDayTypeLabel(workout.day_type)
          const isDone = completedSet.has(workout.id)

          return (
            <Link
              key={iso}
              href={`/dashboard/workout/${workout.id}`}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.99] ${
                isToday ? 'border-[#C8FF00]/30 bg-[#C8FF00]/5' : 'border-[#222222] bg-[#141414]'
              }`}
            >
              {/* Day type pill */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[9px] font-bold text-center leading-tight px-1"
                style={{ background: `${color}20`, color }}
              >
                {label.split(' ').map((w, i) => <span key={i} className="block">{w}</span>)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isToday ? 'text-[#C8FF00]' : 'text-white'}`}>
                  {label}
                </p>
                <p className="text-[#555555] text-xs mt-0.5">
                  {date.toLocaleDateString('es-MX', { weekday: 'long' })} · {workout.duration_minutes} min
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isDone && (
                  <div className="w-6 h-6 rounded-full bg-[#C8FF00]/20 flex items-center justify-center">
                    <Check size={12} className="text-[#C8FF00]" strokeWidth={3} />
                  </div>
                )}
                {!isDone && !isPast && (
                  <ChevronRight size={16} className="text-[#444444]" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
