'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Profile, Job } from '@/types'
import UpgradeModal, { UpgradeTrigger } from '@/components/ui/UpgradeModal'
import ToastProvider from '@/components/ui/Toast'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface Props {
  user: { email: string; id: string }
  profile: Profile & { streak_count?: number }
  usage: { minutes_used: number; jobs_count: number }
  recentJobs: Partial<Job>[]
  children: React.ReactNode
}

const TOOLS = [
  { label: 'text to speech',       href: '/dashboard/tts',           icon: '📝', locked: false },
  { label: 'transcription',        href: '/dashboard/transcription', icon: '🎙', locked: false },
  { label: 'voice profiles',       href: '/dashboard/voices',        icon: '👤', locked: false },
  { label: 'history',              href: '/dashboard/history',       icon: '📋', locked: false },
  { label: 'sounds like you',      href: '/dashboard',               icon: '🎭', locked: true  },
  { label: 'speak their language', href: '/dashboard/dub',           icon: '🎬', locked: true  },
]

export default function DashboardShell({ user, profile, usage, recentJobs, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [upgradeTrigger, setUpgradeTrigger] = useState<UpgradeTrigger | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const plan = (profile.plan || 'free') as 'free' | 'pro'
  const limits = PLAN_LIMITS[plan]
  const pctUsed = (usage.minutes_used / limits.minutesPerDay) * 100
  const remaining = Math.max(0, limits.minutesPerDay - usage.minutes_used)
  const usageColor = pctUsed >= 95 ? 'var(--danger)' : pctUsed >= 80 ? 'var(--warning)' : 'var(--accent)'
  const streak = profile.streak_count ?? 0

  useEffect(() => { setMobileMenuOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleLockedClick = (href: string) => {
    if (href === '/dashboard') setUpgradeTrigger('voice_clone')
    else if (href === '/dashboard/dub') setUpgradeTrigger('video_dub')
    else setUpgradeTrigger('generic')
  }

  function SidebarContent() {
    return (
      <>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 12px rgba(249,115,22,0.25)' }}>
            <div style={{ width: 8, height: 8, background: '#07070c', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>OmniDub</span>
          {streak >= 3 && (
            <span style={{ fontSize: 10, marginLeft: 'auto', background: 'rgba(240,160,48,0.15)', color: 'var(--warning)', border: '1px solid rgba(240,160,48,0.25)', padding: '1px 7px', borderRadius: 10, fontWeight: 600, boxShadow: streak >= 7 ? '0 0 12px rgba(249,115,22,0.30)' : 'none' }}>
              {`🔥 ${streak}`}
            </span>
          )}
        </Link>

        <div style={{ marginBottom: 20, padding: 10, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{plan} plan</span>
            {plan === 'free' && (
              <button onClick={() => setUpgradeTrigger('generic')} style={{ fontSize: 10, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Pro →
              </button>
            )}
          </div>
          <div style={{ height: 3, background: 'var(--bg-4)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(pctUsed, 100)}%`, background: usageColor, borderRadius: 3, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{usage.minutes_used.toFixed(1)} used</span>
            <span style={{ fontSize: 10, color: pctUsed >= 80 ? usageColor : 'var(--text-3)' }}>{remaining.toFixed(1)} left</span>
          </div>
        </div>

        <div style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, paddingLeft: 2, fontWeight: 600 }}>tools</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 20 }}>
          {TOOLS.map(tool => {
            const active = pathname === tool.href
            const locked = tool.locked && plan === 'free'
            if (locked) {
              return (
                <button key={tool.href} onClick={() => handleLockedClick(tool.href)}
                  style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: 'transparent', color: 'var(--text-4)', fontSize: 13, borderLeft: '2px solid transparent', opacity: 0.45, textAlign: 'left', width: '100%', cursor: 'pointer' }}>
                  <span style={{ fontSize: 14 }}>{tool.icon}</span>
                  <span style={{ flex: 1 }}>{tool.label}</span>
                  <span style={{ fontSize: 9 }}>🔒</span>
                </button>
              )
            }
            return (
              <Link key={tool.href} href={tool.href}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--radius)', background: active ? 'rgba(249,115,22,0.06)' : 'transparent', color: active ? 'var(--accent)' : 'var(--text-3)', fontSize: 13, fontWeight: active ? 500 : 400, borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`, transition: 'var(--transition)' }}
                onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-2)'; (e.currentTarget as HTMLAnchorElement).style.background = 'var(--bg-3)' } }}
                onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-3)'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' } }}
              >
                <span style={{ fontSize: 14 }}>{tool.icon}</span>
                {tool.label}
              </Link>
            )
          })}
        </nav>

        {recentJobs.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6, paddingLeft: 2, fontWeight: 600 }}>recent</div>
            <div style={{ marginBottom: 16 }}>
              {recentJobs.slice(0, 4).map(job => (
                <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', borderRadius: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: job.status === 'completed' ? 'var(--accent)' : job.status === 'failed' ? 'var(--danger)' : 'var(--text-4)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)', flex: 1 }}>{(job.type ?? '').toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-4)' }}>{job.status === 'completed' ? '✓' : job.status === 'failed' ? '✗' : '…'}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ flex: 1 }} />
        <div style={{ marginBottom: 12 }}>
          <ThemeToggle />
        </div>
        <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          <button onClick={handleSignOut} style={{ fontSize: 11, color: 'var(--text-4)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>out</button>
        </div>
      </>
    )
  }

  return (
    <div className="bg-app" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {pctUsed >= 80 && (
        <div style={{ background: pctUsed >= 95 ? 'var(--danger-dim)' : 'var(--warning-dim)', borderBottom: `1px solid ${pctUsed >= 95 ? 'var(--danger)' : 'var(--warning)'}`, padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 12, color: pctUsed >= 95 ? 'var(--danger)' : 'var(--warning)', animation: 'slideDown 0.2s ease' }}>
          {pctUsed >= 95 ? `only ${remaining.toFixed(1)} min left today` : `running low — ${remaining.toFixed(1)} min remaining`}
          {plan === 'free' && (
            <button onClick={() => setUpgradeTrigger('daily_limit')} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 600, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}>
              upgrade for 120 min/day →
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1 }}>
        <aside className="hide-mobile" style={{ width: 224, background: 'var(--bg-2)', boxShadow: 'inset -1px 0 0 var(--border)', flexShrink: 0, padding: '20px 14px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <SidebarContent />
        </aside>
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', animation: 'fadeIn 0.25s ease', paddingBottom: 80 }}>
          {children}
        </main>
      </div>

      <nav className="show-mobile" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-2)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)', padding: '8px 0 12px', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { label: 'tts', icon: '📝', href: '/dashboard/tts' },
            { label: 'transcribe', icon: '🎙', href: '/dashboard/transcription' },
            { label: 'voices', icon: '👤', href: '/dashboard/voices' },
            { label: 'history', icon: '📋', href: '/dashboard/history' },
          ].map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, color: active ? 'var(--accent)' : 'var(--text-3)', fontSize: 10, padding: '4px 0' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
          <button onClick={() => setMobileMenuOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1, color: 'var(--text-3)', fontSize: 10, padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: 22 }}>⋯</span>
            <span>more</span>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderRadius: '20px 20px 0 0', padding: '20px 16px 40px', maxHeight: '80vh', overflowY: 'auto', animation: 'springIn 0.4s var(--ease-spring)' }}>
            <div style={{ width: 32, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <SidebarContent />
          </div>
        </div>
      )}

      {upgradeTrigger && <UpgradeModal trigger={upgradeTrigger} onClose={() => setUpgradeTrigger(null)} />}
      <ToastProvider />
    </div>
  )
}
