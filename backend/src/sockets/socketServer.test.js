import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { io as createClient } from 'socket.io-client';
test('broadcasts typed traffic and camera status events to connected clients', async () => {
    process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/trafficiq-test';
    const { broadcastCameraStatusChanged, broadcastNewViolation, broadcastVehicleDetected, closeSocketServer, initializeSocketServer, } = await import('./socketServer.js');
    const httpServer = createServer();
    const socketServer = initializeSocketServer(httpServer);
    httpServer.listen(0, '127.0.0.1');
    await once(httpServer, 'listening');
    const address = httpServer.address();
    assert.ok(address && typeof address !== 'string');
    const client = createClient(`http://127.0.0.1:${address.port}`, { transports: ['websocket'], reconnection: false });
    try {
        await new Promise((resolve, reject) => {
            client.once('connect', () => resolve());
            client.once('connect_error', reject);
        });
        const detectedEvent = new Promise((resolve) => {
            client.once('vehicle_detected', resolve);
        });
        broadcastVehicleDetected({
            eventId: 'vehicle-1',
            cameraId: 'CAM-01',
            vehicleType: 'CAR',
            plateNumber: 'BR01AB1234',
            timestamp: '2026-11-09T12:00:00.000Z',
            confidence: 0.9,
            source: 'SIMULATED',
        });
        assert.deepEqual(await detectedEvent, {
            eventId: 'vehicle-1',
            cameraId: 'CAM-01',
            vehicleType: 'CAR',
            plateNumber: 'BR01AB1234',
            timestamp: '2026-11-09T12:00:00.000Z',
            confidence: 0.9,
            source: 'SIMULATED',
        });
        const violationEvent = new Promise((resolve) => {
            client.once('new_violation', resolve);
        });
        broadcastNewViolation({
            eventId: 'violation-1',
            cameraId: 'CAM-01',
            location: 'City Hall Junction, Central Zone',
            vehicleType: 'MOTORCYCLE',
            plateNumber: 'BR01AB1234',
            violationType: 'NO_HELMET',
            timestamp: '2026-11-09T12:00:00.000Z',
            confidence: 0.88,
            reviewStatus: 'PENDING',
            source: 'SIMULATED',
        });
        assert.equal((await violationEvent).location, 'City Hall Junction, Central Zone');
        const statusEvent = new Promise((resolve) => {
            client.once('camera_status_changed', resolve);
        });
        broadcastCameraStatusChanged({
            cameraId: 'CAM-01',
            status: 'OFFLINE',
            changedAt: '2026-11-09T12:01:00.000Z',
        });
        assert.deepEqual(await statusEvent, {
            cameraId: 'CAM-01',
            status: 'OFFLINE',
            changedAt: '2026-11-09T12:01:00.000Z',
        });
    }
    finally {
        client.disconnect();
        await closeSocketServer();
        socketServer.removeAllListeners();
    }
});
