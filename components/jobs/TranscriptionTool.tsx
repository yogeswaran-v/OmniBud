'use client'
import { useState, useRef, useEffect } from 'react'
import { useJobPoller, ProgressBar, SubmitButton } from './JobShared'

const SUPPORTED_LANGUAGES = ['English', 'Spanish', 'French', 'Hindi', 'Mandarin', 'Arabic', 'Portuguese', 'German', 'Japanese', 'Korean', 'Russian', 'Italian']

const LANG_TO_CODE: Record<string, string> = {
  English: 'en', Spanish: 'es', French: 'fr', Hindi: 'hi', Mandarin: 'zh',
  Arabic: 'ar', Portuguese: 'pt', German: 'de', Japanese: 'ja', Korean: 'ko',
  Russian: 'ru', Italian: 'it',
}

export default function TranscriptionTool() {
  const [dragging, setDragging] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [language, setLanguage] = useState('English')
  const [jobId, setJobId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const job = useJobPoller(jobId)

  const handleFileSelect = async (file: File) => {
    setAudioFile(file)
    setUploading(true)
    setError('')
    const form = new FormData()
    form.append('file', file)
    form.append('bucket', 'omnidub-inputs')
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (data.error) setError(data.error)
    else setAudioUrl(data.url)
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!audioUrl) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/jobs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'transcription',
        audio_url: audioUrl,
        language: LANG_TO_CODE[language] ?? 'en',
      }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error === 'daily_limit_reached' ? 'Daily limit reached. Upgrade to Pro.' : data.error)
      setLoading(false)
    } else {
      setJobId(data.job_id)
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, animation: 'fadeIn 0.25s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>transcription</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, letterSpacing: '-0.025em' }}>audio to text.</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.6 }}>drop any audio or video file. get an accurate transcript powered by Whisper.</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 10, fontSize: 13, color: '#e05555', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>audio / video file</label>
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : audioFile ? 'rgba(249,115,22,0.30)' : 'var(--border)'}`,
            background: dragging ? 'rgba(249,115,22,0.04)' : audioFile ? 'rgba(249,115,22,0.02)' : 'var(--bg-2)',
            boxShadow: dragging ? '0 0 0 4px rgba(249,115,22,0.08)' : 'none',
            borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.2s var(--ease)',
          }}>
          <input ref={fileRef} type="file" accept="audio/*,video/*" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          {audioFile ? (
            <div>
              <div style={{ color: 'var(--accent-strong)', fontSize: 18, marginBottom: 4 }}>{uploading ? '⏳' : '✓'}</div>
              <div style={{ fontSize: 13, color: 'var(--accent-strong)', fontWeight: 600 }}>{audioFile.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                {uploading ? 'uploading…' : `${(audioFile.size / 1024 / 1024).toFixed(1)} MB · click to replace`}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🎙</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>drop audio or video file here</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>WAV · MP3 · M4A · MP4 · 50MB max</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>language</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUPPORTED_LANGUAGES.map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              style={{ padding: '6px 13px', borderRadius: 'var(--radius-pill)', fontSize: 12, cursor: 'pointer', border: '1px solid var(--border)', background: language === lang ? 'var(--accent)' : 'var(--bg-3)', color: language === lang ? 'var(--accent-text)' : 'var(--text-2)', transition: 'var(--transition)' }}>
              {lang}
            </button>
          ))}
        </div>
      </div>

      <SubmitButton onClick={handleSubmit} loading={loading} disabled={!audioUrl || uploading} label="Transcribe →" />

      {job && (job.status === 'pending' || job.status === 'processing') && (
        <ProgressBar progress={job.progress} status={job.status} />
      )}

      {job?.status === 'completed' && (
        <TranscriptResult jobId={jobId!} />
      )}

      {job?.status === 'failed' && (
        <div style={{ marginTop: 16, padding: '14px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--danger)' }}>
          transcription failed: {job.error}. make sure WHISPER_LOCAL_URL is configured.
        </div>
      )}
    </div>
  )
}

function TranscriptResult({ jobId }: { jobId: string }) {
  const [transcript, setTranscript] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (loaded) return
    fetch(`/api/jobs/status?job_id=${jobId}`)
      .then(r => r.json())
      .then(data => {
        if (data.transcript) setTranscript(data.transcript)
        setLoaded(true)
      })
  }, [jobId, loaded])

  const copy = () => {
    navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!transcript) return (
    <div className="card-accent" style={{ marginTop: 16, padding: '14px', fontSize: 13, color: 'var(--accent-strong)', fontWeight: 600 }}>
      ✓ transcription complete
    </div>
  )

  return (
    <div className="card-accent" style={{ marginTop: 16, padding: '20px', animation: 'springIn 0.4s var(--ease-spring) both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--accent-strong)', fontWeight: 600 }}>✓ transcript</div>
        <button onClick={copy} className="btn-ghost" style={{ fontSize: 11, padding: '6px 12px' }}>
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{transcript}</div>
    </div>
  )
}
