import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut, User, RefreshCcw } from 'lucide-react'

export default async function MorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', user.id)
    .single()

  const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || user.email

  return (
    <div className="px-5 pt-12">
      <h1 className="text-2xl font-bold text-white mb-8">Más</h1>

      {/* Profile */}
      <div className="bg-[#141414] border border-[#222222] rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center">
          <User size={20} className="text-[#C8FF00]" />
        </div>
        <div>
          <p className="text-white font-semibold">{name}</p>
          <p className="text-[#555555] text-xs">{user.email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <a
          href="/onboarding"
          className="flex items-center gap-3 bg-[#141414] border border-[#222222] rounded-2xl p-4 text-[#888888] hover:text-white transition-colors"
        >
          <RefreshCcw size={18} />
          <span className="text-sm font-medium">Regenerar plan</span>
        </a>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 bg-[#141414] border border-[#222222] rounded-2xl p-4 text-[#888888] hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </div>
  )
}
