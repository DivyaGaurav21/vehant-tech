import { env } from '../config/env.js';
import { CameraModel } from '../models/Camera.js';
import { TrafficEventModel } from '../models/TrafficEvent.js';
import { cameraRegistry } from '../utils/cameraRegistry.js';
import { HttpError } from '../utils/httpError.js';
import { generateDetection, generateViolations } from './simulationGenerator.js';
import { createSingleIntervalScheduler } from './singleIntervalScheduler.js';
import { broadcastNewViolation, broadcastVehicleDetected, toNewViolationPayload, toVehicleDetectedPayload, } from '../sockets/socketServer.js';
export const simulationProbabilities = {
    noHelmet: env.SIM_NO_HELMET_PROBABILITY,
    redLight: env.SIM_RED_LIGHT_PROBABILITY,
    wrongSide: env.SIM_WRONG_SIDE_PROBABILITY,
};
let lastTickAt;
export async function runSimulationTick() {
    const cameraIds = cameraRegistry.map((camera) => camera.cameraId);
    const onlineCameras = await CameraModel.find({
        cameraId: { $in: cameraIds },
        status: 'ONLINE',
    }).select('cameraId location').lean();
    if (!onlineCameras.length) {
        throw new HttpError(503, 'NO_ONLINE_CAMERAS', 'The simulator requires at least one online seeded camera');
    }
    const locationByCamera = new Map(onlineCameras.map((camera) => [camera.cameraId, camera.location]));
    const detection = generateDetection(onlineCameras.map((camera) => camera.cameraId));
    const violations = generateViolations(detection, simulationProbabilities);
    const records = [detection, ...violations];
    await TrafficEventModel.insertMany(records, { ordered: true });
    await CameraModel.updateOne({ cameraId: detection.cameraId }, { $set: { lastSeenAt: detection.timestamp } });
    lastTickAt = detection.timestamp;
    broadcastVehicleDetected(toVehicleDetectedPayload(detection));
    const location = locationByCamera.get(detection.cameraId);
    if (!location)
        throw new Error(`Missing location for generated camera ${detection.cameraId}`);
    for (const violation of violations) {
        broadcastNewViolation(toNewViolationPayload(violation, location));
    }
}
const scheduler = createSingleIntervalScheduler(runSimulationTick, env.SIMULATION_INTERVAL_MS, (error) => console.error('Traffic simulation tick failed', error));
function getStatus() {
    const schedulerState = scheduler.getState();
    return {
        ...schedulerState,
        intervalMs: env.SIMULATION_INTERVAL_MS,
        lastTickAt: lastTickAt?.toISOString() ?? null,
        probabilities: simulationProbabilities,
    };
}
export function startSimulation() {
    scheduler.start();
    return getStatus();
}
export async function stopSimulation() {
    await scheduler.stop();
    return getStatus();
}
export function getSimulationStatus() {
    return getStatus();
}
