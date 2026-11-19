import { Router } from "express";
import * as apiController from "../controllers/apiController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
export const apiRouter = Router();
apiRouter.get(
  "/dashboard/summary",
  asyncHandler(apiController.dashboardSummary),
);
apiRouter.get(
  "/dashboard/analytics",
  asyncHandler(apiController.dashboardAnalytics),
);
apiRouter.get("/cameras", asyncHandler(apiController.cameras));
apiRouter.get("/cameras/:id/events", asyncHandler(apiController.cameraEvents));
apiRouter.get("/cameras/:id", asyncHandler(apiController.cameraById));
apiRouter.get("/violations", asyncHandler(apiController.violations));
apiRouter.get("/violations/:id", asyncHandler(apiController.violationById));
apiRouter.patch(
  "/violations/:id/status",
  requireAdmin,
  asyncHandler(apiController.patchViolationStatus),
);
apiRouter.post("/auth/login", asyncHandler(apiController.login));
apiRouter.get(
  "/auth/me",
  requireAdmin,
  asyncHandler(apiController.currentAdmin),
);
apiRouter.get("/anpr", asyncHandler(apiController.anprRecords));
apiRouter.get("/events/recent", asyncHandler(apiController.recentEvents));
apiRouter.get("/demo/status", asyncHandler(apiController.demoStatus));
apiRouter.post(
  "/demo/start",
  requireAdmin,
  asyncHandler(apiController.startDemo),
);
apiRouter.post(
  "/demo/stop",
  requireAdmin,
  asyncHandler(apiController.stopDemo),
);
apiRouter.get("/traffic-videos", asyncHandler(apiController.trafficVideos));
