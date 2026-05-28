import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase, createAdminSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // 50MB limit
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (50MB max)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = file.name.split('.').pop()
  const path = `${user.id}/${Date.now()}.${ext}`

  const admin = createAdminSupabase()
  const { error } = await admin.storage
    .from('omnidub-inputs')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = admin.storage
    .from('omnidub-inputs')
    .getPublicUrl(path)

  return NextResponse.json({ url: publicUrl, path })
}
