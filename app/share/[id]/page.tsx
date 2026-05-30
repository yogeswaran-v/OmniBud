import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import WaveformPlayer from '@/components/ui/WaveformPlayer'

interface ShareData {
  id: string
  type: string
  output_url: string
  created_at: string
  input: Record<string, unknown>
}

async function getShare(id: string): Promise<ShareData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  try {
    const res = await fetch(`${baseUrl}/api/share/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const share = await getShare(params.id)
  if (!share) return { title: 'OmniDub' }

  const text = typeof share.input?.text === 'string' ? share.input.text.slice(0, 100) : null
  const desc = text ? `"${text}"` : 'Listen to this AI-generated voiceover on OmniDub.'

  return {
    title: 'listen on OmniDub',
    description: desc,
    openGraph: {
      title: 'listen on OmniDub',
      description: desc,
      type: 'website',
      audio: share.output_url ? [{ url: share.output_url, type: 'audio/mpeg' }] : undefined,
    },
    twitter: {
      card: 'summary',
      title: 'listen on OmniDub',
      description: desc,
    },
  }
}

export default async function SharePage({ params }: { params: { id: string } }) {
  const share = await getShare(params.id)
  if (!share) notFound()

  const text = typeof share.input?.text === 'string' ? share.input.text : null
  const transcript = typeof share.input?.transcript === 'string' ? share.input.transcript : null
  const isTTS = share.type === 'tts'
  const dateStr = new Date(share.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 560, animation: 'fadeIn 0.35s ease' }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
          <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: '#0a0a0a', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>OmniDub</span>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(15,15,15,0.9)',
          border: '1px solid var(--border-2)',
          borderRadius: 20,
          padding: 28,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            {isTTS ? 'ai voiceover' : 'transcription'} · {dateStr}
          </div>

          {/* Text excerpt */}
          {text && (
            <blockquote style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(16px, 3vw, 22px)',
              fontWeight: 300,
              fontStyle: 'italic',
              color: 'var(--text)',
              lineHeight: 1.55,
              marginBottom: 24,
              borderLeft: '2px solid var(--accent)',
              paddingLeft: 16,
            }}>
              &ldquo;{text.length > 200 ? text.slice(0, 200) + '…' : text}&rdquo;
            </blockquote>
          )}

          {/* Transcript text */}
          {transcript && !isTTS && (
            <div style={{
              padding: '14px 16px',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              fontSize: 13,
              color: 'var(--text-2)',
              lineHeight: 1.7,
              marginBottom: 20,
              maxHeight: 200,
              overflowY: 'auto',
            }}>
              {transcript}
            </div>
          )}

          {/* Player */}
          {isTTS && share.output_url && (
            <div style={{ marginBottom: 20 }}>
              <WaveformPlayer src={share.output_url} />
            </div>
          )}

          {/* Download */}
          {isTTS && share.output_url && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <a
                href={share.output_url}
                download={`omnidub-${share.id}.mp3`}
                style={{
                  fontSize: 12,
                  color: 'var(--text-3)',
                  padding: '7px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
              >
                ↓ download mp3
              </a>
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>make your own</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>free · no credit card · 5 min/day</div>
            </div>
            <Link href="/auth/signup" className="btn-accent" style={{ fontSize: 13, padding: '9px 18px', whiteSpace: 'nowrap' }}>
              try OmniDub free →
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--text-4)' }}>
          made with <Link href="/" style={{ color: 'var(--accent)' }}>OmniDub</Link>
        </div>
      </div>
    </main>
  )
}
