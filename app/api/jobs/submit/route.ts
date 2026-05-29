import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { PLAN_LIMITS } from '@/lib/constants'

export const maxDuration = 30

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

  if (type === 'clone' || type === 'dub') {
    return NextResponse.json({ error: 'Coming soon — dubbing and voice cloning are not yet available' }, { status: 400 })
  }

  const { data: profile } = await admin.from('profiles').select('plan').eq('id', user.id).single()
  const plan = profile?.plan || 'free'
  const limits = PLAN_LIMITS[plan as 'free' | 'pro']

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

  // Auto-reset jobs stuck for more than 10 minutes
  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  await admin.from('jobs')
    .update({ status: 'failed', error: 'Timed out — worker did not respond' })
    .eq('user_id', user.id)
    .in('status', ['pending', 'processing'])
    .lt('created_at', cutoff)

  const { count } = await admin.from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['pending', 'processing'])

  if ((count ?? 0) >= limits.queueSlots) {
    return NextResponse.json({ error: 'queue_full — wait for current job to complete' }, { status: 429 })
  }

  const { data: job, error: jobError } = await admin.from('jobs').insert({
    user_id: user.id,
    type,
    input: { ...input, watermark: limits.watermark },
    status: 'pending',
    progress: 0,
  }).select().single()

  if (jobError) return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })

  // Submit to RunPod and wait for the job ID to be stored before returning
  await submitToRunPod(job.id, { type, ...input })

  return NextResponse.json({ job_id: job.id })
}

async function submitToRunPod(jobId: string, input: Record<string, unknown>) {
  const apiKey = process.env.RUNPOD_API_KEY
  const endpointId = process.env.RUNPOD_ENDPOINT_ID
  const admin = createAdminSupabase()

  try {
    const res = await fetch(`https://api.runpod.ai/v2/${endpointId}/run`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          text: input.text,
          language: input.language || 'English',
        },
      }),
    })

    if (!res.ok) {
      console.error(`[RunPod] Submit failed ${res.status}`)
      await admin.from('jobs').update({ status: 'failed', error: `RunPod error ${res.status}` }).eq('id', jobId)
      return
    }

    const data = await res.json()
    const runpodJobId = data.id

    await admin.from('jobs').update({
      status: 'processing',
      progress: 10,
      input: { ...input, runpod_job_id: runpodJobId },
    }).eq('id', jobId)

    console.log(`[RunPod] Job ${jobId} submitted as RunPod job ${runpodJobId}`)
  } catch (e) {
    console.error(`[RunPod] Failed to submit job ${jobId}:`, e)
    await admin.from('jobs').update({ status: 'failed', error: 'RunPod unreachable' }).eq('id', jobId)
  }
}
