import { CameraModel } from "../models/Camera.js";
import { TrafficEventModel } from "../models/TrafficEvent.js";
import { HttpError } from "../utils/httpError.js";
function buildEventFilter(filters, violationsOnly = false) {
  const query = {};
  if (violationsOnly) query.eventType = { $ne: "VEHICLE_DETECTED" };
  if (filters.violationType) query.eventType = filters.violationType;
  if (filters.cameraId) query.cameraId = filters.cameraId;
  if (filters.plateNumber)
    query.plateNumber = {
      $regex: escapeRegex(filters.plateNumber),
      $options: "i",
    };
  if (filters.reviewStatus) query.reviewStatus = filters.reviewStatus;
  if (filters.from || filters.to) {
    const upperBound = filters.to ? new Date(filters.to) : undefined;
    if (upperBound && /^\d{4}-\d{2}-\d{2}$/.test(filters.to ?? "")) {
      upperBound.setUTCDate(upperBound.getUTCDate() + 1);
      upperBound.setUTCMilliseconds(upperBound.getUTCMilliseconds() - 1);
    }
    query.timestamp = {
      ...(filters.from ? { $gte: new Date(filters.from) } : {}),
      ...(upperBound ? { $lte: upperBound } : {}),
    };
  }
  return query;
}
export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
async function addCameraMetadata(events) {
  const cameraIds = [...new Set(events.map((event) => event.cameraId))];
  const cameras = cameraIds.length
    ? await CameraModel.find({ cameraId: { $in: cameraIds } })
        .select("cameraId name location zone junction")
        .lean()
    : [];
  const camerasById = new Map(
    cameras.map((camera) => [camera.cameraId, camera]),
  );
  return events.map((event) => {
    const camera = camerasById.get(event.cameraId);
    return {
      ...event,
      cameraName: camera?.name ?? null,
      cameraLocation: camera?.location ?? null,
      zone: camera?.zone ?? null,
      junction: camera?.junction ?? null,
    };
  });
}
export async function listViolations(filters) {
  const query = buildEventFilter(filters, true);
  const [data, total] = await Promise.all([
    TrafficEventModel.find(query)
      .sort({ timestamp: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean(),
    TrafficEventModel.countDocuments(query),
  ]);
  return { data: await addCameraMetadata(data), total };
}
export async function getViolationById(eventId) {
  const event = await TrafficEventModel.findOne({
    eventId,
    eventType: { $ne: "VEHICLE_DETECTED" },
  }).lean();
  if (!event)
    throw new HttpError(
      404,
      "VIOLATION_NOT_FOUND",
      "Violation event was not found",
    );
  const [eventWithCamera] = await addCameraMetadata([event]);
  return eventWithCamera;
}
export async function updateViolationStatus(eventId, reviewStatus) {
  const violation = await TrafficEventModel.findOne({
    eventId,
    eventType: { $ne: "VEHICLE_DETECTED" },
  });
  if (!violation)
    throw new HttpError(
      404,
      "VIOLATION_NOT_FOUND",
      "Violation event was not found",
    );
  violation.reviewStatus = reviewStatus;
  await violation.save();
  return getViolationById(eventId);
}
export async function listRecentEvents(filters) {
  const [data, total] = await Promise.all([
    TrafficEventModel.find()
      .sort({ timestamp: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean(),
    TrafficEventModel.countDocuments(),
  ]);
  return { data: await addCameraMetadata(data), total };
}
export async function listCameraEvents(cameraId, filters) {
  const query = buildEventFilter({ ...filters, cameraId });
  const [data, total] = await Promise.all([
    TrafficEventModel.find(query)
      .sort({ timestamp: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean(),
    TrafficEventModel.countDocuments(query),
  ]);
  return { data: await addCameraMetadata(data), total };
}
export async function listAnprRecordsWithDate(filters) {
  const query = buildEventFilter(filters);
  query.eventType = "VEHICLE_DETECTED";
  const [data, total] = await Promise.all([
    TrafficEventModel.find(query)
      .sort({ timestamp: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean(),
    TrafficEventModel.countDocuments(query),
  ]);
  return { data: await addCameraMetadata(data), total };
}
