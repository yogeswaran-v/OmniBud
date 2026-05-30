'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const QUOTE = { text: 'turned my podcast script into 12 language versions in an afternoon.', author: 'content creator' }
const WAVE_HEIGHTS = [0.2,0.5,0.8,0.4,0.9,0.3,0.7,0.5,0.6,0.2,0.8,0.4,1.0,0.3,0.7,0.5,0.6,0.8,0.3,0.9,0.4,0.7,0.2,0.6,0.5,0.8,0.3,0.6,0.4,0.9,0.5,0.3]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '55% 45%', background: 'var(--bg)' }}>
      {/* Left — form */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', animation: 'fadeIn 0.4s var(--ease-out) both' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 52 }}>
            <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(200,245,66,0.28)' }}>
              <div style={{ width: 8, height: 8, background: '#050505', borderRadius: '50%' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17 }}>OmniDub</span>
          </Link>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.025em', marginBottom: 8 }}>welcome back.</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 36 }}>sign in to continue making.</p>

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 10, fontSize: 13, color: 'var(--danger)', marginBottom: 20, animation: 'fadeIn 0.2s ease' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 7, fontWeight: 500, letterSpacing: '0.04em' }}>email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '13px 16px', fontSize: 14, borderRadius: 'var(--radius)', background: 'var(--bg-3)' }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 7, fontWeight: 500, letterSpacing: '0.04em' }}>password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '13px 16px', fontSize: 14, borderRadius: 'var(--radius)', background: 'var(--bg-3)' }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>

          <button onClick={handleLogin} disabled={loading || !email || !password}
            className={`btn-accent${loading ? ' btn-shimmer' : ''}`}
            style={{ width: '100%', padding: '14px', fontSize: 14, borderRadius: 'var(--radius)', justifyContent: 'center' }}>
            {loading ? <><div className="spinner" /> signing in…</> : 'sign in →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 22 }}>
            no account?{' '}
            <Link href="/auth/signup" style={{ color: 'var(--accent)', fontWeight: 500 }}>create one free →</Link>
          </p>
        </div>
      </div>

      {/* Right — animated waveform + quote */}
      <div className="bg-split-right hide-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 80, marginBottom: 48 }}>
          {WAVE_HEIGHTS.map((h, i) => (
            <div key={i} style={{
              width: 4, height: `${h * 80}px`, borderRadius: 4,
              background: i % 3 === 0 ? 'rgba(200,245,66,0.7)' : 'rgba(123,97,255,0.5)',
              transformOrigin: 'center',
              animation: `waveBar ${0.8 + (i % 5) * 0.15}s ease-in-out ${(i * 0.06) % 1}s infinite`,
            }} />
          ))}
        </div>
        <blockquote style={{ textAlign: 'center', maxWidth: 320 }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 300, fontStyle: 'italic', lineHeight: 1.55, color: 'rgba(240,240,240,0.85)', marginBottom: 16 }}>
            &ldquo;{QUOTE.text}&rdquo;
          </p>
          <cite style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'normal', letterSpacing: '0.06em' }}>— {QUOTE.author}</cite>
        </blockquote>
      </div>
    </div>
  )
}
