import { CameraModel } from "../models/Camera.js";
import { TrafficEventModel } from "../models/TrafficEvent.js";
import { cameraRegistry } from "../utils/cameraRegistry.js";
import {
  broadcastCameraStatusChanged,
  toCameraStatusChangedPayload,
} from "../sockets/socketServer.js";
export async function seedCameras() {
  await CameraModel.bulkWrite(
    cameraRegistry.map((camera) => ({
      updateOne: {
        filter: { cameraId: camera.cameraId },
        update: {
          $set: camera,
          $setOnInsert: {
            status: "ONLINE",
            videoUrl: null,
            thumbnailUrl: null,
            lastSeenAt: null,
          },
        },
        upsert: true,
      },
    })),
  );
}
export async function listCameras() {
  const cameraIds = cameraRegistry.map((camera) => camera.cameraId);
  const [cameras, stats] = await Promise.all([
    CameraModel.find({ cameraId: { $in: cameraIds } })
      .sort({ cameraId: 1 })
      .lean(),
    TrafficEventModel.aggregate([
      { $match: { eventType: "VEHICLE_DETECTED" } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$cameraId",
          vehicleCount: { $sum: 1 },
          lastEventAt: { $first: "$timestamp" },
        },
      },
    ]),
  ]);
  const statsByCamera = new Map(stats.map((item) => [item._id, item]));
  return cameras.map((camera) => {
    const cameraStats = statsByCamera.get(camera.cameraId);
    return {
      ...camera,
      vehicleCount: cameraStats?.vehicleCount ?? 0,
      lastEventAt: cameraStats?.lastEventAt ?? null,
    };
  });
}
export async function getCameraById(cameraId) {
  if (!cameraRegistry.some((camera) => camera.cameraId === cameraId))
    return null;
  const camera = await CameraModel.findOne({ cameraId }).lean();
  if (!camera) return null;
  const [eventStats] = await TrafficEventModel.aggregate([
    { $match: { cameraId, eventType: "VEHICLE_DETECTED" } },
    {
      $group: {
        _id: null,
        vehicleCount: { $sum: 1 },
        lastEventAt: { $max: "$timestamp" },
      },
    },
  ]);
  return {
    ...camera,
    vehicleCount: eventStats?.vehicleCount ?? 0,
    lastEventAt: eventStats?.lastEventAt ?? null,
  };
}
export async function updateCameraStatus(cameraId, status) {
  const camera = await CameraModel.findOne({ cameraId });
  if (!camera || !cameraRegistry.some((record) => record.cameraId === cameraId))
    return null;
  if (camera.status === status) return camera;
  camera.status = status;
  await camera.save();
  broadcastCameraStatusChanged(toCameraStatusChangedPayload(cameraId, status));
  return camera;
}
