import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PHASE_LABELS, PHASE_COLORS, type TrainingPhase } from '@/lib/planGenerator'
import PlanBoard from './PlanBoard'

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

  const [workoutsRes, completedRes, planRes] = await Promise.all([
    supabase
      .from('workouts')
      .select('id, scheduled_date, day_type, duration_minutes, intensity, is_rest_day, blocks')
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

  const workouts     = workoutsRes.data ?? []
  const completedIds = (completedRes.data ?? []).map(c => c.workout_id).filter((id): id is string => id !== null)
  const plan         = planRes.data

  let activeWeek = 1
  if (plan) {
    const planStart = new Date(plan.start_date + 'T00:00:00')
    const daysDiff  = Math.floor((new Date().getTime() - planStart.getTime()) / 86_400_000)
    activeWeek = daysDiff < 0 ? 1 : Math.min(Math.floor(daysDiff / 7) + 1, plan.total_weeks)
  }

  const phaseMap     = (plan?.structure as Record<string, unknown> | null)?.phase_map as Record<string, string> | undefined
  const currentPhase = (phaseMap?.[String(activeWeek)] ?? null) as TrainingPhase | null

  const planMeta = plan ? {
    activeWeek,
    totalWeeks:  plan.total_weeks,
    phaseLabel:  currentPhase ? PHASE_LABELS[currentPhase] : null,
    phaseColor:  currentPhase ? PHASE_COLORS[currentPhase] : '#C8FF00',
  } : null

  return (
    <PlanBoard
      dates={dates.map(d => d.toISOString().split('T')[0])}
      workouts={workouts}
      completedIds={completedIds}
      weekOffset={weekOffset}
      planMeta={planMeta}
    />
  )
}
