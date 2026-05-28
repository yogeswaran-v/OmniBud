import { createServerSupabase } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminSupabase()

  // Ensure profile exists
  await admin.from('profiles').upsert({ id: user.id, plan: 'free' }, { onConflict: 'id', ignoreDuplicates: true })

  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()

  // Get today's usage
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await admin.from('usage_log')
    .select('minutes_used, jobs_count')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // Recent jobs
  const { data: recentJobs } = await admin.from('jobs')
    .select('id, type, status, created_at, output_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardShell
      user={{ email: user.email!, id: user.id }}
      profile={profile || { id: user.id, plan: 'free', created_at: '' }}
      usage={{ minutes_used: usage?.minutes_used ?? 0, jobs_count: usage?.jobs_count ?? 0 }}
      recentJobs={recentJobs ?? []}
    >
      {children}
    </DashboardShell>
  )
}
