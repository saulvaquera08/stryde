'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  MouseSensor, TouchSensor, useSensor, useSensors, pointerWithin,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { ChevronLeft, ChevronRight, Plus, Check, TrendingUp, Dumbbell, Zap, Activity } from 'lucide-react'
import { moveWorkout } from '../settings/actions'
import { getDayTypeColor } from '@/lib/workout-utils'
import LogActivityModal from './LogActivityModal'

// ── Types ─────────────────────────────────────────────────────────────────────

interface WorkoutData {
  id: string
  scheduled_date: string
  day_type: string
  duration_minutes: number | null
  is_rest_day: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: any[]
}

interface PlanMeta {
  activeWeek: number
  totalWeeks: number
  phaseLabel: string | null
  phaseColor: string
}

interface Props {
  dates: string[]
  workouts: WorkoutData[]
  completedIds: string[]
  weekOffset: number
  planMeta: PlanMeta | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOW_ES   = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DOW_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

const TYPE_LABEL: Record<string, string> = {
  run_day:              'CORRER',
  strength_lower_day:   'FUERZA',
  strength_upper_day:   'FUERZA',
  hyrox_day:            'HYROX',
  race_day:             'CARRERA',
  recovery_day:         'RECUPERACIÓN',
}

function mainBlock(blocks: any[]): any {
  return blocks?.find(b => b?.label !== 'Calentamiento') ?? blocks?.[0]
}

function WorkoutIcon({ dayType, size = 18 }: { dayType: string; size?: number }) {
  if (dayType === 'hyrox_day' || dayType === 'race_day') return <Zap size={size} strokeWidth={2} />
  if (dayType === 'run_day')                             return <TrendingUp size={size} strokeWidth={2} />
  if (dayType.includes('strength'))                      return <Dumbbell size={size} strokeWidth={2} />
  return <Activity size={size} strokeWidth={2} />
}

// ── Draggable workout card (wide horizontal) ───────────────────────────────────

function WorkoutCard({
  workout, isCompleted, overlay = false,
}: {
  workout: WorkoutData; isCompleted: boolean; overlay?: boolean
}) {
  const router = useRouter()
  const color  = getDayTypeColor(workout.day_type)
  const block  = mainBlock(workout.blocks)
  const name   = (block?.label as string) ?? workout.day_type
  const sub    = (block?.subtitle as string) ?? (block?.format as string) ?? ''
  const typeLabel = TYPE_LABEL[workout.day_type] ?? ''

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id:       workout.id,
    data:     { workout },
    disabled: isCompleted,
  })

  const style = transform && !overlay
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, zIndex: 50, position: 'relative' as const }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => { if (!isDragging) router.push(`/dashboard/workout/${workout.id}`) }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border select-none touch-none transition-all ${
        overlay
          ? 'shadow-[0_12px_40px_rgba(0,0,0,0.7)] scale-[1.02] border-[#2A2A2A] bg-[#1C1C1C]'
          : isDragging
          ? 'opacity-20 border-[#222] bg-[#141414]'
          : isCompleted
          ? 'border-[#1A3300] bg-[#141414] active:opacity-70 cursor-pointer'
          : 'border-[#222] bg-[#141414] active:opacity-70 cursor-pointer'
      }`}
    >
      {/* Type icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, color }}
      >
        <WorkoutIcon dayType={workout.day_type} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color }}>
            {typeLabel}
          </span>
        </div>
        <p className="text-white text-[14px] font-semibold leading-snug truncate">{name}</p>
        {sub && !overlay && (
          <p className="text-[#555] text-[11px] truncate mt-0.5">{sub.split('\n')[0]}</p>
        )}
      </div>

      {/* Right side */}
      <div className="shrink-0 flex flex-col items-end gap-1.5">
        <span className="font-mono text-[12px] text-[#666] font-semibold">
          {workout.duration_minutes ?? 0}m
        </span>
        {isCompleted ? (
          <div className="w-5 h-5 rounded-full bg-[#C8FF00]/20 flex items-center justify-center">
            <Check size={11} className="text-[#C8FF00]" strokeWidth={3} />
          </div>
        ) : (
          !overlay && (
            <ChevronRight size={13} className="text-[#333]" />
          )
        )}
      </div>
    </div>
  )
}

// ── Droppable day row ──────────────────────────────────────────────────────────

function DayRow({
  date, dow, dowFull, workout, isCompleted, isToday, isDraggingActive,
}: {
  date: string; dow: string; dowFull: string; workout: WorkoutData | null;
  isCompleted: boolean; isToday: boolean; isDraggingActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: date })
  const d     = new Date(date + 'T12:00:00')
  const day   = d.getDate()
  const month = d.toLocaleDateString('es-ES', { month: 'short' })

  const isRest = !workout || workout.is_rest_day

  return (
    <div className="flex items-start gap-3">
      {/* Day label — left gutter */}
      <div className="w-[52px] shrink-0 pt-3.5 pb-2">
        <p className={`font-mono text-[9px] font-bold tracking-[0.15em] ${isToday ? 'text-[#C8FF00]' : 'text-[#444]'}`}>
          {dow}
        </p>
        <p className={`text-[22px] font-bold leading-none mt-0.5 ${isToday ? 'text-[#C8FF00]' : 'text-[#555]'}`}>
          {day}
        </p>
        <p className={`font-mono text-[8px] mt-0.5 ${isToday ? 'text-[#C8FF00]/60' : 'text-[#333]'}`}>
          {month.toUpperCase()}
        </p>
      </div>

      {/* Drop zone — right side */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[64px] rounded-2xl transition-all duration-150 ${
          isOver ? 'ring-1 ring-inset ring-[#C8FF00]/35 bg-[#C8FF00]/5' : ''
        }`}
      >
        {!isRest ? (
          <WorkoutCard workout={workout!} isCompleted={isCompleted} />
        ) : (
          <div className={`flex items-center h-full min-h-[64px] px-4 rounded-2xl border transition-colors ${
            isOver
              ? 'border-[#C8FF00]/30 border-dashed'
              : isDraggingActive
              ? 'border-[#252525] border-dashed'
              : 'border-transparent'
          }`}>
            {isOver ? (
              <p className="font-mono text-[10px] text-[#C8FF00]/60 tracking-[0.15em]">SOLTAR AQUÍ</p>
            ) : (
              <p className="font-mono text-[10px] text-[#252525] tracking-[0.15em]">DESCANSO</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function PlanBoard({ dates, workouts, completedIds, weekOffset, planMeta }: Props) {
  const router = useRouter()
  const today  = new Date().toISOString().split('T')[0]

  const [logOpen, setLogOpen]     = useState(false)
  const [active, setActive]       = useState<WorkoutData | null>(null)
  const [localWorkouts, setLocal] = useState<WorkoutData[]>(workouts)
  const [isPending, startT]       = useTransition()

  useEffect(() => { setLocal(workouts) }, [workouts])

  const completedSet   = new Set(completedIds)
  const byDate         = Object.fromEntries(localWorkouts.map(w => [w.scheduled_date, w]))
  const activeTraining = localWorkouts.filter(w => !w.is_rest_day)
  const weekDone       = activeTraining.filter(w => completedSet.has(w.id)).length

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  )

  const onDragStart = ({ active: a }: DragStartEvent) => {
    setActive((a.data.current?.workout as WorkoutData) ?? null)
  }

  const onDragEnd = ({ active: a, over }: DragEndEvent) => {
    setActive(null)
    if (!over) return
    const newDate = over.id as string
    const workout = a.data.current?.workout as WorkoutData
    if (!workout || newDate === workout.scheduled_date) return

    setLocal(prev => prev.map(w =>
      w.id === workout.id ? { ...w, scheduled_date: newDate } : w
    ))
    startT(async () => {
      try { await moveWorkout(workout.id, newDate) }
      catch { setLocal(workouts) }
    })
  }

  // ── Header info ──────────────────────────────────────────────────────────
  const d0  = new Date(dates[0] + 'T12:00:00')
  const d6  = new Date(dates[6] + 'T12:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const rangeLabel = `${fmt(d0)} – ${fmt(d6)}`

  const weekLabel = planMeta
    ? `Semana ${planMeta.activeWeek} / ${planMeta.totalWeeks}`
    : `Semana ${weekOffset === 0 ? '—' : weekOffset > 0 ? `+${weekOffset}` : weekOffset}`

  return (
    <div className="pt-5 pb-4 select-none">

      {/* ── Top header ──────────────────────────────────────────────────── */}
      <div className="px-5 mb-5">
        {/* Title row */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[28px] font-bold text-white leading-none tracking-tight">Plan</h1>
          <button
            onClick={() => setLogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 text-[#C8FF00] active:scale-95 transition-transform"
            style={{ minHeight: 36 }}
          >
            <Plus size={13} strokeWidth={2.5} />
            <span className="font-mono text-[10px] font-bold tracking-[0.12em]">LOG</span>
          </button>
        </div>

        {/* Week nav bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/dashboard/plan?week=${weekOffset - 1}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-[#888] active:opacity-50 shrink-0"
          >
            <ChevronLeft size={15} />
          </button>

          <div className="flex-1 bg-[#141414] border border-[#1F1F1F] rounded-2xl px-4 py-2.5 text-center">
            <p className="text-white text-[13px] font-semibold leading-none">{weekLabel}</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <p className="font-mono text-[10px] text-[#555]">{rangeLabel}</p>
              {planMeta?.phaseLabel && (
                <>
                  <span className="text-[#333]">·</span>
                  <span
                    className="font-mono text-[10px] font-bold tracking-[0.1em]"
                    style={{ color: planMeta.phaseColor }}
                  >
                    {planMeta.phaseLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          <button
            onClick={() => router.push(`/dashboard/plan?week=${weekOffset + 1}`)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-[#888] active:opacity-50 shrink-0"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Progress row */}
        {activeTraining.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 h-[3px] rounded-full bg-[#1A1A1A] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#C8FF00] transition-all"
                style={{ width: `${(weekDone / activeTraining.length) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[#555] shrink-0">
              {weekDone}/{activeTraining.length}
            </span>
          </div>
        )}
      </div>

      {/* ── Day list + DnD ──────────────────────────────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col px-5">
          {dates.map((date, i) => {
            const workout     = byDate[date] ?? null
            const isCompleted = workout ? completedSet.has(workout.id) : false
            const isToday     = date === today
            return (
              <div key={date}>
                <DayRow
                  date={date}
                  dow={DOW_SHORT[i]}
                  dowFull={DOW_ES[i]}
                  workout={workout}
                  isCompleted={isCompleted}
                  isToday={isToday}
                  isDraggingActive={active !== null}
                />
                {i < 6 && <div className="ml-[64px] border-b border-[#141414]" />}
              </div>
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {active && (
            <div className="px-5">
              <WorkoutCard workout={active} isCompleted={false} overlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {isPending && (
        <p className="text-center font-mono text-[10px] text-[#555] mt-3 tracking-[0.12em]">
          MOVIENDO…
        </p>
      )}

      {/* Hint — only show when not dragging */}
      {!active && (
        <p className="text-center font-mono text-[9px] text-[#222] mt-4 tracking-[0.1em]">
          MANTÉN PRESIONADO PARA MOVER
        </p>
      )}

      {logOpen && <LogActivityModal onClose={() => setLogOpen(false)} />}
    </div>
  )
}
