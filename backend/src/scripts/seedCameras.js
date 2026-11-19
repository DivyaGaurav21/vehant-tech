import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { seedCameras } from "../services/cameraService.js";
try {
  await connectDatabase();
  await seedCameras();
  console.info("Seeded or updated the nine TrafficIQ camera records");
} catch (error) {
  console.error("Camera seed failed", error);
  process.exitCode = 1;
} finally {
  await disconnectDatabase();
}
