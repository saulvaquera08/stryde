import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from './_components/BottomNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <main
        className="max-w-lg mx-auto"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 68px)',
        }}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
