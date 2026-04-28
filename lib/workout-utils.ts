export type WorkoutCategory = 'HYROX' | 'RUN' | 'LIFT' | 'HYBRID' | 'TRAIN'

// ─── New strict day-type helpers ──────────────────────────────────────────────

export function getDayTypeLabel(dayType: string): string {
  switch (dayType) {
    case 'strength_lower_day': return 'FUERZA LOWER'
    case 'strength_upper_day': return 'FUERZA UPPER'
    case 'run_day':            return 'RUN'
    case 'hyrox_day':          return 'HYROX'
    case 'race_day':           return 'RACE DAY'
    case 'rest_day':           return 'DESCANSO'
    default:                   return dayType.toUpperCase().replace(/_/g, ' ')
  }
}

export function getDayTypeColor(dayType: string): string {
  switch (dayType) {
    case 'strength_lower_day':
    case 'strength_upper_day': return '#A78BFA'
    case 'run_day':            return '#C8FF00'
    case 'hyrox_day':
    case 'race_day':           return '#FF6B35'
    default:                   return '#444444'
  }
}

// ─── Legacy category helpers (kept for plan/workout-detail pages) ─────────────

export function getWorkoutCategory(dayType: string): WorkoutCategory {
  const t = dayType.toLowerCase()
  // New strict day types
  if (t === 'hyrox_day' || t === 'race_day')                      return 'HYROX'
  if (t === 'run_day')                                             return 'RUN'
  if (t === 'strength_lower_day' || t === 'strength_upper_day')   return 'LIFT'
  // Legacy fallback
  if (t.includes('hyrox') || t.includes('simulation'))            return 'HYROX'
  if (t.includes('run') || t.includes('z2') || t.includes('tempo') || t.includes('interval')) return 'RUN'
  if (t.includes('strength') || t.includes('upper') || t.includes('lower') || t.includes('fuerza')) return 'LIFT'
  return 'TRAIN'
}

export function getCategoryColor(category: WorkoutCategory): string {
  switch (category) {
    case 'HYROX':  return '#FF6B35'
    case 'RUN':    return '#C8FF00'
    case 'LIFT':   return '#A78BFA'
    case 'HYBRID': return '#38BDF8'
    default:       return '#888888'
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
