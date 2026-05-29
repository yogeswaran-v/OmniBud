'use client'
import { useState, useEffect, useCallback } from 'react'

interface HistoryJob {
  id: string
  type: string
  status: string
  progress: number
  output_url?: string
  error?: string
  created_at: string
  completed_at?: string
  input: Record<string, unknown>
}

export default function HistoryList() {
  const [jobs, setJobs] = useState<HistoryJob[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'tts' | 'transcription'>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const params = filter !== 'all' ? `?type=${filter}` : ''
    const res = await fetch(`/api/history${params}`)
    const data = await res.json()
    setJobs(data.jobs ?? [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#c8f542', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>History</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>Job history</h1>
        <p style={{ fontSize: 13, color: '#555', marginTop: 6 }}>All your past TTS and transcription jobs.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'tts', 'transcription'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', fontSize: 12, background: filter === f ? '#c8f542' : '#1a1a1a', color: filter === f ? '#0a0a0a' : '#666' }}>
            {f === 'all' ? 'All' : f === 'tts' ? 'Text to Speech' : 'Transcription'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: '#444', fontSize: 13 }}>Loading...</div>
      ) : jobs.length === 0 ? (
        <div style={{ padding: 40, border: '1px dashed #1a1a1a', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>📋</div>
          <div style={{ fontSize: 13, color: '#444' }}>No jobs yet</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {jobs.map(job => (
            <div key={job.id} style={{ padding: '14px 16px', background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: job.output_url ? 12 : 0 }}>
                <div style={{ fontSize: 18, marginTop: 1 }}>
                  {job.type === 'tts' ? '📝' : job.type === 'transcription' ? '🎙' : '🎬'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#e8e8e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{job.type}</span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20,
                      background: job.status === 'completed' ? '#0d1a08' : job.status === 'failed' ? '#1a0808' : '#111',
                      color: job.status === 'completed' ? '#c8f542' : job.status === 'failed' ? '#e05555' : '#555',
                      border: `1px solid ${job.status === 'completed' ? '#2a3a1a' : job.status === 'failed' ? '#3a1010' : '#1e1e1e'}` }}>
                      {job.status}
                    </span>
                    <span style={{ fontSize: 11, color: '#333', marginLeft: 'auto' }}>{fmt(job.created_at)}</span>
                  </div>
                  {job.type === 'tts' && typeof job.input.text === 'string' && (
                    <div style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      &quot;{job.input.text.slice(0, 120)}&quot;
                    </div>
                  )}
                  {job.type === 'transcription' && typeof job.input.transcript === 'string' && (
                    <div style={{ fontSize: 12, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      &quot;{job.input.transcript.slice(0, 120)}&quot;
                    </div>
                  )}
                  {job.status === 'failed' && job.error && (
                    <div style={{ fontSize: 11, color: '#e05555', marginTop: 2 }}>Error: {job.error}</div>
                  )}
                </div>
              </div>
              {job.status === 'completed' && job.output_url && job.type === 'tts' && (
                <div style={{ paddingLeft: 30 }}>
                  <audio controls src={job.output_url} style={{ width: '100%', maxWidth: 400, height: 32 }} />
                  <a href={job.output_url} download={`${job.id}.mp3`}
                    style={{ display: 'inline-block', marginTop: 6, fontSize: 11, color: '#555', textDecoration: 'none' }}>
                    ↓ Download
                  </a>
                </div>
              )}
              {job.type === 'transcription' && typeof job.input.transcript === 'string' && (
                <div style={{ paddingLeft: 30, marginTop: 8 }}>
                  <div style={{ padding: '10px 12px', background: '#141414', borderRadius: 8, fontSize: 12, color: '#888', lineHeight: 1.6, maxHeight: 80, overflow: 'hidden' }}>
                    {job.input.transcript}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
