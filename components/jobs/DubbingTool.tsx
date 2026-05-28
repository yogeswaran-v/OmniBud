'use client'
import { useState } from 'react'
import { useJobPoller, ProgressBar, OutputPlayer, LanguageSelector, SubmitButton } from './JobShared'

export default function DubbingTool() {
  const [videoUrl, setVideoUrl] = useState('')
  const [language, setLanguage] = useState('Hindi')
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const job = useJobPoller(jobId)

  const handleSubmit = async () => {
    setLoading(true); setError('')
    const res = await fetch('/api/jobs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'dub', video_url: videoUrl, language }),
    })
    const data = await res.json()
    if (data.error) { setError(data.error === 'daily_limit_reached' ? "Daily limit reached. Upgrade to Pro for 120 min/day." : data.error); setLoading(false) }
    else { setJobId(data.job_id); setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 720, animation: 'fadeIn 0.25s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#c8f542', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Video Dubbing</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>Dub your video into 646 languages</h1>
        <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>Transcribe → translate → re-voice. Full lip-sync-aware pipeline powered by OmniVoice.</p>
      </div>

      {error && <div style={{ padding: '12px 16px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 10, fontSize: 13, color: '#e05555', marginBottom: 20 }}>{error}</div>}

      {/* Free tier warning */}
      <div style={{ padding: '14px 16px', background: '#120e04', border: '1px solid #2a2010', borderRadius: 10, marginBottom: 24, display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 12, color: '#d4a84b', fontWeight: 500 }}>Free plan: 5-minute video limit · Audio watermark applied</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Upgrade to Pro for 60-minute videos and clean exports.</div>
        </div>
      </div>

      {/* Video source */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Video Source</label>
        <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
          placeholder="Paste YouTube URL (e.g. https://youtube.com/watch?v=...)"
          style={{ width: '100%', padding: '12px 14px', fontSize: 13 }} />
        <div style={{ fontSize: 11, color: '#333', marginTop: 6 }}>YouTube URLs supported. Direct video upload coming soon.</div>
      </div>

      {/* Pipeline steps */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { step: '1', label: 'Transcribe', sub: 'WhisperX · 99 langs' },
          { step: '2', label: 'Translate', sub: 'Neural MT' },
          { step: '3', label: 'Re-voice', sub: `OmniVoice · ${language}` },
        ].map(s => (
          <div key={s.step} style={{ padding: '14px', background: '#0c0c0c', border: '1px solid #1a1a1a', borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: '#333', marginBottom: 4 }}>Step {s.step}</div>
            <div style={{ fontSize: 13, color: '#e8e8e8', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 24 }}>
        <LanguageSelector value={language} onChange={setLanguage} plan="free" />
      </div>

      <SubmitButton onClick={handleSubmit} loading={loading} disabled={!videoUrl} label={`Dub to ${language} →`} />

      {job && (job.status === 'pending' || job.status === 'processing') && <ProgressBar progress={job.progress} status={job.status} />}
      {job?.status === 'completed' && job.output_url && <OutputPlayer outputUrl={job.output_url} fileName={`dubbed_${language.toLowerCase()}.mp4`} />}
      {job?.status === 'failed' && <div style={{ marginTop: 16, padding: '14px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 10, fontSize: 13, color: '#e05555' }}>Job failed: {job.error}. Please try again.</div>}
    </div>
  )
}
