'use client'
import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastItem { id: number; message: string; type: ToastType }

let _add: ((msg: string, type: ToastType) => void) | null = null

export function toast(message: string, type: ToastType = 'info') {
  _add?.(message, type)
}

export default function ToastProvider() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    _add = (message, type) => {
      const id = Date.now()
      setItems(prev => [...prev.slice(-3), { id, message, type }])
      setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 3800)
    }
    return () => { _add = null }
  }, [])

  if (!items.length) return null

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {items.map(t => (
        <div
          key={t.id}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius)',
            fontSize: 13,
            fontWeight: 500,
            pointerEvents: 'auto',
            animation: 'slideUp 0.24s ease',
            background: t.type === 'success' ? 'rgba(200,245,66,0.12)' : t.type === 'error' ? 'rgba(224,85,85,0.12)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${t.type === 'success' ? 'rgba(200,245,66,0.3)' : t.type === 'error' ? 'rgba(224,85,85,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: t.type === 'success' ? 'var(--accent)' : t.type === 'error' ? 'var(--danger)' : 'var(--text-2)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            maxWidth: 300,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
