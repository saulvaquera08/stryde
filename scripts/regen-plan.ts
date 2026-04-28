import { createClient } from '@supabase/supabase-js'
import { generatePlan } from '../lib/planGenerator'

const SUPABASE_URL = 'https://htmzmawdcgasddkdgsqy.supabase.co'
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const USER_ID = 'aa9c7a77-3097-493f-bba7-e08ae934ada4'

async function main() {
  const profile = {
    level:         'intermediate',
    training_days: ['monday', 'tuesday', 'thursday', 'friday', 'sunday'],
    equipment:     'full_gym',
    goals:         [{ type: 'hyrox', race_date: '2026-09-05' }],
  }

  const { plan: planData, workouts: workoutsData } = generatePlan(USER_ID, profile)

  console.log(`\nGenerated plan: ${planData.total_weeks} weeks · ${workoutsData.length} workouts`)
  console.log(`Start: ${planData.start_date}  End: ${planData.end_date}\n`)

  // Preview first 3 weeks
  console.log('═══ FIRST 3 WEEKS ═══')
  const first3 = workoutsData.filter(w => (w.week_number ?? 0) <= 3 && !w.is_rest_day)
  for (const w of first3) {
    const block = (w.blocks as any[])?.[w.day_type === 'run_day' ? 1 : 0]
    const warmup = w.day_type === 'run_day' ? (w.blocks as any[])?.[0]?.label : null
    console.log(
      `  W${w.week_number} ${w.scheduled_date}  [${w.day_type.padEnd(20)}]  ${block?.label ?? ''}`
      + (warmup ? `  (+ ${warmup})` : '')
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

  // Show HX rotation in first 10 weeks
  console.log('═══ HYROX ROTATION (weeks 1-10) ═══')
  const hxWorkouts = workoutsData.filter(w => w.day_type === 'hyrox_day' && (w.week_number ?? 0) <= 10)
  for (const w of hxWorkouts) {
    const block = (w.blocks as any[])?.[0]
    console.log(`  W${w.week_number}  ${w.scheduled_date}  ${block?.label ?? ''}`)
  }
  console.log('')
}

main().catch(e => { console.error(e); process.exit(1) })
