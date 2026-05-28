import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const jobId = req.nextUrl.searchParams.get('job_id')
  if (!jobId) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

  const admin = createAdminSupabase()
  const { data: job, error } = await admin.from('jobs')
    .select('id, status, progress, output_url, error, type, input')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (error || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // If still in-flight, check RunPod for latest state
  if ((job.status === 'pending' || job.status === 'processing') && job.input?.runpod_job_id) {
    const updated = await checkRunPodJob(job, admin)
    const { input: _input, ...safe } = updated
    return NextResponse.json(safe)
  }

  const { input: _input, ...safe } = job
  return NextResponse.json(safe)
}

async function checkRunPodJob(job: Record<string, any>, admin: ReturnType<typeof createAdminSupabase>) {
  const apiKey = process.env.RUNPOD_API_KEY
  const endpointId = process.env.RUNPOD_ENDPOINT_ID
  const runpodJobId = job.input.runpod_job_id

  try {
    const res = await fetch(`https://api.runpod.ai/v2/${endpointId}/status/${runpodJobId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!res.ok) return job

    const data = await res.json()

    if (data.status === 'COMPLETED') {
      const output = data.output

      if (output?.error) {
        await admin.from('jobs').update({ status: 'failed', error: output.error }).eq('id', job.id)
        return { ...job, status: 'failed', error: output.error }
      }

      // Decode audio and upload to Supabase storage
      const audioBuffer = Buffer.from(output.audio_base64, 'base64')
      await admin.storage.createBucket('audio', { public: true }).catch(() => {})

      const fileName = `${job.id}.mp3`
      const { error: uploadError } = await admin.storage
        .from('audio')
        .upload(fileName, audioBuffer, { contentType: 'audio/mpeg', upsert: true })

      if (uploadError) {
        console.error('[Storage] Upload failed:', uploadError)
        await admin.from('jobs').update({ status: 'failed', error: 'Storage upload failed' }).eq('id', job.id)
        return { ...job, status: 'failed', error: 'Storage upload failed' }
      }

      const { data: { publicUrl } } = admin.storage.from('audio').getPublicUrl(fileName)
      await admin.from('jobs').update({ status: 'completed', progress: 100, output_url: publicUrl }).eq('id', job.id)
      return { ...job, status: 'completed', progress: 100, output_url: publicUrl }
    }

    if (data.status === 'FAILED') {
      const errMsg = data.error || 'RunPod job failed'
      await admin.from('jobs').update({ status: 'failed', error: errMsg }).eq('id', job.id)
      return { ...job, status: 'failed', error: errMsg }
    }

    if (data.status === 'IN_PROGRESS') {
      await admin.from('jobs').update({ progress: 50 }).eq('id', job.id)
      return { ...job, progress: 50 }
    }

    return job
  } catch (e) {
    console.error('[RunPod] Status check failed:', e)
    return job
  }
}
