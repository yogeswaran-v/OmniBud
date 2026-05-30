import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { api, pollJob, resetTestUser } from '../helpers.ts'

describe('tts', () => {
  // Free plan allows 1 concurrent job + 5 min/day. Reset so the suite is deterministic.
  before(async () => { await resetTestUser() })

  test('submit returns job_id and completes with mp3 URL', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'End to end voice generation test.', voiceId: '1', language: 'English' }),
    })
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(d.job_id, 'should return job_id')

    // Poll to completion — this also drains the single free-plan queue slot.
    const result = await pollJob(d.job_id)
    assert.equal(result.status, 'completed', `job failed: ${result.error}`)
    assert.ok(result.output_url?.includes('.mp3'), 'output_url should be an mp3')
  })

  test('unauthenticated submit returns 401', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST', auth: false,
      body: JSON.stringify({ type: 'tts', text: 'test', voiceId: '1', language: 'English' }),
    })
    assert.equal(r.status, 401)
  })
})
