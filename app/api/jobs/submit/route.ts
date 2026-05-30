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

  if (!['tts', 'clone', 'dub', 'transcription'].includes(type)) {
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

  if (type === 'tts') {
    if (process.env.OMNIVOICE_LOCAL_URL) {
      submitToLocalOmniVoice(job.id, input).catch(console.error)
    } else {
      await submitToRunPod(job.id, { type, ...input })
    }
  } else if (type === 'transcription') {
    submitTranscription(job.id, input).catch(console.error)
  }

  return NextResponse.json({ job_id: job.id })
}

async function submitToLocalOmniVoice(jobId: string, input: Record<string, unknown>) {
  const baseUrl = process.env.OMNIVOICE_LOCAL_URL!
  const admin = createAdminSupabase()

  try {
    await admin.from('jobs').update({ status: 'processing', progress: 10 }).eq('id', jobId)

    const form = new URLSearchParams()
    form.set('text', String(input.text ?? ''))
    form.set('language', String(input.language ?? 'English'))

    const res = await fetch(`${baseUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })

    if (!res.ok) {
      await admin.from('jobs').update({ status: 'failed', error: `OmniVoice error ${res.status}` }).eq('id', jobId)
      return
    }

    const audioBuffer = Buffer.from(await res.arrayBuffer())
    await admin.storage.createBucket('audio', { public: true }).catch(() => {})
    const fileName = `${jobId}.mp3`
    const { error: uploadError } = await admin.storage
      .from('audio')
      .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

    if (uploadError) {
      await admin.from('jobs').update({ status: 'failed', error: 'Storage upload failed' }).eq('id', jobId)
      return
    }

    const { data: { publicUrl } } = admin.storage.from('audio').getPublicUrl(fileName)
    await admin.from('jobs').update({ status: 'completed', progress: 100, output_url: publicUrl }).eq('id', jobId)
  } catch (e) {
    console.error('[LocalOmniVoice] Error:', e)
    await admin.from('jobs').update({ status: 'failed', error: 'Local OmniVoice error' }).eq('id', jobId)
  }
}

function validateAudioUrl(raw: string): void {
  let parsed: URL
  try { parsed = new URL(raw) } catch { throw new Error('Invalid audio URL') }
  if (parsed.protocol !== 'https:') throw new Error('audio_url must use https://')
  const host = parsed.hostname.toLowerCase()
  // Block loopback, link-local (AWS IMDS), and RFC-1918 private ranges
  if (
    host === 'localhost' ||
    /^127\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2[0-9]|3[01])\./.test(host) ||
    /^::1$/.test(host) ||
    host === '[::1]'
  ) {
    throw new Error('audio_url points to a private or reserved address')
  }
}

async function submitTranscription(jobId: string, input: Record<string, unknown>) {
  const whisperUrl = process.env.WHISPER_LOCAL_URL
  const admin = createAdminSupabase()

  try {
    await admin.from('jobs').update({ status: 'processing', progress: 10 }).eq('id', jobId)

    const audioUrl = String(input.audio_url ?? '')
    if (!audioUrl) {
      await admin.from('jobs').update({ status: 'failed', error: 'No audio_url provided' }).eq('id', jobId)
      return
    }

    try {
      validateAudioUrl(audioUrl)
    } catch (e) {
      await admin.from('jobs').update({ status: 'failed', error: String(e instanceof Error ? e.message : e) }).eq('id', jobId)
      return
    }

    if (!whisperUrl) {
      await admin.from('jobs').update({ status: 'failed', error: 'Transcription service not configured (set WHISPER_LOCAL_URL)' }).eq('id', jobId)
      return
    }

    // Fetch audio from URL
    const audioRes = await fetch(audioUrl)
    if (!audioRes.ok) {
      await admin.from('jobs').update({ status: 'failed', error: 'Could not fetch audio file' }).eq('id', jobId)
      return
    }
    const audioBlob = await audioRes.blob()

    // Submit to Whisper ASR
    const formData = new FormData()
    formData.append('audio_file', audioBlob, 'audio.mp3')
    const lang = String(input.language ?? 'en').toLowerCase().slice(0, 2)
    const whisperRes = await fetch(
      `${whisperUrl}/asr?task=transcribe&language=${lang}&output=json`,
      { method: 'POST', body: formData }
    )

    if (!whisperRes.ok) {
      await admin.from('jobs').update({ status: 'failed', error: `Whisper error ${whisperRes.status}` }).eq('id', jobId)
      return
    }

    const result = await whisperRes.json()
    const transcript = result.text ?? ''

    // Store transcript as a text file in storage
    await admin.storage.createBucket('transcripts', { public: true }).catch(() => {})
    const fileName = `${jobId}.txt`
    const { error: uploadError } = await admin.storage
      .from('transcripts')
      .upload(fileName, Buffer.from(transcript, 'utf-8'), { contentType: 'text/plain', upsert: true })

    if (uploadError) {
      // Fall back: store transcript directly in input field
      await admin.from('jobs').update({
        status: 'completed',
        progress: 100,
        output_url: null,
        input: { ...input, transcript },
      }).eq('id', jobId)
      return
    }

    const { data: { publicUrl } } = admin.storage.from('transcripts').getPublicUrl(fileName)
    await admin.from('jobs').update({
      status: 'completed',
      progress: 100,
      output_url: publicUrl,
      input: { ...input, transcript },
    }).eq('id', jobId)
  } catch (e) {
    console.error('[Transcription] Error:', e)
    await admin.from('jobs').update({ status: 'failed', error: 'Transcription failed' }).eq('id', jobId)
  }
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
