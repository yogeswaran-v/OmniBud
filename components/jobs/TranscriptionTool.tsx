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
        <div style={{ fontSize: 11, color: '#c8f542', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Transcription</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>Transcribe audio to text</h1>
        <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>Upload any audio or video file. Get an accurate transcript powered by Whisper.</p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 10, fontSize: 13, color: '#e05555', marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Audio / Video File</label>
        <div onClick={() => fileRef.current?.click()}
          style={{ border: `1.5px dashed ${audioFile ? '#2a3a1a' : '#1e1e1e'}`, borderRadius: 12, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: audioFile ? '#0d150a' : '#0c0c0c', transition: 'all 0.2s' }}>
          <input ref={fileRef} type="file" accept="audio/*,video/*" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          {audioFile ? (
            <div>
              <div style={{ color: '#c8f542', fontSize: 18, marginBottom: 4 }}>{uploading ? '⏳' : '✓'}</div>
              <div style={{ fontSize: 13, color: '#c8f542' }}>{audioFile.name}</div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 3 }}>
                {uploading ? 'Uploading...' : `${(audioFile.size / 1024 / 1024).toFixed(1)} MB · Click to replace`}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}>🎙</div>
              <div style={{ fontSize: 13, color: '#555' }}>Drop audio or video file here</div>
              <div style={{ fontSize: 11, color: '#333', marginTop: 4 }}>WAV · MP3 · M4A · MP4 · 50MB max</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Language</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUPPORTED_LANGUAGES.map(lang => (
            <button key={lang} onClick={() => setLanguage(lang)}
              style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: 'none', cursor: 'pointer', background: language === lang ? '#c8f542' : '#1a1a1a', color: language === lang ? '#0a0a0a' : '#666', transition: 'all 0.15s' }}>
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
        <div style={{ marginTop: 16, padding: '14px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 10, fontSize: 13, color: '#e05555' }}>
          Transcription failed: {job.error}. Make sure WHISPER_LOCAL_URL is configured.
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
    <div style={{ marginTop: 16, padding: '14px', background: '#0f1a08', border: '1px solid #2a3a1a', borderRadius: 12, fontSize: 13, color: '#c8f542' }}>
      ✓ Transcription complete
    </div>
  )

  return (
    <div style={{ marginTop: 16, padding: '20px', background: '#0f1a08', border: '1px solid #2a3a1a', borderRadius: 12, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: '#c8f542' }}>✓ Transcript</div>
        <button onClick={copy} style={{ padding: '5px 12px', background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 11, color: '#888', cursor: 'pointer' }}>
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{transcript}</div>
    </div>
  )
}
