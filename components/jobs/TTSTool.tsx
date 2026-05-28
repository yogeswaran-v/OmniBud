'use client'
import { useState } from 'react'
import { VOICES } from '@/lib/constants'
import { useJobPoller, ProgressBar, OutputPlayer, LanguageSelector, SubmitButton } from './JobShared'

export default function TTSTool() {
  const [text, setText] = useState('')
  const [voiceId, setVoiceId] = useState('1')
  const [language, setLanguage] = useState('English')
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const job = useJobPoller(jobId)

  const handleSubmit = async () => {
    setLoading(true); setError('')
    const res = await fetch('/api/jobs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'tts', text, voice_id: voiceId, language }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error === 'daily_limit_reached' ? "Daily limit reached. Upgrade to Pro." : data.error); setLoading(false) }
    else { setJobId(data.job_id); setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 720, animation: 'fadeIn 0.25s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#c8f542', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Text to Speech</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>Turn text into natural speech</h1>
        <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>Choose a voice, type your script, pick a language. Download broadcast-quality audio.</p>
      </div>

      {error && <div style={{ padding: '12px 16px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 10, fontSize: 13, color: '#e05555', marginBottom: 20 }}>{error}</div>}

      {/* Voice picker */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voice</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {VOICES.map(v => (
            <div key={v.id} onClick={() => setVoiceId(v.id)}
              style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${voiceId === v.id ? '#c8f542' : '#1a1a1a'}`, background: voiceId === v.id ? '#131a0a' : '#0f0f0f', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: voiceId === v.id ? '#c8f542' : '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: voiceId === v.id ? '#0a0a0a' : '#444', flexShrink: 0 }}>
                  {v.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#e8e8e8' }}>{v.name}</div>
                  <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>{v.tone}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Script */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Script</label>
          <span style={{ fontSize: 11, color: '#333' }}>{text.length}/1000</span>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value.slice(0, 1000))}
          placeholder="Enter your script here..."
          rows={6} style={{ width: '100%', padding: '12px 14px', fontSize: 13, lineHeight: 1.7 }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <LanguageSelector value={language} onChange={setLanguage} plan="free" />
      </div>

      <SubmitButton onClick={handleSubmit} loading={loading} disabled={!text} label="Generate Speech →" />

      {job && (job.status === 'pending' || job.status === 'processing') && <ProgressBar progress={job.progress} status={job.status} />}
      {job?.status === 'completed' && job.output_url && <OutputPlayer outputUrl={job.output_url} fileName="speech_output.mp3" />}
      {job?.status === 'failed' && <div style={{ marginTop: 16, padding: '14px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 10, fontSize: 13, color: '#e05555' }}>Job failed: {job.error}. Please try again.</div>}
    </div>
  )
}
