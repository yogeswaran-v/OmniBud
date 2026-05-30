import Link from 'next/link'
import LandingDemo from '@/components/landing/LandingDemo'
import LiveCounter from '@/components/ui/LiveCounter'
import ThemeToggle from '@/components/ui/ThemeToggle'

export const metadata = {
  title: 'OmniDub — your voice, every language.',
  description: 'AI-powered text to speech, voice cloning, and video dubbing. Free to start. No failed-generation charges. Ever.',
  openGraph: {
    title: 'OmniDub — your voice, every language.',
    description: 'Transparent pricing. Studio-quality voices. Hear the product before you sign up.',
    type: 'website',
  },
}

const FEATURES = [
  { icon: '📝', title: 'generate voiceover', desc: 'type a script, pick a voice, hear it in seconds. 6 voices, 20+ languages free.', href: '/auth/signup', cta: 'try free →', tone: 'accent', pro: false },
  { icon: '🎙', title: 'transcribe audio', desc: 'drop an audio file, get a clean transcript. powered by Whisper.', href: '/auth/signup', cta: 'try free →', tone: 'plain', pro: false },
  { icon: '🎭', title: 'sounds like you', desc: 'record 30 seconds. clone your voice. speak any language.', href: '/auth/signup', cta: 'pro feature →', tone: 'contrast', pro: true },
  { icon: '🎬', title: 'speak their language', desc: 'paste a YouTube URL. get a fully dubbed video in your voice.', href: '/auth/signup', cta: 'pro feature →', tone: 'plain', pro: true },
]

export default function Home() {
  return (
    <main className="bg-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Dot grid */}
      <div aria-hidden="true" className="dot-grid" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.6 }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, height: 64, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, background: 'var(--bg-2)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-accent)' }}>
            <div style={{ width: 8, height: 8, background: 'var(--accent-text)', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '-0.01em' }}>OmniDub</span>
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/pricing" style={{ fontSize: 13, color: 'var(--text-2)', padding: '7px 14px' }}>pricing</Link>
        <ThemeToggle compact />
        <Link href="/auth/login" className="btn-ghost" style={{ fontSize: 13, padding: '8px 18px' }}>sign in</Link>
        <Link href="/auth/signup" className="btn-accent" style={{ padding: '9px 18px', fontSize: 13 }}>get started free</Link>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 24px 88px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 44, animation: 'fadeIn 0.5s var(--ease-out) both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 14px 5px 10px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-pill)', marginBottom: 26 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'glowPulse 2s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--accent-strong)', fontWeight: 700, letterSpacing: '0.06em' }}>NO ACCOUNT REQUIRED</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(44px, 7vw, 74px)', fontWeight: 400, lineHeight: 1.04, letterSpacing: '-0.035em', marginBottom: 22 }}>
            your voice.<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent-strong)' }}>every language.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 460, margin: '0 auto' }}>
            hear the product before you sign up. no account, no credit card. just type and listen.
          </p>
        </div>

        <div style={{ width: '100%', animation: 'springIn 0.55s var(--ease-spring) 0.15s both' }}>
          <LandingDemo />
        </div>

        {/* Social proof */}
        <div style={{ textAlign: 'center', marginTop: 26 }}>
          <LiveCounter target={18432} style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--text)' }} />
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>voices generated today</div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 22, textAlign: 'center', lineHeight: 1.7, maxWidth: 440 }}>
          unlike ElevenLabs, we never charge for failed generations.
          unlike HeyGen, &ldquo;unlimited&rdquo; actually means unlimited.
        </p>
      </section>

      {/* Feature bento */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 10 }}>everything you need.</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 15 }}>pick where to start.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => {
              const isContrast = f.tone === 'contrast'
              const isAccent = f.tone === 'accent'
              return (
                <Link key={f.title} href={f.href}
                  className="card-hover"
                  style={{
                    padding: '28px 24px',
                    background: isContrast ? 'var(--contrast)' : isAccent ? 'var(--accent)' : 'var(--bg-2)',
                    color: isContrast ? 'var(--on-contrast)' : isAccent ? 'var(--accent-text)' : 'var(--text)',
                    boxShadow: isAccent ? 'var(--shadow-accent)' : isContrast ? 'var(--shadow-contrast)' : 'var(--shadow-1)',
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex', flexDirection: 'column', gap: 14, minHeight: 200,
                    animation: `fadeIn 0.4s var(--ease-out) ${i * 0.08}s both`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                    {f.pro && <span className="pill" style={{ background: isContrast ? 'rgba(255,255,255,0.12)' : 'var(--accent-2-dim)', color: isContrast ? 'var(--accent)' : 'var(--accent-2)' }}>PRO</span>}
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{f.title}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, opacity: isAccent ? 0.75 : isContrast ? 0.7 : 1, color: (isAccent || isContrast) ? 'inherit' : 'var(--text-2)' }}>{f.desc}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, opacity: isContrast ? 0.9 : 1 }}>{f.cta}</div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 10 }}>simple, transparent pricing.</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 44 }}>flat per-minute pricing. no credits to track. no surprise charges.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginBottom: 28 }}>
            {/* Free */}
            <div className="card" style={{ padding: '32px 28px', textAlign: 'left' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 700 }}>free</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                <span className="giant-num" style={{ fontSize: 48 }}>$0</span>
              </div>
              {['5 min/day', '3 languages', 'quick voice clone', 'watermarked exports'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 11, display: 'flex', gap: 9 }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>{f}
                </div>
              ))}
              <Link href="/auth/signup" className="btn-ghost" style={{ display: 'flex', justifyContent: 'center', marginTop: 22, fontSize: 13 }}>get started</Link>
            </div>
            {/* Pro — the black Crextio card */}
            <div className="card-contrast" style={{ padding: '32px 28px', textAlign: 'left', position: 'relative' }}>
              <div className="pill" style={{ position: 'absolute', top: 20, right: 20, background: 'var(--accent)', color: 'var(--accent-text)' }}>popular</div>
              <div style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, fontWeight: 700 }}>pro</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 22 }}>
                <span className="giant-num" style={{ fontSize: 48, color: 'var(--on-contrast)' }}>$19</span>
                <span style={{ fontSize: 13, color: 'var(--on-contrast-2)' }}>/mo</span>
              </div>
              {['120 min/day', 'all 20+ languages', 'full voice clone', 'clean exports', 'priority queue'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--on-contrast)', marginBottom: 11, display: 'flex', gap: 9 }}>
                  <span style={{ color: 'var(--accent)' }}>✓</span>{f}
                </div>
              ))}
              <Link href="/auth/signup?intent=pro" className="btn-accent" style={{ display: 'flex', justifyContent: 'center', marginTop: 22, fontSize: 13 }}>upgrade to pro</Link>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>no failed-generation charges. no hidden credits. no contracts.</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid var(--border)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>OmniDub</span>
        <div style={{ display: 'flex', gap: 22, fontSize: 12, color: 'var(--text-3)' }}>
          <Link href="/pricing">pricing</Link>
          <Link href="/auth/login">sign in</Link>
          <Link href="/auth/signup">sign up</Link>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>© 2026 OmniDub.</span>
      </footer>
    </main>
  )
}
