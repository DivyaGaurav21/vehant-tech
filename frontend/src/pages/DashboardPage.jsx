import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bike,
  CarFront,
  CircleDot,
  RefreshCw,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { DashboardCharts } from "../components/DashboardCharts";
import { CameraCard } from "../components/CameraCard";
import { MetricCard } from "../components/MetricCard";
import {
  getCameras,
  getDashboardAnalytics,
  getDashboardSummary,
  getDemoStatus,
  getRecentEvents,
  getTrafficVideos,
  startDemo,
  stopDemo,
} from "../services/api";
import { cameraRegistry } from "../utils/cameras";
import { useTrafficSocket } from "../context/useTrafficSocket";
import { useAuth } from "../context/useAuth";
import { Link } from "react-router-dom";
export function DashboardPage() {
  const { connected, eventVersion } = useTrafficSocket();
  const { user } = useAuth();
  const requestSequence = useRef(0);
  const [summary, setSummary] = useState();
  const [analytics, setAnalytics] = useState();
  const [cameras, setCameras] = useState(cameraRegistry);
  const [alerts, setAlerts] = useState([]);
  const [simulation, setSimulation] = useState();
  const [loading, setLoading] = useState(true);
  const [simulationPending, setSimulationPending] = useState(false);
  const [simulationError, setSimulationError] = useState();
  const [apiError, setApiError] = useState();
  function fetchDashboard() {
    return Promise.allSettled([
      getDashboardSummary(),
      getDashboardAnalytics(),
      getCameras(),
      getRecentEvents(),
      getTrafficVideos(),
      getDemoStatus(),
    ]);
  }
  function applyDashboardResults(results) {
    if (results[0].status === "fulfilled") setSummary(results[0].value);
    if (results[1].status === "fulfilled") setAnalytics(results[1].value);
    if (results[2].status === "fulfilled") {
      const byId = new Map(
        results[2].value.map((camera) => [camera.cameraId, camera]),
      );
      setCameras(
        cameraRegistry.map((camera) => ({
          ...camera,
          ...byId.get(camera.cameraId),
        })),
      );
    }
    if (results[3].status === "fulfilled") {
      setAlerts(
        results[3].value
          .filter((event) => event.eventType !== "VEHICLE_DETECTED")
          .slice(0, 5),
      );
    }
    if (results[4].status === "fulfilled") {
      const videoByCamera = new Map(
        results[4].value.map((camera) => [camera.cameraId, camera]),
      );
      setCameras((current) =>
        current.map((camera) => ({
          ...camera,
          ...videoByCamera.get(camera.cameraId),
        })),
      );
    }
    if (results[5].status === "fulfilled") setSimulation(results[5].value);
    if (results.slice(0, 4).some((result) => result.status === "rejected")) {
      setApiError(
        "Some dashboard data is unavailable. Connect the TrafficIQ API to load live records.",
      );
    } else if (results[4].status === "rejected") {
      setApiError(
        "YouTube demo videos are unavailable. Camera placeholders remain available.",
      );
    }
    if (results[5].status === "rejected") {
      setSimulationError(
        "Simulation status is unavailable. Check the backend connection.",
      );
    } else {
      setSimulationError(undefined);
    }
    setLoading(false);
  }
  function refreshDashboard() {
    const sequence = ++requestSequence.current;
    setLoading(true);
    setApiError(undefined);
    void fetchDashboard().then((results) => {
      if (sequence === requestSequence.current) applyDashboardResults(results);
    });
  }
  async function toggleSimulation() {
    setSimulationPending(true);
    setSimulationError(undefined);
    try {
      const nextStatus = simulation?.running
        ? await stopDemo()
        : await startDemo();
      setSimulation(nextStatus);
    } catch (error) {
      setSimulationError(
        error instanceof Error
          ? error.message
          : "Unable to change simulation state.",
      );
    } finally {
      setSimulationPending(false);
    }
  }
  useEffect(() => {
    let active = true;
    const sequence = ++requestSequence.current;
    void fetchDashboard().then((results) => {
      if (active && sequence === requestSequence.current)
        applyDashboardResults(results);
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (eventVersion === 0) return;
    const timeout = window.setTimeout(() => {
      const sequence = ++requestSequence.current;
      void fetchDashboard().then((results) => {
        if (sequence === requestSequence.current)
          applyDashboardResults(results);
      });
    }, 120);
    return () => window.clearTimeout(timeout);
  }, [eventVersion]);
  const metrics = [
    {
      label: "Total vehicles detected",
      value: summary?.totalVehiclesDetected,
      icon: CarFront,
      tone: "blue",
      hint: "All recorded detections",
    },
    {
      label: "Traffic violations",
      value: summary?.totalTrafficViolations,
      icon: ShieldAlert,
      tone: "red",
      hint: "All violation events",
    },
    {
      label: "No helmet",
      value: summary?.noHelmetViolations,
      icon: Bike,
      tone: "amber",
      hint: "Motorcycle violations",
    },
    {
      label: "Red light",
      value: summary?.redLightViolations,
      icon: CircleDot,
      tone: "violet",
      hint: "Signal violations",
    },
    {
      label: "Wrong side",
      value: summary?.wrongSideDrivingViolations,
      icon: AlertTriangle,
      tone: "red",
      hint: "Direction violations",
    },
    {
      label: "ANPR records",
      value: summary?.anprRecords,
      icon: Activity,
      tone: "green",
      hint: "Plate detections recorded",
    },
  ];
  return _jsxs("div", {
    className: "page-content",
    children: [
      _jsxs("div", {
        className: "page-title-row",
        children: [
          _jsxs("div", {
            children: [
              _jsxs("div", {
                className: "eyebrow",
                children: [
                  "TRAFFIC OPERATIONS CENTER ",
                  _jsx("span", {}),
                  " OVERVIEW",
                ],
              }),
              _jsx("h1", { children: "Traffic overview" }),
              _jsx("p", {
                className: "page-subtitle",
                children:
                  "A city-wide view of traffic activity and monitored intersections.",
              }),
            ],
          }),
          _jsxs("button", {
            className: "refresh-button",
            onClick: refreshDashboard,
            disabled: loading,
            children: [
              _jsx(RefreshCw, {
                size: 15,
                className: loading ? "spinning" : "",
              }),
              "Refresh data",
            ],
          }),
        ],
      }),
      apiError &&
        _jsxs("div", {
          className: "api-notice",
          role: "status",
          children: [
            _jsx(AlertTriangle, { size: 17 }),
            _jsxs("span", {
              children: [
                apiError,
                " Metric values remain blank until provided by MongoDB-backed APIs.",
              ],
            }),
          ],
        }),
      _jsx("section", {
        className: "metrics-grid",
        "aria-label": "Traffic key performance indicators",
        children: metrics.map((metric) =>
          _jsx(MetricCard, { ...metric }, metric.label),
        ),
      }),
      _jsxs("section", {
        className: "overview-strip",
        children: [
          _jsxs("div", {
            className: "overview-copy",
            children: [
              _jsx("div", {
                className: "overview-icon",
                children: _jsx(Activity, { size: 17 }),
              }),
              _jsxs("div", {
                children: [
                  _jsx("strong", { children: "Today's traffic activity" }),
                  _jsx("span", {
                    children: "Current day \u00B7 All monitored zones",
                  }),
                ],
              }),
            ],
          }),
          _jsxs("div", {
            className: "today-stat",
            children: [
              _jsx("span", { children: "VEHICLES TODAY" }),
              _jsx("strong", {
                children: summary?.todayVehicleCount?.toLocaleString() ?? "—",
              }),
            ],
          }),
          _jsxs("div", {
            className: "today-stat",
            children: [
              _jsx("span", { children: "VIOLATIONS TODAY" }),
              _jsx("strong", {
                children: summary?.todayViolationCount?.toLocaleString() ?? "—",
              }),
            ],
          }),
          _jsxs("div", {
            className: "today-stat",
            children: [
              _jsx("span", { children: "ACTIVE CAMERAS" }),
              _jsxs("strong", {
                children: [
                  summary?.activeCameraCount ?? "—",
                  " ",
                  _jsx("small", { children: "/ 9" }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsx(DashboardCharts, { analytics: analytics }),
      _jsxs("section", {
        className: "lower-grid",
        children: [
          _jsxs("div", {
            className: "panel alerts-panel",
            children: [
              _jsxs("div", {
                className: "panel-heading",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsx("h2", { children: "Recent violation alerts" }),
                      _jsx("p", {
                        children: "Latest events across the camera network",
                      }),
                    ],
                  }),
                  _jsxs("span", {
                    className: `live-tag${connected ? "" : " disconnected"}`,
                    children: [
                      _jsx("i", {}),
                      " ",
                      connected ? "LIVE UPDATES" : "RECONNECTING",
                    ],
                  }),
                ],
              }),
              alerts.length
                ? _jsx("div", {
                    className: "alert-list",
                    children: alerts.map((alert) =>
                      _jsxs(
                        "div",
                        {
                          className: "alert-row",
                          children: [
                            _jsx("div", {
                              className: "alert-symbol",
                              children: _jsx(AlertTriangle, { size: 15 }),
                            }),
                            _jsxs("div", {
                              className: "alert-main",
                              children: [
                                _jsx("strong", {
                                  children: formatEvent(alert.eventType),
                                }),
                                _jsxs("span", {
                                  children: [
                                    alert.plateNumber,
                                    " \u00B7 ",
                                    alert.cameraId,
                                    " \u00B7 ",
                                    alert.cameraLocation ??
                                      "Location unavailable",
                                  ],
                                }),
                              ],
                            }),
                            _jsx("time", {
                              children: formatTime(alert.timestamp),
                            }),
                          ],
                        },
                        alert.eventId,
                      ),
                    ),
                  })
                : _jsxs("div", {
                    className: "panel-empty",
                    children: [
                      _jsx(ShieldAlert, { size: 22 }),
                      _jsx("strong", {
                        children: loading
                          ? "Loading recent alerts"
                          : "No recent violations",
                      }),
                      _jsx("span", {
                        children: loading
                          ? "Fetching persisted events…"
                          : "New simulated alerts will appear here when the backend is connected.",
                      }),
                    ],
                  }),
            ],
          }),
          _jsxs("div", {
            className: "panel network-panel",
            children: [
              _jsxs("div", {
                className: "panel-heading",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsx("h2", { children: "Camera network" }),
                      _jsx("p", { children: "Connection status overview" }),
                    ],
                  }),
                  _jsxs("span", {
                    className: "network-total",
                    children: [_jsx(VideoIcon, {}), " 09"],
                  }),
                ],
              }),
              _jsxs("div", {
                className: "network-counts",
                children: [
                  _jsxs("div", {
                    className: "network-count online",
                    children: [
                      _jsx("i", {}),
                      _jsx("span", { children: "Online" }),
                      _jsx("strong", {
                        children: summary?.cameraStatus.online ?? "—",
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: "network-count offline",
                    children: [
                      _jsx("i", {}),
                      _jsx("span", { children: "Offline" }),
                      _jsx("strong", {
                        children: summary?.cameraStatus.offline ?? "—",
                      }),
                    ],
                  }),
                ],
              }),
              _jsxs("div", {
                className: "network-footer",
                children: [
                  _jsxs("span", {
                    children: [
                      _jsx(Truck, { size: 15 }),
                      " ",
                      simulation?.running
                        ? "Simulation running"
                        : "Simulation stopped",
                    ],
                  }),
                  _jsx("button", {
                    className: `simulation-toggle${simulation?.running ? " running" : ""}`,
                    onClick: () => void toggleSimulation(),
                    disabled: simulationPending || !simulation || !user,
                    children: simulationPending
                      ? "PLEASE WAIT"
                      : !user
                        ? "ADMIN"
                        : simulation?.running
                          ? "STOP"
                          : "START",
                  }),
                ],
              }),
              !user &&
                _jsxs("p", {
                  className: "simulation-error",
                  children: [
                    "Admin sign in required to control the simulator. ",
                    _jsx(Link, {
                      to: "/login",
                      state: { from: "/" },
                      children: "Sign in",
                    }),
                  ],
                }),
              simulationError &&
                _jsx("p", {
                  className: "simulation-error",
                  role: "status",
                  children: simulationError,
                }),
              simulation?.lastError &&
                _jsxs("p", {
                  className: "simulation-error",
                  role: "status",
                  children: [
                    "Last simulator tick failed: ",
                    simulation.lastError,
                  ],
                }),
            ],
          }),
        ],
      }),
      _jsxs("section", {
        className: "camera-section",
        children: [
          _jsxs("div", {
            className: "section-heading",
            children: [
              _jsxs("div", {
                children: [
                  _jsx("div", {
                    className: "eyebrow",
                    children: "CITY-WIDE MONITORING",
                  }),
                  _jsxs("h2", {
                    children: [
                      "Camera feeds ",
                      _jsx("span", {
                        className: "section-count",
                        children: "09",
                      }),
                    ],
                  }),
                ],
              }),
              _jsxs("span", {
                className: "demo-explainer",
                children: [
                  _jsx("span", {}),
                  " All feeds are recorded demo video",
                ],
              }),
            ],
          }),
          _jsx("div", {
            className: "camera-grid",
            children: cameras.map((camera) =>
              _jsx(CameraCard, { camera: camera }, camera.cameraId),
            ),
          }),
        ],
      }),
    ],
  });
}
function VideoIcon() {
  return _jsx(CarFront, { size: 14 });
}
function formatEvent(eventType) {
  return eventType
    .replaceAll("_", " ")
    .replace("NO HELMET", "No helmet")
    .replace("RED LIGHT", "Red light")
    .replace("WRONG SIDE", "Wrong side");
}
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
