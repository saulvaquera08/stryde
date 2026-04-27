'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import CompleteModal from './CompleteModal'

interface Props {
  workoutId: string
  alreadyDone: boolean
}

export default function WorkoutClient({ workoutId, alreadyDone }: Props) {
  const [showModal, setShowModal] = useState(false)

  if (alreadyDone) {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] font-semibold py-4 rounded-xl">
        <CheckCircle2 size={18} className="text-[#C8FF00]" />
        Completado
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-[#C8FF00] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        Completar workout
      </button>
      {showModal && (
        <CompleteModal
          workoutId={workoutId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
