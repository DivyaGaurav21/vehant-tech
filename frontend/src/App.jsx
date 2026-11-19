import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CircleHelp,
  LayoutDashboard,
  Map,
  ScanLine,
  ShieldAlert,
  TrafficCone,
  X,
} from "lucide-react";
import { TrafficSocketProvider } from "./context/TrafficSocketProvider";
import { useTrafficSocket } from "./context/useTrafficSocket";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const CamerasPage = lazy(() =>
  import("./pages/CamerasPage").then((module) => ({
    default: module.CamerasPage,
  })),
);
const CameraDetailPage = lazy(() =>
  import("./pages/CameraDetailPage").then((module) => ({
    default: module.CameraDetailPage,
  })),
);
const ViolationsPage = lazy(() =>
  import("./pages/ViolationsPage").then((module) => ({
    default: module.ViolationsPage,
  })),
);
const AnprPage = lazy(() =>
  import("./pages/AnprPage").then((module) => ({ default: module.AnprPage })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
function AppShell() {
  const location = useLocation();
  const { connected, toasts, dismissToast } = useTrafficSocket();
  const { user, signOut } = useAuth();
  const cameraDetail = location.pathname.startsWith("/cameras/");
  const pageTitle = cameraDetail
    ? "Camera detail"
    : (navigationItems.find((item) => item.to === location.pathname)?.label ??
      "TrafficIQ");
  return _jsxs("div", {
    className: "app-shell",
    children: [
      _jsxs("aside", {
        className: "sidebar",
        children: [
          _jsxs(Link, {
            to: "/",
            className: "brand",
            children: [
              _jsx("div", {
                className: "brand-mark",
                children: _jsx(TrafficCone, { size: 20, strokeWidth: 2.2 }),
              }),
              _jsxs("span", {
                children: [
                  "Traffic",
                  _jsx("span", { className: "brand-accent", children: "IQ" }),
                  _jsx("small", { children: "SMART CITY OPERATIONS" }),
                ],
              }),
            ],
          }),
          _jsx("div", {
            className: "nav-section-label",
            children: "WORKSPACE",
          }),
          _jsx("nav", {
            className: "main-nav",
            "aria-label": "Main navigation",
            children: navigationItems.map(({ label, to, icon: Icon }) =>
              _jsxs(
                NavLink,
                {
                  to: to,
                  className: ({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`,
                  children: [
                    _jsx(Icon, { size: 17, strokeWidth: 1.8 }),
                    _jsx("span", { children: label }),
                    label === "Camera feeds" &&
                      _jsx("span", { className: "nav-count", children: "09" }),
                  ],
                },
                to,
              ),
            ),
          }),
          _jsxs("div", {
            className: "sidebar-bottom",
            children: [
              _jsxs("div", {
                className: "system-card",
                children: [
                  _jsx("span", {
                    className: `system-dot${connected ? " connected" : ""}`,
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx("strong", { children: "System status" }),
                      _jsx("small", {
                        children: connected
                          ? "Realtime connection active"
                          : "Realtime reconnecting",
                      }),
                    ],
                  }),
                ],
              }),
              _jsxs("button", {
                className: "help-link",
                children: [
                  _jsx(CircleHelp, { size: 16 }),
                  " Help & documentation",
                ],
              }),
              _jsxs("div", {
                className: "sidebar-version",
                children: [
                  "TRAFFIQ CONSOLE ",
                  _jsx("span", { children: "v0.1.0" }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: "main-column",
        children: [
          _jsxs("header", {
            className: "topbar",
            children: [
              _jsxs("div", {
                className: "breadcrumbs",
                children: [
                  _jsx("span", { children: "TrafficIQ" }),
                  _jsx("b", { children: "/" }),
                  _jsx("strong", { children: pageTitle }),
                ],
              }),
              _jsxs("div", {
                className: "topbar-right",
                children: [
                  _jsxs("div", {
                    className: `environment-tag${connected ? " socket-connected" : " socket-disconnected"}`,
                    children: [
                      _jsx("span", {}),
                      " ",
                      connected
                        ? "REALTIME CONNECTED"
                        : "REALTIME RECONNECTING",
                    ],
                  }),
                  _jsxs("button", {
                    className: "icon-button notification-button",
                    "aria-label": "Notifications",
                    children: [_jsx(Bell, { size: 17 }), _jsx("i", {})],
                  }),
                  user
                    ? _jsxs("button", {
                        type: "button",
                        className: "user-profile user-profile-button",
                        onClick: signOut,
                        title: "Sign out",
                        children: [
                          _jsx("div", {
                            className: "avatar",
                            children: user.email.slice(0, 2).toUpperCase(),
                          }),
                          _jsxs("div", {
                            children: [
                              _jsx("strong", { children: user.email }),
                              _jsx("small", {
                                children: "Administrator \u00B7 Sign out",
                              }),
                            ],
                          }),
                          _jsx(ChevronDown, { size: 14 }),
                        ],
                      })
                    : _jsxs(Link, {
                        to: "/login",
                        className: "user-profile login-profile",
                        children: [
                          _jsx("div", { className: "avatar", children: "TC" }),
                          _jsxs("div", {
                            children: [
                              _jsx("strong", { children: "Admin sign in" }),
                              _jsx("small", { children: "Operator access" }),
                            ],
                          }),
                        ],
                      }),
                ],
              }),
            ],
          }),
          _jsx("main", {
            children: _jsx(Suspense, {
              fallback: _jsx("div", {
                className: "page-loading",
                children: "Opening workspace\u2026",
              }),
              children: _jsxs(Routes, {
                children: [
                  _jsx(Route, { path: "/", element: _jsx(DashboardPage, {}) }),
                  _jsx(Route, {
                    path: "/cameras",
                    element: _jsx(CamerasPage, {}),
                  }),
                  _jsx(Route, {
                    path: "/cameras/:cameraId",
                    element: _jsx(CameraDetailPage, {}),
                  }),
                  _jsx(Route, {
                    path: "/violations",
                    element: _jsx(ViolationsPage, {}),
                  }),
                  _jsx(Route, { path: "/anpr", element: _jsx(AnprPage, {}) }),
                  _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }),
                  _jsx(Route, {
                    path: "*",
                    element: _jsx(Navigate, { to: "/", replace: true }),
                  }),
                ],
              }),
            }),
          }),
        ],
      }),
      _jsx("div", {
        className: "toast-stack",
        "aria-live": "polite",
        "aria-label": "Real-time violation alerts",
        children: toasts.map((toast) =>
          _jsxs(
            "article",
            {
              className: "violation-toast",
              children: [
                _jsx("div", {
                  className: "toast-icon",
                  children: _jsx(ShieldAlert, { size: 17 }),
                }),
                _jsxs("div", {
                  className: "toast-content",
                  children: [
                    _jsxs("strong", {
                      children: [
                        "New ",
                        formatViolation(toast.violationType),
                        " alert",
                      ],
                    }),
                    _jsxs("span", {
                      children: [toast.cameraId, " \u00B7 ", toast.location],
                    }),
                    _jsxs("span", {
                      children: [toast.plateNumber, " \u00B7 SIMULATED"],
                    }),
                  ],
                }),
                _jsx("button", {
                  type: "button",
                  "aria-label": "Dismiss alert",
                  onClick: () => dismissToast(toast.eventId),
                  children: _jsx(X, { size: 15 }),
                }),
              ],
            },
            toast.eventId,
          ),
        ),
      }),
    ],
  });
}
function formatViolation(type) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
const navigationItems = [
  { label: "Overview", to: "/", icon: LayoutDashboard },
  { label: "Camera feeds", to: "/cameras", icon: Map },
  { label: "Violations", to: "/violations", icon: ShieldAlert },
  { label: "ANPR records", to: "/anpr", icon: ScanLine },
];
export default function App() {
  return _jsx(TrafficSocketProvider, {
    children: _jsx(AuthProvider, {
      children: _jsx(BrowserRouter, { children: _jsx(AppShell, {}) }),
    }),
  });
}
