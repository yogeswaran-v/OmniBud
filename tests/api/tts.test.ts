import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api, pollJob } from '../helpers.ts'

describe('tts', () => {
  test('submit returns job_id', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'Hello from automated test.', voiceId: '1', language: 'English' }),
    })
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(d.job_id, 'should return job_id')
  })

  test('job completes with mp3 URL', async () => {
    const r = await api('/api/jobs/submit', {
      method: 'POST',
      body: JSON.stringify({ type: 'tts', text: 'End to end voice generation test.', voiceId: '1', language: 'English' }),
    })
    const { job_id } = await r.json()
    const result = await pollJob(job_id)
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
