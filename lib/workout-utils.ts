export type WorkoutCategory = 'HYROX' | 'RUN' | 'LIFT' | 'HYBRID' | 'TRAIN'

export function getWorkoutCategory(dayType: string): WorkoutCategory {
  const t = dayType.toLowerCase()
  if (t.includes('hyrox')) return 'HYROX'
  if (t.includes('run') || t.includes('z2') || t.includes('endurance')) return 'RUN'
  if (t.includes('strength') || t.includes('upper') || t.includes('lower')) return 'LIFT'
  if (t.includes('hybrid') || t.includes('simulation')) return 'HYBRID'
  return 'TRAIN'
}

export function getCategoryLabel(category: WorkoutCategory): string {
  return category
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
  if (hour >= 5  && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 22) return 'Good evening'
  return 'Good night'
}

export function formatGoalTag(tag: string): string {
  return tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  const start = new Date(d)
  start.setDate(d.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}
