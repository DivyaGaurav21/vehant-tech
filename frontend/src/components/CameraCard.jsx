import { ArrowUpRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { YouTubeDemoFrame } from './YouTubeDemoFrame'

export function CameraCard({ camera }) {
  return (
    <Link className="camera-card" to={`/cameras/${camera.cameraId}`}>
      <div className="camera-preview">
        <YouTubeDemoFrame key={`${camera.videoId ?? ''}:${camera.embedUrl ?? ''}`} camera={camera} />
        <span className="demo-badge"><span /> DEMO FEED</span>
        <span className="camera-id">{camera.cameraId}</span>
        <span className={`camera-state ${camera.status?.toLowerCase() ?? 'unknown'}`}>
          <i />{camera.status ?? 'AWAITING API'}
        </span>
      </div>
      <div className="camera-card-content">
        <div className="camera-card-heading">
          <div>
            <h3>{camera.name}</h3>
            <p><MapPin size={13} /> {camera.location}</p>
          </div>
          <ArrowUpRight size={17} className="card-arrow" />
        </div>
        <div className="camera-card-meta">
          <span>VEHICLES</span>
          <strong>{camera.vehicleCount?.toLocaleString() ?? '—'}</strong>
          <span className="last-event">
            Last event&nbsp; {camera.lastEventAt
              ? new Date(camera.lastEventAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '—'}
          </span>
        </div>
      </div>
    </Link>
  )
}
