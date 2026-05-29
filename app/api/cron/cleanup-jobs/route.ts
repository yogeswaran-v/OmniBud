import { NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

// Called by Vercel Cron every 5 minutes
export async function GET() {
  const admin = createAdminSupabase()

  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 min ago

  const { data, error } = await admin
    .from('jobs')
    .update({ status: 'failed', error: 'Timed out — worker did not respond in time' })
    .in('status', ['pending', 'processing'])
    .lt('created_at', cutoff)
    .select('id')

  if (error) {
    console.error('[Cron] Cleanup failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const count = data?.length ?? 0
  if (count > 0) console.log(`[Cron] Reset ${count} stuck job(s)`)

  return NextResponse.json({ reset: count })
}
