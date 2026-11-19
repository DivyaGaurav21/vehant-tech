import axios from "axios";
const defaultApiBaseUrl = import.meta.env.PROD
  ? "https://vehant-tech.onrender.com/api"
  : "/api";
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  timeout: 8000,
  headers: { Accept: "application/json" },
});
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window === "undefined"
      ? null
      : window.sessionStorage.getItem("trafficiq-admin-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !error.config?.url?.startsWith("/auth/login")
    ) {
      window.sessionStorage.removeItem("trafficiq-admin-token");
      window.dispatchEvent(new Event("trafficiq:unauthorized"));
    }
    return Promise.reject(error);
  },
);
async function getData(path) {
  const response = await apiClient.get(path);
  return response.data.data;
}
export const getDashboardSummary = () => getData("/dashboard/summary");
export const getDashboardAnalytics = () => getData("/dashboard/analytics");
export const getCameras = () => getData("/cameras");
export const getTrafficVideos = () => getData("/traffic-videos");
export const getCamera = (cameraId) => getData(`/cameras/${cameraId}`);
export const getCameraEvents = (cameraId) =>
  getData(`/cameras/${cameraId}/events`);
export const getRecentEvents = () => getData("/events/recent");
export const getDemoStatus = () => getData("/demo/status");
export const startDemo = async () => {
  const response = await apiClient.post("/demo/start");
  return response.data.data;
};
export const stopDemo = async () => {
  const response = await apiClient.post("/demo/stop");
  return response.data.data;
};
async function getPaginatedData(path, params) {
  const response = await apiClient.get(path, { params });
  if (!response.data.meta)
    throw new Error("API pagination metadata is missing");
  return { data: response.data.data, meta: response.data.meta };
}
export const getViolations = (filters) =>
  getPaginatedData("/violations", filters);
export const getAnprRecords = (filters) => getPaginatedData("/anpr", filters);
export async function updateViolationStatus(eventId, reviewStatus) {
  const response = await apiClient.patch(
    `/violations/${encodeURIComponent(eventId)}/status`,
    { reviewStatus },
  );
  return response.data.data;
}
export async function loginAdmin(email, password) {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data.data;
}
export async function getCurrentAdmin() {
  const response = await apiClient.get("/auth/me");
  return response.data.data;
}
