import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Clock, Zap } from 'lucide-react'
import { getWorkoutCategory, getCategoryColor } from '@/lib/workout-utils'
import type { WorkoutBlock } from '@/lib/supabase/types'
import WorkoutClient from './WorkoutClient'

function BlockSection({ block }: { block: WorkoutBlock }) {
  const label: Record<string, string> = {
    warmup:    'Calentamiento',
    strength:  'Fuerza',
    power:     'Potencia',
    cardio:    'Cardio',
    hiit:      'HIIT',
    accessory: 'Accesorio',
    mobility:  'Movilidad',
    cooldown:  'Enfriamiento',
  }
  const sectionLabel = label[block.type] ?? block.label

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-[#1E1E1E]" />
        <span className="text-[#555555] text-xs font-semibold uppercase tracking-widest">
          {sectionLabel}
        </span>
        <div className="h-px flex-1 bg-[#1E1E1E]" />
      </div>

      {block.label && block.label !== sectionLabel && (
        <p className="text-white font-semibold text-sm mb-3">{block.label}</p>
      )}

      {/* Cardio / interval format */}
      {block.format && (
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-4">
          <p className="text-white text-sm">{block.format}</p>
          <div className="flex gap-4 mt-2">
            {block.rpe && (
              <span className="text-[#888888] text-xs">RPE {block.rpe}</span>
            )}
            {block.hr_zone && (
              <span className="text-[#888888] text-xs">Zona {block.hr_zone}</span>
            )}
            {(block.duration_min || block.duration_max) && (
              <span className="text-[#888888] text-xs">
                {block.duration_min}–{block.duration_max} min
              </span>
            )}
            {block.rest && (
              <span className="text-[#888888] text-xs">Descanso: {block.rest}</span>
            )}
          </div>
        </div>
      )}

      {/* Cardio without format (duration only) */}
      {!block.format && !block.exercises && (block.duration_min || block.duration_max) && (
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-4">
          <div className="flex gap-4">
            {(block.duration_min || block.duration_max) && (
              <span className="text-white text-sm">
                {block.duration_min}–{block.duration_max} min
              </span>
            )}
            {block.hr_zone && <span className="text-[#888888] text-xs">Zona {block.hr_zone}</span>}
            {block.rpe    && <span className="text-[#888888] text-xs">RPE {block.rpe}</span>}
          </div>
        </div>
      )}

      {/* Exercise list */}
      {block.exercises && block.exercises.length > 0 && (
        <div className="space-y-2">
          {block.exercises.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#141414] border border-[#1E1E1E] rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-white text-sm font-medium">{ex.name}</p>
                {ex.notes && <p className="text-[#555555] text-xs mt-0.5">{ex.notes}</p>}
              </div>
              <div className="text-right shrink-0 ml-4">
                {ex.sets && ex.reps ? (
                  <p className="text-[#C8FF00] text-sm font-semibold">
                    {ex.sets} × {ex.reps}
                  </p>
                ) : ex.reps ? (
                  <p className="text-[#C8FF00] text-sm font-semibold">{ex.reps}</p>
                ) : null}
                {ex.rest && (
                  <p className="text-[#555555] text-xs">{ex.rest}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [workoutRes, completedRes] = await Promise.all([
    supabase
      .from('workouts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('completed_workouts')
      .select('id, rating, notes')
      .eq('workout_id', id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!workoutRes.data) notFound()

  const workout   = workoutRes.data
  const completed = completedRes.data
  const category  = getWorkoutCategory(workout.day_type)
  const color     = getCategoryColor(category)
  const blocks    = (workout.blocks ?? []) as WorkoutBlock[]

  const dateLabel = new Date(workout.scheduled_date + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="px-5 pt-10 pb-4">
      {/* Back */}
      <Link
        href="/dashboard/plan"
        className="flex items-center gap-1 text-[#888888] text-sm mb-6 hover:text-white transition-colors"
      >
        <ChevronLeft size={16} /> Plan
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <span
          className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: `${color}20`, color }}
        >
          {category}
        </span>
        {completed && (
          <span className="text-xs text-[#C8FF00] font-semibold">
            ★ {completed.rating}/5
          </span>
        )}
      </div>

      <h1 className="text-2xl font-bold text-white mt-3 mb-1 leading-snug">
        {workout.day_type}
      </h1>

      <div className="flex items-center gap-4 mb-6">
        <span className="flex items-center gap-1.5 text-[#888888] text-sm">
          <Clock size={14} />
          {workout.duration_minutes} min
        </span>
        <span className="flex items-center gap-1.5 text-[#888888] text-sm capitalize">
          <Zap size={14} />
          {workout.intensity}
        </span>
        <span className="text-[#555555] text-xs capitalize">{dateLabel}</span>
      </div>

      {/* Tags */}
      {workout.goals_tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {workout.goals_tags.map((tag: string) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full border"
              style={{ color, borderColor: `${color}40` }}
            >
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Blocks */}
      <div className="mb-8">
        {blocks.map((block, i) => (
          <BlockSection key={i} block={block} />
        ))}

        {blocks.length === 0 && (
          <p className="text-[#555555] text-sm text-center py-8">
            Sin detalles de bloques disponibles.
          </p>
        )}
      </div>

      {/* Previous notes */}
      {completed?.notes && (
        <div className="bg-[#141414] border border-[#222222] rounded-xl p-4 mb-5">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-widest mb-1">
            Mis notas
          </p>
          <p className="text-[#888888] text-sm">{completed.notes}</p>
        </div>
      )}

      {/* CTA */}
      <WorkoutClient workoutId={id} alreadyDone={!!completed} />
    </div>
  )
}
