import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import WaveformPlayer from '@/components/ui/WaveformPlayer'
import GiantStat from '@/components/ui/GiantStat'
import Donut from '@/components/ui/Donut'
import OnboardingChecklist, { ChecklistStep } from '@/components/ui/OnboardingChecklist'
import { PLAN_LIMITS } from '@/lib/constants'

export default async function DashboardHome() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminSupabase()
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await admin.from('usage_log').select('minutes_used').eq('user_id', user.id).eq('date', today).single()
  const { data: allUsage } = await admin.from('usage_log').select('minutes_used').eq('user_id', user.id)
  const { data: recentJobs } = await admin.from('jobs').select('id, type, status, output_url, created_at, input').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4)
  const { data: lastAudio } = await admin.from('jobs').select('id, output_url, created_at, input').eq('user_id', user.id).eq('type', 'tts').eq('status', 'completed').order('created_at', { ascending: false }).limit(1).single()
  const { count: totalJobs } = await admin.from('jobs').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
  const { count: voiceProfiles } = await admin.from('voice_profiles').select('id', { count: 'exact', head: true }).eq('user_id', user.id)

  const plan = (profile?.plan || 'free') as 'free' | 'pro'
  const limits = PLAN_LIMITS[plan]
  const minutesUsed = Number(usage?.minutes_used ?? 0)
  const pctUsed = minutesUsed / limits.minutesPerDay
  const streak = profile?.streak_count ?? 0
  const totalMinutes = (allUsage ?? []).reduce((a, r) => a + Number(r.minutes_used ?? 0), 0)

  const jobs = recentJobs ?? []
  const hasTTS = jobs.some(j => j.type === 'tts')
  const hasTranscription = jobs.some(j => j.type === 'transcription')

  const onboardingSteps: ChecklistStep[] = [
    { id: 'tts', label: 'generate your first voiceover', href: '/dashboard/tts', done: hasTTS },
    { id: 'transcribe', label: 'transcribe an audio file', href: '/dashboard/transcription', done: hasTranscription },
    { id: 'voice', label: 'save a voice profile', href: '/dashboard/voices', done: (voiceProfiles ?? 0) > 0 },
    { id: 'pro', label: 'explore Pro features', href: '/pricing', done: plan === 'pro' },
  ]

  const lastAudioDate = lastAudio ? new Date(lastAudio.created_at) : null
  const showReturnHook = lastAudioDate && (Date.now() - lastAudioDate.getTime()) > 86400000
  const firstName = user.email?.split('@')[0] ?? 'there'
  const usageColor = pctUsed >= 0.95 ? 'var(--danger)' : pctUsed >= 0.8 ? 'var(--warning)' : 'var(--accent)'

  return (
    <div style={{ maxWidth: 1040, animation: 'fadeIn 0.3s ease' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 400, letterSpacing: '-0.03em', marginBottom: 6 }}>
          welcome back, {firstName}.
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
          {minutesUsed === 0 ? 'ready when you are.' : `you've generated ${minutesUsed.toFixed(1)} min today.`}
        </p>
      </div>

      {/* Giant stats strip */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 'clamp(24px, 5vw, 56px)', flexWrap: 'wrap' }}>
          <GiantStat value={streak} label="day streak" icon="🔥" accent={streak >= 3} />
          <GiantStat value={totalJobs ?? 0} label="creations" icon="🎙" />
          <GiantStat value={totalMinutes.toFixed(0)} label="total minutes" icon="⏱" />
        </div>
        <Donut value={pctUsed} size={104} stroke={9} centerLabel={`${Math.round(pctUsed * 100)}%`} subLabel="today" color={usageColor} />
      </div>

      {/* Usage detail bar */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 600 }}>{minutesUsed.toFixed(1)}</span>
          {' / '}{limits.minutesPerDay} min used today
        </span>
        {plan === 'free' && (
          <Link href="/pricing" style={{ fontSize: 12, color: 'var(--accent-strong)', fontWeight: 600 }}>Pro gets 120 min/day →</Link>
        )}
      </div>

      {/* Bento: actions + onboarding */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 16, marginBottom: 16, alignItems: 'start' }}>
        {/* Quick actions */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>quick start</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { label: 'generate voiceover', sub: 'text → speech', href: '/dashboard/tts', icon: '📝', accent: true },
              { label: 'transcribe audio', sub: 'speech → text', href: '/dashboard/transcription', icon: '🎙', accent: false },
              { label: 'voice profiles', sub: 'save your voices', href: '/dashboard/voices', icon: '👤', accent: false },
              { label: 'history', sub: 'past creations', href: '/dashboard/history', icon: '📋', accent: false },
            ].map(card => (
              <Link key={card.href} href={card.href}
                className="card-hover"
                style={{
                  padding: '20px 18px', borderRadius: 'var(--radius-lg)',
                  background: card.accent ? 'var(--accent)' : 'var(--bg-2)',
                  color: card.accent ? 'var(--accent-text)' : 'var(--text)',
                  boxShadow: card.accent ? 'var(--shadow-accent)' : 'var(--shadow-1)',
                  display: 'flex', flexDirection: 'column', gap: 10, minHeight: 110,
                }}>
                <span style={{ fontSize: 24 }}>{card.icon}</span>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{card.label}</div>
                  <div style={{ fontSize: 11, opacity: card.accent ? 0.7 : 1, color: card.accent ? 'inherit' : 'var(--text-3)' }}>{card.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Onboarding checklist (dark card) */}
        <OnboardingChecklist steps={onboardingSteps} />
      </div>

      {/* Return-visit hook */}
      {showReturnHook && lastAudio?.output_url && (
        <div className="card-accent" style={{ marginBottom: 16, padding: 20, animation: 'slideDown 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--accent-strong)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>pick up where you left off</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                {lastAudioDate ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round((Date.now() - lastAudioDate.getTime()) / 86400000), 'day') : ''}
              </div>
            </div>
            <Link href="/dashboard/history" style={{ fontSize: 12, color: 'var(--text-2)', textDecoration: 'underline' }}>see all →</Link>
          </div>
          <WaveformPlayer src={lastAudio.output_url} compact />
        </div>
      )}

      {/* Recent jobs */}
      {jobs.length > 0 ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>recent</div>
            <Link href="/dashboard/history" style={{ fontSize: 12, color: 'var(--text-2)' }}>view all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {jobs.map(job => (
              <div key={job.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, background: job.status === 'completed' ? 'var(--success)' : job.status === 'failed' ? 'var(--danger)' : 'var(--text-4)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', textTransform: 'capitalize' }}>{job.type}</div>
                  {typeof (job.input as Record<string, unknown>)?.text === 'string' && (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(job.input as Record<string, unknown>).text as string}
                    </div>
                  )}
                </div>
                <span className={`pill ${job.status === 'completed' ? 'pill-green' : job.status === 'failed' ? 'pill-red' : 'pill-dim'}`}>{job.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.4 }}>🎙</div>
          <div style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 16 }}>nothing yet — let&apos;s fix that.</div>
          <Link href="/dashboard/tts" className="btn-accent" style={{ display: 'inline-flex' }}>generate your first voiceover →</Link>
        </div>
      )}
    </div>
  )
}
