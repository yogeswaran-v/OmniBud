'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { VOICES, ALL_LANGUAGES, FREE_LANGUAGES, PLAN_LIMITS } from '@/lib/constants'
import { useJobPoller } from './JobShared'
import WaveformPlayer from '@/components/ui/WaveformPlayer'
import ParticleBurst from '@/components/ui/ParticleBurst'
import UpgradeModal, { UpgradeTrigger } from '@/components/ui/UpgradeModal'
import type { Profile } from '@/types'

interface Props { profile: Profile; usageMinutes: number }

const CHARS_PER_MINUTE = 800

const VOICE_WAVEFORMS: Record<string, string> = {
  '1': '0,16 8,8 16,20 24,4 32,18 40,10 48,22 56,6 64,16',
  '2': '0,12 8,20 16,6 24,18 32,8 40,22 48,4 56,16 64,10',
  '3': '0,18 8,6 16,22 24,10 32,18 40,4 48,20 56,12 64,16',
  '4': '0,10 8,22 16,8 24,20 32,6 40,18 48,10 56,22 64,14',
  '5': '0,14 8,4 16,20 24,8 32,22 40,6 48,18 56,10 64,20',
  '6': '0,20 8,10 16,18 24,6 32,20 40,12 48,22 56,8 64,16',
}

