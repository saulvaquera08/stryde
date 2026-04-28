import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Flag, TrendingUp, Dumbbell, Calendar, Settings, Bell, ChevronRight, Flame, Zap } from 'lucide-react'

const GOAL_LABELS: Record<string, string> = {
  hyrox:    'HYROX',
  '21k':    '21K Half Marathon',
  '5k':     '5K',
  '10k':    '10K',
  strength: 'Strength',
  recomp:   'Body recomp',
}

export default async function MorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, goalsRes, planRes, workoutsCountRes] = await Promise.all([
    supabase
      .from('users')
      .select('first_name, last_name, created_at')
      .eq('id', user.id)
      .single(),
    supabase.from('goals').select('type, race_date').eq('user_id', user.id),
    supabase
      .from('plans')
      .select('total_weeks, start_date, structure')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('completed_workouts')
      .select('id, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
  ])

  const profile = profileRes.data
  const goals   = goalsRes.data ?? []
  const plan    = planRes.data

  const firstName  = profile?.first_name ?? ''
  const lastName   = profile?.last_name  ?? ''
  const fullName   = [firstName, lastName].filter(Boolean).join(' ') || (user.email ?? 'Athlete')
  const initials   = [firstName[0], lastName[0]].filter(Boolean).join('').toUpperCase() || '?'
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : ''

  const allCompleted = workoutsCountRes.data ?? []
  const totalWorkouts = allCompleted.length

  // Compute streak
  let streak = 0
  if (allCompleted.length > 0) {
    // allCompleted is already DESC (most recent first) — do NOT reverse
    const dates = allCompleted.map(c => c.completed_at.split('T')[0])
    const today = new Date().toISOString().split('T')[0]
    let checkDate = today
    for (const d of dates) {
      if (d === checkDate) {
        streak++
        const prev = new Date(checkDate)
        prev.setDate(prev.getDate() - 1)
        checkDate = prev.toISOString().split('T')[0]
      } else if (d < checkDate) {
        break
      }
    }
  }

  // Total hours trained
  const totalHoursRes = await supabase
    .from('completed_workouts')
    .select('duration_seconds')
    .eq('user_id', user.id)
  const totalSeconds = (totalHoursRes.data ?? []).reduce((s, r) => s + (r.duration_seconds ?? 0), 0)
  const totalHours   = Math.round(totalSeconds / 3600)

  // Active week + phase
  let activeWeek = 1
  if (plan) {
    const planStart = new Date(plan.start_date + 'T00:00:00')
    const daysDiff  = Math.floor((new Date().getTime() - planStart.getTime()) / 86_400_000)
    activeWeek = daysDiff < 0 ? 1 : Math.min(Math.floor(daysDiff / 7) + 1, plan.total_weeks)
  }

  const now = Date.now()
  const upcomingGoals = goals
    .filter(g => g.race_date)
    .map(g => ({
      ...g,
      daysLeft: Math.ceil((new Date(g.race_date! + 'T12:00:00').getTime() - now) / 86_400_000),
    }))
    .filter(g => g.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const primaryGoal   = upcomingGoals[0] ?? null
  const secondaryGoal = upcomingGoals[1] ?? null

  return (
    <div className="px-5 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="inline-flex items-baseline font-black text-[22px] tracking-[0.04em] leading-none italic"
          style={{ transform: 'skewX(-6deg)' }}
        >
          <span className="text-white">STRYD</span>
          <span className="text-[#C8FF00]">E</span>
        </span>
        <Settings size={18} className="text-[#555]" strokeWidth={1.6} />
      </div>

      <div className="mb-6">
        <p className="text-[#888] text-[13px]">Account</p>
        <h1 className="text-[38px] font-bold text-white leading-none mt-1 tracking-tight">
          Profile<span className="text-[#C8FF00]">.</span>
        </h1>
      </div>

      {/* Profile card */}
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-5 mb-3 flex items-center gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-[76px] h-[76px] rounded-full p-[3px] flex items-center justify-center"
            style={{
              background: 'conic-gradient(from 180deg, #C8FF00, #FF6B35, #A78BFA, #C8FF00)',
            }}
          >
            <div className="w-full h-full rounded-full bg-[#141414] p-[2px] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] flex items-center justify-center font-bold text-[26px] text-white tracking-tight">
                {initials}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-bold tracking-[-0.01em] truncate">{fullName}</p>
          <p className="text-[#888] text-[12px] mt-0.5 truncate">{user.email}</p>
          {streak > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full bg-[#C8FF00]/10 text-[#C8FF00] font-mono text-[9px] font-bold tracking-[0.15em]">
              <Flame size={10} strokeWidth={2.4} />
              {streak} DAY STREAK
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { value: String(totalWorkouts), label: 'WORKOUTS' },
          { value: totalHours > 0 ? `${totalHours}h` : '0h',  label: 'TIME' },
          { value: memberSince.split(' ')[0] || '—', label: 'JOINED' },
        ].map(s => (
          <div key={s.label} className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-3 text-center">
            <p className="font-mono text-[22px] font-bold tracking-[-0.02em]">{s.value}</p>
            <p className="font-mono text-[9px] font-bold tracking-[0.15em] text-[#888] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* My plan */}
      {(primaryGoal || secondaryGoal || plan) && (
        <>
          <SectionLabel icon={<Flag size={11} />}>MY PLAN</SectionLabel>
          <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] p-4 mb-3">
            {primaryGoal && (
              <div className="flex items-center gap-3 pb-[14px] border-b border-[#1F1F1F]">
                <div className="w-[38px] h-[38px] rounded-xl bg-[#FF6B35]/10 border border-[#FF6B35]/20 flex items-center justify-center shrink-0">
                  <Flag size={18} className="text-[#FF6B35]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#444]">PRIMARY GOAL</p>
                  <p className="text-[16px] font-bold mt-0.5">{GOAL_LABELS[primaryGoal.type] ?? primaryGoal.type.toUpperCase()}</p>
                  <p className="text-[12px] text-[#888] mt-0.5">{primaryGoal.daysLeft}d remaining</p>
                </div>
                <ChevronRight size={16} className="text-[#444]" strokeWidth={2} />
              </div>
            )}
            {secondaryGoal && (
              <div className={`flex items-center gap-3 ${primaryGoal ? 'pt-[14px] pb-[14px]' : 'pb-[14px]'} border-b border-[#1F1F1F]`}>
                <div className="w-[38px] h-[38px] rounded-xl bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center shrink-0">
                  <TrendingUp size={18} className="text-[#C8FF00]" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <p className="font-mono text-[9px] font-bold tracking-[0.2em] text-[#444]">SECONDARY</p>
                  <p className="text-[16px] font-bold mt-0.5">{GOAL_LABELS[secondaryGoal.type] ?? secondaryGoal.type.toUpperCase()}</p>
                  <p className="text-[12px] text-[#888] mt-0.5">{secondaryGoal.daysLeft}d remaining</p>
                </div>
                <ChevronRight size={16} className="text-[#444]" strokeWidth={2} />
              </div>
            )}
            {plan && (
              <div className={`flex justify-between items-center ${(primaryGoal || secondaryGoal) ? 'pt-[14px]' : ''}`}>
                <p className="text-[13px] text-[#888]">Plan length</p>
                <p className="font-mono text-[13px] font-bold">{plan.total_weeks} weeks</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Actions */}
      <SectionLabel icon={<Zap size={11} />}>ACTIONS</SectionLabel>
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] overflow-hidden mb-3">
        <SettingRow href="/onboarding" icon={<Calendar size={16} className="text-[#888]" strokeWidth={1.8} />} label="Regenerate plan" />
        <SettingRow href="/dashboard/progress" icon={<Dumbbell size={16} className="text-[#888]" strokeWidth={1.8} />} label="View stats" last />
      </div>

      {/* Settings */}
      <SectionLabel icon={<Settings size={11} />}>SETTINGS</SectionLabel>
      <div className="bg-[#141414] border border-[#1F1F1F] rounded-[22px] overflow-hidden mb-5">
        <SettingRowStatic icon={<Bell size={16} className="text-[#888]" strokeWidth={1.8} />} label="Notifications" value="On" />
        <SettingRowStatic icon={<Settings size={16} className="text-[#888]" strokeWidth={1.8} />} label="Units" value="Metric" last />
      </div>

      {/* Footer */}
      <div className="flex flex-col items-center gap-2.5 pt-5 border-t border-[#1F1F1F]">
        <p className="font-mono text-[10px] tracking-[0.2em] text-[#444] font-bold">STRYDE · v1.0.0</p>
        <div className="flex gap-3.5 text-[12px] text-[#888]">
          <span className="cursor-pointer hover:text-white transition-colors">Help</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
          <span>·</span>
          <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
        </div>
        <form action="/auth/signout" method="post" className="mt-2">
          <button
            type="submit"
            className="text-[13px] text-[#FF6B35] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  )
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-1 pb-[10px] pt-1">
      <span className="text-[#888]">{icon}</span>
      <span className="font-mono text-[10px] tracking-[0.2em] text-[#888] font-bold">{children}</span>
    </div>
  )
}

function SettingRow({ icon, label, href, last }: { icon: React.ReactNode; label: string; href: string; last?: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-[14px] cursor-pointer hover:bg-white/5 transition-colors ${
        !last ? 'border-b border-[#1F1F1F]' : ''
      }`}
    >
      {icon}
      <span className="flex-1 text-[14px] font-medium text-white">{label}</span>
      <ChevronRight size={14} className="text-[#444]" strokeWidth={2} />
    </a>
  )
}

function SettingRowStatic({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-[14px] ${!last ? 'border-b border-[#1F1F1F]' : ''}`}>
      {icon}
      <span className="flex-1 text-[14px] font-medium">{label}</span>
      <span className="font-mono text-[12px] text-[#888]">{value}</span>
    </div>
  )
}
