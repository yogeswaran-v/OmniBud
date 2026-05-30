import { NextRequest, NextResponse } from 'next/server'
import { VOICES, VOICE_PREVIEW_TEXTS } from '@/lib/constants'

const cache = new Map<string, { url: string; ts: number }>()
const TTL = 60 * 60 * 1000 // 1 hour

export async function GET(req: NextRequest) {
  const voiceId = req.nextUrl.searchParams.get('id')
  if (!voiceId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const voice = VOICES.find(v => v.id === voiceId)
  if (!voice) return NextResponse.json({ error: 'Unknown voice' }, { status: 404 })

  // Return cached URL if fresh
  const cached = cache.get(voiceId)
  if (cached && Date.now() - cached.ts < TTL) return NextResponse.json({ url: cached.url })

  const omnivoiceUrl = process.env.OMNIVOICE_LOCAL_URL
  if (!omnivoiceUrl) return NextResponse.json({ error: 'OmniVoice not configured' }, { status: 503 })

  try {
    const text = VOICE_PREVIEW_TEXTS[voiceId] ?? `Hi, I'm ${voice.name}. This is my voice.`
    const form = new URLSearchParams({ text, language: 'English' })
    const res = await fetch(`${omnivoiceUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    if (!res.ok) return NextResponse.json({ error: 'Generation failed' }, { status: 502 })

    const buf = await res.arrayBuffer()
    // Stream back directly (no Supabase storage needed for previews)
    cache.set(voiceId, { url: `data:audio/mpeg;base64,${Buffer.from(buf).toString('base64')}`, ts: Date.now() })
    return new NextResponse(buf, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=3600' } })
  } catch {
    return NextResponse.json({ error: 'Preview generation failed' }, { status: 500 })
  }
}
