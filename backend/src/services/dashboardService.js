import { CameraModel } from "../models/Camera.js";
import { TrafficEventModel } from "../models/TrafficEvent.js";
import { cameraRegistry } from "../utils/cameraRegistry.js";
const violationTypes = ["NO_HELMET", "RED_LIGHT", "WRONG_SIDE"];
function getUtcDay(dateValue) {
  const date = dateValue ? new Date(`${dateValue}T00:00:00.000Z`) : new Date();
  const start = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}
export async function getDashboardSummary() {
  const { start, end } = getUtcDay();
  const [eventStats, cameraStats] = await Promise.all([
    TrafficEventModel.aggregate([
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 },
          todayCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$timestamp", start] },
                    { $lt: ["$timestamp", end] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          anprCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$eventType", "VEHICLE_DETECTED"] },
                    { $ne: ["$plateNumber", ""] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
    CameraModel.aggregate([
      {
        $match: {
          cameraId: { $in: cameraRegistry.map((camera) => camera.cameraId) },
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);
  const byType = new Map(eventStats.map((item) => [item._id, item]));
  const byStatus = new Map(cameraStats.map((item) => [item._id, item.count]));
  const vehicleStats = byType.get("VEHICLE_DETECTED");
  const violations = violationTypes.reduce(
    (sum, type) => sum + (byType.get(type)?.count ?? 0),
    0,
  );
  const todayViolations = violationTypes.reduce(
    (sum, type) => sum + (byType.get(type)?.todayCount ?? 0),
    0,
  );
  return {
    totalVehiclesDetected: vehicleStats?.count ?? 0,
    totalTrafficViolations: violations,
    noHelmetViolations: byType.get("NO_HELMET")?.count ?? 0,
    redLightViolations: byType.get("RED_LIGHT")?.count ?? 0,
    wrongSideDrivingViolations: byType.get("WRONG_SIDE")?.count ?? 0,
    anprRecords: vehicleStats?.anprCount ?? 0,
    activeCameraCount: byStatus.get("ONLINE") ?? 0,
    todayVehicleCount: vehicleStats?.todayCount ?? 0,
    todayViolationCount: todayViolations,
    cameraStatus: {
      online: byStatus.get("ONLINE") ?? 0,
      offline: byStatus.get("OFFLINE") ?? 0,
    },
  };
}
export async function getDashboardAnalytics(dateValue) {
  const { start, end } = getUtcDay(dateValue);
  const [hourlyStats, violationStats] = await Promise.all([
    TrafficEventModel.aggregate([
      {
        $match: {
          eventType: "VEHICLE_DETECTED",
          timestamp: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { $hour: { date: "$timestamp", timezone: "UTC" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    TrafficEventModel.aggregate([
      { $match: { eventType: { $in: violationTypes } } },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
    ]),
  ]);
  const hoursByNumber = new Map(
    hourlyStats.map((item) => [item._id, item.count]),
  );
  const violationCounts = new Map(
    violationStats.map((item) => [item._id, item.count]),
  );
  return {
    hourlyDetections: Array.from({ length: 24 }, (_, hour) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      count: hoursByNumber.get(hour) ?? 0,
    })),
    violationDistribution: violationTypes.map((type) => ({
      type,
      count: violationCounts.get(type) ?? 0,
    })),
  };
}
