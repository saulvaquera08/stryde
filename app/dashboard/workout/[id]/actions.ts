'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeWorkout(
  workoutId: string,
  rating: number,
  notes: string,
  durationSeconds: number,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('completed_workouts')
    .upsert(
      {
        workout_id: workoutId,
        user_id: user.id,
        rating,
        notes,
        duration_seconds: durationSeconds,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'workout_id,user_id' },
    )

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/plan')
  revalidatePath('/dashboard/progress')
  revalidatePath(`/dashboard/workout/${workoutId}`)
}
