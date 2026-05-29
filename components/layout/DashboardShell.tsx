'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Profile, Job } from '@/types'
import UpgradeModal from '@/components/ui/UpgradeModal'

interface Props {
  user: { email: string; id: string }
  profile: Profile
  usage: { minutes_used: number; jobs_count: number }
  recentJobs: Partial<Job>[]
  children: React.ReactNode
}

const TABS = [
  { label: 'Voice Clone', href: '/dashboard', icon: '🎙' },
  { label: 'Text to Speech', href: '/dashboard/tts', icon: '📝' },
  { label: 'Transcription', href: '/dashboard/transcription', icon: '🔤' },
  { label: 'Video Dubbing', href: '/dashboard/dub', icon: '🎬' },
  { label: 'Voice Profiles', href: '/dashboard/voices', icon: '👤' },
  { label: 'History', href: '/dashboard/history', icon: '📋' },
]

function UsageBar({ used, total, label }: { used: number; total: number; label: string }) {
  const pct = Math.min((used / total) * 100, 100)
  const warn = pct > 80
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: 10, color: warn ? '#e05555' : '#444' }}>{used.toFixed(1)}/{total}</span>
      </div>
      <div style={{ height: 3, background: '#1a1a1a', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: warn ? '#e05555' : '#c8f542', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export default function DashboardShell({ user, profile, usage, recentJobs, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showUpgrade, setShowUpgrade] = useState(false)
  const limits = PLAN_LIMITS[profile.plan]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column' }}>
      {/* Top Nav */}
      <nav style={{ height: 52, borderBottom: '1px solid #141414', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 14, position: 'sticky', top: 0, background: '#080808', zIndex: 20 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 24, height: 24, background: '#c8f542', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: '#0a0a0a', borderRadius: '50%' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16 }}>OmniDub</span>
        </Link>
        <div style={{ flex: 1 }} />
        <div style={{ padding: '3px 9px', borderRadius: 5, background: '#111', border: '1px solid #1e1e1e', fontSize: 10, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {profile.plan} plan
        </div>
        {profile.plan === 'free' && (
          <button onClick={() => setShowUpgrade(true)} style={{ padding: '6px 13px', borderRadius: 7, border: 'none', background: '#c8f542', color: '#0a0a0a', fontSize: 11, fontWeight: 600, letterSpacing: '0.03em' }}>
            Upgrade →
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#444' }}>{user.email}</div>
          <button onClick={handleSignOut} style={{ padding: '5px 10px', background: 'none', border: '1px solid #1a1a1a', borderRadius: 6, color: '#444', fontSize: 11 }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 210, borderRight: '1px solid #141414', flexShrink: 0, padding: '20px 14px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Tools</div>
          {TABS.map(t => {
            const active = pathname === t.href
            return (
              <Link key={t.href} href={t.href} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 8, marginBottom: 2, background: active ? '#141414' : 'transparent', color: active ? '#e8e8e8' : '#555', fontSize: 13, borderLeft: active ? '2px solid #c8f542' : '2px solid transparent', transition: 'all 0.15s' }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span>
                {t.label}
              </Link>
            )
          })}

          <div style={{ marginTop: 28, marginBottom: 8, fontSize: 10, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's Usage</div>
          <UsageBar used={usage.minutes_used} total={limits.minutesPerDay} label="Minutes" />

          {profile.plan === 'free' && (
            <button onClick={() => setShowUpgrade(true)} style={{ width: '100%', marginTop: 12, padding: '9px', borderRadius: 8, border: '1px solid #1e1e1e', background: '#0f0f0f', color: '#c8f542', fontSize: 11, letterSpacing: '0.04em' }}>
              ↑ Pro — $19/mo
            </button>
          )}

          {recentJobs.length > 0 && (
            <>
              <div style={{ marginTop: 28, marginBottom: 8, fontSize: 10, color: '#333', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recent</div>
              {recentJobs.map(job => (
                <div key={job.id} style={{ fontSize: 11, color: '#3a3a3a', padding: '6px 4px', borderBottom: '1px solid #111', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{job.type?.toUpperCase()}</span>
                  <span style={{ color: job.status === 'completed' ? '#4a7a20' : job.status === 'failed' ? '#7a2020' : '#555' }}>
                    {job.status}
                  </span>
                </div>
              ))}
            </>
          )}

          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 10, color: '#2a2a2a', paddingTop: 16, borderTop: '1px solid #111' }}>
            OmniDub v0.1.0
          </div>
        </aside>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', animation: 'fadeIn 0.25s ease' }}>
          {children}
        </main>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  )
}
