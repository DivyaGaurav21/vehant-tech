import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Video } from 'lucide-react'

let youtubeApiPromise

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise((resolve, reject) => {
    let timeout
    const previousCallback = window.onYouTubeIframeAPIReady
    const fail = () => {
      window.clearTimeout(timeout)
      youtubeApiPromise = undefined
      reject(new Error('YouTube player API could not be loaded'))
    }
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout)
      previousCallback?.()
      resolve(window.YT)
    }
    timeout = window.setTimeout(fail, 15000)

    let script = document.getElementById('youtube-iframe-api')
    if (!script) {
      script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener('error', fail, { once: true })
  })

  return youtubeApiPromise
}

export function YouTubeDemoFrame({ camera, className = '' }) {
  const iframeRef = useRef(null)
  const playerRef = useRef(null)
  const [unavailable, setUnavailable] = useState(() => !camera.videoId || !camera.embedUrl)
  const [loading, setLoading] = useState(() => Boolean(camera.videoId && camera.embedUrl))
  const iframeUrl = camera.embedUrl ? new URL(camera.embedUrl) : undefined

  if (iframeUrl) iframeUrl.searchParams.set('origin', window.location.origin)

  useEffect(() => {
    let active = true

    if (!camera.videoId || !camera.embedUrl) {
      return undefined
    }

    loadYouTubeIframeApi()
      .then((youtube) => {
        if (!active || !iframeRef.current) return
        playerRef.current = new youtube.Player(iframeRef.current, {
          events: {
            onReady: (event) => {
              if (!active) return
              setLoading(false)
              event.target.mute()
              event.target.playVideo()
            },
            onError: () => {
              if (!active) return
              setLoading(false)
              setUnavailable(true)
            },
          },
        })
      })
      .catch(() => {
        if (!active) return
        setLoading(false)
        setUnavailable(true)
      })

    return () => {
      active = false
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [camera.embedUrl, camera.videoId])

  return (
    <div className={`youtube-demo-frame ${className}`}>
      {camera.embedUrl && (
        <iframe
          ref={iframeRef}
          src={iframeUrl?.toString()}
          title={`${camera.cameraId} recorded traffic demo`}
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          onError={() => {
            setLoading(false)
            setUnavailable(true)
          }}
        />
      )}
      {loading && !unavailable && (
        <div className="demo-video-message" role="status">
          <Video size={20} />
          <span>Loading demo feed…</span>
        </div>
      )}
      {unavailable && (
        <div className="demo-video-message demo-video-error" role="status">
          <AlertTriangle size={20} />
          <span>This video is unavailable or embedding is disabled.</span>
        </div>
      )}
    </div>
  )
}
