import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WaveformPlayer from '@/components/ui/WaveformPlayer'
import { PLAN_LIMITS } from '@/lib/constants'

export default async function DashboardHome() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminSupabase()
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await admin.from('usage_log').select('minutes_used').eq('user_id', user.id).eq('date', today).single()
  const { data: recentJobs } = await admin.from('jobs').select('id, type, status, output_url, created_at, input').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
  const { data: lastAudio } = await admin.from('jobs').select('id, output_url, created_at, input').eq('user_id', user.id).eq('type', 'tts').eq('status', 'completed').order('created_at', { ascending: false }).limit(1).single()

  const plan = (profile?.plan || 'free') as 'free' | 'pro'
  const limits = PLAN_LIMITS[plan]
  const minutesUsed = Number(usage?.minutes_used ?? 0)
  const pctUsed = (minutesUsed / limits.minutesPerDay) * 100
  const streak = profile?.streak_count ?? 0

  // Show return-visit hook if last audio was >1 day ago
  const lastAudioDate = lastAudio ? new Date(lastAudio.created_at) : null
  const showReturnHook = lastAudioDate && (Date.now() - lastAudioDate.getTime()) > 86400000

  const firstName = user.email?.split('@')[0] ?? 'there'

  return (
    <div style={{ maxWidth: 700, animation: 'fadeIn 0.28s ease' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, letterSpacing: '-0.02em' }}>
            hey, {firstName}.
          </h1>
          {streak >= 3 && (
            <span style={{ fontSize: 12, background: 'rgba(240,160,48,0.15)', color: 'var(--warning)', border: '1px solid rgba(240,160,48,0.25)', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
              {`🔥 ${streak}-day streak`}
            </span>
          )}
        </div>
        <p style={{ color: 'var(--text-3)', fontSize: 14 }}>
          {minutesUsed === 0 ? "ready when you are." : `you've generated ${minutesUsed.toFixed(1)} min today.`}
        </p>
      </div>

      {/* Return visit hook */}
      {showReturnHook && lastAudio?.output_url && (
        <div style={{ marginBottom: 28, padding: 20, background: 'rgba(200,245,66,0.03)', border: '1px solid rgba(200,245,66,0.12)', borderRadius: 14, animation: 'slideDown 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>your last generation</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {lastAudioDate ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round((Date.now() - lastAudioDate.getTime()) / 86400000), 'day') : ''}
              </div>
            </div>
            <Link href="/dashboard/history" style={{ fontSize: 12, color: 'var(--text-3)', textDecoration: 'underline' }}>see all →</Link>
          </div>
          <WaveformPlayer src={lastAudio.output_url} compact />
        </div>
      )}

      {/* Today's usage */}
      <div style={{ marginBottom: 28, padding: '16px 18px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>today</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{minutesUsed.toFixed(1)} / {limits.minutesPerDay} min</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-4)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(pctUsed, 100)}%`, background: pctUsed >= 95 ? 'var(--danger)' : pctUsed >= 80 ? 'var(--warning)' : 'var(--accent)', borderRadius: 4, transition: 'width 0.6s ease' }} />
        </div>
        {plan === 'free' && pctUsed >= 50 && (
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
            Pro gets 120 min/day.{' '}
            <Link href="/pricing" style={{ color: 'var(--accent)', fontWeight: 500 }}>upgrade →</Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600 }}>quick start</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { label: 'generate voiceover', sub: 'text → speech', href: '/dashboard/tts', icon: '📝', accent: true },
            { label: 'transcribe audio',   sub: 'speech → text', href: '/dashboard/transcription', icon: '🎙', accent: false },
            { label: 'voice profiles',     sub: 'save your voices', href: '/dashboard/voices', icon: '👤', accent: false },
          ].map(card => (
            <Link key={card.href} href={card.href}
              className={card.accent ? 'card-hover-accent' : 'card-hover'}
              style={{
              padding: '16px 14px', borderRadius: 14,
              background: card.accent ? 'rgba(200,245,66,0.05)' : 'var(--bg-2)',
              border: `1px solid ${card.accent ? 'rgba(200,245,66,0.2)' : 'var(--border)'}`,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <span style={{ fontSize: 22 }}>{card.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: card.accent ? 'var(--accent)' : 'var(--text)', marginBottom: 3 }}>{card.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{card.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent jobs */}
      {recentJobs && recentJobs.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-4)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>recent jobs</div>
            <Link href="/dashboard/history" style={{ fontSize: 12, color: 'var(--text-3)' }}>view all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentJobs.map(job => (
              <div key={job.id} style={{ padding: '12px 16px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: job.status === 'completed' ? 'var(--accent)' : job.status === 'failed' ? 'var(--danger)' : 'var(--text-4)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{job.type}</div>
                  {job.type === 'tts' && typeof (job.input as Record<string, unknown>)?.text === 'string' && (
                    <div style={{ fontSize: 11, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {((job.input as Record<string, unknown>).text as string).slice(0, 60)}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 10, color: job.status === 'completed' ? 'var(--accent)' : job.status === 'failed' ? 'var(--danger)' : 'var(--text-3)', padding: '2px 8px', background: job.status === 'completed' ? 'var(--accent-dim)' : job.status === 'failed' ? 'var(--danger-dim)' : 'var(--bg-3)', borderRadius: 10, flexShrink: 0 }}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!recentJobs?.length && (
        <div style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--border)', borderRadius: 16 }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>🎙</div>
          <div style={{ fontSize: 14, color: 'var(--text-3)', marginBottom: 16 }}>nothing yet — let&apos;s fix that.</div>
          <Link href="/dashboard/tts" className="btn-accent" style={{ display: 'inline-flex' }}>generate your first voiceover →</Link>
        </div>
      )}
    </div>
  )
}
