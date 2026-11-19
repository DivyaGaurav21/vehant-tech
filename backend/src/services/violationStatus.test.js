import assert from 'node:assert/strict';
import test from 'node:test';
test('persists review status only on violation events', async () => {
    process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/trafficiq-test';
    const [{ CameraModel }, { TrafficEventModel }, { updateViolationStatus }] = await Promise.all([
        import('../models/Camera.js'),
        import('../models/TrafficEvent.js'),
        import('./eventService.js'),
    ]);
    let saved = false;
    const violation = {
        eventId: 'violation-test',
        eventType: 'RED_LIGHT',
        cameraId: 'CAM-01',
        vehicleType: 'CAR',
        plateNumber: 'BR01AB1234',
        timestamp: new Date('2026-11-09T12:00:00.000Z'),
        confidence: 0.9,
        source: 'SIMULATED',
        reviewStatus: 'PENDING',
        async save() { saved = true; },
    };
    const originalFindOne = Object.getOwnPropertyDescriptor(TrafficEventModel, 'findOne');
    const originalCameraFind = Object.getOwnPropertyDescriptor(CameraModel, 'find');
    const queryFilters = [];
    Object.defineProperty(TrafficEventModel, 'findOne', {
        configurable: true,
        value: (filter) => {
            queryFilters.push(filter);
            if (queryFilters.length === 1)
                return Promise.resolve(violation);
            return {
                lean: async () => violation,
            };
        },
    });
    Object.defineProperty(CameraModel, 'find', {
        configurable: true,
        value: () => ({
            select: () => ({
                lean: async () => [{
                        cameraId: 'CAM-01',
                        name: 'Central Avenue',
                        location: 'City Hall Junction, Central Zone',
                        zone: 'Central Zone',
                        junction: 'City Hall Junction',
                    }],
            }),
        }),
    });
    try {
        const result = await updateViolationStatus('violation-test', 'REVIEWED');
        assert.equal(saved, true);
        assert.equal(violation.reviewStatus, 'REVIEWED');
        assert.equal(result.reviewStatus, 'REVIEWED');
        assert.ok(queryFilters.every((filter) => JSON.stringify(filter).includes('eventType')));
    }
    finally {
        if (originalFindOne)
            Object.defineProperty(TrafficEventModel, 'findOne', originalFindOne);
        else
            Reflect.deleteProperty(TrafficEventModel, 'findOne');
        if (originalCameraFind)
            Object.defineProperty(CameraModel, 'find', originalCameraFind);
        else
            Reflect.deleteProperty(CameraModel, 'find');
    }
});
