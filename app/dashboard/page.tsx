import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Zap, Dumbbell, TrendingUp, Activity } from 'lucide-react'
import { getWorkoutCategory, getCategoryColor, getGreeting, formatGoalTag } from '@/lib/workout-utils'
import { getCoachMessage } from '@/lib/coach'
import { PHASE_LABELS, type TrainingPhase } from '@/lib/planGenerator'

function WorkoutIcon({ category, size = 28 }: { category: string; size?: number }) {
  const cls = `text-current`
  if (category === 'HYROX')  return <Zap      size={size} className={cls} />
  if (category === 'RUN')    return <TrendingUp size={size} className={cls} />
  if (category === 'LIFT')   return <Dumbbell  size={size} className={cls} />
  if (category === 'HYBRID') return <Zap      size={size} className={cls} />
  return <Activity size={size} className={cls} />
}

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayISO = new Date().toISOString().split('T')[0]
  const hour     = new Date().getUTCHours()

  const [profileRes, todayRes, planRes] = await Promise.all([
    supabase.from('users').select('first_name').eq('id', user.id).single(),
    supabase
      .from('workouts')
      .select('id, day_type, duration_minutes, goals_tags, intensity, is_rest_day')
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
  ])

  const firstName = profileRes.data?.first_name ?? ''
  const greeting  = getGreeting(hour)
  const plan      = planRes.data

  // Active plan week: derive week_number from plan start_date so the counter
  // always reflects the plan's cadence, not the calendar week.
  // Before the plan starts → week 1 (upcoming). After it ends → last week.
  let activeWeek = 1
  if (plan) {
    const planStart  = new Date(plan.start_date + 'T00:00:00')
    const daysDiff   = Math.floor((new Date().getTime() - planStart.getTime()) / 86_400_000)
    activeWeek = daysDiff < 0
      ? 1
      : Math.min(Math.floor(daysDiff / 7) + 1, plan.total_weeks)
  }

  // Derive current training phase from plan.structure.phase_map
  const phaseMap = (plan?.structure as Record<string, unknown> | null)?.phase_map as Record<string, string> | undefined
  const currentPhase = (phaseMap?.[String(activeWeek)] ?? null) as TrainingPhase | null

  const coachMessage = await getCoachMessage(user.id, currentPhase).catch(() => null)

  // Fetch workouts for the active week, then check which are completed
  const weekWorkoutsRes = await supabase
    .from('workouts')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_number', activeWeek)
    .eq('is_rest_day', false)

  const weekWorkoutIds = weekWorkoutsRes.data?.map(w => w.id) ?? []

  const completedRes = await supabase
    .from('completed_workouts')
    .select('workout_id')
    .eq('user_id', user.id)
    .in('workout_id', weekWorkoutIds.length > 0 ? weekWorkoutIds : ['00000000-0000-0000-0000-000000000000'])

  const weekTotal     = weekWorkoutIds.length
  const weekCompleted = completedRes.data?.length ?? 0

  // If no workout today, find next upcoming one
  let nextWorkout = todayRes.data
  let nextDate: string | null = null
  if (!nextWorkout && plan) {
    const nextRes = await supabase
      .from('workouts')
      .select('id, day_type, duration_minutes, goals_tags, intensity, is_rest_day, scheduled_date')
      .eq('user_id', user.id)
      .eq('is_rest_day', false)
      .gt('scheduled_date', todayISO)
      .order('scheduled_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    nextWorkout = nextRes.data
    nextDate    = nextRes.data?.scheduled_date ?? null
  }

  const isToday    = !nextDate
  const category   = nextWorkout ? getWorkoutCategory(nextWorkout.day_type) : null
  const color      = category ? getCategoryColor(category) : '#888888'
  const completedSet = new Set((completedRes.data ?? []).map(c => c.workout_id))
  const isTodayDone = todayRes.data ? completedSet.has(todayRes.data.id) : false

  return (
    <div className="px-5 pt-12">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[#888888] text-sm mb-1">{greeting},</p>
        <h1 className="text-[2rem] font-bold text-white leading-tight">
          {firstName || 'Atleta'}.
        </h1>
      </div>

      {/* AI Coach message */}
      {coachMessage && (
        <div className="flex items-start gap-2.5 mb-6">
          <Zap size={14} className="text-[#C8FF00] shrink-0 mt-0.5" />
          <p className="text-[#888888] text-sm leading-relaxed">{coachMessage}</p>
        </div>
      )}

      {/* Main workout card */}
      {nextWorkout ? (
        <div
          className="rounded-2xl border p-5 mb-5"
          style={{ borderColor: `${color}30`, background: `${color}08` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              {!isToday && nextDate && (
                <p className="text-xs font-medium mb-1.5" style={{ color }}>
                  PRÓXIMO · {new Date(nextDate + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }).toUpperCase()}
                </p>
              )}
              {isToday && (
                <p className="text-xs font-medium mb-1.5" style={{ color }}>HOY</p>
              )}
              <span
                className="inline-block text-xs font-bold tracking-widest px-2.5 py-1 rounded-full mb-3"
                style={{ background: `${color}20`, color }}
              >
                {category}
              </span>
              <h2 className="text-xl font-bold text-white leading-snug">
                {nextWorkout.day_type}
              </h2>
              <p className="text-[#888888] text-sm mt-1">
                {nextWorkout.duration_minutes} min · {nextWorkout.intensity}
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}15`, color }}
            >
              <WorkoutIcon category={category ?? 'TRAIN'} size={26} />
            </div>
          </div>

          {/* Goals tags */}
          {nextWorkout.goals_tags && nextWorkout.goals_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-[#555555] text-xs">Suma a:</span>
              {nextWorkout.goals_tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-0.5 rounded-full border"
                  style={{ color, borderColor: `${color}40` }}
                >
                  {formatGoalTag(tag)}
                </span>
              ))}
            </div>
          )}

          {isTodayDone ? (
            <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] font-semibold py-3.5 rounded-xl text-center text-sm">
              ✓ Completado
            </div>
          ) : (
            <Link
              href={`/dashboard/workout/${nextWorkout.id}`}
              className="flex items-center justify-center gap-2 w-full font-bold py-3.5 rounded-xl text-black text-sm transition-all active:scale-[0.98]"
              style={{ background: '#C8FF00' }}
            >
              START WORKOUT
              <ChevronRight size={16} strokeWidth={2.5} />
            </Link>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#222222] bg-[#141414] p-6 mb-5 text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-white font-semibold mb-1">Sin plan activo</p>
          <p className="text-[#888888] text-sm">Completa el onboarding para generar tu plan.</p>
        </div>
      )}

      {/* Weekly progress */}
      {plan && (
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white font-semibold text-sm">
                Semana {activeWeek} de {plan.total_weeks}
              </p>
              {currentPhase && (
                <p className="text-[#C8FF00] text-xs font-bold tracking-widest mt-0.5">
                  Fase {PHASE_LABELS[currentPhase]}
                </p>
              )}
            </div>
            <span className="text-[#C8FF00] font-bold text-sm">
              {weekCompleted} / {weekTotal}
            </span>
          </div>
          <div className="h-1.5 bg-[#222222] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C8FF00] rounded-full transition-all duration-500"
              style={{ width: weekTotal > 0 ? `${(weekCompleted / weekTotal) * 100}%` : '0%' }}
            />
          </div>
          <p className="text-[#555555] text-xs mt-2">
            {weekTotal - weekCompleted} de {weekTotal} entrenamientos restantes
          </p>
        </div>
      )}

      {/* Quick link to plan */}
      <Link
        href="/dashboard/plan"
        className="flex items-center justify-between bg-[#141414] border border-[#222222] rounded-2xl p-4"
      >
        <div>
          <p className="text-white text-sm font-semibold">Ver plan completo</p>
          <p className="text-[#555555] text-xs mt-0.5">
            {plan ? `${plan.total_weeks} semanas · ${plan.start_date} → ${plan.end_date}` : 'Sin plan'}
          </p>
        </div>
        <ChevronRight size={18} className="text-[#444444]" />
      </Link>
    </div>
  )
}
