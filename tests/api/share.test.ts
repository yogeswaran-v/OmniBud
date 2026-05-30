import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { api, pollJob, resetTestUser } from '../helpers.ts'

describe('share', () => {
  before(async () => { await resetTestUser() })

  test('unshared job returns 404 on public share endpoint', async () => {
    const sub = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'unshared test.', voiceId: '1', language: 'English' }),
    })
    const { job_id } = await sub.json()
    await pollJob(job_id)
    const r = await fetch(`http://localhost:3000/api/share/${job_id}`)
    assert.equal(r.status, 404, 'unshared job should be 404')
  })

  test('shared job is publicly accessible with safe fields only', async () => {
    const sub = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'public share test.', voiceId: '1', language: 'English' }),
    })
    const { job_id } = await sub.json()
    await pollJob(job_id)
    await api(`/api/jobs/${job_id}/share`, { method: 'POST' })
    const r = await fetch(`http://localhost:3000/api/share/${job_id}`)
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.equal(d.type, 'tts')
    assert.ok(d.output_url, 'should have output_url')
    assert.ok(d.input?.text, 'should expose text')
    assert.ok(!d.input?.audio_url, 'must NOT expose audio_url')
    assert.ok(!d.input?.transcript, 'must NOT expose transcript')
  })

  test('share endpoint requires auth', async () => {
    const r = await fetch('http://localhost:3000/api/jobs/00000000-0000-0000-0000-000000000000/share', { method: 'POST' })
    assert.equal(r.status, 401)
  })
})
