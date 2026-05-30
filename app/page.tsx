import Link from 'next/link'
import LandingDemo from '@/components/landing/LandingDemo'

export const metadata = {
  title: 'OmniDub — your voice, every language.',
  description: 'AI-powered text to speech, voice cloning, and video dubbing. Free to start. No failed-generation charges. Ever.',
  openGraph: {
    title: 'OmniDub — your voice, every language.',
    description: 'Transparent pricing. Studio-quality voices. Hear the product before you sign up.',
    type: 'website',
  },
}

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Dot grid + ambient orbs */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(167,139,250,0.14) 0%, transparent 70%)', animation: 'orb 12s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%)', animation: 'orb 16s ease-in-out 4s infinite reverse' }} />
      </div>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: 60, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, background: 'rgba(8,8,15,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(249,115,22,0.30)' }}>
            <div style={{ width: 8, height: 8, background: '#07070c', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17, letterSpacing: '-0.01em' }}>OmniDub</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/pricing" style={{ fontSize: 13, color: 'var(--text-3)', padding: '7px 14px', transition: 'color 0.15s' }}>pricing</Link>
        <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--text-2)', padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', transition: 'var(--transition)' }}>sign in</Link>
        <Link href="/auth/signup" className="btn-accent" style={{ padding: '8px 18px', fontSize: 13 }}>get started free</Link>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 96px', maxWidth: 700, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeIn 0.5s var(--ease-out) both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px 4px 8px', background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 20, marginBottom: 24 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'glowPulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em' }}>no account required</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(40px, 6.5vw, 68px)', fontWeight: 300, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 22 }}>
            your voice.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>every language.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-3)', lineHeight: 1.65, maxWidth: 460, margin: '0 auto' }}>
            hear the product before you sign up.<br />no account, no credit card. just type and listen.
          </p>
        </div>

        <div style={{ width: '100%', animation: 'springIn 0.55s var(--ease-spring) 0.15s both' }}>
          <LandingDemo />
        </div>

        <LiveCounter />

        <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 20, textAlign: 'center', lineHeight: 1.7 }}>
          unlike ElevenLabs, we never charge for failed generations.
          unlike HeyGen, &ldquo;unlimited&rdquo; actually means unlimited.
        </p>
      </section>

      {/* Feature grid */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, letterSpacing: '-0.025em', marginBottom: 12 }}>everything you need.</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 15 }}>pick where to start.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <Link key={f.title} href={f.href}
                className={f.accent ? 'card-hover-accent' : 'card-hover'}
                style={{
                  padding: '28px 24px',
                  background: f.accent ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.02)',
                  boxShadow: f.accent ? 'var(--shadow-accent)' : 'var(--shadow-1)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  animation: `fadeIn 0.4s var(--ease-out) ${i * 0.08}s both`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 26 }}>{f.icon}</div>
                  {f.pro && <span className="pill pill-violet">PRO</span>}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: f.accent ? 'var(--accent)' : 'var(--text)', marginBottom: 7 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>{f.desc}</div>
                </div>
                <div style={{ fontSize: 12, color: f.accent ? 'var(--accent)' : 'var(--text-3)', marginTop: 'auto', fontWeight: 500 }}>{f.cta}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.008)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 300, letterSpacing: '-0.025em', marginBottom: 12 }}>simple, transparent pricing.</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 44, lineHeight: 1.7 }}>flat per-minute pricing. no credits to track. no surprise charges.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 }}>
            <div style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', boxShadow: 'var(--shadow-1)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 600 }}>free</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 44, marginBottom: 20, letterSpacing: '-0.02em' }}>$0</div>
              {['5 min/day', '3 languages', 'quick voice clone', 'watermarked exports'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 10, display: 'flex', gap: 9 }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span>{f}
                </div>
              ))}
              <Link href="/auth/signup" className="btn-ghost" style={{ display: 'flex', justifyContent: 'center', marginTop: 24, fontSize: 13 }}>get started</Link>
            </div>
            <div className="gradient-border" style={{ padding: '28px 24px', background: 'rgba(249,115,22,0.03)', borderRadius: 'var(--radius-lg)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#07070c', fontSize: 10, fontWeight: 700, padding: '3px 14px', borderRadius: 20, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 600 }}>pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 44, letterSpacing: '-0.02em' }}>$19</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>/mo</span>
              </div>
              {['120 min/day', 'all 20+ languages', 'full voice clone', 'clean exports', 'priority queue'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10, display: 'flex', gap: 9 }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span>{f}
                </div>
              ))}
              <Link href="/auth/signup?intent=pro" className="btn-accent" style={{ display: 'flex', justifyContent: 'center', marginTop: 24, fontSize: 13 }}>upgrade to pro</Link>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-4)' }}>no failed-generation charges. no hidden credits. no contracts.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>OmniDub</span>
        <div style={{ display: 'flex', gap: 22, fontSize: 12, color: 'var(--text-4)' }}>
          <Link href="/pricing">pricing</Link>
          <Link href="/auth/login">sign in</Link>
          <Link href="/auth/signup">sign up</Link>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-4)' }}>© 2026 OmniDub.</span>
      </footer>
    </main>
  )
}

const FEATURES = [
  { icon: '📝', title: 'generate voiceover', desc: 'type a script, pick a voice, hear it in seconds. 6 built-in voices, 20+ languages on free.', href: '/auth/signup', cta: 'try free →', accent: true, pro: false },
  { icon: '🎙', title: 'transcribe audio',   desc: 'drop an audio file, get a clean transcript. powered by Whisper, runs locally.', href: '/auth/signup', cta: 'try free →', accent: false, pro: false },
  { icon: '🎭', title: 'sounds like you',    desc: 'record 30 seconds. clone your voice. hear yourself speak any language.', href: '/auth/signup', cta: 'pro feature →', accent: false, pro: true },
  { icon: '🎬', title: 'speak their language', desc: 'paste a YouTube URL. get a fully dubbed video with your voice in any language.', href: '/auth/signup', cta: 'pro feature →', accent: false, pro: true },
]

function LiveCounter() {
  const base = 18432
  return (
    <div style={{ textAlign: 'center', marginTop: 24 }}>
      <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
        <span style={{ color: 'var(--text-2)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{base.toLocaleString()}</span>
        {' '}voices generated today
      </span>
    </div>
  )
}
