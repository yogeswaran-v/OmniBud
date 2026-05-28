import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { PLAN_LIMITS } from '@/lib/constants'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabase()
  const body = await req.json()
  const { type, ...input } = body

  if (!['tts', 'clone', 'dub'].includes(type)) {
    return NextResponse.json({ error: 'Invalid job type' }, { status: 400 })
  }

  // Get user plan
  const { data: profile } = await admin.from('profiles').select('plan').eq('id', user.id).single()
  const plan = profile?.plan || 'free'
  const limits = PLAN_LIMITS[plan as 'free' | 'pro']

  // Check daily usage
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await admin.from('usage_log')
    .select('minutes_used')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const minutesUsed = usage?.minutes_used ?? 0
  if (minutesUsed >= limits.minutesPerDay) {
    return NextResponse.json({ error: 'daily_limit_reached' }, { status: 429 })
  }

  // Check queue slots
  const { count } = await admin.from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'processing'])

  if ((count ?? 0) >= limits.queueSlots) {
    return NextResponse.json({ error: 'queue_full — wait for current job to complete' }, { status: 429 })
  }

  // Create job in DB
  const { data: job, error: jobError } = await admin.from('jobs').insert({
    user_id: user.id,
    type,
    input: { ...input, watermark: limits.watermark },
    status: 'pending',
    progress: 0,
  }).select().single()

  if (jobError) return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })

  // Submit to GPU worker
  await submitToGPU(job.id, { type, ...input, watermark: limits.watermark })

  return NextResponse.json({ job_id: job.id })
}

async function submitToGPU(jobId: string, input: Record<string, unknown>) {
  const workerUrl = process.env.GPU_WORKER_URL || 'http://171.101.230.15:8000'

  try {
    const res = await fetch(`${workerUrl}/api/jobs/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, ...input }),
    })
    if (!res.ok) {
      console.error(`[GPU] Worker responded ${res.status} for job ${jobId}`)
    } else {
      console.log(`[GPU] Job ${jobId} submitted successfully`)
    }
  } catch (e) {
    console.error(`[GPU] Failed to submit job ${jobId}:`, e)
  }
}
