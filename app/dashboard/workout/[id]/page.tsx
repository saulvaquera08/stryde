import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Clock, Zap } from 'lucide-react'
import { getDayTypeLabel, getDayTypeColor } from '@/lib/workout-utils'
import type { WorkoutBlock } from '@/lib/supabase/types'
import WorkoutClient from './WorkoutClient'
import BackButton from '../../_components/BackButton'

function BlockSection({ block }: { block: WorkoutBlock }) {
  const sectionLabels: Record<string, string> = {
    warmup:    'CALENTAMIENTO',
    strength:  'FUERZA',
    power:     'POTENCIA',
    cardio:    'CARDIO',
    hiit:      'HIIT',
    accessory: 'ACCESORIO',
    mobility:  'MOVILIDAD',
    cooldown:  'ENFRIAMIENTO',
  }
  const sectionLabel = sectionLabels[block.type] ?? block.label?.toUpperCase() ?? block.type.toUpperCase()

  return (
    <div className="bg-[#141414] border border-[#1A1A1A] rounded-xl p-4 mb-3">
      {/* Block header */}
      <p className="text-[#555555] text-xs font-semibold tracking-widest uppercase mb-3">
        {sectionLabel}
      </p>

      {block.label && block.label.toUpperCase() !== sectionLabel && (
        <p className="text-white font-semibold text-sm mb-3">{block.label}</p>
      )}

      {/* Cardio / interval format */}
      {block.format && (
        <div className="mb-2">
          <p className="text-white text-sm whitespace-pre-line">{block.format}</p>
          {(block.rpe || block.hr_zone || block.duration_min || block.rest) && (
            <div className="flex gap-3 mt-2">
              {block.rpe && <span className="text-[#555555] text-xs">RPE {block.rpe}</span>}
              {block.hr_zone && <span className="text-[#555555] text-xs">Zona {block.hr_zone}</span>}
              {(block.duration_min || block.duration_max) && (
                <span className="text-[#555555] text-xs">{block.duration_min}–{block.duration_max} min</span>
              )}
              {block.rest && <span className="text-[#555555] text-xs">Descanso: {block.rest}</span>}
            </div>
          )}
        </div>
      )}

      {/* Duration only (no format, no exercises) */}
      {!block.format && !block.exercises && (block.duration_min || block.duration_max) && (
        <div className="flex gap-3">
          <span className="text-white text-sm">{block.duration_min}–{block.duration_max} min</span>
          {block.hr_zone && <span className="text-[#555555] text-xs">Zona {block.hr_zone}</span>}
          {block.rpe && <span className="text-[#555555] text-xs">RPE {block.rpe}</span>}
        </div>
      )}

      {/* Exercise list */}
      {block.exercises && block.exercises.length > 0 && (
        <div>
          {block.exercises.map((ex, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-2.5 ${
                i < block.exercises!.length - 1 ? 'border-b border-[#1A1A1A]' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{ex.name}</p>
                {ex.notes && <p className="text-[#555555] text-xs mt-0.5 italic">{ex.notes}</p>}
              </div>
              <div className="text-right shrink-0 ml-4">
                {ex.sets && ex.reps ? (
                  <p className="text-[#888888] text-sm font-semibold">{ex.sets} × {ex.reps}</p>
                ) : ex.reps ? (
                  <p className="text-[#888888] text-sm font-semibold">{ex.reps}</p>
                ) : null}
                {ex.rest && <p className="text-[#444444] text-xs">{ex.rest}</p>}
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
    supabase.from('workouts').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase
      .from('completed_workouts')
      .select('id, rating, notes, duration_seconds')
      .eq('workout_id', id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!workoutRes.data) notFound()

  const workout    = workoutRes.data
  const completed  = completedRes.data
  const color      = getDayTypeColor(workout.day_type)
  const typeLabel  = getDayTypeLabel(workout.day_type)
  const blocks     = (workout.blocks ?? []) as WorkoutBlock[]
  const firstBlock = blocks[0]

  const dateLabel = new Date(workout.scheduled_date + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="px-5 pt-5 pb-6">
      {/* Inline nav header */}
      <div className="flex items-center justify-between mb-5">
        <BackButton />
        <span className="font-mono text-[11px] text-[#444] tracking-[0.18em]">
          {new Date(workout.scheduled_date + 'T12:00:00').toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
          }).toUpperCase()}
        </span>
        <div className="w-9" />
      </div>

      {/* Meta pills */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span
          className="text-xs font-bold tracking-wider px-3 py-1 rounded-full"
          style={{ background: `${color}18`, color }}
        >
          {typeLabel}
        </span>
        <span className="flex items-center gap-1 text-xs text-[#888888] bg-[#1A1A1A] px-3 py-1 rounded-full">
          <Clock size={11} />
          {workout.duration_minutes} min
        </span>
        <span className="flex items-center gap-1 text-xs text-[#888888] bg-[#1A1A1A] px-3 py-1 rounded-full capitalize">
          <Zap size={11} />
          {workout.intensity}
        </span>
        {completed && (
          <span className="text-xs text-[#C8FF00] bg-[#C8FF00]/10 px-3 py-1 rounded-full font-semibold">
            ✓ {completed.rating}/10
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-white leading-snug mb-0.5">
        {firstBlock?.label ?? typeLabel}
      </h1>
      <p className="text-[#555555] text-xs mb-1 capitalize">{dateLabel}</p>

      {/* Goal tags */}
      {workout.goals_tags?.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3 mb-5">
          <span className="text-[#555555] text-xs">Suma a:</span>
          {workout.goals_tags.map((tag: string) => (
            <span key={tag} className="text-xs text-[#C8FF00] bg-[#C8FF00]/10 px-2 py-0.5 rounded-full">
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}

      {/* Blocks */}
      <div className="mt-4 mb-4">
        {blocks.map((block, i) => (
          <BlockSection key={i} block={block} />
        ))}
        {blocks.length === 0 && (
          <p className="text-[#555555] text-sm text-center py-8">Sin detalles de bloques disponibles.</p>
        )}
      </div>

      {/* Previous notes */}
      {completed?.notes && (
        <div className="bg-[#141414] border border-[#1A1A1A] rounded-xl p-4 mb-4">
          <p className="text-[#555555] text-xs font-semibold uppercase tracking-widest mb-1">Mis notas</p>
          <p className="text-[#888888] text-sm">{completed.notes}</p>
        </div>
      )}

      {/* Sticky CTA */}
      <div className="sticky bottom-[80px] pt-3">
        <WorkoutClient workoutId={id} alreadyDone={!!completed} />
      </div>
    </div>
  )
}
