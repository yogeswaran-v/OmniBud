'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async () => {
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setDone(true)
  }

  if (done) return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ width: 56, height: 56, background: '#131a0a', border: '1px solid #2a3a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 22 }}>✓</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 10 }}>Check your email</h2>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.7 }}>We sent a confirmation link to <strong style={{ color: '#888' }}>{email}</strong>. Click it to activate your account.</p>
        <Link href="/auth/login" style={{ display: 'inline-block', marginTop: 24, fontSize: 13, color: '#c8f542' }}>← Back to sign in</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40, justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, background: '#c8f542', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 9, height: 9, background: '#0a0a0a', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>OmniDub</span>
        </Link>

        <div style={{ background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 16, padding: '36px 32px' }}>
          <div style={{ display: 'inline-block', padding: '4px 10px', background: '#131a0a', border: '1px solid #2a3a1a', borderRadius: 20, fontSize: 11, color: '#c8f542', marginBottom: 16, letterSpacing: '0.06em' }}>
            FREE — 5 min/day included
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 28 }}>No credit card required</p>

          {error && (
            <div style={{ padding: '10px 14px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 8, fontSize: 13, color: '#e05555', marginBottom: 20 }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '11px 14px', fontSize: 14 }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              style={{ width: '100%', padding: '11px 14px', fontSize: 14 }}
              onKeyDown={e => e.key === 'Enter' && handleSignup()} />
          </div>

          <button onClick={handleSignup} disabled={loading || !email || !password}
            style={{ width: '100%', padding: '13px', background: (!email || !password) ? '#141414' : '#c8f542', color: (!email || !password) ? '#333' : '#0a0a0a', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.15s' }}>
            {loading ? <><div className="spinner" />Creating account...</> : 'Create free account →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#444', marginTop: 20 }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#c8f542' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
