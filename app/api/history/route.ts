import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const type = req.nextUrl.searchParams.get('type') // 'tts' | 'transcription' | null (all)
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? 50), 100)

  const admin = createAdminSupabase()
  let query = admin
    .from('jobs')
    .select('id, type, status, progress, output_url, error, created_at, completed_at, input')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (type) query = query.eq('type', type)

  const { data: jobs, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Strip sensitive fields from input
  const safe = (jobs ?? []).map(j => {
    const { runpod_job_id: _r, watermark: _w, ...inputSafe } = (j.input as Record<string, unknown> ?? {})
    return { ...j, input: inputSafe }
  })

  return NextResponse.json({ jobs: safe })
}
