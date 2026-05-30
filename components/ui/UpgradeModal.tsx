'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type UpgradeTrigger = 'daily_limit' | 'pro_voice' | 'voice_clone' | 'video_dub' | 'generic'

interface Props { onClose: () => void; trigger?: UpgradeTrigger }

const HEADLINES: Record<UpgradeTrigger, { title: string; sub: string }> = {
  daily_limit: { title: "you're out of minutes.", sub: "Upgrade to keep going — Pro gets you 120 min/day." },
  pro_voice:   { title: "unlock studio-quality voices.", sub: "This voice requires Pro. Hear the difference before you pay." },
  voice_clone: { title: "clone your own voice.", sub: "Record 30 seconds — we'll make it speak any language." },
  video_dub:   { title: "speak their language.", sub: "Video dubbing is coming. Pro members get early access." },
  generic:     { title: "unlock everything.", sub: "24× more minutes, Pro voices, and your own voice clone." },
}

const FREE_FEATURES = ['5 min/day TTS', '3 languages', 'Quick voice clone', 'Watermarked exports', '1 job at a time']
const PRO_FEATURES  = ['120 min/day TTS', 'All 20+ languages', 'Full voice clone', 'Clean exports', '10 concurrent jobs', 'Studio voices', 'Priority queue', 'Share without branding']
const PRO_HIGHLIGHTS: Partial<Record<UpgradeTrigger, number>> = { daily_limit: 0, pro_voice: 5, voice_clone: 2, video_dub: 7 }

export default function UpgradeModal({ onClose, trigger = 'generic' }: Props) {
  const [annual, setAnnual] = useState(true)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { title, sub } = HEADLINES[trigger]
  const price = annual ? 16 : 19
  const highlightIdx = PRO_HIGHLIGHTS[trigger] ?? -1

  const handleUpgrade = async () => {
    setLoading(true)
    const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ annual }) })
    const { url } = await res.json()
    if (url) router.push(url)
    else setLoading(false)
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', animation: 'fadeIn 0.2s ease' }}
    >
      <div style={{ width: '100%', maxWidth: 560, background: 'rgba(10,10,10,0.94)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32, animation: 'slideUp 0.26s ease', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, color: 'var(--text-3)', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>OmniDub Pro</div>
          <h2 style={{ fontSize: 24, fontWeight: 300, fontFamily: 'var(--font-serif)', marginBottom: 8 }}>{title}</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.6 }}>{sub}</p>
        </div>

        {/* Billing toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <button onClick={() => setAnnual(false)} style={{ padding: '5px 13px', borderRadius: 20, fontSize: 12, background: !annual ? 'var(--bg-4)' : 'transparent', border: `1px solid ${!annual ? 'var(--border-2)' : 'var(--border)'}`, color: !annual ? 'var(--text)' : 'var(--text-3)' }}>Monthly — $19</button>
          <button onClick={() => setAnnual(true)} style={{ padding: '5px 13px', borderRadius: 20, fontSize: 12, background: annual ? 'var(--accent-dim)' : 'transparent', border: `1px solid ${annual ? 'rgba(200,245,66,0.3)' : 'var(--border)'}`, color: annual ? 'var(--accent)' : 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            Annual — $16/mo
            {annual && <span style={{ background: 'var(--accent)', color: '#0a0a0a', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10 }}>SAVE 20%</span>}
          </button>
        </div>

        {/* Plan comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Free</div>
            {FREE_FEATURES.map(f => (
              <div key={f} style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--text-3)', marginBottom: 7 }}>
                <span style={{ color: 'var(--text-4)', flexShrink: 0 }}>–</span>{f}
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(200,245,66,0.04)', border: '1px solid rgba(200,245,66,0.18)', borderRadius: 12, padding: '14px 12px' }}>
            <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>Pro</div>
            {PRO_FEATURES.map((f, i) => {
              const hl = i === highlightIdx
              return (
                <div key={f} style={{ display: 'flex', gap: 6, fontSize: 12, color: hl ? 'var(--accent)' : 'var(--text-2)', background: hl ? 'rgba(200,245,66,0.08)' : 'transparent', borderRadius: 4, padding: hl ? '2px 4px' : '2px 0', margin: hl ? '0 -4px 5px' : '0 0 7px', fontWeight: hl ? 600 : 400 }}>
                  <span style={{ color: hl ? 'var(--accent)' : 'var(--text-3)', flexShrink: 0 }}>✓</span>{f}
                </div>
              )
            })}
          </div>
        </div>

        <button onClick={handleUpgrade} disabled={loading} className="btn-accent" style={{ width: '100%', padding: 14, fontSize: 15, borderRadius: 12 }}>
          {loading ? <><span className="spinner" /> redirecting...</> : `upgrade to pro — $${price}/mo`}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-4)', marginTop: 10 }}>cancel anytime. no contracts.</p>
      </div>
    </div>
  )
}
