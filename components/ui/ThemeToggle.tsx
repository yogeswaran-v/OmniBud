'use client'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  try {
    return (localStorage.getItem('omnidub-theme') as Theme) || 'dark'
  } catch {
    return 'dark'
  }
}

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) || 'dark')
  }, [])

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('omnidub-theme', next) } catch { /* ignore */ }
  }

  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: compact ? 0 : 8,
        width: compact ? 36 : undefined,
        height: 36,
        padding: compact ? 0 : '0 14px',
        borderRadius: 'var(--radius-pill)',
        background: 'var(--bg-3)',
        border: '1px solid var(--border)',
        color: 'var(--text-2)',
        fontSize: 13, fontWeight: 500,
        transition: 'var(--transition)',
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{isDark ? '☀️' : '🌙'}</span>
      {!compact && <span>{isDark ? 'light' : 'dark'}</span>}
    </button>
  )
}
