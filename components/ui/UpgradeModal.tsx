'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpgrade = async () => {
    setLoading(true)
    const res = await fetch('/api/billing/checkout', { method: 'POST' })
    const { url } = await res.json()
    if (url) router.push(url)
    else setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 18, padding: '40px 36px', width: 430, position: 'relative', animation: 'fadeIn 0.2s ease' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#444', fontSize: 18 }}>✕</button>

        <div style={{ fontSize: 10, color: '#c8f542', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Upgrade to Pro</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, marginBottom: 8, lineHeight: 1.2 }}>
          Unlock the full platform
        </h2>
        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 28 }}>
          Get 120 minutes/day, all 646 languages, no watermarks, and priority processing.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
          {[
            ['120 min/day', 'vs 5 min free'],
            ['646 languages', 'vs 3 free'],
            ['No watermark', 'Clean exports'],
            ['Priority queue', 'No waiting'],
            ['5 min samples', 'vs 30s free'],
            ['60 min videos', 'vs 5 min free'],
          ].map(([title, sub]) => (
            <div key={title} style={{ padding: '12px 14px', background: '#141414', borderRadius: 9, border: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: 13, color: '#e8e8e8', fontWeight: 500 }}>{title}</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>

        <button onClick={handleUpgrade} disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: loading ? '#333' : '#c8f542', color: loading ? '#666' : '#0a0a0a', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {loading ? <><div className="spinner" />Redirecting to checkout...</> : 'Upgrade — $19/month'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#333' }}>
          Cancel anytime · Instant access · Powered by Stripe
        </div>
      </div>
    </div>
  )
}
