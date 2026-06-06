'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generatePlan } from '@/lib/planGenerator'
import type { OnboardingData } from './types'

// Construye el array de goals a partir de los campos del nuevo data shape
function buildGoals(data: OnboardingData): { type: string; race_date?: string }[] {
  if (data.program_type === 'gym') {
    return [{ type: data.gym_goal || 'general_fitness' }]
  }
  if (data.program_type === 'run') {
    return [{
      type:      data.run_goal || '5k',
      race_date: data.run_race_date || undefined,
    }]
  }
  return []
}

export async function saveOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  const goals = buildGoals(data)

  // ── 1. Update user profile ────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profilePayload: Record<string, any> = {
    first_name:    data.first_name.trim() || null,
    last_name:     data.last_name.trim()  || null,
    age:           data.age     ? parseInt(data.age)      : null,
    weight:        data.weight  ? parseFloat(data.weight) : null,
    height:        data.height  ? parseFloat(data.height) : null,
    level:         data.level   || null,
    training_days: data.training_days,
    available_days: [data.training_days.length],
    equipment:     [data.equipment || 'none'],
    program_type:           data.program_type || null,
    gym_split:              data.gym_split    || null,
    secondary_program_days: data.secondary_program_days ?? 0,
    is_mixed_program:       (data.secondary_program_days ?? 0) > 0,
    current_5k_time:               data.current_5k_time       ? `00:${data.current_5k_time}`       : null,
    current_10k_time:              data.current_10k_time      ? `00:${data.current_10k_time}`      : null,
    current_half_marathon_time:    data.current_hm_time       ? `00:${data.current_hm_time}`       : null,
    current_marathon_time:         data.current_marathon_time ? `00:${data.current_marathon_time}` : null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileErr } = await supabase
    .from('users')
    .update(profilePayload as any)
    .eq('id', user.id)

  if (profileErr) throw new Error(profileErr.message)

  // ── 2. Replace goals ──────────────────────────────────────────────────────
  await supabase.from('goals').delete().eq('user_id', user.id)

  if (goals.length > 0) {
    const { error: goalsErr } = await supabase.from('goals').insert(
      goals.map((g, i) => ({
        user_id:   user.id,
        type:      g.type as import('@/lib/supabase/types').GoalType,
        race_date: g.race_date || null,
        priority:  i + 1,
      }))
    )
    if (goalsErr) throw new Error(goalsErr.message)
  }

  // ── 3. Generate plan ──────────────────────────────────────────────────────
  const { plan: planData, workouts: workoutsData } = generatePlan(user.id, {
    level:         data.level         || 'beginner',
    training_days: data.training_days,
    equipment:     data.equipment     || 'none',
    program_type:           data.program_type  as 'gym' | 'run' | undefined,
    gym_split:              data.gym_split     as 'ppl' | 'upper_lower' | 'full_body' | undefined,
    secondary_program_days: data.secondary_program_days ?? 0,
    goals,
  })

  // ── 4. Delete old plan if exists, then insert new ─────────────────────────
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
    .from('plans').insert(planData).select().single()

  if (planErr || !plan) throw new Error(planErr?.message ?? 'Failed to create plan')

  // ── 5. Bulk-insert workouts ───────────────────────────────────────────────
  const BATCH = 100
  for (let i = 0; i < workoutsData.length; i += BATCH) {
    const chunk = workoutsData.slice(i, i + BATCH).map(w => ({ ...w, plan_id: plan.id }))
    const { error: wErr } = await supabase.from('workouts').insert(chunk)
    if (wErr) throw new Error(wErr.message)
  }

  // ── 6. Mark onboarding done ───────────────────────────────────────────────
  await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id)

  redirect('/dashboard')
}
