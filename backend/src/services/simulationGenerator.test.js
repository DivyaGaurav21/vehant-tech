import assert from 'node:assert/strict';
import test from 'node:test';
import { generateDetection, generatePlateNumber, generateViolations, } from './simulationGenerator.js';
function sequenceRandom(values) {
    let index = 0;
    return () => values[index++ % values.length];
}
const motorcycleDetection = {
    cameraId: 'CAM-01',
    vehicleType: 'MOTORCYCLE',
    plateNumber: 'BR01AB1234',
    timestamp: new Date('2026-11-09T12:00:00.000Z'),
    confidence: 0.91,
};
test('generates synthetic Indian-style registration plates', () => {
    const plate = generatePlateNumber(sequenceRandom([0, 0, 0, 0, 0]));
    assert.match(plate, /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/);
    assert.equal(plate, 'BR01AA0000');
});
test('generates a persisted-shape detection with valid camera, plate, and confidence', () => {
    const detection = generateDetection(['CAM-01', 'CAM-02'], {
        random: sequenceRandom([0, 0.2, 0, 0, 0, 0, 0, 0.5]),
        now: () => new Date('2026-11-09T12:00:00.000Z'),
        createId: () => 'vehicle-event',
    });
    assert.equal(detection.eventId, 'vehicle-event');
    assert.equal(detection.cameraId, 'CAM-01');
    assert.equal(detection.eventType, 'VEHICLE_DETECTED');
    assert.equal(detection.vehicleType, 'CAR');
    assert.match(detection.plateNumber, /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/);
    assert.equal(detection.source, 'SIMULATED');
    assert.ok(detection.confidence >= 0.75 && detection.confidence <= 0.99);
});
test('creates configured motorcycle violations as pending simulated records', () => {
    let id = 0;
    const violations = generateViolations(motorcycleDetection, {
        noHelmet: 1,
        redLight: 1,
        wrongSide: 1,
    }, {
        random: () => 0,
        createId: () => `violation-${++id}`,
    });
    assert.deepEqual(violations.map((event) => event.eventType), ['NO_HELMET', 'RED_LIGHT', 'WRONG_SIDE']);
    assert.ok(violations.every((event) => event.cameraId === motorcycleDetection.cameraId &&
        event.vehicleType === motorcycleDetection.vehicleType &&
        event.plateNumber === motorcycleDetection.plateNumber &&
        event.timestamp === motorcycleDetection.timestamp &&
        event.source === 'SIMULATED' &&
        event.reviewStatus === 'PENDING'));
});
test('never creates a helmet violation for a car', () => {
    const violations = generateViolations({ ...motorcycleDetection, vehicleType: 'CAR' }, { noHelmet: 1, redLight: 0, wrongSide: 0 }, { random: () => 0 });
    assert.deepEqual(violations, []);
});
test('respects zero violation probabilities', () => {
    const violations = generateViolations(motorcycleDetection, { noHelmet: 0, redLight: 0, wrongSide: 0 }, { random: () => 0 });
    assert.deepEqual(violations, []);
});
test('refuses to create a detection without camera IDs', () => {
    assert.throws(() => generateDetection([]), /configured camera/);
});
