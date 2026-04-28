'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

const PAGE_TITLES: Record<string, string | null> = {
  '/dashboard':          null,
  '/dashboard/plan':     'PLAN',
  '/dashboard/progress': 'PROGRESS',
  '/dashboard/more':     'MORE',
}

export default function Header() {
  const pathname = usePathname()

  const isWorkout = pathname.startsWith('/dashboard/workout/')
  const staticTitle = PAGE_TITLES[pathname] ?? null
  const isMainPage = pathname === '/dashboard' || staticTitle !== null

  if (isMainPage && staticTitle === null) {
    // Today → logo only
    return (
      <header className="h-[52px] flex items-center justify-center border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <span className="text-white font-bold tracking-[0.25em] text-base">STRYDE</span>
      </header>
    )
  }

  if (isMainPage && staticTitle) {
    return (
      <header className="h-[52px] flex items-center justify-center border-b border-[#1A1A1A] bg-[#0A0A0A]">
        <span className="text-white font-bold tracking-[0.2em] text-sm">{staticTitle}</span>
      </header>
    )
  }

  if (isWorkout) {
    return (
      <header className="h-[52px] flex items-center border-b border-[#1A1A1A] bg-[#0A0A0A] px-4 relative">
        <Link
          href="/dashboard/plan"
          className="absolute left-4 flex items-center gap-0.5 text-white transition-opacity active:opacity-60"
        >
          <ChevronLeft size={20} strokeWidth={2} />
        </Link>
        <span className="absolute left-0 right-0 text-center text-white font-bold tracking-[0.2em] text-sm pointer-events-none">
          WORKOUT
        </span>
      </header>
    )
  }

  return (
    <header className="h-[52px] flex items-center justify-center border-b border-[#1A1A1A] bg-[#0A0A0A]">
      <span className="text-white font-bold tracking-[0.25em] text-base">STRYDE</span>
    </header>
  )
}
