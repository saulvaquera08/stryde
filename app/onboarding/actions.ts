'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generatePlan } from '@/lib/planGenerator'
import type { OnboardingData } from './types'

export async function saveOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // ── Derive goal type and race date from program_type ─────────────────────
  let goalType  = ''
  let raceDate: string | null = null

  if (data.program_type === 'gym') {
    goalType = data.gym_goal || 'general'
  } else if (data.program_type === 'run') {
    goalType = data.run_distance || '5k'
    raceDate = data.run_race_date || null
  } else if (data.program_type === 'hyrox') {
    goalType = 'hyrox'
    raceDate = data.hyrox_race_date || null
  }

  // Level: gym_level for gym, run_level for run, intermediate default for hyrox
  const level =
    data.program_type === 'gym'   ? (data.gym_level   || 'beginner') :
    data.program_type === 'run'   ? (data.run_level   || 'beginner') :
    'intermediate'

  // ── 1. Update user profile ────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilePayload: Record<string, any> = {
    first_name:    data.first_name.trim() || null,
    last_name:     data.last_name.trim()  || null,
    age:           data.age     ? parseInt(data.age)       : null,
    weight:        data.weight  ? parseFloat(data.weight)  : null,
    height:        data.height  ? parseFloat(data.height)  : null,
    level,
    training_days:   data.training_days,
    available_days:  [data.training_days.length],
    equipment:       data.equipment ? [data.equipment] : [],
    injuries:        data.injuries.filter(z => z !== 'none'),

    // v2 fields (added via migration 003; cast to any since generated types lag behind)
    program_type:   data.program_type || null,

    gym_goal:         data.gym_goal || null,
    priority_muscles: data.priority_muscles,

    run_distance:    data.run_distance || null,
    run_race_date:   data.run_race_date || null,
    run_weekly_km:   data.run_weekly_km || null,
    run_level:       data.run_level || null,

    hyrox_experience:              data.hyrox_experience || null,
    hyrox_race_date:               data.hyrox_race_date || null,
    hyrox_weak_stations:           data.hyrox_weak_stations,
    hyrox_strength_cardio_balance: data.hyrox_strength_cardio_balance ?? null,

    injury_notes:             data.injury_notes || null,
    low_intensity_preference: data.low_intensity_preference,
    preferred_time:           data.preferred_time || null,
    session_duration:         data.session_duration || null,

    current_5k_time:  data.run_current_5k_time  ? `00:${data.run_current_5k_time}`  : null,
    current_10k_time: data.run_current_10k_time ? `00:${data.run_current_10k_time}` : null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileErr } = await supabase
    .from('users')
    .update(profilePayload as any)
    .eq('id', user.id)

  if (profileErr) throw new Error(profileErr.message)

  // ── 2. Replace goals ──────────────────────────────────────────────────────
  await supabase.from('goals').delete().eq('user_id', user.id)

  if (goalType) {
    const { error: goalsErr } = await supabase.from('goals').insert([{
      user_id:   user.id,
      type:      goalType as import('@/lib/supabase/types').GoalType,
      race_date: raceDate,
      priority:  1,
    }])
    if (goalsErr) throw new Error(goalsErr.message)
  }

  // ── 3. Generate plan ──────────────────────────────────────────────────────
  const { plan: planData, workouts: workoutsData } = generatePlan(user.id, {
    level,
    training_days:  data.training_days,
    equipment:      data.equipment || 'none',
    goals:          goalType ? [{ type: goalType, race_date: raceDate ?? undefined }] : [],
    program_type:   data.program_type || undefined,
    session_duration: data.session_duration || undefined,
    injuries:       data.injuries.filter(z => z !== 'none'),
    gym_goal:       data.gym_goal || undefined,
    priority_muscles: data.priority_muscles,
    run_distance:   data.run_distance || undefined,
    run_weekly_km:  data.run_weekly_km || undefined,
    hyrox_experience:    data.hyrox_experience || undefined,
    hyrox_weak_stations: data.hyrox_weak_stations,
    hyrox_strength_cardio: data.hyrox_strength_cardio_balance ?? undefined,
  })

  // ── 4. Insert plan + workouts ─────────────────────────────────────────────
  // Delete any existing plan first
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

  const { data: plan, error: planErr } = await supabase
    .from('plans')
    .insert(planData)
    .select()
    .single()

  if (planErr || !plan) throw new Error(planErr?.message ?? 'Failed to create plan')

  const { error: workoutsErr } = await supabase
    .from('workouts')
    .insert(workoutsData.map(w => ({ ...w, plan_id: plan.id })))

  if (workoutsErr) throw new Error(workoutsErr.message)

  // ── 5. Mark onboarding done ───────────────────────────────────────────────
  await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  redirect('/dashboard')
}
