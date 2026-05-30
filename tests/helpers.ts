const BASE = 'http://localhost:3000'
const SB   = 'http://localhost:54321'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd-vwvnFuPM5M0EH_8J5lmK1cEuMdxIg'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hj04zWl196z0ILF8'
export const TEST_EMAIL = 'test@omnidub.local'
export const TEST_PASS  = 'TestPass123!'

let _cachedSession: { token: string; cookie: string; userId: string } | null = null

export async function getSession(): Promise<{ token: string; cookie: string; userId: string }> {
  if (_cachedSession) return _cachedSession
  const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
  })
  if (!r.ok) throw new Error(`Login failed: ${await r.text()}`)
  const session = await r.json()
  const cookie = `sb-127-auth-token=${encodeURIComponent(JSON.stringify(session))}`
  _cachedSession = { token: session.access_token, cookie, userId: session.user.id }
  return _cachedSession
}

/** Supabase REST call with service-role key (bypasses RLS) for test setup/teardown. */
async function admin(path: string, opts: RequestInit = {}) {
  return fetch(`${SB}/rest/v1/${path}`, {
    ...opts,
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', ...(opts.headers as Record<string, string> ?? {}) },
  })
}

/**
 * Reset the test user to a clean slate so TTS/job tests are deterministic:
 *  - clears today's usage_log (avoids daily-limit flakiness)
 *  - fails any stuck pending/processing jobs (frees the 1-slot free queue)
 */
export async function resetTestUser(): Promise<void> {
  const { userId } = await getSession()
  const today = new Date().toISOString().split('T')[0]
  await admin(`usage_log?user_id=eq.${userId}&date=eq.${today}`, { method: 'DELETE' })
  await admin(`jobs?user_id=eq.${userId}&status=in.(pending,processing)`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'failed', error: 'reset by test harness' }),
  })
}

export async function api(path: string, opts: RequestInit & { auth?: boolean } = {}) {
  const { auth = true, ...rest } = opts
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string> ?? {}),
  }
  if (auth) {
    const { cookie } = await getSession()
    headers['Cookie'] = cookie
  }
  return fetch(`${BASE}${path}`, { ...rest, headers })
}

export function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export async function pollJob(
  jobId: string,
  maxMs = 35000,
): Promise<{ status: string; output_url?: string; input?: Record<string, unknown>; error?: string }> {
  const deadline = Date.now() + maxMs
  while (Date.now() < deadline) {
    const r = await api(`/api/jobs/status?job_id=${jobId}`)
    const d = await r.json()
    if (d.status === 'completed' || d.status === 'failed') return d
    await sleep(2000)
  }
  throw new Error(`Job ${jobId} timed out after ${maxMs}ms`)
}
