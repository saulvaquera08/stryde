import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: plan } = await supabase
    .from('plans')
    .select('id, start_date, end_date, total_weeks')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full">
        <div className="w-16 h-16 rounded-2xl bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚡</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">
          ¡Tu plan está listo!
        </h1>
        <p className="text-[#888888] text-sm leading-relaxed mb-2">
          Plan de {plan?.total_weeks ?? 6} semanas generado.
        </p>
        {plan && (
          <p className="text-[#555555] text-xs mb-8">
            {new Date(plan.start_date + 'T12:00:00').toLocaleDateString('es-MX', {
              day: 'numeric', month: 'long'
            })}
            {' — '}
            {new Date(plan.end_date + 'T12:00:00').toLocaleDateString('es-MX', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        )}

        <div className="bg-[#141414] border border-[#222222] rounded-2xl p-5 mb-6">
          <p className="text-[#C8FF00] text-xs font-semibold uppercase tracking-widest mb-2">
            Próximos pasos
          </p>
          <p className="text-[#888888] text-sm leading-relaxed">
            La app completa (Today, Plan, Progress y AI Coach) estará disponible pronto. Fase 4 en construcción.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="text-[#555555] text-xs hover:text-[#888888] transition-colors"
        >
          ← Volver al onboarding
        </Link>
      </div>
    </div>
  )
}
