import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminSupabase()
  const { data: job } = await admin
    .from('jobs')
    .select('id, type, status, output_url, created_at, input')
    .eq('id', params.id)
    .eq('status', 'completed')
    .in('type', ['tts', 'transcription'])
    .single()

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { watermark: _w, runpod_job_id: _r, ...inputSafe } = (job.input as Record<string, unknown>) ?? {}
  return NextResponse.json({ id: job.id, type: job.type, output_url: job.output_url, created_at: job.created_at, input: inputSafe })
}
