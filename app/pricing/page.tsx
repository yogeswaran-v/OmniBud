import Link from 'next/link'

const FREE_FEATURES = ['5 minutes/day', '3 languages', '30s voice samples', '5 min video dubbing', '1 job at a time', 'audio watermark', '6 built-in voices']
const PRO_FEATURES = ['120 minutes/day', '646 languages', '5 min voice samples', '60 min video dubbing', '10 concurrent jobs', 'no watermark', '6 built-in voices']

export default function PricingPage() {
  return (
    <div className="bg-app" style={{ minHeight: '100vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 13, color: 'var(--text-3)', display: 'inline-block', marginBottom: 40 }}>← back</Link>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: 'var(--accent-strong)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>pricing</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 46px)', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 12 }}>simple, transparent pricing.</h1>
          <p style={{ fontSize: 15, color: 'var(--text-2)' }}>start free. upgrade when you need more.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>
          {/* Free */}
          <div className="card" style={{ padding: '32px 28px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>free</div>
            <div className="giant-num" style={{ fontSize: 48, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 28 }}>forever free</div>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11, fontSize: 13, color: 'var(--text-2)' }}>
                <span style={{ color: 'var(--success)', fontSize: 14 }}>✓</span> {f}
              </div>
            ))}
            <Link href="/auth/signup" className="btn-ghost" style={{ display: 'flex', justifyContent: 'center', marginTop: 28, fontSize: 13 }}>
              get started free →
            </Link>
          </div>

          {/* Pro — black Crextio card */}
          <div className="card-contrast" style={{ padding: '32px 28px', position: 'relative' }}>
            <div className="pill" style={{ position: 'absolute', top: 18, right: 18, background: 'var(--accent)', color: 'var(--accent-text)' }}>most popular</div>
            <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 700 }}>pro</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <span className="giant-num" style={{ fontSize: 48, color: 'var(--on-contrast)' }}>$19</span>
              <span style={{ fontSize: 13, color: 'var(--on-contrast-2)' }}>/mo</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--on-contrast-2)', marginBottom: 28 }}>per month · cancel anytime</div>
            {PRO_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11, fontSize: 13, color: 'var(--on-contrast)' }}>
                <span style={{ color: 'var(--accent)', fontSize: 14 }}>✓</span> {f}
              </div>
            ))}
            <Link href="/auth/signup?intent=pro" className="btn-accent" style={{ display: 'flex', justifyContent: 'center', marginTop: 28, fontSize: 13 }}>
              start pro →
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, fontSize: 13, color: 'var(--text-3)' }}>
          need higher volume or custom enterprise pricing?{' '}
          <a href="mailto:hello@omnidub.ai" style={{ color: 'var(--accent-strong)' }}>contact us →</a>
        </div>
      </div>
    </div>
  )
}
