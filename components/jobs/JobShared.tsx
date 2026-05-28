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
  const color = status === 'failed' ? '#e05555' : '#c8f542'
  return (
    <div style={{ marginTop: 20, padding: '20px', background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: '#888' }}>
          {status === 'pending' && '⏳ Queued — waiting for GPU...'}
          {status === 'processing' && '⚡ Processing...'}
          {status === 'completed' && '✅ Done!'}
          {status === 'failed' && '❌ Job failed'}
        </span>
        <span style={{ fontSize: 12, color: '#555' }}>{progress}%</span>
      </div>
      <div style={{ height: 4, background: '#1a1a1a', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${progress}%`, background: color, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export function OutputPlayer({ outputUrl, fileName }: { outputUrl: string; fileName: string }) {
  return (
    <div style={{ marginTop: 16, padding: '20px', background: '#0f1a08', border: '1px solid #2a3a1a', borderRadius: 12, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ fontSize: 12, color: '#c8f542', marginBottom: 12 }}>✓ {fileName}</div>
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
              style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: 'none', cursor: 'pointer', background: value === lang ? '#c8f542' : locked ? '#0f0f0f' : '#1a1a1a', color: value === lang ? '#0a0a0a' : locked ? '#333' : '#666', transition: 'all 0.15s' }}>
              {lang}{locked ? ' 🔒' : ''}
            </button>
          )
        })}
        {plan === 'free' && (
          <button onClick={() => setShowUpgrade(true)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, border: '1px dashed #222', background: 'none', color: '#c8f542', cursor: 'pointer' }}>
            +626 more →
          </button>
        )}
      </div>
      {showUpgrade && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: '#120e04', border: '1px solid #2a2010', borderRadius: 8, fontSize: 12, color: '#d4a84b' }}>
          All 646 languages available on Pro. <button onClick={() => { window.dispatchEvent(new CustomEvent('show-upgrade')) }} style={{ background: 'none', border: 'none', color: '#c8f542', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>Upgrade →</button>
        </div>
      )}
    </div>
  )
}

export function SubmitButton({ onClick, loading, disabled, label }: { onClick: () => void; loading: boolean; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      style={{ padding: '13px 28px', borderRadius: 10, border: 'none', background: (loading || disabled) ? '#141414' : '#c8f542', color: (loading || disabled) ? '#333' : '#0a0a0a', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}>
      {loading ? <><div className="spinner" />{label.replace('→', '...')}</> : label}
    </button>
  )
}
