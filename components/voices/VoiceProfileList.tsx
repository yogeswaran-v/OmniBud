'use client'
import { useState, useEffect, useCallback } from 'react'
import type { VoiceProfile } from '@/types'

function avatarColor(name: string): string {
  const colors = ['#a78bfa','#f97316','#f0a030','#e05555','#4ade80','#60a5fa','#f472b6','#a78bfa']
  let hash = 0
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  return colors[Math.abs(hash) % colors.length]
}
function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

interface Props {
  onSelect?: (profile: VoiceProfile) => void
  showCreate?: boolean
}

export default function VoiceProfileList({ onSelect, showCreate = true }: Props) {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sampleFile, setSampleFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/voices')
    const data = await res.json()
    if (data.error) setError(data.error)
    else setProfiles(data.profiles)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    let sample_url: string | undefined

    if (sampleFile) {
      setUploading(true)
      const form = new FormData()
      form.append('file', sampleFile)
      form.append('bucket', 'omnidub-inputs')
      const upRes = await fetch('/api/upload', { method: 'POST', body: form })
      const upData = await upRes.json()
      sample_url = upData.url
      setUploading(false)
    }

    const res = await fetch('/api/voices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, sample_url }),
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
    } else {
      setProfiles(prev => [data.profile, ...prev])
      setShowForm(false)
      setName('')
      setDescription('')
      setSampleFile(null)
    }
    setCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this voice profile?')) return
    await fetch(`/api/voices/${id}`, { method: 'DELETE' })
    setProfiles(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return <div style={{ color: 'var(--text-3)', fontSize: 13, padding: 20 }}>Loading voice profiles...</div>

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 600 }}>voice profiles</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, letterSpacing: '-0.025em' }}>your voice library.</h1>
        </div>
        {showCreate && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: showForm ? '#1a1a1a' : '#f97316', color: showForm ? '#555' : '#07070c', fontSize: 12, fontWeight: 600 }}>
            {showForm ? 'Cancel' : '+ New Profile'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 10, fontSize: 13, color: '#e05555', marginBottom: 16 }}>{error}</div>
      )}

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>New voice profile</div>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Profile name (e.g. My Voice, Client Voice)"
            style={{ width: '100%', padding: '10px 12px', fontSize: 13, marginBottom: 10 }}
          />
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Optional description"
            rows={2}
            style={{ width: '100%', padding: '10px 12px', fontSize: 13, marginBottom: 10 }}
          />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voice Sample (optional)</label>
            <div onClick={() => document.getElementById('vp-sample-upload')?.click()}
              style={{ border: '1.5px dashed var(--border-2)', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-3)' }}>
              <input id="vp-sample-upload" type="file" accept="audio/*" style={{ display: 'none' }}
                onChange={e => setSampleFile(e.target.files?.[0] ?? null)} />
              {sampleFile
                ? <span style={{ fontSize: 12, color: '#f97316' }}>✓ {sampleFile.name}</span>
                : <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Click to upload audio sample (WAV · MP3 · M4A)</span>
              }
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !name.trim()}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: (!name.trim() || creating) ? '#141414' : '#f97316', color: (!name.trim() || creating) ? '#333' : '#07070c', fontSize: 12, fontWeight: 600 }}>
            {uploading ? 'Uploading...' : creating ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      )}

      {profiles.length === 0 ? (
        <div style={{ padding: 40, border: '1px dashed #1a1a1a', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>🎙</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No voice profiles yet</div>
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>Create a profile to save voice samples for cloning</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {profiles.map(p => (
            <div key={p.id}
              onClick={() => onSelect?.(p)}
              style={{ padding: '18px 16px', background: 'var(--bg-2)', boxShadow: 'var(--shadow-1)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 14, cursor: onSelect ? 'pointer' : 'default', transition: 'var(--transition)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-2)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-1)' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor(p.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#07070c', flexShrink: 0 }}>
                {initials(p.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: p.status === 'ready' ? '#0d1a08' : '#1a1008', color: p.status === 'ready' ? '#f97316' : '#a07020', border: `1px solid ${p.status === 'ready' ? '#2a3a1a' : '#3a2a10'}` }}>
                  {p.status}
                </span>
                {p.sample_url && (
                  <audio src={p.sample_url} controls style={{ height: 24, maxWidth: 140 }} onClick={e => e.stopPropagation()} />
                )}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(p.id) }}
                  style={{ padding: '4px 8px', background: 'none', border: '1px solid #1e1e1e', borderRadius: 6, color: 'var(--text-3)', fontSize: 11, cursor: 'pointer' }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
