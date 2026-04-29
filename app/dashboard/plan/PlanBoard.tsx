'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  MouseSensor, TouchSensor, useSensor, useSensors, pointerWithin,
} from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import Link from 'next/link'
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

const DOW_SHORT = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

function mainBlock(blocks: any[]): any {
  return blocks?.find(b => b?.label !== 'Calentamiento') ?? blocks?.[0]
}

function WorkoutIcon({ dayType, size = 15 }: { dayType: string; size?: number }) {
  if (dayType === 'hyrox_day' || dayType === 'race_day') return <Zap size={size} strokeWidth={2} />
  if (dayType === 'run_day')                             return <TrendingUp size={size} strokeWidth={2} />
  if (dayType.includes('strength'))                      return <Dumbbell size={size} strokeWidth={2} />
  return <Activity size={size} strokeWidth={2} />
}

// ── Draggable card ────────────────────────────────────────────────────────────

function WorkoutCard({
  workout, isCompleted, overlay = false,
}: {
  workout: WorkoutData; isCompleted: boolean; overlay?: boolean
}) {
  const router = useRouter()
  const color  = getDayTypeColor(workout.day_type)
  const block  = mainBlock(workout.blocks)
  const name   = (block?.label as string) ?? workout.day_type

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id:       workout.id,
    data:     { workout },
    disabled: isCompleted,
  })

  const style = transform && !overlay
    ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)`, zIndex: 50 }
    : undefined

  const handleTap = () => {
    if (!isDragging) router.push(`/dashboard/workout/${workout.id}`)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleTap}
      className={`rounded-2xl border p-3 cursor-pointer select-none touch-none transition-all ${
        overlay
          ? 'shadow-[0_8px_32px_rgba(0,0,0,0.6)] scale-[1.04] rotate-1 border-[#333] bg-[#1E1E1E]'
          : isDragging
          ? 'opacity-25 border-[#222] bg-[#141414]'
          : 'border-[#222] bg-[#141414] active:opacity-70'
      }`}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between mb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18`, color }}
        >
          <WorkoutIcon dayType={workout.day_type} />
        </div>
        {isCompleted && !overlay && (
          <div className="w-5 h-5 rounded-full bg-[#C8FF00]/20 flex items-center justify-center">
            <Check size={10} className="text-[#C8FF00]" strokeWidth={3} />
          </div>
        )}
        {!isCompleted && !overlay && (
          <span className="font-mono text-[9px] text-[#444] font-bold tracking-[0.08em]">
            {workout.duration_minutes ?? 0}m
          </span>
        )}
      </div>

      {/* Name */}
      <p className="text-white text-[11px] font-semibold leading-tight" style={{ WebkitLineClamp: 3, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {name}
      </p>

      {!isCompleted && !overlay && (
        <p className="font-mono text-[9px] text-[#444] mt-1.5 tracking-[0.08em]">
          {workout.day_type === 'run_day' ? 'CORRER' : workout.day_type.includes('strength') ? 'FUERZA' : 'HYROX'}
        </p>
      )}
    </div>
  )
}

// ── Droppable day column ──────────────────────────────────────────────────────

