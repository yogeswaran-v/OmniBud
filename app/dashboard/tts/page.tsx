import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TTSTool from '@/components/jobs/TTSTool'

export default async function TTSPage() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminSupabase()
  const { data: profile } = await admin.from('profiles').select('*').eq('id', user.id).single()
  const today = new Date().toISOString().split('T')[0]
  const { data: usage } = await admin.from('usage_log').select('minutes_used').eq('user_id', user.id).eq('date', today).single()

  return (
    <TTSTool
      profile={profile || { id: user.id, plan: 'free', created_at: '' }}
      usageMinutes={Number(usage?.minutes_used ?? 0)}
    />
  )
}
