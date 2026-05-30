'use client'
import { useState, useEffect, useCallback } from 'react'
import WaveformPlayer from '@/components/ui/WaveformPlayer'
import { toast } from '@/components/ui/Toast'
import Link from 'next/link'

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
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const copyTranscript = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast('transcript copied', 'success')).catch(() => toast('copy failed', 'error'))
  }

  const shareJob = async (id: string) => {
    try {
      await fetch(`/api/jobs/${id}/share`, { method: 'POST' })
      await navigator.clipboard.writeText(`${window.location.origin}/share/${id}`)
      toast('share link copied', 'success')
    } catch {
      toast('copy failed', 'error')
    }
  }

  // Stats: minutes generated this week
  const now = Date.now()
  const weekMs = 7 * 86400000
  const weekJobs = jobs.filter(j => j.status === 'completed' && j.type === 'tts' && (now - new Date(j.created_at).getTime()) < weekMs)

  return (
    <div style={{ maxWidth: 860, animation: 'fadeIn 0.28s ease' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, fontWeight: 600 }}>history</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em' }}>your jobs</h1>
          {weekJobs.length > 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-3)', paddingBottom: 4 }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{weekJobs.length}</span> generation{weekJobs.length !== 1 ? 's' : ''} this week
            </div>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'tts', 'transcription'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
              background: filter === f ? 'var(--accent)' : 'transparent',
              color: filter === f ? '#07070c' : 'var(--text-3)',
              fontSize: 12, fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer', transition: 'var(--transition)',
            }}>
            {f === 'all' ? 'all' : f === 'tts' ? 'voiceover' : 'transcription'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div style={{ padding: 48, border: '1px dashed var(--border)', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>📋</div>
          <div style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 16 }}>nothing here yet.</div>
          <Link href="/dashboard/tts" className="btn-accent" style={{ display: 'inline-flex', fontSize: 13 }}>generate your first voiceover →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {jobs.map(job => {
            const isOpen = expanded.has(job.id)
            const inputText = typeof job.input?.text === 'string' ? job.input.text : null
            const transcript = typeof job.input?.transcript === 'string' ? job.input.transcript : null
            const hasAudio = job.status === 'completed' && job.output_url && job.type === 'tts'
            const hasTx = job.type === 'transcription' && transcript

            return (
              <div key={job.id} style={{
                background: 'rgba(255,255,255,0.025)',
                boxShadow: 'var(--shadow-1)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                transition: 'var(--transition)',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-2)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow-1)')}
              >
                {/* Row header */}
                <div
                  onClick={() => (hasAudio || hasTx) && toggleExpand(job.id)}
                  style={{
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: hasAudio || hasTx ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                    background: job.status === 'completed' ? 'var(--accent)' : job.status === 'failed' ? 'var(--danger)' : 'var(--text-4)',
                    boxShadow: job.status === 'completed' ? '0 0 8px rgba(249,115,22,0.50)' : job.status === 'failed' ? '0 0 8px rgba(224,85,85,0.5)' : 'none',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {job.type === 'tts' ? 'voiceover' : job.type}
                      </span>
                      <span style={{
                        fontSize: 10, padding: '2px 7px', borderRadius: 20,
                        background: job.status === 'completed' ? 'var(--accent-dim)' : job.status === 'failed' ? 'var(--danger-dim)' : 'var(--bg-3)',
                        color: job.status === 'completed' ? 'var(--accent)' : job.status === 'failed' ? 'var(--danger)' : 'var(--text-3)',
                        border: `1px solid ${job.status === 'completed' ? 'rgba(249,115,22,0.20)' : job.status === 'failed' ? 'rgba(224,85,85,0.2)' : 'var(--border)'}`,
                      }}>
                        {job.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 'auto' }}>{fmt(job.created_at)}</span>
                    </div>
                    {inputText && (
                      <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        &quot;{inputText.slice(0, 100)}{inputText.length > 100 ? '…' : ''}&quot;
                      </div>
                    )}
                    {transcript && !inputText && (
                      <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {transcript.slice(0, 100)}{transcript.length > 100 ? '…' : ''}
                      </div>
                    )}
                    {job.status === 'failed' && job.error && (
                      <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 2 }}>error: {job.error}</div>
                    )}
                  </div>
                  {(hasAudio || hasTx) && (
                    <div style={{ fontSize: 14, color: 'var(--text-4)', flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      ↓
                    </div>
                  )}
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)', paddingTop: 16, animation: 'slideDown 0.2s ease' }}>
                    {hasAudio && job.output_url && (
                      <div style={{ marginBottom: 14 }}>
                        <WaveformPlayer src={job.output_url} />
                      </div>
                    )}

                    {hasTx && transcript && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{
                          padding: '12px 14px',
                          background: 'var(--bg-3)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          fontSize: 13,
                          color: 'var(--text-2)',
                          lineHeight: 1.7,
                          maxHeight: 160,
                          overflowY: 'auto',
                        }}>
                          {transcript}
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {hasAudio && job.output_url && (
                        <a
                          href={job.output_url}
                          download={`omnidub-${job.id}.mp3`}
                          style={{
                            fontSize: 12, color: 'var(--text-3)',
                            padding: '6px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}
                        >
                          ↓ download
                        </a>
                      )}
                      {hasAudio && (
                        <button
                          onClick={() => shareJob(job.id)}
                          style={{
                            fontSize: 12, color: 'var(--text-3)',
                            padding: '6px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            background: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          ↗ share
                        </button>
                      )}
                      {hasTx && transcript && (
                        <button
                          onClick={() => copyTranscript(transcript)}
                          style={{
                            fontSize: 12, color: 'var(--text-3)',
                            padding: '6px 12px',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            background: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          copy text
                        </button>
                      )}
                      {job.status === 'failed' && (
                        <Link
                          href={`/dashboard/${job.type}`}
                          style={{
                            fontSize: 12, color: 'var(--accent)',
                            padding: '6px 12px',
                            border: '1px solid rgba(249,115,22,0.20)',
                            borderRadius: 8,
                            textDecoration: 'none',
                          }}
                        >
                          try again →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
