import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Zap, Dumbbell, TrendingUp, Activity, Flag } from 'lucide-react'
import { getDayTypeLabel, getDayTypeColor, getGreeting } from '@/lib/workout-utils'
import { getCoachMessage } from '@/lib/coach'
import { PHASE_LABELS, PHASE_COLORS, type TrainingPhase } from '@/lib/planGenerator'
import type { WorkoutBlock } from '@/lib/supabase/types'

const GOAL_LABELS: Record<string, string> = {
  hyrox:    'HYROX',
  '21k':    'Media Maratón',
  '5k':     '5K',
  '10k':    '10K',
  strength: 'Fuerza',
  recomp:   'Recomposición',
}

function DayTypeIcon({ dayType, size = 26 }: { dayType: string; size?: number }) {
  if (dayType === 'hyrox_day' || dayType === 'race_day') return <Zap size={size} className="text-current" />
  if (dayType === 'run_day')                             return <TrendingUp size={size} className="text-current" />
  if (dayType === 'strength_lower_day')                  return <Dumbbell size={size} className="text-current" />
  if (dayType === 'strength_upper_day')                  return <Dumbbell size={size} className="text-current" />
  return <Activity size={size} className="text-current" />
}

function RaceCountdown({
  goals,
  plan,
  activeWeek,
}: {
  goals: Array<{ type: string; race_date: string | null }>
  plan: { total_weeks: number } | null
  activeWeek: number
}) {
  const now = Date.now()

  // Check if we're in the post-race recovery window (race passed ≤ 7 days ago)
  const recentlyRaced = goals
    .filter(g => g.race_date)
    .map(g => ({
      type: g.type,
      daysAfter: Math.floor((now - new Date(g.race_date! + 'T12:00:00').getTime()) / 86_400_000),
    }))
    .filter(g => g.daysAfter >= 0 && g.daysAfter <= 7)
    .sort((a, b) => a.daysAfter - b.daysAfter)[0]

  if (recentlyRaced) {
    const goalLabel = GOAL_LABELS[recentlyRaced.type] ?? recentlyRaced.type.toUpperCase()
    const isLastDay = recentlyRaced.daysAfter === 7
    return (
      <div className="mb-6">
        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">✅</span>
            <p className="text-white font-semibold text-sm">{goalLabel} completado</p>
          </div>
          <p className="text-[#555555] text-xs">Semana de recuperación — el cuerpo se adapta en el descanso.</p>
          {isLastDay && (
            <a
              href="/onboarding"
              className="mt-3 flex items-center justify-center w-full bg-[#C8FF00] text-black font-bold py-3 rounded-xl text-sm"
            >
              ¿Cuál es tu próximo objetivo? →
            </a>
          )}
        </div>
      </div>
    )
  }

  // Check if race is more than 7 days past (show new-goal CTA)
  const pastRace = goals
    .filter(g => g.race_date)
    .map(g => ({
      type: g.type,
      daysAfter: Math.floor((now - new Date(g.race_date! + 'T12:00:00').getTime()) / 86_400_000),
    }))
    .filter(g => g.daysAfter > 7)
    .sort((a, b) => a.daysAfter - b.daysAfter)[0]

  if (pastRace && !goals.some(g => g.race_date && new Date(g.race_date + 'T12:00:00').getTime() > now)) {
    const goalLabel = GOAL_LABELS[pastRace.type] ?? pastRace.type.toUpperCase()
    return (
      <div className="mb-6 bg-[#141414] border border-[#222222] rounded-2xl p-4">
        <p className="text-white font-semibold text-sm mb-1">✅ {goalLabel} completado</p>
        <p className="text-[#555555] text-xs mb-3">Recuperación lista. ¿Cuál es el siguiente reto?</p>
        <a
          href="/onboarding"
          className="flex items-center justify-center w-full bg-[#C8FF00] text-black font-bold py-3 rounded-xl text-sm"
        >
          Nuevo objetivo →
        </a>
      </div>
    )
  }

  // Normal countdown for upcoming races
  const upcoming = goals
    .filter(g => g.race_date)
    .map(g => ({
      ...g,
      daysLeft: Math.ceil(
        (new Date(g.race_date! + 'T12:00:00').getTime() - now) / 86_400_000
      ),
    }))
    .filter(g => g.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  if (!upcoming.length) return null

  const next = upcoming[0]
  const weeksLeft = Math.ceil(next.daysLeft / 7)
  const goalLabel = GOAL_LABELS[next.type] ?? next.type.toUpperCase()

  if (next.daysLeft === 0) {
    return (
      <div className="mb-6 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-2xl p-4 flex items-center gap-3">
        <Flag size={20} className="text-[#FF6B35] shrink-0" />
        <div>
          <p className="text-[#FF6B35] font-bold text-sm">HOY ES EL DÍA</p>
          <p className="text-white font-semibold">{goalLabel}</p>
        </div>
      </div>
    )
  }

  const isUrgent = next.daysLeft <= 7
  const isNear   = next.daysLeft <= 30
  const color    = (isUrgent || isNear) ? '#FF6B35' : '#888888'
  const timeStr  = next.daysLeft <= 30
    ? `${next.daysLeft} día${next.daysLeft !== 1 ? 's' : ''}`
    : `${weeksLeft} semana${weeksLeft !== 1 ? 's' : ''}`

  const progressPct = plan && plan.total_weeks > 0
    ? Math.min((activeWeek / plan.total_weeks) * 100, 100)
    : 0

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white text-sm font-semibold">
          {goalLabel}
          {upcoming.length > 1 && (
            <span className="text-[#555555] text-xs font-normal ml-2">+{upcoming.length - 1} más</span>
          )}
        </p>
        <p className={`text-sm font-bold${isUrgent ? ' animate-pulse' : ''}`} style={{ color }}>
          {timeStr}{isUrgent ? ' 🔥' : ''}
        </p>
      </div>
      {plan && (
        <div className="h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: color }}
          />
        </div>
      )}
    </div>
  )
}

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayISO = new Date().toISOString().split('T')[0]
  const hour     = new Date().getUTCHours()

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
    supabase
      .from('goals')
      .select('type, race_date')
      .eq('user_id', user.id),
  ])

  const firstName = profileRes.data?.first_name ?? ''
  const greeting  = getGreeting(hour)
  const plan      = planRes.data
  const goals     = goalsRes.data ?? []

  let activeWeek = 1
  if (plan) {
    const planStart = new Date(plan.start_date + 'T00:00:00')
    const daysDiff  = Math.floor((new Date().getTime() - planStart.getTime()) / 86_400_000)
    activeWeek = daysDiff < 0
      ? 1
      : Math.min(Math.floor(daysDiff / 7) + 1, plan.total_weeks)
  }

  const phaseMap     = (plan?.structure as Record<string, unknown> | null)?.phase_map as Record<string, string> | undefined
  const currentPhase = (phaseMap?.[String(activeWeek)] ?? null) as TrainingPhase | null

  const coachMessage = await getCoachMessage(user.id, currentPhase).catch(() => null)

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

  const isToday       = !nextDate
  const dayType       = nextWorkout?.day_type ?? ''
  const color         = dayType ? getDayTypeColor(dayType) : '#888888'
  const typeLabel     = dayType ? getDayTypeLabel(dayType) : null
  const completedSet  = new Set((completedRes.data ?? []).map(c => c.workout_id))
  const isTodayDone   = todayRes.data ? completedSet.has(todayRes.data.id) : false

  // Extract variant name + subtitle from first block
  const firstBlock   = nextWorkout ? ((nextWorkout.blocks ?? []) as WorkoutBlock[])[0] : null
  const variantName  = firstBlock?.label ?? typeLabel ?? ''
  // subtitle is stored as "Short desc\nFull format" — take first line
  const variantSub   = firstBlock?.format?.split('\n')[0] ?? null

  // Race day special handling
  const isRaceDay = dayType === 'race_day'

  return (
    <div className="px-5 pt-12">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[#888888] text-sm mb-1">{greeting},</p>
        <h1 className="text-[2.25rem] font-bold text-white leading-tight">
          {firstName || 'Atleta'}.
        </h1>
      </div>

      {/* AI Coach message */}
      {coachMessage && (
        <div className="flex items-start gap-2.5 mb-5">
          <Zap size={14} className="text-[#C8FF00] shrink-0 mt-0.5" />
          <p className="text-[#888888] text-sm leading-relaxed">{coachMessage}</p>
        </div>
      )}

      {/* Race countdown */}
      <RaceCountdown goals={goals} plan={plan} activeWeek={activeWeek} />

      {/* Phase pill */}
      {plan && currentPhase && (
        <div className="mb-5">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest px-3 py-1 rounded-full"
            style={{ background: `${PHASE_COLORS[currentPhase]}18`, color: PHASE_COLORS[currentPhase] }}
          >
            Semana {activeWeek} de {plan.total_weeks} · Fase {PHASE_LABELS[currentPhase]}
          </span>
        </div>
      )}

      {/* Race day card */}
      {isRaceDay ? (
        <div className="rounded-2xl border border-[#FF6B35]/30 bg-[#FF6B35]/08 p-6 mb-5 text-center">
          <p className="text-4xl mb-3">🏁</p>
          <p className="text-[#FF6B35] font-bold text-lg mb-1">HOY ES EL DÍA</p>
          <p className="text-white text-sm">{firstBlock?.format ?? ''}</p>
        </div>
      ) : nextWorkout ? (
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
              {typeLabel && (
                <span
                  className="inline-block text-xs font-bold tracking-widest px-2.5 py-1 rounded-full mb-3"
                  style={{ background: `${color}20`, color }}
                >
                  {typeLabel}
                </span>
              )}
              <h2 className="text-xl font-bold text-white leading-snug">
                {variantName}
              </h2>
              {variantSub && (
                <p className="text-[#555555] text-xs mt-0.5">{variantSub}</p>
              )}
              <p className="text-[#888888] text-sm mt-1.5">
                {nextWorkout.duration_minutes} min · {nextWorkout.intensity}
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ml-3"
              style={{ background: `${color}15`, color }}
            >
              <DayTypeIcon dayType={dayType} size={26} />
            </div>
          </div>

          {isTodayDone ? (
            <div className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] font-semibold min-h-[56px] rounded-xl flex items-center justify-center text-sm">
              ✓ Completado
            </div>
          ) : (
            <Link
              href={`/dashboard/workout/${nextWorkout.id}`}
              className="flex items-center justify-center gap-2 w-full font-bold min-h-[56px] rounded-xl text-black text-sm transition-all active:scale-[0.98]"
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
                <p className="text-xs font-bold tracking-widest mt-0.5" style={{ color: PHASE_COLORS[currentPhase] }}>
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
