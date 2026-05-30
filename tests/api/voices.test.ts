import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { api } from '../helpers.ts'

let createdId: string

describe('voice profiles', () => {
  test('create returns profile with id', async () => {
    const r = await api('/api/voices', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Voice CI', description: 'Automated test profile' }),
    })
    assert.equal(r.status, 201)
    const d = await r.json()
    assert.ok(d.profile?.id, 'should return profile id')
    createdId = d.profile.id
  })

  test('list includes created profile', async () => {
    const r = await api('/api/voices')
    assert.equal(r.status, 200)
    const d = await r.json()
    assert.ok(Array.isArray(d.profiles), 'should return profiles array')
    const found = d.profiles.find((p: { id: string }) => p.id === createdId)
    assert.ok(found, 'created profile should appear in list')
  })

  test('delete removes profile', async () => {
    const r = await api(`/api/voices/${createdId}`, { method: 'DELETE' })
    assert.equal(r.status, 200)
  })

  test('create requires auth', async () => {
    const r = await api('/api/voices', {
      method: 'POST', auth: false,
      body: JSON.stringify({ name: 'Unauth test' }),
    })
    assert.equal(r.status, 401)
  })
})
