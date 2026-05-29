'use client'
import { useState, useEffect, useCallback } from 'react'
import type { VoiceProfile } from '@/types'

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

  if (loading) return <div style={{ color: '#444', fontSize: 13, padding: 20 }}>Loading voice profiles...</div>

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: '#c8f542', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Voice Profiles</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, letterSpacing: '-0.02em' }}>Your voice library</h1>
        </div>
        {showCreate && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: '9px 18px', borderRadius: 8, border: 'none', background: showForm ? '#1a1a1a' : '#c8f542', color: showForm ? '#555' : '#0a0a0a', fontSize: 12, fontWeight: 600 }}>
            {showForm ? 'Cancel' : '+ New Profile'}
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#1a0808', border: '1px solid #3a1010', borderRadius: 10, fontSize: 13, color: '#e05555', marginBottom: 16 }}>{error}</div>
      )}

      {showForm && (
        <div style={{ padding: 20, background: '#0f0f0f', border: '1px solid #1e1e1e', borderRadius: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>New voice profile</div>
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
            <label style={{ fontSize: 11, color: '#555', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voice Sample (optional)</label>
            <div onClick={() => document.getElementById('vp-sample-upload')?.click()}
              style={{ border: '1.5px dashed #1e1e1e', borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: '#0c0c0c' }}>
              <input id="vp-sample-upload" type="file" accept="audio/*" style={{ display: 'none' }}
                onChange={e => setSampleFile(e.target.files?.[0] ?? null)} />
              {sampleFile
                ? <span style={{ fontSize: 12, color: '#c8f542' }}>✓ {sampleFile.name}</span>
                : <span style={{ fontSize: 12, color: '#444' }}>Click to upload audio sample (WAV · MP3 · M4A)</span>
              }
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !name.trim()}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: (!name.trim() || creating) ? '#141414' : '#c8f542', color: (!name.trim() || creating) ? '#333' : '#0a0a0a', fontSize: 12, fontWeight: 600 }}>
            {uploading ? 'Uploading...' : creating ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      )}

      {profiles.length === 0 ? (
        <div style={{ padding: 40, border: '1px dashed #1a1a1a', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>🎙</div>
          <div style={{ fontSize: 13, color: '#444' }}>No voice profiles yet</div>
          <div style={{ fontSize: 12, color: '#2a2a2a', marginTop: 4 }}>Create a profile to save voice samples for cloning</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {profiles.map(p => (
            <div key={p.id}
              onClick={() => onSelect?.(p)}
              style={{ padding: '14px 16px', background: '#0f0f0f', border: '1px solid #1a1a1a', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14, cursor: onSelect ? 'pointer' : 'default', transition: 'border-color 0.15s' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                🎙
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e8e8', marginBottom: 2 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: p.status === 'ready' ? '#0d1a08' : '#1a1008', color: p.status === 'ready' ? '#c8f542' : '#a07020', border: `1px solid ${p.status === 'ready' ? '#2a3a1a' : '#3a2a10'}` }}>
                  {p.status}
                </span>
                {p.sample_url && (
                  <audio src={p.sample_url} controls style={{ height: 24, maxWidth: 140 }} onClick={e => e.stopPropagation()} />
                )}
                <button
                  onClick={e => { e.stopPropagation(); handleDelete(p.id) }}
                  style={{ padding: '4px 8px', background: 'none', border: '1px solid #1e1e1e', borderRadius: 6, color: '#555', fontSize: 11, cursor: 'pointer' }}>
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