export default function TTSTool({ profile, usageMinutes }: Props) {
  const [text, setText] = useState('')
  const [voiceId, setVoiceId] = useState('1')
  const [language, setLanguage] = useState('English')
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [burst, setBurst] = useState(false)
  const [isFirstJob, setIsFirstJob] = useState(false)
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger | null>(null)
  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})
  const [previewLoading, setPreviewLoading] = useState<string | null>(null)
  const submitRef = useRef<HTMLButtonElement>(null)
  const job = useJobPoller(jobId)

  const plan = profile.plan as 'free' | 'pro'
  const limits = PLAN_LIMITS[plan]
  const remaining = limits.minutesPerDay - usageMinutes
  const estimatedMins = text.length / CHARS_PER_MINUTE
  const pctUsed = (usageMinutes / limits.minutesPerDay) * 100

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submitRef.current?.click() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // First job detection
  useEffect(() => {
    const key = 'omnidub_had_job'
    if (!localStorage.getItem(key)) setIsFirstJob(true)
  }, [])

  // Particle burst on first completion
  useEffect(() => {
    if (job?.status === 'completed' && isFirstJob) {
      setBurst(true)
      localStorage.setItem('omnidub_had_job', '1')
      setTimeout(() => setBurst(false), 1000)
    }
  }, [job?.status, isFirstJob])

  const playPreview = useCallback(async (id: string) => {
    if (previewPlaying === id) { setPreviewPlaying(null); return }
    if (previewUrls[id]) { setPreviewPlaying(id); return }
    setPreviewLoading(id)
    try {
      const res = await fetch(`/api/voices/preview?id=${id}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPreviewUrls(prev => ({ ...prev, [id]: url }))
      setPreviewPlaying(id)
    } catch { /* silent */ } finally { setPreviewLoading(null) }
  }, [previewPlaying, previewUrls])

  const handleSubmit = async () => {
    if (remaining <= 0) { setUpgradeTrigger('daily_limit'); return }
    setLoading(true); setError('')
    const res = await fetch('/api/jobs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'tts', text, voice_id: voiceId, language }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error === 'daily_limit_reached' ? 'daily_limit_reached' : data.error)
      if (data.error === 'daily_limit_reached') setUpgradeTrigger('daily_limit')
      setLoading(false)
    } else {
      setJobId(data.job_id)
      setLoading(false)
    }
  }

  const handleRegenerate = () => { setJobId(null); handleSubmit() }
  const handleShare = async () => {
    if (!job?.id) return
    try {
      await fetch(`/api/jobs/${job.id}/share`, { method: 'POST' })
      await navigator.clipboard.writeText(`${window.location.origin}/share/${job.id}`)
    } catch { /* silent — share link still works if clipboard fails */ }
  }

  const usageColor = pctUsed >= 95 ? 'var(--danger)' : pctUsed >= 80 ? 'var(--warning)' : 'var(--accent)'

  return (
    <div style={{ maxWidth: 700, animation: 'fadeIn 0.28s ease', position: 'relative' }}>
      {burst && <ParticleBurst trigger={burst} x={50} y={60} />}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>text to speech</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 300, letterSpacing: '-0.02em', marginBottom: 6 }}>your words, any voice.</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6 }}>pick a voice, write your script, hit generate. download broadcast-quality audio.</p>
      </div>

      {/* Error */}
      {error && error !== 'daily_limit_reached' && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 10, fontSize: 13, color: 'var(--danger)', marginBottom: 20 }}>{error}</div>
      )}

      {/* Usage bar (shows at ≥50%) */}
      {pctUsed >= 50 && (
        <div style={{ marginBottom: 20, padding: '10px 14px', background: pctUsed >= 80 ? (pctUsed >= 95 ? 'var(--danger-dim)' : 'var(--warning-dim)') : 'var(--bg-3)', border: `1px solid ${pctUsed >= 95 ? 'rgba(224,85,85,0.25)' : pctUsed >= 80 ? 'rgba(240,160,48,0.25)' : 'var(--border)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, animation: 'slideDown 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: pctUsed >= 80 ? usageColor : 'var(--text-2)' }}>
              {pctUsed >= 95 ? `⚠️ ${remaining.toFixed(1)} min left today` : pctUsed >= 80 ? `running low — ${remaining.toFixed(1)} min left` : `${remaining.toFixed(1)} min left today`}
            </span>
            {plan === 'free' && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>· Pro gets 120 min/day</span>}
          </div>
          {plan === 'free' && (
            <button onClick={() => setUpgradeTrigger('daily_limit')} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>upgrade →</button>
          )}
        </div>
      )}

      {/* Voice cards */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>voice</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {VOICES.map(v => {
            const selected = voiceId === v.id
            const locked = v.pro && plan === 'free'
            return (
              <div
                key={v.id}
                onClick={() => locked ? setUpgradeTrigger('pro_voice') : setVoiceId(v.id)}
                style={{
                  padding: '14px 12px',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  background: selected ? 'rgba(200,245,66,0.06)' : 'rgba(255,255,255,0.025)',
                  boxShadow: selected ? 'var(--shadow-accent)' : 'var(--shadow-1)',
                  opacity: locked ? 0.5 : 1,
                  transition: 'var(--transition)',
                  position: 'relative',
                }}
                onMouseEnter={e => { if (!selected && !locked) (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-2)' }}
                onMouseLeave={e => { if (!selected && !locked) (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-1)' }}
              >
                {v.pro && (
                  <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, background: 'var(--accent-2-dim)', color: '#a490ff', border: '1px solid rgba(123,97,255,0.3)', padding: '1px 6px', borderRadius: 10, fontWeight: 700, letterSpacing: '0.06em' }}>PRO</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{v.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{v.accent} · {v.tone}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); if (!locked) playPreview(v.id) }}
                    style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: previewPlaying === v.id ? 'var(--accent)' : 'var(--bg-4)',
                      border: `1px solid ${previewPlaying === v.id ? 'transparent' : 'var(--border)'}`,
                      color: previewPlaying === v.id ? '#0a0a0a' : 'var(--text-3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, flexShrink: 0,
                      transition: 'var(--transition)',
                    }}
                    title="preview voice"
                  >
                    {previewLoading === v.id ? <span className="spinner" style={{ width: 10, height: 10 }} /> : previewPlaying === v.id ? '⏹' : '▶'}
                  </button>
                </div>
                {/* Voice waveform signature */}
                <svg width="100%" height="22" viewBox="0 0 64 22" preserveAspectRatio="none" style={{ opacity: selected ? 0.8 : 0.25, transition: 'opacity 0.2s', marginTop: 8, display: 'block' }}>
                  <polyline points={VOICE_WAVEFORMS[v.id] ?? VOICE_WAVEFORMS['1']} fill="none" stroke={selected ? 'var(--accent)' : 'var(--text-3)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {previewPlaying === v.id && previewUrls[v.id] && (
                  <audio src={previewUrls[v.id]} autoPlay onEnded={() => setPreviewPlaying(null)} style={{ display: 'none' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Script */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>script</label>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: text.length > 900 ? 'var(--warning)' : 'var(--text-4)' }}>{text.length}/1000</span>
            {text.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>~{estimatedMins.toFixed(1)} min</span>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value.slice(0, 1000))}
          placeholder="enter your script here..."
          rows={6}
          style={{ width: '100%', padding: '13px 15px', fontSize: 13, lineHeight: 1.7, borderRadius: 'var(--radius)', resize: 'vertical', borderLeft: '3px solid transparent', transition: 'border-left 0.15s' }}
          onFocus={e => { (e.target as HTMLTextAreaElement).style.borderLeft = '3px solid rgba(200,245,66,0.5)' }}
          onBlur={e => { (e.target as HTMLTextAreaElement).style.borderLeft = '3px solid transparent' }}
        />
      </div>

      {/* Language pills */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>language</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ALL_LANGUAGES.map(lang => {
            const locked = plan === 'free' && !FREE_LANGUAGES.includes(lang)
            const active = language === lang
            return (
              <button
                key={lang}
                onClick={() => locked ? setUpgradeTrigger('generic') : setLanguage(lang)}
                style={{
                  padding: '5px 13px', borderRadius: 20, fontSize: 12,
                  background: active ? 'var(--accent)' : locked ? 'transparent' : 'var(--bg-3)',
                  color: active ? '#0a0a0a' : locked ? 'var(--text-4)' : 'var(--text-2)',
                  border: `1px solid ${active ? 'transparent' : locked ? 'var(--border)' : 'var(--border)'}`,
                  cursor: locked ? 'default' : 'pointer',
                  opacity: locked ? 0.5 : 1,
                  transition: 'var(--transition)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {lang}{locked && <span style={{ fontSize: 9 }}>🔒</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Pre-generation cost line */}
      {text.length > 0 && (
        <div style={{ marginBottom: 16, fontSize: 12, color: 'var(--text-3)', padding: '8px 12px', background: 'var(--bg-3)', borderRadius: 8, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <span>uses ~{estimatedMins.toFixed(1)} min · {remaining.toFixed(1)} remaining today</span>
          {plan === 'free' && <span style={{ color: 'var(--text-4)' }}>Pro gets 120 min/day</span>}
        </div>
      )}

      {/* Submit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          ref={submitRef}
          onClick={handleSubmit}
          disabled={loading || !text.trim() || remaining <= 0}
          className={`btn-accent${loading ? ' btn-shimmer' : ''}`}
          style={{ width: '100%', padding: '16px', fontSize: 15, justifyContent: 'center', borderRadius: 'var(--radius)', opacity: (!text.trim() || remaining <= 0) ? 0.45 : 1 }}
        >
          {loading ? <><span className="spinner" /> generating…</> : remaining <= 0 ? 'daily limit reached' : 'generate ↵'}
        </button>
        {remaining <= 0 && plan === 'free' && (
          <button onClick={() => setUpgradeTrigger('daily_limit')} className="btn-ghost" style={{ fontSize: 12 }}>upgrade for more →</button>
        )}
        <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 4 }}>⌘↵ to submit</span>
      </div>

      {/* Job progress */}
      {job && (job.status === 'pending' || job.status === 'processing') && (
        <div style={{ marginTop: 20, padding: 18, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {job.status === 'pending' ? '⏳ queued...' : '⚡ generating on GPU...'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{job.progress}%</span>
          </div>
          <div style={{ height: 3, background: 'var(--bg-4)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${job.progress}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.5s ease', animation: 'glow 2s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      {/* Output */}
      {job?.status === 'completed' && job.output_url && (
        <div style={{ marginTop: 20, padding: 20, background: 'rgba(200,245,66,0.04)', boxShadow: 'var(--shadow-accent)', borderRadius: 'var(--radius)', animation: 'springIn 0.45s var(--ease-spring) both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>✓ generated</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={job.output_url} download="omnidub-speech.mp3" className="btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }}>↓ download</a>
              <button onClick={handleShare} className="btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }}>↗ share</button>
              <button onClick={handleRegenerate} className="btn-ghost" style={{ fontSize: 11, padding: '5px 12px' }}>↺ regenerate</button>
            </div>
          </div>
          <WaveformPlayer src={job.output_url} />
          {plan === 'free' && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              this file is watermarked in the filename.{' '}
              <button onClick={() => setUpgradeTrigger('generic')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>remove it with Pro →</button>
            </div>
          )}
        </div>
      )}

      {/* Failure */}
      {job?.status === 'failed' && (
        <div style={{ marginTop: 16, padding: 16, background: 'var(--danger-dim)', border: '1px solid rgba(224,85,85,0.25)', borderRadius: 12, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ fontSize: 13, color: 'var(--danger)', marginBottom: 8 }}>generation failed: {job.error}</div>
          <button onClick={handleRegenerate} className="btn-ghost" style={{ fontSize: 12 }}>try again →</button>
        </div>
      )}

      {/* Upgrade modal */}
      {upgradeTrigger && <UpgradeModal trigger={upgradeTrigger} onClose={() => setUpgradeTrigger(null)} />}
    </div>
  )
}
