import assert from 'node:assert/strict'
import test from 'node:test'
import { getTrafficVideoAssignments } from './youtubeVideoService.js'

test('returns nine uniquely assigned YouTube embeds with backend camera metadata', () => {
  const assignments = getTrafficVideoAssignments()

  assert.equal(assignments.length, 9)
  assert.deepEqual(assignments.map((camera) => camera.cameraId), [
    'CAM-01', 'CAM-02', 'CAM-03', 'CAM-04', 'CAM-05',
    'CAM-06', 'CAM-07', 'CAM-08', 'CAM-09',
  ])
  assert.equal(new Set(assignments.map((camera) => camera.videoId)).size, 9)

  for (const camera of assignments) {
    assert.ok(camera.name)
    assert.ok(camera.location)
    const embedUrl = new URL(camera.embedUrl)
    assert.equal(embedUrl.origin, 'https://www.youtube.com')
    assert.equal(embedUrl.pathname, `/embed/${camera.videoId}`)
    assert.equal(embedUrl.searchParams.get('autoplay'), '1')
    assert.equal(embedUrl.searchParams.get('mute'), '1')
    assert.equal(embedUrl.searchParams.get('loop'), '1')
    assert.equal(embedUrl.searchParams.get('playlist'), camera.videoId)
    assert.equal(embedUrl.searchParams.get('playsinline'), '1')
  }
})
