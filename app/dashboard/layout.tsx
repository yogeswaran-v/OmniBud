import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminSupabase()

  // Ensure profile exists
  await admin.from('profiles').upsert({ id: user.id, plan: 'free' }, { onConflict: 'id', ignoreDuplicates: true })

  // Update streak
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()

  if (profile) {
    const lastActive = profile.last_active_date
    if (lastActive !== today) {
      const newStreak = lastActive === yesterday ? (profile.streak_count ?? 0) + 1 : 1
      await admin.from('profiles').update({ last_active_date: today, streak_count: newStreak }).eq('id', user.id)
      profile.streak_count = newStreak
      profile.last_active_date = today
    }
  }

  const { data: usage } = await admin.from('usage_log')
    .select('minutes_used, jobs_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const { data: recentJobs } = await admin.from('jobs')
    .select('id, type, status, created_at, output_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardShell
      user={{ email: user.email!, id: user.id }}
      profile={profile || { id: user.id, plan: 'free', created_at: '' }}
      usage={{ minutes_used: Number(usage?.minutes_used ?? 0), jobs_count: usage?.jobs_count ?? 0 }}
      recentJobs={recentJobs ?? []}
    >
      {children}
    </DashboardShell>
  )
}
