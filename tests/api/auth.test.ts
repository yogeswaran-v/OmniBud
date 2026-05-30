import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api, getSession } from '../helpers.ts'

describe('auth', () => {
  test('login returns a valid session token', async () => {
    const { token } = await getSession()
    assert.ok(token.length > 20, 'access token should be a JWT')
  })

  test('protected route returns 401 without auth', async () => {
    const r = await api('/api/history', { auth: false })
    assert.equal(r.status, 401)
  })

  test('protected route succeeds with valid auth', async () => {
    const r = await api('/api/history')
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(Array.isArray(d.jobs), 'should return jobs array')
  })
})
