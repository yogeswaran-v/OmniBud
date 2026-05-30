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
    <main style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ height: 58, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: '#0a0a0a', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 17 }}>OmniDub</span>
        </div>
        <div style={{ flex: 1 }} />
        <Link href="/pricing" style={{ fontSize: 13, color: 'var(--text-3)', padding: '7px 14px' }}>pricing</Link>
        <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--text-2)', padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 8, transition: 'var(--transition)' }}>sign in</Link>
        <Link href="/auth/signup" className="btn-accent" style={{ padding: '7px 16px', fontSize: 13 }}>get started free</Link>
      </nav>

      {/* Hero — demo first */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px 80px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 18, fontWeight: 600 }}>no account required</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5.5vw, 58px)', fontWeight: 300, lineHeight: 1.12, letterSpacing: '-0.025em', marginBottom: 20 }}>
            your voice.<br />
            <span style={{ fontStyle: 'italic', color: 'var(--accent)' }}>every language.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
            hear the product before you sign up. no account, no credit card. just type and listen.
          </p>
        </div>

        {/* No-login demo */}
        <LandingDemo />

        {/* Live counter */}
        <LiveCounter />

        {/* Trust line */}
        <p style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 20, textAlign: 'center', lineHeight: 1.6 }}>
          unlike ElevenLabs, we never charge for failed generations.
          unlike HeyGen, &ldquo;unlimited&rdquo; actually means unlimited.
        </p>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 10 }}>everything you need.</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14 }}>pick where you want to start.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              { icon: '📝', title: 'generate voiceover', desc: 'type a script, pick a voice, hear it in seconds. 6 built-in voices, 20+ languages on free.', href: '/auth/signup', cta: 'try free →', accent: true },
              { icon: '🎙', title: 'transcribe audio',   desc: 'drop an audio file, get a clean transcript back. powered by Whisper, runs on your GPU.', href: '/auth/signup', cta: 'try free →', accent: false },
              { icon: '🎭', title: 'sounds like you',    desc: 'record 30 seconds. clone your voice. hear yourself speak any language.', href: '/auth/signup', cta: 'Pro feature →', accent: false, pro: true },
              { icon: '🎬', title: 'speak their language', desc: 'paste a YouTube URL. get a fully dubbed video with your voice in any language.', href: '/auth/signup', cta: 'Pro feature →', accent: false, pro: true },
            ].map(f => (
              <div key={f.title} style={{ padding: '24px', background: f.accent ? 'rgba(200,245,66,0.04)' : 'var(--bg-2)', border: `1px solid ${f.accent ? 'rgba(200,245,66,0.18)' : 'var(--border)'}`, borderRadius: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{f.icon}</span>
                  {f.pro && <span style={{ fontSize: 9, background: 'var(--accent-2-dim)', color: '#a490ff', border: '1px solid rgba(123,97,255,0.3)', padding: '1px 6px', borderRadius: 10, fontWeight: 700, letterSpacing: '0.06em' }}>PRO</span>}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: f.accent ? 'var(--accent)' : 'var(--text)', marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
                <Link href={f.href} style={{ fontSize: 12, color: f.accent ? 'var(--accent)' : 'var(--text-3)', marginTop: 'auto', fontWeight: 500 }}>{f.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing strip */}
      <section style={{ padding: '64px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 10 }}>simple, transparent pricing.</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginBottom: 36, lineHeight: 1.7 }}>
            flat per-minute pricing. no credits to track. no surprise charges. cancel anytime.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
            <div style={{ padding: 24, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 600 }}>free</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, marginBottom: 16 }}>$0</div>
              {['5 min/day', '3 languages', 'quick voice clone', 'watermarked exports'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8, display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth/signup" className="btn-ghost" style={{ display: 'flex', justifyContent: 'center', marginTop: 20, fontSize: 13 }}>get started</Link>
            </div>
            <div style={{ padding: 24, background: 'rgba(200,245,66,0.04)', border: '1px solid rgba(200,245,66,0.2)', borderRadius: 14, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent)', color: '#0a0a0a', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>MOST POPULAR</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, fontWeight: 600 }}>pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: 36 }}>$19</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>/mo</span>
              </div>
              {['120 min/day', 'all 20+ languages', 'full voice clone', 'clean exports', 'priority queue'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8, display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                </div>
              ))}
              <Link href="/auth/signup?intent=pro" className="btn-accent" style={{ display: 'flex', justifyContent: 'center', marginTop: 20, fontSize: 13 }}>upgrade to pro</Link>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-4)' }}>no failed-generation charges. no hidden credits. no contracts.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>OmniDub</span>
        <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--text-4)' }}>
          <Link href="/pricing">pricing</Link>
          <Link href="/auth/login">sign in</Link>
          <Link href="/auth/signup">sign up</Link>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-4)' }}>© 2026 OmniDub.</span>
      </footer>
    </main>
  )
}

function LiveCounter() {
  // Static SSR value — client-side JS can animate it up
  const base = 18432
  return (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
      <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
        <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{base.toLocaleString()}</span> voices generated today
      </span>
    </div>
  )
}
