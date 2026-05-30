import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabase } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = createAdminSupabase()
  const { data: job } = await admin
    .from('jobs')
    .select('id, type, status, output_url, created_at, input')
    .eq('id', params.id)
    .eq('status', 'completed')
    .eq('is_shared', true)
    .in('type', ['tts', 'transcription'])
    .single()

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Allowlist only safe fields — never expose audio_url, transcript, or internal IDs
  const input = (job.input as Record<string, unknown>) ?? {}
  const safeInput: Record<string, unknown> = {}
  if (typeof input.text === 'string') safeInput.text = input.text
  if (typeof input.language === 'string') safeInput.language = input.language
  if (typeof input.voiceId === 'string') safeInput.voiceId = input.voiceId

  return NextResponse.json({
    id: job.id,
    type: job.type,
    output_url: job.output_url,
    created_at: job.created_at,
    input: safeInput,
  })
}
