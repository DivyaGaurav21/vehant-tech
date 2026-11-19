import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CameraCard } from "../components/CameraCard";
import { getCameras, getTrafficVideos } from "../services/api";
import { cameraRegistry } from "../utils/cameras";

export function CamerasPage() {
  const [cameras, setCameras] = useState(cameraRegistry);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [videosUnavailable, setVideosUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([getCameras(), getTrafficVideos()]).then(
      ([cameraResult, videosResult]) => {
        if (!active) return;
        const byId = new Map();
        if (cameraResult.status === "fulfilled") {
          for (const camera of cameraResult.value)
            byId.set(camera.cameraId, camera);
        } else {
          setApiUnavailable(true);
        }
        if (videosResult.status === "fulfilled") {
          for (const assignment of videosResult.value) {
            byId.set(assignment.cameraId, {
              ...byId.get(assignment.cameraId),
              ...assignment,
            });
          }
        } else {
          setVideosUnavailable(true);
        }
        setCameras(
          cameraRegistry.map((camera) => ({
            ...camera,
            ...byId.get(camera.cameraId),
          })),
        );
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <div className="eyebrow">CITY-WIDE MONITORING</div>
          <h1>
            Camera feeds <span className="section-count">09</span>
          </h1>
          <p className="page-subtitle">
            Recorded demo video previews for nine city intersections.
          </p>
        </div>
      </div>
      {apiUnavailable && (
        <div className="api-notice" role="status">
          <AlertTriangle size={17} />
          <span>
            Camera API is unavailable. Showing the nine configured camera
            locations; status will load from the backend.
          </span>
        </div>
      )}
      {videosUnavailable && (
        <div className="api-notice" role="status">
          <AlertTriangle size={17} />
          <span>
            YouTube demo video configurations could not be loaded. Check the
            backend connection; fallback cards remain visible.
          </span>
        </div>
      )}
      <div className="camera-grid">
        {cameras.map((camera) => (
          <CameraCard camera={camera} key={camera.cameraId} />
        ))}
      </div>
    </div>
  );
}
