import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ height: 60, borderBottom: '1px solid #141414', display: 'flex', alignItems: 'center', padding: '0 32px', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#c8f542', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, background: '#0a0a0a', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>OmniDub</span>
        </div>
        <div style={{ flex: 1 }} />
        <Link href="/pricing" style={{ fontSize: 13, color: '#666', padding: '8px 16px' }}>Pricing</Link>
        <Link href="/auth/login" style={{ fontSize: 13, color: '#888', padding: '8px 16px', border: '1px solid #1e1e1e', borderRadius: 8 }}>Sign in</Link>
        <Link href="/auth/signup" style={{ fontSize: 13, color: '#0a0a0a', padding: '8px 18px', background: '#c8f542', borderRadius: 8, fontWeight: 600 }}>Get started free</Link>
      </nav>

      {/* Hero */}
      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#c8f542', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          Powered by OmniVoice · 646 Languages
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 24, maxWidth: 800 }}>
          Clone voices. Dub videos.<br />
          <span style={{ fontStyle: 'italic', color: '#c8f542' }}>Speak every language.</span>
        </h1>
        <p style={{ fontSize: 17, color: '#666', lineHeight: 1.7, maxWidth: 520, marginBottom: 40 }}>
          AI-powered voice cloning and video dubbing into 646 languages.
          Free to start. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/signup" style={{ padding: '14px 32px', background: '#c8f542', color: '#0a0a0a', borderRadius: 10, fontWeight: 600, fontSize: 15, letterSpacing: '0.02em' }}>
            Start for free →
          </Link>
          <Link href="/pricing" style={{ padding: '14px 32px', background: '#111', color: '#888', borderRadius: 10, fontSize: 15, border: '1px solid #1e1e1e' }}>
            See pricing
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['646', 'Languages supported'], ['40×', 'Faster than real-time'], ['$0', 'To get started'], ['3s', 'Voice clone sample']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: '#e8e8e8' }}>{val}</div>
              <div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 32px', borderTop: '1px solid #141414', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        {[
          { icon: '🎙', title: 'Voice Cloning', desc: 'Upload a 30-second sample. Clone any voice with accent, tone, and emotion preserved across all 646 languages.' },
          { icon: '📝', title: 'Text to Speech', desc: 'Type any script. Choose from 6 built-in voices or your cloned voice. Export broadcast-quality audio instantly.' },
          { icon: '🎬', title: 'Video Dubbing', desc: 'Paste a YouTube URL or upload a video. Get a fully dubbed MP4 in your target language in minutes.' },
        ].map(f => (
          <div key={f.title} style={{ padding: '28px', background: '#0f0f0f', borderRadius: 14, border: '1px solid #141414' }}>
            <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 10, color: '#e8e8e8' }}>{f.title}</div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7 }}>{f.desc}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 32px', textAlign: 'center', borderTop: '1px solid #141414' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, marginBottom: 16 }}>Ready to go multilingual?</h2>
        <p style={{ color: '#555', marginBottom: 28, fontSize: 15 }}>Free plan includes 5 minutes/day. No credit card needed.</p>
        <Link href="/auth/signup" style={{ padding: '14px 36px', background: '#c8f542', color: '#0a0a0a', borderRadius: 10, fontWeight: 600, fontSize: 15 }}>
          Create free account →
        </Link>
      </section>

      <footer style={{ borderTop: '1px solid #141414', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: 15 }}>OmniDub</span>
        <span style={{ fontSize: 12, color: '#333' }}>© 2026 OmniDub. Built on OmniVoice Studio.</span>
      </footer>
    </main>
  )
}
