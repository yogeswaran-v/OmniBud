'use client'
import { useState, useRef } from 'react'
import { useJobPoller, ProgressBar, OutputPlayer, LanguageSelector, SubmitButton } from './JobShared'

export default function VoiceCloneTool() {
  const [text, setText] = useState('')
  const [language, setLanguage] = useState('English')
  const [sampleFile, setSampleFile] = useState<File | null>(null)
  const [sampleUrl, setSampleUrl] = useState('')
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const job = useJobPoller(jobId)

  const handleUpload = async (file: File) => {
    setSampleFile(file)
    // Upload to Supabase storage via API
    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'omnidub-inputs')
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const { url } = await res.json()
    setSampleUrl(url)
  }

  const handleSubmit = async () => {
    if (!sampleUrl || !text) return
    setLoading(true); setError('')
    const res = await fetch('/api/jobs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'clone', sample_url: sampleUrl, text, language }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error === 'daily_limit_reached' ? "You've hit your daily limit. Upgrade to Pro for 120 min/day." : data.error)
      setLoading(false)
    } else {
      setJobId(data.job_id)
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, animation: 'fadeIn 0.25s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: '#f97316', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Voice Clone</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>Clone any voice in seconds</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>Upload a voice sample, type your script, select a language. We do the rest.</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 10, fontSize: 13, color: '#e05555', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Upload */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voice Sample</label>
        <div onClick={() => fileRef.current?.click()}
          style={{ border: `1.5px dashed ${sampleFile ? 'var(--border-2)' : '#1e1e1e'}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: sampleFile ? '#0d150a' : '#0c0c0c', transition: 'all 0.2s' }}>
          <input ref={fileRef} type="file" accept="audio/*,video/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          {sampleFile ? (
            <div>
              <div style={{ color: '#f97316', fontSize: 18, marginBottom: 4 }}>✓</div>
              <div style={{ fontSize: 13, color: '#f97316' }}>{sampleFile.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>Click to replace · Free: 30s max · Pro: 5 min max</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>🎙</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Drop audio file or click to upload</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>WAV · MP3 · M4A · Free plan: 30 seconds max</div>
            </div>
          )}
        </div>
      </div>

      {/* Script */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Script</label>
          <span style={{ fontSize: 11, color: text.length > 450 ? '#e05555' : '#333' }}>{text.length}/500</span>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))}
          placeholder="Type what you want the cloned voice to say..."
          rows={5}
          style={{ width: '100%', padding: '12px 14px', fontSize: 13, lineHeight: 1.7 }} />
      </div>

      {/* Language */}
      <div style={{ marginBottom: 24 }}>
        <LanguageSelector value={language} onChange={setLanguage} plan="free" />
      </div>

      <SubmitButton onClick={handleSubmit} loading={loading} disabled={!sampleUrl || !text} label="Clone Voice →" />

      {/* Job progress */}
      {job && (job.status === 'pending' || job.status === 'processing') && (
        <ProgressBar progress={job.progress} status={job.status} />
      )}
      {job?.status === 'completed' && job.output_url && (
        <OutputPlayer outputUrl={job.output_url} fileName="cloned_voice.mp3" />
      )}
      {job?.status === 'failed' && (
        <div style={{ marginTop: 16, padding: '14px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 10, fontSize: 13, color: '#e05555' }}>
          Job failed: {job.error || 'Unknown error'}. Please try again.
        </div>
      )}
    </div>
  )
}
