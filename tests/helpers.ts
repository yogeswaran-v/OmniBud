const BASE = 'http://localhost:3000'
const SB   = 'http://localhost:54321'
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqd-vwvnFuPM5M0EH_8J5lmK1cEuMdxIg'
export const TEST_EMAIL = 'test@omnidub.local'
export const TEST_PASS  = 'TestPass123!'

let _cachedSession: { token: string; cookie: string } | null = null

export async function getSession(): Promise<{ token: string; cookie: string }> {
  if (_cachedSession) return _cachedSession
  const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
  })
  if (!r.ok) throw new Error(`Login failed: ${await r.text()}`)
  const session = await r.json()
  const cookie = `sb-127-auth-token=${encodeURIComponent(JSON.stringify(session))}`
  _cachedSession = { token: session.access_token, cookie }
  return _cachedSession
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
