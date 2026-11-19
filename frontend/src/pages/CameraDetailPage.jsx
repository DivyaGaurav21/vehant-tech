import { useEffect, useState } from "react";
import { AlertTriangle, ArrowLeft, MapPin, Video } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { YouTubeDemoFrame } from "../components/YouTubeDemoFrame";
import { getCamera, getCameraEvents, getTrafficVideos } from "../services/api";
import { getCameraMetadata } from "../utils/cameras";

export function CameraDetailPage() {
  const { cameraId = "" } = useParams();
  const [camera, setCamera] = useState(() => getCameraMetadata(cameraId));
  const [events, setEvents] = useState([]);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      getCamera(cameraId),
      getCameraEvents(cameraId),
      getTrafficVideos(),
    ]).then(([cameraResult, eventsResult, videosResult]) => {
      if (!active) return;
      if (cameraResult.status === "fulfilled") setCamera(cameraResult.value);
      if (eventsResult.status === "fulfilled") setEvents(eventsResult.value);
      if (videosResult.status === "fulfilled") {
        const video = videosResult.value.find(
          (assignment) => assignment.cameraId === cameraId,
        );
        if (video)
          setCamera((current) =>
            current ? { ...current, ...video } : current,
          );
      }
      setApiUnavailable(
        [cameraResult, eventsResult, videosResult].some(
          (result) => result.status === "rejected",
        ),
      );
    });
    return () => {
      active = false;
    };
  }, [cameraId]);

  if (!camera) {
    return (
      <div className="page-content">
        <Link to="/cameras" className="back-link">
          <ArrowLeft size={15} /> All cameras
        </Link>
        <div className="empty-page">
          <AlertTriangle size={22} />
          <strong>Camera not found</strong>
          <span>
            That camera ID is not in the configured nine-camera network.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Link to="/cameras" className="back-link">
        <ArrowLeft size={15} /> All cameras
      </Link>
      <div className="page-title-row detail-title-row">
        <div>
          <div className="eyebrow">
            {camera.cameraId} <span /> {camera.zone.toUpperCase()}
          </div>
          <h1>{camera.name}</h1>
          <p className="page-subtitle">
            <MapPin size={14} /> {camera.location}
          </p>
        </div>
        <span
          className={`camera-state detail-state ${camera.status?.toLowerCase() ?? "unknown"}`}
        >
          <i />
          {camera.status ?? "AWAITING API"}
        </span>
      </div>
      {apiUnavailable && (
        <div className="api-notice" role="status">
          <AlertTriangle size={17} />
          <span>
            Camera detail API is unavailable. Some camera or event data may be
            missing.
          </span>
        </div>
      )}
      <section className="panel detail-feed-panel">
        <div className="detail-video">
          <YouTubeDemoFrame
            key={`${camera.videoId ?? ""}:${camera.embedUrl ?? ""}`}
            camera={camera}
          />
          <span className="demo-badge">
            <span /> DEMO FEED
          </span>
          <span className="camera-id">{camera.cameraId}</span>
        </div>
        <div className="detail-feed-footer">
          <div>
            <strong>{camera.junction}</strong>
            <span>Recorded YouTube traffic demo · Not a live CCTV stream</span>
          </div>
          <span className="source-label">SIMULATED DATA</span>
        </div>
      </section>
      <section className="panel detail-events">
        <div className="panel-heading">
          <div>
            <h2>Recent camera events</h2>
            <p>Events associated with {camera.cameraId}</p>
          </div>
        </div>
        {events.length ? (
          <div className="event-table">
            {events.map((event) => (
              <div className="event-row" key={event.eventId}>
                <span
                  className={`event-indicator ${event.eventType === "VEHICLE_DETECTED" ? "detection" : ""}`}
                />
                <strong>{event.eventType.replaceAll("_", " ")}</strong>
                <span>{event.plateNumber}</span>
                <span>{event.vehicleType}</span>
                <time>{new Date(event.timestamp).toLocaleString()}</time>
                <small>SIMULATED</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel-empty compact-empty">
            <Video size={20} />
            <strong>No events available</strong>
            <span>
              Recent detections and violations will appear when the backend is
              connected.
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
