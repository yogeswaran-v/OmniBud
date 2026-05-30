import { NextRequest, NextResponse } from 'next/server'

// In-memory rate limit: 1 demo/IP/hour (resets on server restart; fine for dev + edge)
const rateLimitMap = new Map<string, number>()
const LIMIT_MS = 60 * 60 * 1000

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  const lastGen = rateLimitMap.get(ip) ?? 0
  const remaining = LIMIT_MS - (Date.now() - lastGen)

  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60000)
    return NextResponse.json({ error: 'rate_limited', retryAfterMinutes: mins }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const text = String(body.text ?? '').trim().slice(0, 300)
  if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })

  const omnivoiceUrl = process.env.OMNIVOICE_LOCAL_URL
  if (!omnivoiceUrl) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

  try {
    const form = new URLSearchParams({ text, language: 'English' })
    const res = await fetch(`${omnivoiceUrl}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
    if (!res.ok) return NextResponse.json({ error: 'Generation failed' }, { status: 502 })

    rateLimitMap.set(ip, Date.now())
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': 'inline; filename="omnidub-demo-watermarked.mp3"',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
