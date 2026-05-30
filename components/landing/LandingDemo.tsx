'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import WaveformPlayer from '@/components/ui/WaveformPlayer'

const DEMO_VOICES = [
  { id: '1', name: 'Aria',   accent: 'American' },
  { id: '2', name: 'Marcus', accent: 'British' },
  { id: '3', name: 'Zara',   accent: 'Indian' },
  { id: '4', name: 'Leo',    accent: 'Australian' },
]

const SAMPLE_TEXTS = [
  'The future of communication is here — your words, your voice, every language on earth.',
  'Good morning. Today I want to share something that could change everything for your team.',
  'Welcome to the show. I\'m your host, and we have an incredible episode lined up for you.',
]

export default function LandingDemo() {
  const [text, setText] = useState(SAMPLE_TEXTS[0])
  const [voiceId, setVoiceId] = useState('1')
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryMins, setRetryMins] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [generated, setGenerated] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const startCountdown = (mins: number) => {
    setRetryMins(mins)
    setCountdown(mins * 60)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(intervalRef.current!)
          setRetryMins(null)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  const generate = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    setAudioUrl(null)

    try {
      const res = await fetch('/api/demo/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), voiceId }),
      })

      if (res.status === 429) {
        const data = await res.json()
        startCountdown(data.retryAfterMinutes ?? 60)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError('generation failed — try again in a moment.')
        setLoading(false)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setGenerated(true)
    } catch {
      setError('network error — check your connection.')
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate()
  }

  return (
    <div style={{ width: '100%', animation: 'slideUp 0.4s ease 0.1s both' }}>
      <div style={{
        background: 'rgba(15,15,15,0.8)',
        border: '1px solid var(--border-2)',
        borderRadius: 20,
        padding: 24,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        {/* Voice selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {DEMO_VOICES.map(v => (
            <button
              key={v.id}
              onClick={() => setVoiceId(v.id)}
              style={{
                padding: '10px 8px',
                borderRadius: 12,
                border: `1px solid ${voiceId === v.id ? 'var(--accent)' : 'var(--border)'}`,
                background: voiceId === v.id ? 'rgba(249,115,22,0.08)' : 'var(--bg-3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'var(--transition)',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: voiceId === v.id ? 'var(--accent)' : 'var(--bg-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14,
                transition: 'var(--transition)',
              }}>
                🎙
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: voiceId === v.id ? 'var(--accent)' : 'var(--text-2)' }}>{v.name}</div>
              <div style={{ fontSize: 9, color: 'var(--text-4)', letterSpacing: '0.04em' }}>{v.accent}</div>
            </button>
          ))}
        </div>

        {/* Text input */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={300}
            rows={3}
            placeholder="type something to hear it spoken…"
            style={{
              width: '100%',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '14px 16px',
              fontSize: 14,
              color: 'var(--text)',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              fontFamily: 'var(--font-sans)',
              transition: 'border-color 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--border-2)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'var(--text-4)' }}>
            {text.length}/300
          </div>
        </div>

        {/* Sample texts */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {SAMPLE_TEXTS.map((s, i) => (
            <button
              key={i}
              onClick={() => setText(s)}
              style={{
                fontSize: 10,
                color: text === s ? 'var(--accent)' : 'var(--text-4)',
                background: text === s ? 'var(--accent-dim)' : 'transparent',
                border: `1px solid ${text === s ? 'rgba(249,115,22,0.25)' : 'var(--border)'}`,
                borderRadius: 20,
                padding: '3px 10px',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              sample {i + 1}
            </button>
          ))}
        </div>

        {/* Generate button */}
        {retryMins === null ? (
          <button
            onClick={generate}
            disabled={loading || !text.trim()}
            className="btn-accent"
            style={{
              width: '100%',
              padding: '13px 20px',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: loading || !text.trim() ? 0.6 : 1,
              cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              <>
                <span style={{ display: 'inline-block', animation: 'spin 0.9s linear infinite', fontSize: 14 }}>⟳</span>
                generating…
              </>
            ) : (
              <>
                hear it
                <span style={{ fontSize: 10, color: 'rgba(10,10,10,0.5)', fontWeight: 400 }}>⌘↵</span>
              </>
            )}
          </button>
        ) : (
          <div style={{
            width: '100%',
            padding: '13px 20px',
            background: 'var(--bg-3)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>
                back in <span style={{ color: 'var(--text)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(countdown)}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-4)' }}>or sign up for 5 min/day free</div>
            </div>
            <Link href="/auth/signup" className="btn-accent" style={{ fontSize: 12, padding: '7px 14px', whiteSpace: 'nowrap' }}>
              get 5 min/day free →
            </Link>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--danger)', textAlign: 'center' }}>{error}</div>
        )}

        {/* Output */}
        {audioUrl && (
          <div style={{ marginTop: 20, animation: 'slideDown 0.3s ease' }}>
            <WaveformPlayer src={audioUrl} autoPlay />

            {/* Post-generation CTA */}
            {generated && (
              <div style={{
                marginTop: 16,
                padding: '14px 16px',
                background: 'rgba(249,115,22,0.04)',
                border: '1px solid rgba(249,115,22,0.15)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 3 }}>save this + get 5 min/day free</div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)' }}>no credit card · cancel anytime</div>
                </div>
                <Link href="/auth/signup" className="btn-accent" style={{ fontSize: 13, padding: '9px 18px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  sign up free →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hint */}
      {!audioUrl && !retryMins && (
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'var(--text-4)' }}>
          1 free generation · no account needed · watermarked
        </div>
      )}
    </div>
  )
}
