'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generatePlan } from '@/lib/planGenerator'
import type { OnboardingData } from './types'

export async function saveOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // ── 1. Update user profile ────────────────────────────────────────────────
  const { error: profileErr } = await supabase
    .from('users')
    .update({
      first_name:       data.first_name.trim() || null,
      last_name:        data.last_name.trim()  || null,
      age:              data.age     ? parseInt(data.age)       : null,
      weight:           data.weight  ? parseFloat(data.weight)  : null,
      height:           data.height  ? parseFloat(data.height)  : null,
      level:            data.level   || null,
      available_days:   [data.available_days],
      equipment:        [data.equipment || ''],
      current_5k_time:  data.current_5k_time  ? `00:${data.current_5k_time}` : null,
      current_10k_time: data.current_10k_time ? `00:${data.current_10k_time}` : null,
    })
    .eq('id', user.id)

  if (profileErr) throw new Error(profileErr.message)

  // ── 2. Replace goals ──────────────────────────────────────────────────────
  await supabase.from('goals').delete().eq('user_id', user.id)

  if (data.goals.length > 0) {
    const { error: goalsErr } = await supabase.from('goals').insert(
      data.goals.map((g, i) => ({
        user_id:   user.id,
        type:      g.type,
        race_date: g.race_date || null,
        priority:  i + 1,
      }))
    )
    if (goalsErr) throw new Error(goalsErr.message)
  }

  // ── 3. Generate plan ──────────────────────────────────────────────────────
  const { plan: planData, workouts: workoutsData } = generatePlan(user.id, {
    level:          data.level || 'beginner',
    available_days: data.available_days,
    equipment:      data.equipment || 'none',
    goals:          data.goals,
  })

  // ── 4. Insert plan ────────────────────────────────────────────────────────
  const { data: plan, error: planErr } = await supabase
    .from('plans')
    .insert(planData)
    .select()
    .single()

  if (planErr || !plan) throw new Error(planErr?.message ?? 'Failed to create plan')

  // ── 5. Bulk-insert workouts ───────────────────────────────────────────────
  const { error: workoutsErr } = await supabase
    .from('workouts')
    .insert(workoutsData.map(w => ({ ...w, plan_id: plan.id })))

  if (workoutsErr) throw new Error(workoutsErr.message)

  // ── 6. Mark onboarding as done ────────────────────────────────────────────
  await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  redirect('/dashboard')
}
