import Link from 'next/link'

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: '60px 24px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Link href="/" style={{ fontSize: 13, color: '#444', display: 'inline-block', marginBottom: 40 }}>← Back</Link>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, color: '#f97316', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Pricing</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 400, letterSpacing: '-0.02em', marginBottom: 12 }}>Simple, transparent pricing</h1>
          <p style={{ fontSize: 15, color: '#555' }}>Start free. Upgrade when you need more.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 700, margin: '0 auto' }}>
          {/* Free */}
          <div style={{ padding: '32px 28px', background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 16 }}>
            <div style={{ fontSize: 12, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Free</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, marginBottom: 4 }}>$0</div>
            <div style={{ fontSize: 12, color: '#444', marginBottom: 28 }}>Forever free</div>
            {[
              '5 minutes/day',
              '3 languages',
              '30s voice samples',
              '5 min video dubbing',
              '1 job at a time',
              'Audio watermark',
              '6 built-in voices',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#666' }}>
                <span style={{ color: '#2a3a1a', fontSize: 16 }}>✓</span> {f}
              </div>
            ))}
            <Link href="/auth/signup" style={{ display: 'block', marginTop: 28, padding: '12px', textAlign: 'center', background: '#141414', border: '1px solid #1e1e1e', borderRadius: 10, fontSize: 13, color: '#888' }}>
              Get started free →
            </Link>
          </div>

          {/* Pro */}
          <div style={{ padding: '32px 28px', background: '#0f1a08', border: '1.5px solid #f97316', borderRadius: 16, position: 'relative' }}>
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f97316', color: '#07070c', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 20, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Most Popular
            </div>
            <div style={{ fontSize: 12, color: '#f97316', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Pro</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, marginBottom: 4 }}>$19</div>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 28 }}>per month · cancel anytime</div>
            {[
              '120 minutes/day',
              '646 languages',
              '5 min voice samples',
              '60 min video dubbing',
              '10 concurrent jobs',
              'No watermark',
              '6 built-in voices',
            ].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#e8e8e8' }}>
                <span style={{ color: '#f97316', fontSize: 16 }}>✓</span> {f}
              </div>
            ))}
            <Link href="/auth/signup" style={{ display: 'block', marginTop: 28, padding: '12px', textAlign: 'center', background: '#f97316', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#07070c' }}>
              Start Pro →
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, fontSize: 13, color: '#333' }}>
          Need higher volume or custom enterprise pricing?{' '}
          <a href="mailto:hello@omnidub.ai" style={{ color: '#f97316' }}>Contact us →</a>
        </div>
      </div>
    </div>
  )
}
