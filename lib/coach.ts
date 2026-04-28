import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { PHASE_LABELS, type TrainingPhase } from '@/lib/planGenerator'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface CoachContext {
  userId: string
  firstName: string
  activeWeek: number
  totalWeeks: number
  currentPhase: TrainingPhase | null
  todayWorkout: { day_type: string; duration_minutes: number | null; intensity: string } | null
  nextWorkout: { day_type: string; scheduled_date: string } | null
  recentCompleted: { day_type: string; rating: number | null; completed_at: string }[]
  goals: string[]
  daysToRace: number | null
}

async function buildContext(userId: string): Promise<CoachContext> {
  const supabase = await createClient()

  const todayISO = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString()

  const [profileRes, planRes, todayRes, goalsRes] = await Promise.all([
    supabase.from('users').select('first_name').eq('id', userId).single(),
    supabase
      .from('plans')
      .select('id, start_date, end_date, total_weeks, structure')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('workouts')
      .select('id, day_type, duration_minutes, intensity')
      .eq('user_id', userId)
      .eq('scheduled_date', todayISO)
      .eq('is_rest_day', false)
      .maybeSingle(),
    supabase
      .from('goals')
      .select('type, race_date')
      .eq('user_id', userId),
  ])

  const plan = planRes.data
  let activeWeek = 1
  let totalWeeks = 0
  let currentPhase: TrainingPhase | null = null
  if (plan) {
    const planStart = new Date(plan.start_date + 'T00:00:00')
    const daysDiff = Math.floor((Date.now() - planStart.getTime()) / 86_400_000)
    activeWeek = daysDiff < 0 ? 1 : Math.min(Math.floor(daysDiff / 7) + 1, plan.total_weeks)
    totalWeeks = plan.total_weeks
    const phaseMap = (plan.structure as Record<string, unknown> | null)?.phase_map as Record<string, string> | undefined
    currentPhase = (phaseMap?.[String(activeWeek)] ?? null) as TrainingPhase | null
  }

  // Recent completed workouts with ratings
  const recentRes = await supabase
    .from('completed_workouts')
    .select('workout_id, rating, completed_at')
    .eq('user_id', userId)
    .gte('completed_at', sevenDaysAgo)
    .order('completed_at', { ascending: false })
    .limit(7)

  const completedWorkoutIds = recentRes.data?.map(c => c.workout_id) ?? []

  let recentCompleted: CoachContext['recentCompleted'] = []
  if (completedWorkoutIds.length > 0) {
    const workoutsRes = await supabase
      .from('workouts')
      .select('id, day_type')
      .in('id', completedWorkoutIds)
    const workoutMap = new Map((workoutsRes.data ?? []).map(w => [w.id, w.day_type]))
    recentCompleted = (recentRes.data ?? []).map(c => ({
      day_type: workoutMap.get(c.workout_id) ?? 'Entrenamiento',
      rating: c.rating,
      completed_at: c.completed_at,
    }))
  }

  // Next workout if not today
  let nextWorkout: CoachContext['nextWorkout'] = null
  if (!todayRes.data && plan) {
    const nextRes = await supabase
      .from('workouts')
      .select('day_type, scheduled_date')
      .eq('user_id', userId)
      .eq('is_rest_day', false)
      .gt('scheduled_date', todayISO)
      .order('scheduled_date', { ascending: true })
      .limit(1)
      .maybeSingle()
    nextWorkout = nextRes.data ?? null
  }

  // Days to closest race
  let daysToRace: number | null = null
  for (const goal of goalsRes.data ?? []) {
    if (goal.race_date) {
      const d = Math.ceil((new Date(goal.race_date).getTime() - Date.now()) / 86_400_000)
      if (d > 0 && (daysToRace === null || d < daysToRace)) daysToRace = d
    }
  }

  return {
    userId,
    firstName: profileRes.data?.first_name ?? 'Atleta',
    activeWeek,
    totalWeeks,
    currentPhase,
    todayWorkout: todayRes.data ?? null,
    nextWorkout,
    recentCompleted,
    goals: (goalsRes.data ?? []).map(g => g.type),
    daysToRace,
  }
}

