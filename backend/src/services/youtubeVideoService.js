import { cameraRegistry } from '../utils/cameraRegistry.js'

export function getTrafficVideoAssignments() {
  return cameraRegistry.map(({ videoId, ...camera }) => ({
    ...camera,
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0&controls=0&enablejsapi=1`,
  }))
}
