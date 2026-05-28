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

  // Check queue slots (active jobs)
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

  // Submit to Vast.ai / GPU worker
  // For now, we queue it and the worker polls — in production, POST to RunPod/Vast endpoint
  await submitToGPU(job.id, { type, ...input, watermark: limits.watermark })

  return NextResponse.json({ job_id: job.id })
}

async function submitToGPU(jobId: string, input: Record<string, unknown>) {
  const vastApiKey = process.env.VAST_API_KEY
  if (!vastApiKey || vastApiKey === 'placeholder') {
    // GPU not connected yet — mark as pending for manual processing
    console.log(`[GPU] Job ${jobId} queued (GPU not configured):`, input)
    return
  }

  // TODO: POST to your Vast.ai/RunPod worker endpoint
  // const workerUrl = process.env.GPU_WORKER_URL
  // await fetch(`${workerUrl}/run`, { method: 'POST', body: JSON.stringify({ job_id: jobId, ...input }) })
}