function buildPrompt(ctx: CoachContext): string {
  const lines: string[] = []

  lines.push(`Atleta: ${ctx.firstName}`)
  if (ctx.totalWeeks > 0) {
    const phaseLabel = ctx.currentPhase ? ` · Fase ${PHASE_LABELS[ctx.currentPhase]}` : ''
    lines.push(`Semana de entrenamiento: ${ctx.activeWeek} de ${ctx.totalWeeks}${phaseLabel}`)
  }
  if (ctx.currentPhase) {
    const phaseDesc: Record<string, string> = {
      base:     'Fase BASE — construir base aeróbica y fuerza general, volumen moderado',
      build:    'Fase BUILD — aumentar volumen semana a semana, más intervalos y sesiones específicas',
      specific: 'Fase SPECIFIC — volumen alto (95%), simulaciones HYROX largas, intervalos exigentes',
      peak:     'Fase PEAK — volumen máximo, simulaciones de competencia, largo runs intensos',
      taper:    'Fase TAPER — reducir volumen, mantener intensidad, preparar el cuerpo para competir',
    }
    lines.push(phaseDesc[ctx.currentPhase] ?? '')
  }
  if (ctx.goals.length > 0) lines.push(`Objetivos activos: ${ctx.goals.join(', ')}`)
  if (ctx.daysToRace !== null) lines.push(`Días para la próxima carrera: ${ctx.daysToRace}`)

  if (ctx.todayWorkout) {
    lines.push(`Entrenamiento de hoy: ${ctx.todayWorkout.day_type} (${ctx.todayWorkout.duration_minutes ?? '?'} min, intensidad ${ctx.todayWorkout.intensity})`)
  } else if (ctx.nextWorkout) {
    lines.push(`Próximo entrenamiento: ${ctx.nextWorkout.day_type} el ${ctx.nextWorkout.scheduled_date}`)
  } else {
    lines.push('Sin entrenamiento programado próximamente.')
  }

  if (ctx.recentCompleted.length > 0) {
    lines.push('Últimos 7 días:')
    for (const w of ctx.recentCompleted) {
      const ratingStr = w.rating !== null ? ` (${w.rating}/10)` : ''
      lines.push(`  - ${w.day_type}${ratingStr}`)
    }
    const ratingsWithValue = ctx.recentCompleted.filter(w => w.rating !== null)
    const lowRatings = ratingsWithValue.filter(w => w.rating! >= 8)
    if (lowRatings.length >= 3) {
      lines.push('ALERTA: 3 o más entrenamientos recientes con dificultad ≥ 8/10. Posible acumulación de fatiga — considera ajustar la carga.')
    }
  } else {
    lines.push('Sin entrenamientos completados en los últimos 7 días.')
  }

  return lines.join('\n')
}

export async function getCoachMessage(userId: string, phase?: TrainingPhase | null): Promise<string> {
  const supabase = await createClient()

  // Check last message to avoid repetition
  const lastRes = await supabase
    .from('coach_messages')
    .select('message')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const lastMessage = lastRes.data?.message ?? null

  const ctx = await buildContext(userId)
  const contextText = buildPrompt(ctx)

  const systemPrompt = `Eres el coach personal de Stryde, una app de entrenamiento de alto rendimiento. Tu misión es motivar y guiar al atleta de forma directa, específica y sin rodeos.

Reglas de respuesta:
- Escribe EXACTAMENTE 2-3 líneas en español. Ni más, ni menos.
- Sé directo: menciona el entrenamiento de hoy o mañana por nombre.
- Si hay señales de fatiga (calificaciones bajas recurrentes), prioriza recuperación y ajuste de carga.
- No uses frases genéricas como "¡Sigue adelante!" sin contexto específico.
- No uses emojis ni hashtags.
- Tono: coach exigente pero empático. Como un entrenador que conoce bien al atleta.
- No repitas el mensaje anterior exactamente. Varía el ángulo o el énfasis.`

  const previousInfo = lastMessage
    ? `\n\nMensaje anterior (NO repetir): "${lastMessage}"`
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Contexto del atleta:\n${contextText}${previousInfo}\n\nEscribe el mensaje motivacional de hoy (2-3 líneas).`,
      },
    ],
  })

  const message = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('')
    .trim()

  // Persist to DB (fire-and-forget, don't block render)
  supabase.from('coach_messages').insert({ user_id: userId, message }).then(() => {})

  return message
}
