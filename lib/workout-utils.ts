export type WorkoutCategory = 'RUN' | 'GYM' | 'TRAIN'

// ─── Day-type helpers ────────────────────────────────────────────────────────

export function getDayTypeLabel(dayType: string): string {
  switch (dayType) {
    case 'strength_push_day':      return 'PUSH'
    case 'strength_pull_day':      return 'PULL'
    case 'strength_legs_day':      return 'LEGS'
    case 'strength_upper_day':     return 'UPPER'
    case 'strength_lower_day':     return 'LOWER'
    case 'strength_full_body_day': return 'FULL BODY'
    case 'run_easy_day':           return 'EASY RUN'
    case 'run_tempo_day':          return 'TEMPO'
    case 'run_intervals_day':      return 'INTERVALS'
    case 'run_long_day':           return 'LONG RUN'
    case 'run_fartlek_day':        return 'FARTLEK'
    case 'race_day':               return 'RACE DAY'
    case 'rest_day':               return 'DESCANSO'
    case 'recovery_day':           return 'RECUPERACIÓN'
    default:                       return dayType.toUpperCase().replace(/_/g, ' ')
  }
}

export function getDayTypeColor(dayType: string): string {
  if (dayType.startsWith('strength_')) return '#A78BFA'
  if (dayType.startsWith('run_'))      return '#60A5FA'
  switch (dayType) {
    case 'race_day':     return '#C8FF00'
    case 'recovery_day': return '#888888'
    default:             return '#444444'
  }
}

// ─── Category helpers ────────────────────────────────────────────────────────

export function getWorkoutCategory(dayType: string): WorkoutCategory {
  const t = dayType.toLowerCase()
  if (t.startsWith('run_') || t === 'race_day')  return 'RUN'
  if (t.startsWith('strength_'))                  return 'GYM'
  if (t.includes('run') || t.includes('tempo') || t.includes('interval')) return 'RUN'
  if (t.includes('strength') || t.includes('upper') || t.includes('lower') || t.includes('push') || t.includes('pull') || t.includes('legs')) return 'GYM'
  return 'TRAIN'
}

export function getCategoryColor(category: WorkoutCategory): string {
  switch (category) {
    case 'RUN':  return '#60A5FA'
    case 'GYM':  return '#A78BFA'
    default:     return '#888888'
  }
}

export function getGreeting(hour: number): string {
  if (hour >= 5  && hour < 12) return 'Buenos días'
  if (hour >= 12 && hour < 17) return 'Buenas tardes'
  if (hour >= 17 && hour < 22) return 'Buenas noches'
  return 'Buenas noches'
}

export function formatGoalTag(tag: string): string {
  return tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d    = new Date(date)
  const day  = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(d)
  start.setDate(d.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
