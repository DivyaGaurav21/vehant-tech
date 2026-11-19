import { randomUUID } from 'node:crypto';
const vehicleTypes = ['CAR', 'MOTORCYCLE', 'BUS', 'TRUCK'];
const registrationRegions = ['BR', 'DL', 'MH', 'KA', 'TN', 'UP', 'GJ', 'RJ'];
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function randomInteger(random, maximum) {
    return Math.floor(random() * maximum);
}
function confidenceScore(random) {
    return Number((0.75 + random() * 0.24).toFixed(2));
}
export function generatePlateNumber(random = Math.random) {
    const region = registrationRegions[randomInteger(random, registrationRegions.length)];
    const district = String(randomInteger(random, 99) + 1).padStart(2, '0');
    const series = `${letters[randomInteger(random, letters.length)]}${letters[randomInteger(random, letters.length)]}`;
    const number = String(randomInteger(random, 10_000)).padStart(4, '0');
    return `${region}${district}${series}${number}`;
}
export function generateDetection(cameraIds, options = {}) {
    if (cameraIds.length === 0)
        throw new Error('Cannot generate traffic without a configured camera');
    const random = options.random ?? Math.random;
    const createId = options.createId ?? randomUUID;
    const cameraId = cameraIds[randomInteger(random, cameraIds.length)];
    const vehicleType = vehicleTypes[randomInteger(random, vehicleTypes.length)];
    return {
        eventId: createId(),
        cameraId,
        eventType: 'VEHICLE_DETECTED',
        vehicleType,
        plateNumber: generatePlateNumber(random),
        timestamp: (options.now ?? (() => new Date()))(),
        confidence: confidenceScore(random),
        source: 'SIMULATED',
    };
}
function createViolation(detection, eventType, random, createId) {
    return {
        eventId: createId(),
        cameraId: detection.cameraId,
        eventType,
        vehicleType: detection.vehicleType,
        plateNumber: detection.plateNumber,
        timestamp: detection.timestamp,
        confidence: confidenceScore(random),
        source: 'SIMULATED',
        reviewStatus: 'PENDING',
    };
}
export function generateViolations(detection, probabilities, options = {}) {
    const random = options.random ?? Math.random;
    const createId = options.createId ?? randomUUID;
    const violations = [];
    if (detection.vehicleType === 'MOTORCYCLE' && random() < probabilities.noHelmet) {
        violations.push(createViolation(detection, 'NO_HELMET', random, createId));
    }
    if (random() < probabilities.redLight) {
        violations.push(createViolation(detection, 'RED_LIGHT', random, createId));
    }
    if (random() < probabilities.wrongSide) {
        violations.push(createViolation(detection, 'WRONG_SIDE', random, createId));
    }
    return violations;
}
