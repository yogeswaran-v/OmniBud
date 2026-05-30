'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const QUOTE = { text: 'my voice, my accent — in every market we launched.', author: 'founder' }
const WAVE_HEIGHTS = [0.3,0.7,0.5,0.9,0.2,0.8,0.4,1.0,0.3,0.6,0.5,0.8,0.2,0.7,0.4,0.9,0.3,0.6,0.8,0.4,0.7,0.2,0.9,0.5,0.6,0.3,0.8,0.4,0.7,0.5,0.2,0.9]

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const handleSignup = async () => {
    if (password.length < 8) { setError('password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 380, animation: 'springIn 0.5s var(--ease-spring) both' }}>
        <div style={{ width: 56, height: 56, background: 'rgba(200,245,66,0.08)', border: '1px solid rgba(200,245,66,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22, color: 'var(--accent)' }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, marginBottom: 10, fontWeight: 300 }}>check your email.</h2>
        <p style={{ color: 'var(--text-3)', fontSize: 14, lineHeight: 1.7 }}>we sent a confirmation link to <strong style={{ color: 'var(--text-2)' }}>{email}</strong>. click it to activate your account.</p>
        <Link href="/auth/login" style={{ display: 'inline-block', marginTop: 24, fontSize: 13, color: 'var(--accent)' }}>← back to sign in</Link>
      </div>
    </div>
  )

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

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'rgba(200,245,66,0.07)', border: '1px solid rgba(200,245,66,0.2)', borderRadius: 20, marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.06em' }}>FREE — 5 MIN/DAY INCLUDED</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 34, fontWeight: 300, letterSpacing: '-0.025em', marginBottom: 8 }}>let&apos;s go.</h1>
          <p style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 36 }}>no credit card required.</p>

          {error && (
            <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 10, fontSize: 13, color: 'var(--danger)', marginBottom: 20, animation: 'fadeIn 0.2s ease' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 7, fontWeight: 500, letterSpacing: '0.04em' }}>email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '13px 16px', fontSize: 14, borderRadius: 'var(--radius)', background: 'var(--bg-3)' }} />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 7, fontWeight: 500, letterSpacing: '0.04em' }}>password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="min 8 characters"
              style={{ width: '100%', padding: '13px 16px', fontSize: 14, borderRadius: 'var(--radius)', background: 'var(--bg-3)' }}
              onKeyDown={e => e.key === 'Enter' && handleSignup()} />
          </div>

          <button onClick={handleSignup} disabled={loading || !email || !password}
            className={`btn-accent${loading ? ' btn-shimmer' : ''}`}
            style={{ width: '100%', padding: '14px', fontSize: 14, borderRadius: 'var(--radius)', justifyContent: 'center' }}>
            {loading ? <><div className="spinner" /> creating account…</> : 'create free account →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-3)', marginTop: 22 }}>
            already have an account?{' '}
            <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>sign in →</Link>
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
