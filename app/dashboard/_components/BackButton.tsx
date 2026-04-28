'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-[#141414] border border-[#222] text-white transition-opacity active:opacity-60"
    >
      <ChevronLeft size={18} strokeWidth={2} />
    </button>
  )
}
