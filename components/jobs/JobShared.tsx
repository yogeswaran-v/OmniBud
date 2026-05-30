'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import type { Job } from '@/types'

interface JobResult { id: string; status: string; output_url?: string; progress: number; error?: string }

export function useJobPoller(jobId: string | null) {
  const [job, setJob] = useState<JobResult | null>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  const poll = useCallback(async () => {
    if (!jobId) return
    const res = await fetch(`/api/jobs/status?job_id=${jobId}`)
    const data = await res.json()
    setJob(data)
    if (data.status === 'completed' || data.status === 'failed') {
      clearInterval(intervalRef.current)
    }
  }, [jobId])

  useEffect(() => {
    if (!jobId) return
    poll()
    intervalRef.current = setInterval(poll, 3000)
    return () => clearInterval(intervalRef.current)
  }, [jobId, poll])

  return job
}

export function ProgressBar({ progress, status }: { progress: number; status: string }) {
  return (
    <div style={{ marginTop: 20, padding: '20px 22px', background: 'var(--bg-2)', boxShadow: 'var(--shadow-1)', borderRadius: 'var(--radius)', animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: status === 'failed' ? 'var(--danger)' : 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
          {status === 'pending' && <><div className="spinner" /> queued — waiting for GPU</>}
          {status === 'processing' && <><div className="spinner" style={{ borderTopColor: 'var(--accent)' }} /> processing…</>}
          {status === 'completed' && '✓ done'}
          {status === 'failed' && '✗ failed'}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{progress}%</span>
      </div>
      <div style={{ height: 3, background: 'var(--bg-4)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, width: `${progress}%`, background: status === 'failed' ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent-2), var(--accent))', transition: 'width 0.6s var(--ease-out)' }} />
      </div>
    </div>
  )
}

export function OutputPlayer({ outputUrl, fileName }: { outputUrl: string; fileName: string }) {
  return (
    <div style={{ marginTop: 16, padding: '20px', background: '#0f1a08', border: '1px solid #2a3a1a', borderRadius: 12, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ fontSize: 12, color: '#f97316', marginBottom: 12 }}>✓ {fileName}</div>
      {outputUrl.includes('.mp4') || outputUrl.includes('.webm') ? (
        <video controls src={outputUrl} style={{ width: '100%', borderRadius: 8, background: '#000', maxHeight: 300 }} />
      ) : (
        <audio controls src={outputUrl} style={{ width: '100%' }} />
      )}
      <a href={outputUrl} download={fileName} style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', background: '#1e1e1e', borderRadius: 7, fontSize: 12, color: '#888' }}>
        ↓ Download
      </a>
    </div>
  )
}

export function LanguageSelector({ value, onChange, plan }: { value: string; onChange: (l: string) => void; plan: string }) {
  const { ALL_LANGUAGES, FREE_LANGUAGES } = require('@/lib/constants')
  const [showUpgrade, setShowUpgrade] = useState(false)

  return (
    <div>
      <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Target Language</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {ALL_LANGUAGES.map((lang: string) => {
          const locked = plan === 'free' && !FREE_LANGUAGES.includes(lang)
          return (
            <button key={lang}
              onClick={() => locked ? setShowUpgrade(true) : onChange(lang)}
              style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: 'none', cursor: 'pointer', background: value === lang ? '#f97316' : locked ? '#0f0f0f' : '#1a1a1a', color: value === lang ? '#07070c' : locked ? '#333' : '#666', transition: 'all 0.15s' }}>
              {lang}{locked ? ' 🔒' : ''}
            </button>
          )
        })}
        {plan === 'free' && (
          <button onClick={() => setShowUpgrade(true)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '1px dashed #222', background: 'none', color: '#f97316', cursor: 'pointer' }}>
            +626 more →
          </button>
        )}
      </div>
      {showUpgrade && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: '#120e04', border: '1px solid #2a2010', borderRadius: 8, fontSize: 12, color: '#d4a84b' }}>
          All 646 languages available on Pro. <button onClick={() => { window.dispatchEvent(new CustomEvent('show-upgrade')) }} style={{ background: 'none', border: 'none', color: '#f97316', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Upgrade →</button>
        </div>
      )}
    </div>
  )
}

export function SubmitButton({ onClick, loading, disabled, label }: { onClick: () => void; loading: boolean; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className={`btn-accent${loading ? ' btn-shimmer' : ''}`}
      style={{ padding: '14px 32px', fontSize: 14, opacity: disabled && !loading ? 0.4 : 1 }}>
      {loading ? <><div className="spinner" />{label.replace('→', '…')}</> : label}
    </button>
  )
}
