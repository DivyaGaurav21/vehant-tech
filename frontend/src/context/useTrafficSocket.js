import { useContext } from 'react';
import { TrafficSocketContext } from './trafficSocketContext';
export function useTrafficSocket() {
    const context = useContext(TrafficSocketContext);
    if (!context)
        throw new Error('useTrafficSocket must be used within TrafficSocketProvider');
    return context;
}