function DayColumn({
  date, dow, workout, isCompleted, isToday, isDraggingActive,
}: {
  date: string; dow: string; workout: WorkoutData | null;
  isCompleted: boolean; isToday: boolean; isDraggingActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: date })
  const day = new Date(date + 'T12:00:00').getDate()

  return (
    <div className="flex flex-col gap-2.5" style={{ width: 148, flexShrink: 0 }}>
      {/* Day header */}
      <div className={`pb-2 border-b text-center ${isToday ? 'border-[#C8FF00]/30' : 'border-[#1A1A1A]'}`}>
        <p className={`font-mono text-[9px] font-bold tracking-[0.18em] ${isToday ? 'text-[#C8FF00]' : 'text-[#444]'}`}>
          {dow}
        </p>
        <p className={`text-[22px] font-bold leading-tight mt-0.5 ${isToday ? 'text-[#C8FF00]' : 'text-[#555]'}`}>
          {day}
        </p>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[130px] rounded-2xl transition-all duration-150 ${
          isOver
            ? 'bg-[#C8FF00]/6 ring-1 ring-[#C8FF00]/30 ring-inset'
            : isDraggingActive
            ? 'ring-1 ring-[#333] ring-inset bg-[#141414]/50'
            : ''
        }`}
      >
        {workout && !workout.is_rest_day ? (
          <WorkoutCard workout={workout} isCompleted={isCompleted} />
        ) : (
          <div className={`h-full min-h-[120px] rounded-2xl border-dashed border flex items-center justify-center transition-colors ${
            isOver ? 'border-[#C8FF00]/40' : isDraggingActive ? 'border-[#2A2A2A]' : 'border-[#1E1E1E]'
          }`}>
            {isOver ? (
              <p className="font-mono text-[9px] text-[#C8FF00]/60 tracking-[0.12em]">SOLTAR AQUÍ</p>
            ) : (
              <p className="font-mono text-[9px] text-[#2A2A2A] tracking-[0.12em]">DESCANSO</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────

export default function PlanBoard({ dates, workouts, completedIds, weekOffset, planMeta }: Props) {
  const scrollRef        = useRef<HTMLDivElement>(null)
  const today            = new Date().toISOString().split('T')[0]
  const [logOpen, setLogOpen]     = useState(false)
  const [active, setActive]       = useState<WorkoutData | null>(null)
  const [localWorkouts, setLocal] = useState<WorkoutData[]>(workouts)
  const [isPending, startT]       = useTransition()

  // Keep local state in sync when server data changes (week navigation)
  useEffect(() => { setLocal(workouts) }, [workouts])

  // Scroll to today's column on mount
  useEffect(() => {
    const todayIdx = dates.indexOf(today)
    if (todayIdx >= 0 && scrollRef.current) {
      const colW = 148 + 12 // column + gap
      scrollRef.current.scrollLeft = Math.max(0, todayIdx * colW - 20)
    }
  }, [dates, today])

  const completedSet  = new Set(completedIds)
  const byDate        = Object.fromEntries(localWorkouts.map(w => [w.scheduled_date, w]))
  const activeTraining = localWorkouts.filter(w => !w.is_rest_day)
  const weekDone      = activeTraining.filter(w => completedSet.has(w.id)).length

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

    // Optimistic: swap dates in local state
    setLocal(prev => prev.map(w =>
      w.id === workout.id ? { ...w, scheduled_date: newDate } : w
    ))

    startT(async () => {
      try {
        await moveWorkout(workout.id, newDate)
      } catch {
        setLocal(workouts) // rollback on error
      }
    })
  }

  const monthLabel = new Date(dates[0] + 'T12:00:00')
    .toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

  return (
    <div className="pt-5 pb-4 select-none">
      {/* Header */}
      <div className="flex justify-between items-center px-5 mb-4">
        <div>
          <p className="font-mono text-[11px] text-[#444] tracking-[0.18em] mb-0.5 uppercase">{monthLabel}</p>
          <h1 className="text-[28px] font-bold text-white leading-none tracking-tight">Plan</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/plan?week=${weekOffset - 1}`}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-[#888] active:opacity-50"
          >
            <ChevronLeft size={16} />
          </Link>
          <Link
            href={`/dashboard/plan?week=${weekOffset + 1}`}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-[#888] active:opacity-50"
          >
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Phase + progress + log button */}
      <div className="flex items-center justify-between px-5 mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {planMeta && (
            <span
              className="font-mono text-[10px] font-bold tracking-[0.18em] px-[10px] py-[5px] rounded-full"
              style={{ background: `${planMeta.phaseColor}15`, color: planMeta.phaseColor }}
            >
              W{planMeta.activeWeek}/{planMeta.totalWeeks}
              {planMeta.phaseLabel ? ` · ${planMeta.phaseLabel}` : ''}
            </span>
          )}
          {activeTraining.length > 0 && (
            <span className="font-mono text-[10px] text-[#444]">
              {weekDone}/{activeTraining.length} listos
            </span>
          )}
        </div>
        <button
          onClick={() => setLogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 text-[#C8FF00] active:scale-95 transition-transform"
          style={{ minHeight: 36 }}
        >
          <Plus size={13} strokeWidth={2.5} />
          <span className="font-mono text-[10px] font-bold tracking-[0.12em]">LOG</span>
        </button>
      </div>

      {/* Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto px-5 pb-3"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {dates.map((date, i) => {
            const workout     = byDate[date] ?? null
            const isCompleted = workout ? completedSet.has(workout.id) : false
            const isToday     = date === today
            return (
              <div key={date} style={{ scrollSnapAlign: 'start' }}>
                <DayColumn
                  date={date}
                  dow={DOW_SHORT[i]}
                  workout={workout}
                  isCompleted={isCompleted}
                  isToday={isToday}
                  isDraggingActive={active !== null}
                />
              </div>
            )
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {active && <WorkoutCard workout={active} isCompleted={false} overlay />}
        </DragOverlay>
      </DndContext>

      {isPending && (
        <p className="text-center font-mono text-[10px] text-[#555] mt-1 px-5 tracking-[0.1em]">
          MOVIENDO…
        </p>
      )}

      {/* Hint */}
      <p className="text-center font-mono text-[9px] text-[#2A2A2A] mt-2 px-5 tracking-[0.1em]">
        MANTÉN PRESIONADO PARA MOVER
      </p>

      {logOpen && <LogActivityModal onClose={() => setLogOpen(false)} />}
    </div>
  )
}
