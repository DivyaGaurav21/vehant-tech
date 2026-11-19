import { Server } from 'socket.io';
import { clientOrigins } from '../config/env.js';
let socketServer;
export function initializeSocketServer(httpServer) {
    if (socketServer)
        return socketServer;
    socketServer = new Server(httpServer, {
        cors: { origin: clientOrigins, methods: ['GET', 'POST'] },
        path: '/socket.io',
    });
    socketServer.on('connection', (socket) => {
        console.info(`Socket client connected: ${socket.id}`);
        socket.on('disconnect', (reason) => {
            console.info(`Socket client disconnected: ${socket.id} (${reason})`);
        });
    });
    return socketServer;
}
export function closeSocketServer() {
    if (!socketServer)
        return Promise.resolve();
    const activeServer = socketServer;
    socketServer = undefined;
    return new Promise((resolve) => activeServer.close(() => resolve()));
}
export function broadcastVehicleDetected(payload) {
    socketServer?.emit('vehicle_detected', payload);
}
export function broadcastNewViolation(payload) {
    socketServer?.emit('new_violation', payload);
}
export function broadcastCameraStatusChanged(payload) {
    socketServer?.emit('camera_status_changed', payload);
}
export function toVehicleDetectedPayload(event) {
    return {
        eventId: event.eventId,
        cameraId: event.cameraId,
        vehicleType: event.vehicleType,
        plateNumber: event.plateNumber,
        timestamp: event.timestamp.toISOString(),
        confidence: event.confidence,
        source: event.source,
    };
}
export function toNewViolationPayload(event, location) {
    if (event.eventType === 'VEHICLE_DETECTED' || !event.reviewStatus) {
        throw new Error('Only reviewable traffic violations can be broadcast as new_violation');
    }
    return {
        ...toVehicleDetectedPayload(event),
        location,
        violationType: event.eventType,
        reviewStatus: event.reviewStatus,
    };
}
export function toCameraStatusChangedPayload(cameraId, status) {
    return { cameraId, status, changedAt: new Date().toISOString() };
}
