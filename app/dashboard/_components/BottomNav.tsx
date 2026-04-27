'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Calendar, BarChart2, MoreHorizontal } from 'lucide-react'

const TABS = [
  { href: '/dashboard',          label: 'Today',    Icon: Zap          },
  { href: '/dashboard/plan',     label: 'Plan',     Icon: Calendar     },
  { href: '/dashboard/progress', label: 'Progress', Icon: BarChart2    },
  { href: '/dashboard/more',     label: 'More',     Icon: MoreHorizontal },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-[#1A1A1A] z-50">
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-opacity"
            >
              <Icon
                size={22}
                className={active ? 'text-[#C8FF00]' : 'text-[#444444]'}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-[#C8FF00]' : 'text-[#444444]'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* safe area spacer */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
