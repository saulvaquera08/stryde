import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProgressClient from './ProgressClient'

interface CompletedRow {
  duration_seconds: number | null
  rating: number | null
  completed_at: string
}

interface HistoryRow {
  completed_at: string
  duration_seconds: number | null
  rating: number | null
  metrics: Record<string, unknown> | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workouts: any
}

function startOfWeekMonday(ref: Date): Date {
  const d = new Date(ref)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7))
  d.setHours(0, 0, 0, 0)
  return d
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const oneYearAgo = new Date(Date.now() - 366 * 86_400_000).toISOString()

  const [mainRes, historyRes] = await Promise.all([
    supabase
      .from('completed_workouts')
      .select('duration_seconds, rating, completed_at')
      .eq('user_id', user.id)
      .gte('completed_at', oneYearAgo)
      .order('completed_at', { ascending: true }),
    supabase
      .from('completed_workouts')
      .select('completed_at, duration_seconds, rating, metrics, workouts(day_type, duration_minutes, blocks)')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10),
  ])

  const completed: CompletedRow[] = mainRes.data ?? []
  const history: HistoryRow[]     = (historyRes.data ?? []) as HistoryRow[]
  const hasData = completed.length > 0

  const empty = { sessions: 0, minutes: 0, avgIntensity: null }

  if (!hasData) {
    return (
      <ProgressClient
        hasData={false}
        bars={{ week: Array(7).fill(0), month: Array(4).fill(0), year: Array(12).fill(0) }}
        stats={{ week: empty, month: empty, year: empty }}
        history={[]}
      />
    )
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  const weekStart = startOfWeekMonday(now)
  const weekBars  = Array(7).fill(0)
  const monthBars = Array(4).fill(0)
  const yearBars  = Array(12).fill(0)

  const fourWeeksAgo = new Date(weekStart)
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 21)

  const yearStats  = { sessions: 0, minutes: 0, ratings: [] as number[] }
  const monthStats = { sessions: 0, minutes: 0, ratings: [] as number[] }
  const weekStats  = { sessions: 0, minutes: 0, ratings: [] as number[] }

  for (const row of completed) {
    const ts      = new Date(row.completed_at)
    const minutes = row.duration_seconds != null ? Math.round(row.duration_seconds / 60) : 0
    const rowDate = ts.toISOString().split('T')[0]

    const monthDiff = (now.getFullYear() - ts.getFullYear()) * 12 + (now.getMonth() - ts.getMonth())
    if (monthDiff >= 0 && monthDiff < 12) {
      const idx = 11 - monthDiff
      yearBars[idx] += minutes
      yearStats.sessions++
      yearStats.minutes += minutes
      if (row.rating !== null) yearStats.ratings.push(row.rating)
    }

    const fourWeeksAgoStr = fourWeeksAgo.toISOString().split('T')[0]
    if (rowDate >= fourWeeksAgoStr && rowDate <= todayStr) {
      const daysDiff = Math.floor((ts.getTime() - fourWeeksAgo.getTime()) / 86_400_000)
      const weekIdx  = Math.min(Math.floor(daysDiff / 7), 3)
      monthBars[weekIdx] += minutes
      monthStats.sessions++
      monthStats.minutes += minutes
      if (row.rating !== null) monthStats.ratings.push(row.rating)
    }

    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndDate  = new Date(weekStart)
    weekEndDate.setDate(weekEndDate.getDate() + 6)
    const weekEndStr = weekEndDate.toISOString().split('T')[0]
    if (rowDate >= weekStartStr && rowDate <= weekEndStr) {
      const dayIdx = Math.floor((ts.getTime() - weekStart.getTime()) / 86_400_000)
      if (dayIdx >= 0 && dayIdx < 7) {
        weekBars[dayIdx] += minutes
        weekStats.sessions++
        weekStats.minutes += minutes
        if (row.rating !== null) weekStats.ratings.push(row.rating)
      }
    }
  }

  function avg(arr: number[]): number | null {
    if (!arr.length) return null
    return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
  }

  const ACTIVITY_TYPE_TO_DAY_TYPE: Record<string, string> = {
    run:      'run_day',
    strength: 'strength_lower_day',
    hyrox:    'hyrox_day',
  }
  const ACTIVITY_TYPE_LABEL: Record<string, string> = {
    run:      'Carrera manual',
    strength: 'Gym manual',
    hyrox:    'HYROX manual',
    other:    'Actividad manual',
  }

  // Build history items — handle both plan workouts and manual entries
  const historyItems = history.map(h => {
    const w          = h.workouts
    const actType    = (h.metrics?.['activity_type'] as string) ?? 'other'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allBlocks  = w?.blocks as any[]
    const mainBlock  = allBlocks?.find((b: any) => b.label !== 'Calentamiento') ?? allBlocks?.[0]
    return {
      completed_at:     h.completed_at,
      duration_seconds: h.duration_seconds,
      rating:           h.rating,
      day_type:         w?.day_type ?? ACTIVITY_TYPE_TO_DAY_TYPE[actType] ?? '',
      label:            w ? (mainBlock?.label ?? '') : (ACTIVITY_TYPE_LABEL[actType] ?? 'Actividad manual'),
    }
  })

  return (
    <ProgressClient
      hasData={true}
      bars={{ week: weekBars, month: monthBars, year: yearBars }}
      stats={{
        week:  { sessions: weekStats.sessions,  minutes: weekStats.minutes,  avgIntensity: avg(weekStats.ratings)  },
        month: { sessions: monthStats.sessions, minutes: monthStats.minutes, avgIntensity: avg(monthStats.ratings) },
        year:  { sessions: yearStats.sessions,  minutes: yearStats.minutes,  avgIntensity: avg(yearStats.ratings)  },
      }}
      history={historyItems}
    />
  )
}
