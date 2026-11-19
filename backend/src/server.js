import { createServer } from 'node:http';
import { app } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { seedCameras } from './services/cameraService.js';
import { stopSimulation } from './services/simulationService.js';
import { closeSocketServer, initializeSocketServer } from './sockets/socketServer.js';
import { seedAdmin } from './services/authService.js';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '1.1.1.1']);
const server = createServer(app);
async function startServer() {
    await connectDatabase();
    await seedCameras();
    const adminSeeded = await seedAdmin();
    console.info('Ensured the nine TrafficIQ camera records are present');
    if (!adminSeeded)
        console.warn('Admin account is not seeded; configure ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET to enable login');
    initializeSocketServer(server);
    server.listen(env.PORT, () => {
        console.info(`TrafficIQ API listening on http://localhost:${env.PORT}`);
    });
}
async function shutdown(signal) {
    console.info(`${signal} received; closing TrafficIQ API`);
    await stopSimulation();
    await closeSocketServer();
    await disconnectDatabase();
    process.exit();
}
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
startServer().catch(async (error) => {
    console.error('TrafficIQ API startup failed', error);
    await disconnectDatabase();
    process.exitCode = 1;
});
