'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Zap, Calendar, BarChart2, MoreHorizontal } from 'lucide-react'

const TABS = [
  { href: '/dashboard',          label: 'Today',    Icon: Zap            },
  { href: '/dashboard/plan',     label: 'Plan',     Icon: Calendar       },
  { href: '/dashboard/progress', label: 'Stats',    Icon: BarChart2      },
  { href: '/dashboard/more',     label: 'More',     Icon: MoreHorizontal },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1A1A1A]"
      style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="flex max-w-lg mx-auto" style={{ height: 52 }}>
        {TABS.map(({ href, label, Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] transition-opacity active:opacity-50"
              style={{ minHeight: 44 }}
            >
              <Icon
                size={22}
                className={active ? 'text-[#C8FF00]' : 'text-[#555555]'}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span className={`text-[10px] font-medium tracking-wide ${active ? 'text-[#C8FF00]' : 'text-[#555555]'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
