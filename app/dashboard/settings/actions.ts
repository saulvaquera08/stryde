'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generatePlan } from '@/lib/planGenerator'

export async function updateTrainingDays(trainingDays: string[]) {
  if (trainingDays.length < 3) throw new Error('Mínimo 3 días de entrenamiento')
  if (trainingDays.length > 6) throw new Error('Máximo 6 días de entrenamiento')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Load current profile data needed for plan regeneration
  const [profileRes, goalsRes] = await Promise.all([
    supabase.from('users').select('level, equipment').eq('id', user.id).single(),
    supabase.from('goals').select('type, race_date').eq('user_id', user.id),
  ])

  const profile = profileRes.data
  const goals   = goalsRes.data ?? []

  // Update training days on user profile
  await supabase
    .from('users')
    .update({ training_days: trainingDays, available_days: [trainingDays.length] })
    .eq('id', user.id)

  // Delete old plan + workouts (cascade)
  const { data: oldPlan } = await supabase
    .from('plans')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (oldPlan) {
    await supabase.from('workouts').delete().eq('plan_id', oldPlan.id)
    await supabase.from('plans').delete().eq('id', oldPlan.id)
  }

  // Regenerate plan
  const { plan: planData, workouts: workoutsData } = generatePlan(user.id, {
    level:         profile?.level         ?? 'beginner',
    training_days: trainingDays,
    equipment:     profile?.equipment?.[0] ?? 'none',
    goals: goals.map(g => ({ type: g.type, race_date: g.race_date ?? undefined })),
  })

  const { data: newPlan, error: planErr } = await supabase
    .from('plans')
    .insert(planData)
    .select()
    .single()

  if (planErr || !newPlan) throw new Error(planErr?.message ?? 'Failed to create plan')

  await supabase
    .from('workouts')
    .insert(workoutsData.map(w => ({ ...w, plan_id: newPlan.id })))

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/plan')
  revalidatePath('/dashboard/settings')
}

export async function regeneratePlan() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [profileRes, goalsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user.id).single(),
    supabase.from('goals').select('type, race_date').eq('user_id', user.id),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileRes.data as any
  const goals   = goalsRes.data ?? []

  const { data: oldPlan } = await supabase
    .from('plans').select('id').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(1).single()

  if (oldPlan) {
    await supabase.from('workouts').delete().eq('plan_id', oldPlan.id)
    await supabase.from('plans').delete().eq('id', oldPlan.id)
  }

  const { plan: planData, workouts: workoutsData } = generatePlan(user.id, {
    level:            profile?.level            ?? 'beginner',
    training_days:    profile?.training_days    ?? [],
    equipment:        profile?.equipment?.[0]   ?? 'none',
    goals:            goals.map((g: { type: string; race_date: string | null }) => ({ type: g.type, race_date: g.race_date ?? undefined })),
    program_type:     profile?.program_type     ?? undefined,
    session_duration: profile?.session_duration ?? undefined,
    injuries:         profile?.injuries         ?? [],
    gym_goal:         profile?.gym_goal         ?? undefined,
    priority_muscles: profile?.priority_muscles ?? [],
    run_distance:     profile?.run_distance      ?? undefined,
    run_weekly_km:    profile?.run_weekly_km     ?? undefined,
    hyrox_experience:    profile?.hyrox_experience    ?? undefined,
    hyrox_weak_stations: profile?.hyrox_weak_stations ?? [],
    hyrox_strength_cardio: profile?.hyrox_strength_cardio_balance ?? undefined,
  })

  const { data: newPlan, error: planErr } = await supabase
    .from('plans').insert(planData).select().single()

  if (planErr || !newPlan) throw new Error(planErr?.message ?? 'Failed to create plan')

  await supabase.from('workouts').insert(workoutsData.map(w => ({ ...w, plan_id: newPlan.id })))

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/plan')
  revalidatePath('/dashboard/more')
  redirect('/dashboard')
}

export async function skipWorkout(workoutId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/plan')
  revalidatePath('/dashboard')
}

export async function moveWorkout(workoutId: string, newDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('workouts')
    .update({ scheduled_date: newDate })
    .eq('id', workoutId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/plan')
}

export async function logManualActivity(data: {
  activity_type: string
  duration_seconds: number
  logged_date: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('completed_workouts').insert({
    user_id:          user.id,
    workout_id:       null,
    completed_at:     data.logged_date + 'T12:00:00',
    duration_seconds: data.duration_seconds,
    rating:           null,
    notes:            data.notes ?? null,
    metrics:          { activity_type: data.activity_type },
  })

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/plan')
  revalidatePath('/dashboard/progress')
}
