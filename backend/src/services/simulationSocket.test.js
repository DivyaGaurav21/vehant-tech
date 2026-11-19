import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import test from 'node:test';
import { io as createClient } from 'socket.io-client';
test('broadcasts only after the tick events are persisted', async () => {
    process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/trafficiq-test';
    const [{ CameraModel }, { TrafficEventModel }, socketServer, simulation] = await Promise.all([
        import('../models/Camera.js'),
        import('../models/TrafficEvent.js'),
        import('../sockets/socketServer.js'),
        import('./simulationService.js'),
    ]);
    const server = createServer();
    socketServer.initializeSocketServer(server);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const client = createClient(`http://127.0.0.1:${address.port}`, { transports: ['websocket'], reconnection: false });
    const originals = [
        { target: CameraModel, method: 'find', descriptor: Object.getOwnPropertyDescriptor(CameraModel, 'find') },
        { target: CameraModel, method: 'updateOne', descriptor: Object.getOwnPropertyDescriptor(CameraModel, 'updateOne') },
        { target: TrafficEventModel, method: 'insertMany', descriptor: Object.getOwnPropertyDescriptor(TrafficEventModel, 'insertMany') },
    ];
    const savedRecords = [];
    let persisted = false;
    const originalRandom = Math.random;
    const originalProbabilities = { ...simulation.simulationProbabilities };
    try {
        Object.defineProperty(CameraModel, 'find', {
            configurable: true,
            value: () => ({
                select: () => ({
                    lean: async () => [{ cameraId: 'CAM-01', location: 'City Hall Junction, Central Zone' }],
                }),
            }),
        });
        Object.defineProperty(CameraModel, 'updateOne', {
            configurable: true,
            value: async () => ({ acknowledged: true }),
        });
        Object.defineProperty(TrafficEventModel, 'insertMany', {
            configurable: true,
            value: async (records) => {
                savedRecords.push(...records);
                persisted = true;
                return records;
            },
        });
        simulation.simulationProbabilities.noHelmet = 0;
        simulation.simulationProbabilities.redLight = 1;
        simulation.simulationProbabilities.wrongSide = 1;
        Math.random = () => 0;
        await new Promise((resolve, reject) => {
            client.once('connect', () => resolve());
            client.once('connect_error', reject);
        });
        const detectedEvent = new Promise((resolve) => client.once('vehicle_detected', resolve));
        const violations = new Promise((resolve) => {
            const received = [];
            const handleViolation = (violation) => {
                received.push(violation);
                if (received.length === 2) {
                    client.off('new_violation', handleViolation);
                    resolve(received);
                }
            };
            client.on('new_violation', handleViolation);
        });
        await simulation.runSimulationTick();
        const [detection, receivedViolations] = await Promise.all([detectedEvent, violations]);
        assert.equal(persisted, true);
        assert.deepEqual(savedRecords.map((record) => record.eventType), ['VEHICLE_DETECTED', 'RED_LIGHT', 'WRONG_SIDE']);
        assert.ok(savedRecords.every((record) => record.source === 'SIMULATED'));
        assert.equal(detection.cameraId, 'CAM-01');
        assert.deepEqual(receivedViolations.map((violation) => violation.violationType), ['RED_LIGHT', 'WRONG_SIDE']);
        assert.ok(receivedViolations.every((violation) => violation.location === 'City Hall Junction, Central Zone'));
    }
    finally {
        Math.random = originalRandom;
        Object.assign(simulation.simulationProbabilities, originalProbabilities);
        client.disconnect();
        await socketServer.closeSocketServer();
        for (const { target, method, descriptor } of originals) {
            if (descriptor)
                Object.defineProperty(target, method, descriptor);
            else
                Reflect.deleteProperty(target, method);
        }
    }
});
