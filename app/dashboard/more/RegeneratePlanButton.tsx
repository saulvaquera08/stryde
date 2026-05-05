'use client'

import { useState, useTransition } from 'react'
import { RefreshCw, ChevronRight, Loader2 } from 'lucide-react'
import { regeneratePlan } from '../settings/actions'

export default function RegeneratePlanButton() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      try {
        await regeneratePlan()
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al regenerar el plan')
      }
    })
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="flex items-center gap-3 px-4 py-[14px] w-full text-left hover:bg-white/5 transition-colors disabled:opacity-60 border-b border-[#1F1F1F]"
      >
        {isPending
          ? <Loader2 size={16} className="text-[#888] animate-spin shrink-0" strokeWidth={1.8} />
          : <RefreshCw size={16} className="text-[#888] shrink-0" strokeWidth={1.8} />}
        <span className="flex-1 text-[14px] font-medium text-white">
          {isPending ? 'Regenerando plan...' : 'Regenerate plan'}
        </span>
        {!isPending && <ChevronRight size={14} className="text-[#444]" strokeWidth={2} />}
      </button>
      {error && (
        <p className="px-4 py-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
