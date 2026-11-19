import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { TrafficSocketContext } from './trafficSocketContext';
function createTrafficSocket() {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || undefined;
    return io(socketUrl, {
        path: '/socket.io',
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10_000,
        timeout: 10_000,
    });
}
export function TrafficSocketProvider({ children }) {
    const [socket] = useState(createTrafficSocket);
    const [connected, setConnected] = useState(false);
    const [eventVersion, setEventVersion] = useState(0);
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        const handleConnect = () => {
            setConnected(true);
            setEventVersion((version) => version + 1);
        };
        const handleDisconnect = () => setConnected(false);
        const handleVehicleDetected = () => setEventVersion((version) => version + 1);
        const handleNewViolation = (violation) => {
            setEventVersion((version) => version + 1);
            setToasts((current) => [
                { ...violation, dismissAt: Date.now() },
                ...current.filter((toast) => toast.eventId !== violation.eventId),
            ].slice(0, 4));
        };
        const handleCameraStatusChanged = () => setEventVersion((version) => version + 1);
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleDisconnect);
        socket.on('vehicle_detected', handleVehicleDetected);
        socket.on('new_violation', handleNewViolation);
        socket.on('camera_status_changed', handleCameraStatusChanged);
        socket.connect();
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleDisconnect);
            socket.off('vehicle_detected', handleVehicleDetected);
            socket.off('new_violation', handleNewViolation);
            socket.off('camera_status_changed', handleCameraStatusChanged);
            socket.disconnect();
        };
    }, [socket]);
    useEffect(() => {
        if (toasts.length === 0)
            return;
        const timeout = window.setTimeout(() => {
            const cutoff = Date.now() - 7000;
            setToasts((current) => current.filter((toast) => toast.dismissAt > cutoff));
        }, 7000);
        return () => window.clearTimeout(timeout);
    }, [toasts]);
    const value = useMemo(() => ({
        connected,
        eventVersion,
        toasts,
        dismissToast: (eventId) => setToasts((current) => current.filter((toast) => toast.eventId !== eventId)),
    }), [connected, eventVersion, toasts]);
    return _jsx(TrafficSocketContext.Provider, { value: value, children: children });
}
