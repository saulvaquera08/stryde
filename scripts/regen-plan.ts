import { createClient } from '@supabase/supabase-js'
import { generatePlan, validatePlan } from '../lib/planGenerator'

const SUPABASE_URL = 'https://htmzmawdcgasddkdgsqy.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const USER_ID = 'aa9c7a77-3097-493f-bba7-e08ae934ada4'

const GYM_PROFILE = {
  level:         'intermediate',
  training_days: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'],
  equipment:     'full_gym',
  goals:         [{ type: 'strength' }],
  program_type:  'gym' as const,
  gym_goal:      'strength',
  gym_split:     'ppl' as const,
}

const RUN_PROFILE = {
  level:         'intermediate',
  training_days: ['monday', 'tuesday', 'thursday', 'friday', 'sunday'],
  equipment:     'full_gym',
  goals:         [{ type: 'half_marathon', race_date: '2026-09-05' }],
  program_type:  'run' as const,
  run_distance:  'half_marathon',
}

const MIX_PROFILE = {
  level:                  'intermediate',
  training_days:          ['monday', 'wednesday', 'saturday'],
  equipment:              'full_gym',
  goals:                  [{ type: 'half_marathon', race_date: '2026-10-04' }],
  program_type:           'run' as const,
  run_distance:           'half_marathon',
  secondary_program_days: 3,
}

const ACTIVE_PROFILE = process.argv.includes('--gym')
  ? GYM_PROFILE
  : process.argv.includes('--mix')
    ? MIX_PROFILE
    : RUN_PROFILE

async function main() {
  const mode = process.argv.includes('--gym') ? 'GYM' : process.argv.includes('--mix') ? 'MIX' : 'RUN'
  console.log(`\n═══ ${mode} PLAN ═══\n`)

  const { plan: planData, workouts: workoutsData } = generatePlan(USER_ID, ACTIVE_PROFILE)

  console.log(`Generated: ${planData.total_weeks} weeks · ${workoutsData.length} workouts`)
  console.log(`Start: ${planData.start_date}  End: ${planData.end_date}`)

  try {
    const secondaryDays = (ACTIVE_PROFILE as { secondary_program_days?: number }).secondary_program_days ?? 0
    validatePlan(workoutsData, ACTIVE_PROFILE.training_days.length, ACTIVE_PROFILE.training_days.length + secondaryDays)
    console.log(`✓ Validation passed — no issues`)
  } catch (e: any) {
    console.log(`\n⚠ Validation error: ${e.message}`)
  }

  console.log('\n═══ FIRST 3 WEEKS ═══')
  const first3 = workoutsData.filter(w => (w.week_number ?? 0) <= 3 && !w.is_rest_day)
  for (const w of first3) {
    const block = (w.blocks as any[])?.[0]
    console.log(
      `  W${w.week_number} ${w.scheduled_date}  [${w.day_type!.padEnd(24)}]  ${block?.label ?? ''}`
    )
  }
  console.log('')

  // Delete old plans + workouts
  const { error: delW } = await supabase.from('workouts').delete().eq('user_id', USER_ID)
  if (delW) { console.error('Delete workouts failed:', delW.message); process.exit(1) }

  const { error: delP } = await supabase.from('plans').delete().eq('user_id', USER_ID)
  if (delP) { console.error('Delete plans failed:', delP.message); process.exit(1) }

  // Insert new plan
  const { data: plan, error: planErr } = await supabase
    .from('plans').insert(planData).select().single()
  if (planErr || !plan) { console.error('Insert plan failed:', planErr?.message); process.exit(1) }

  // Insert workouts in batches
  const batch = 100
  for (let i = 0; i < workoutsData.length; i += batch) {
    const chunk = workoutsData.slice(i, i + batch).map(w => ({ ...w, plan_id: plan.id }))
    const { error: wErr } = await supabase.from('workouts').insert(chunk)
    if (wErr) { console.error('Insert workouts failed:', wErr.message); process.exit(1) }
  }

  console.log(`✓ Plan inserted  (id: ${plan.id})`)
  console.log(`✓ ${workoutsData.length} workouts inserted\n`)
}

main().catch(e => { console.error(e); process.exit(1) })
