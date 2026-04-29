'use client'

import { useState } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import LogActivityModal from './LogActivityModal'
import MoveWorkoutModal from './MoveWorkoutModal'

// ── Log Activity FAB ─────────────────────────────────────────────────────────

export function LogActivityFAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 text-[#C8FF00] transition-all active:scale-95"
      >
        <Plus size={13} strokeWidth={2.5} />
        <span className="font-mono text-[10px] font-bold tracking-[0.12em]">LOG</span>
      </button>

      {open && <LogActivityModal onClose={() => setOpen(false)} />}
    </>
  )
}

// ── Move Workout Button ───────────────────────────────────────────────────────

interface MoveProps {
  workoutId: string
  currentDate: string
  workoutLabel: string
}

export function MoveWorkoutButton({ workoutId, currentDate, workoutLabel }: MoveProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#1A1A1A] text-[#555] hover:text-white transition-colors"
      >
        <MoreHorizontal size={14} />
      </button>

      {open && (
        <MoveWorkoutModal
          workoutId={workoutId}
          currentDate={currentDate}
          workoutLabel={workoutLabel}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
