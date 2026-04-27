import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function GET() {
  const checks: Record<string, { ok: boolean; error?: string }> = {}

  // Supabase: lightweight ping
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('users').select('id').limit(1)
    checks.supabase = error ? { ok: false, error: error.message } : { ok: true }
  } catch (e) {
    checks.supabase = { ok: false, error: String(e) }
  }

  // Anthropic: verify key is configured (no API call — avoids cost on every health check)
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY?.startsWith('sk-ant-')
  checks.anthropic = { ok: hasAnthropicKey, ...(!hasAnthropicKey && { error: 'ANTHROPIC_API_KEY missing or malformed' }) }

  const allOk = Object.values(checks).every(c => c.ok)

  return NextResponse.json(
    { status: allOk ? 'ok' : 'degraded', checks, ts: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  )
}
