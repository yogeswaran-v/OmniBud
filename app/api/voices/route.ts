import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'
import { PLAN_LIMITS } from '@/lib/constants'

export async function GET() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabase()
  const { data: profiles, error } = await admin
    .from('voice_profiles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profiles: profiles ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabase()
  const { data: planRow } = await admin.from('profiles').select('plan').eq('id', user.id).single()
  const plan = (planRow?.plan ?? 'free') as 'free' | 'pro'
  const limit = PLAN_LIMITS[plan].maxVoiceProfiles

  const { count } = await admin
    .from('voice_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Voice profile limit reached (${limit} for ${plan} plan)` },
      { status: 429 }
    )
  }

  const body = await req.json()
  const { name, description, sample_url } = body

  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const { data: profile, error } = await admin
    .from('voice_profiles')
    .insert({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() ?? '',
      sample_url: sample_url ?? null,
      status: sample_url ? 'ready' : 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ profile }, { status: 201 })
}
