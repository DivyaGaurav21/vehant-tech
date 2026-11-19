import { getCameraById, listCameras } from "../services/cameraService.js";
import {
  getDashboardAnalytics,
  getDashboardSummary,
} from "../services/dashboardService.js";
import {
  getViolationById,
  listAnprRecordsWithDate,
  listCameraEvents,
  listRecentEvents,
  listViolations,
  updateViolationStatus,
} from "../services/eventService.js";
import { loginAdmin } from "../services/authService.js";
import { getTrafficVideoAssignments } from "../services/youtubeVideoService.js";
import {
  getSimulationStatus,
  startSimulation,
  stopSimulation,
} from "../services/simulationService.js";
import {
  validateAnalyticsQuery,
  validateEventQuery,
  validateLoginBody,
  validatePaginationQuery,
  validateViolationStatusBody,
} from "../validators/requestValidation.js";
import { sendPaginated, sendSuccess } from "../utils/apiResponse.js";
import { HttpError } from "../utils/httpError.js";
function getRouteId(request) {
  const id = request.params.id;
  if (typeof id !== "string" || !id)
    throw new HttpError(400, "INVALID_ID", "A single record ID is required");
  return id;
}
export async function dashboardSummary(_request, response) {
  return sendSuccess(response, await getDashboardSummary());
}
export async function dashboardAnalytics(request, response) {
  const query = validateAnalyticsQuery(request.query);
  return sendSuccess(response, await getDashboardAnalytics(query.date));
}
export async function cameras(_request, response) {
  return sendSuccess(response, await listCameras());
}
export async function cameraById(request, response) {
  const camera = await getCameraById(getRouteId(request));
  if (!camera)
    throw new HttpError(404, "CAMERA_NOT_FOUND", "Camera was not found");
  return sendSuccess(response, camera);
}
export async function cameraEvents(request, response) {
  const cameraId = getRouteId(request);
  const camera = await getCameraById(cameraId);
  if (!camera)
    throw new HttpError(404, "CAMERA_NOT_FOUND", "Camera was not found");
  const query = validateEventQuery(request.query, { cameraEvents: true });
  const result = await listCameraEvents(cameraId, query);
  return sendPaginated(
    response,
    result.data,
    query.page,
    query.limit,
    result.total,
  );
}
export async function violations(_request, response) {
  const query = validateEventQuery(_request.query, { violations: true });
  const result = await listViolations(query);
  return sendPaginated(
    response,
    result.data,
    query.page,
    query.limit,
    result.total,
  );
}
export async function violationById(request, response) {
  return sendSuccess(response, await getViolationById(getRouteId(request)));
}
export async function patchViolationStatus(request, response) {
  const { reviewStatus } = validateViolationStatusBody(request.body);
  return sendSuccess(
    response,
    await updateViolationStatus(getRouteId(request), reviewStatus),
  );
}
export async function login(_request, response) {
  const credentials = validateLoginBody(_request.body);
  return sendSuccess(
    response,
    await loginAdmin(credentials.email, credentials.password),
  );
}
export async function currentAdmin(_request, response) {
  const admin = response.locals.admin;
  return sendSuccess(response, {
    id: admin.sub,
    email: admin.email,
    role: admin.role,
  });
}
export async function anprRecords(_request, response) {
  const query = validateEventQuery(_request.query);
  const result = await listAnprRecordsWithDate(query);
  return sendPaginated(
    response,
    result.data,
    query.page,
    query.limit,
    result.total,
  );
}
export async function recentEvents(_request, response) {
  const query = validatePaginationQuery(_request.query);
  const result = await listRecentEvents(query);
  return sendPaginated(
    response,
    result.data,
    query.page,
    query.limit,
    result.total,
  );
}
export async function trafficVideos(_request, response) {
  return sendSuccess(response, await getTrafficVideoAssignments());
}
export async function demoStatus(_request, response) {
  return sendSuccess(response, getSimulationStatus());
}
export async function startDemo(_request, response) {
  return sendSuccess(response, startSimulation());
}
export async function stopDemo(_request, response) {
  return sendSuccess(response, await stopSimulation());
}
