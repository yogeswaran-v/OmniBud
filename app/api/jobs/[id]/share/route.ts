import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

// POST /api/jobs/:id/share — authenticated owner opts a job into public sharing
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabase()

  // Verify ownership before flipping the flag
  const { data: job } = await admin
    .from('jobs')
    .select('id, user_id, status')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await admin.from('jobs').update({ is_shared: true }).eq('id', params.id)

  return NextResponse.json({ shared: true, url: `/share/${params.id}` })
}

// DELETE /api/jobs/:id/share — revoke sharing
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminSupabase()

  const { data: job } = await admin
    .from('jobs')
    .select('id, user_id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await admin.from('jobs').update({ is_shared: false }).eq('id', params.id)

  return NextResponse.json({ shared: false })
}
