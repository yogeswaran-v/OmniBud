'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export interface ChecklistStep {
  id: string
  label: string
  href: string
  done: boolean
}

interface Props {
  steps: ChecklistStep[]
}

/** Crextio-style "Onboarding Task N/total" dark card. Dismissible, persisted. */
export default function OnboardingChecklist({ steps }: Props) {
  const [dismissed, setDismissed] = useState(true)
  const done = steps.filter(s => s.done).length

  useEffect(() => {
    try { setDismissed(localStorage.getItem('omnidub-onboard-dismissed') === '1') } catch { setDismissed(false) }
  }, [])

  if (dismissed || done === steps.length) return null

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem('omnidub-onboard-dismissed', '1') } catch { /* ignore */ }
  }

  return (
    <div className="card-contrast animate-pop" style={{ padding: 20, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-contrast)' }}>get started</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="giant-num" style={{ fontSize: 22, color: 'var(--accent)' }}>{done}/{steps.length}</span>
          <button onClick={dismiss} aria-label="dismiss" style={{ color: 'var(--on-contrast-2)', fontSize: 16, lineHeight: 1 }}>✕</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {steps.map(s => (
          <Link key={s.id} href={s.href}
            style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 8px', borderRadius: 'var(--radius-sm)', transition: 'var(--transition)' }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              background: s.done ? 'var(--accent)' : 'transparent',
              border: s.done ? 'none' : '1.5px solid var(--on-contrast-2)',
              color: s.done ? 'var(--accent-text)' : 'transparent',
            }}>✓</span>
            <span style={{ fontSize: 13, color: s.done ? 'var(--on-contrast-2)' : 'var(--on-contrast)', textDecoration: s.done ? 'line-through' : 'none', flex: 1 }}>
              {s.label}
            </span>
            {!s.done && <span style={{ fontSize: 14, color: 'var(--accent)' }}>→</span>}
          </Link>
        ))}
      </div>
    </div>
  )
}
