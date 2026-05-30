import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api } from '../helpers.ts'

describe('history', () => {
  test('returns jobs array', async () => {
    const r = await api('/api/history')
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(Array.isArray(d.jobs), 'should return jobs array')
  })

  test('type filter returns only tts jobs', async () => {
    const r = await api('/api/history?type=tts')
    assert.equal(r.status, 200)
    const d = await r.json()
    const nonTTS = d.jobs.filter((j: { type: string }) => j.type !== 'tts')
    assert.equal(nonTTS.length, 0, 'filter should return only tts jobs')
  })

  test('completed tts jobs have output_url', async () => {
    const r = await api('/api/history')
    const d = await r.json()
    const completedTTS = d.jobs.filter((j: { type: string; status: string }) => j.type === 'tts' && j.status === 'completed')
    for (const job of completedTTS) {
      assert.ok(job.output_url, `completed tts job ${job.id} should have output_url`)
    }
  })

  test('requires auth', async () => {
    const r = await api('/api/history', { auth: false })
    assert.equal(r.status, 401)
  })
})
