import {
  Fragment as _Fragment,
  jsx as _jsx,
  jsxs as _jsxs,
} from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilterX,
  LoaderCircle,
  ShieldAlert,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getViolations, updateViolationStatus } from "../services/api";
import { useAuth } from "../context/useAuth";
import { getRequestErrorMessage } from "../utils/requestError";
import { getCameras } from "../services/api";
const pageSize = 10;
const violationLabels = {
  NO_HELMET: "No helmet",
  RED_LIGHT: "Red light",
  WRONG_SIDE: "Wrong side",
};
export function ViolationsPage() {
  const { user } = useAuth();
  const [plateNumber, setPlateNumber] = useState("");
  const [violationType, setViolationType] = useState("");
  const [cameraId, setCameraId] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [selected, setSelected] = useState();
  const [statusPending, setStatusPending] = useState(false);
  useEffect(() => {
    let active = true;
    getCameras()
      .then((records) => {
        if (active) setCameras(records);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    const filters = {
      page,
      limit: pageSize,
      ...(plateNumber.trim() ? { plateNumber: plateNumber.trim() } : {}),
      ...(violationType ? { violationType } : {}),
      ...(cameraId ? { cameraId } : {}),
      ...(reviewStatus ? { reviewStatus } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    };
    getViolations(filters)
      .then((result) => {
        if (!active) return;
        setEvents(result.data);
        setTotal(result.meta.total);
        setPages(result.meta.pages);
      })
      .catch((requestError) => {
        if (active) setError(getRequestErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, plateNumber, violationType, cameraId, reviewStatus, from, to]);
  async function changeStatus(event, nextStatus) {
    setStatusPending(true);
    setError(undefined);
    try {
      const updated = await updateViolationStatus(event.eventId, nextStatus);
      setEvents((current) =>
        current.map((item) =>
          item.eventId === updated.eventId ? updated : item,
        ),
      );
      setSelected((current) =>
        current?.eventId === updated.eventId ? updated : current,
      );
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setStatusPending(false);
    }
  }
  function resetFilters() {
    setLoading(true);
    setError(undefined);
    setPlateNumber("");
    setViolationType("");
    setCameraId("");
    setReviewStatus("");
    setFrom("");
    setTo("");
    setPage(1);
  }
  function updateFilter(setter, value) {
    setter(value);
    setLoading(true);
    setError(undefined);
    setPage(1);
  }
  function changePage(nextPage) {
    setLoading(true);
    setError(undefined);
    setPage(nextPage);
  }
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
                  " EVENT REVIEW",
                ],
              }),
              _jsx("h1", { children: "Violation management" }),
              _jsx("p", {
                className: "page-subtitle",
                children:
                  "Review and manage backend-generated simulated traffic violations.",
              }),
            ],
          }),
          _jsx("span", {
            className: "source-label",
            children: "SIMULATED EVENTS",
          }),
        ],
      }),
      !user &&
        _jsxs("div", {
          className: "auth-notice",
          children: [
            _jsx(ShieldAlert, { size: 17 }),
            _jsx("span", {
              children:
                "Sign in as an administrator to mark violations reviewed or dismissed.",
            }),
            _jsx(Link, {
              to: "/login",
              state: { from: "/violations" },
              children: "Admin sign in",
            }),
          ],
        }),
      error &&
        _jsxs("div", {
          className: "api-notice",
          role: "alert",
          children: [
            _jsx(AlertTriangle, { size: 17 }),
            _jsx("span", { children: error }),
          ],
        }),
      _jsxs("section", {
        className: "panel filter-panel",
        children: [
          _jsxs("div", {
            className: "filter-heading",
            children: [
              _jsx("strong", { children: "Filter records" }),
              _jsxs("button", {
                type: "button",
                className: "text-button",
                onClick: resetFilters,
                children: [_jsx(FilterX, { size: 14 }), " Clear filters"],
              }),
            ],
          }),
          _jsxs("div", {
            className: "filter-grid",
            children: [
              _jsxs("label", {
                className: "filter-control",
                children: [
                  _jsx("span", { children: "NUMBER PLATE" }),
                  _jsx("input", {
                    value: plateNumber,
                    onChange: (event) =>
                      updateFilter(setPlateNumber, event.target.value),
                    placeholder: "Search plate\u2026",
                    maxLength: 20,
                  }),
                ],
              }),
              _jsxs("label", {
                className: "filter-control",
                children: [
                  _jsx("span", { children: "VIOLATION TYPE" }),
                  _jsxs("select", {
                    value: violationType,
                    onChange: (event) =>
                      updateFilter(setViolationType, event.target.value),
                    children: [
                      _jsx("option", { value: "", children: "All violations" }),
                      Object.entries(violationLabels).map(([value, label]) =>
                        _jsx(
                          "option",
                          { value: value, children: label },
                          value,
                        ),
                      ),
                    ],
                  }),
                ],
              }),
              _jsxs("label", {
                className: "filter-control",
                children: [
                  _jsx("span", { children: "CAMERA" }),
                  _jsxs("select", {
                    value: cameraId,
                    onChange: (event) =>
                      updateFilter(setCameraId, event.target.value),
                    children: [
                      _jsx("option", { value: "", children: "All cameras" }),
                      cameras.map((camera) =>
                        _jsxs(
                          "option",
                          {
                            value: camera.cameraId,
                            children: [
                              camera.cameraId,
                              " \u00B7 ",
                              camera.name,
                            ],
                          },
                          camera.cameraId,
                        ),
                      ),
                    ],
                  }),
                ],
              }),
              _jsxs("label", {
                className: "filter-control",
                children: [
                  _jsx("span", { children: "REVIEW STATUS" }),
                  _jsxs("select", {
                    value: reviewStatus,
                    onChange: (event) =>
                      updateFilter(setReviewStatus, event.target.value),
                    children: [
                      _jsx("option", { value: "", children: "All statuses" }),
                      _jsx("option", { value: "PENDING", children: "Pending" }),
                      _jsx("option", {
                        value: "REVIEWED",
                        children: "Reviewed",
                      }),
                      _jsx("option", {
                        value: "DISMISSED",
                        children: "Dismissed",
                      }),
                    ],
                  }),
                ],
              }),
              _jsxs("label", {
                className: "filter-control",
                children: [
                  _jsx("span", { children: "FROM DATE" }),
                  _jsx("input", {
                    type: "date",
                    value: from,
                    max: to || undefined,
                    onChange: (event) =>
                      updateFilter(setFrom, event.target.value),
                  }),
                ],
              }),
              _jsxs("label", {
                className: "filter-control",
                children: [
                  _jsx("span", { children: "TO DATE" }),
                  _jsx("input", {
                    type: "date",
                    value: to,
                    min: from || undefined,
                    onChange: (event) =>
                      updateFilter(setTo, event.target.value),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("section", {
        className: "panel data-panel",
        children: [
          _jsxs("div", {
            className: "table-heading",
            children: [
              _jsxs("div", {
                children: [
                  _jsx("h2", { children: "Violation events" }),
                  _jsxs("p", {
                    children: [
                      total.toLocaleString(),
                      " matching simulated records",
                    ],
                  }),
                ],
              }),
              _jsx("span", {
                className: "table-page-label",
                children: pages ? `Page ${page} of ${pages}` : "No pages",
              }),
            ],
          }),
          _jsx("div", {
            className: "table-scroll",
            children: _jsxs("table", {
              className: "data-table",
              children: [
                _jsx("thead", {
                  children: _jsxs("tr", {
                    children: [
                      _jsx("th", { children: "EVENT" }),
                      _jsx("th", { children: "VEHICLE" }),
                      _jsx("th", { children: "CAMERA / LOCATION" }),
                      _jsx("th", { children: "DETECTED" }),
                      _jsx("th", { children: "CONFIDENCE" }),
                      _jsx("th", { children: "STATUS" }),
                      _jsx("th", {}),
                    ],
                  }),
                }),
                _jsxs("tbody", {
                  children: [
                    !loading &&
                      events.map((event) =>
                        _jsxs(
                          "tr",
                          {
                            children: [
                              _jsxs("td", {
                                children: [
                                  _jsx("span", {
                                    className: `violation-type ${event.eventType.toLowerCase()}`,
                                    children: violationLabels[event.eventType],
                                  }),
                                  _jsx("small", {
                                    children: event.eventId.slice(0, 10),
                                  }),
                                ],
                              }),
                              _jsxs("td", {
                                children: [
                                  _jsx("strong", {
                                    className: "plate-value",
                                    children: event.plateNumber,
                                  }),
                                  _jsx("small", {
                                    children: event.vehicleType,
                                  }),
                                ],
                              }),
                              _jsxs("td", {
                                children: [
                                  _jsx("strong", { children: event.cameraId }),
                                  _jsx("small", {
                                    children:
                                      event.cameraLocation ??
                                      event.cameraName ??
                                      "Location unavailable",
                                  }),
                                ],
                              }),
                              _jsx("td", {
                                children: formatDateTime(event.timestamp),
                              }),
                              _jsx("td", {
                                children: formatConfidence(event.confidence),
                              }),
                              _jsx("td", {
                                children: _jsx("span", {
                                  className: `review-status ${event.reviewStatus?.toLowerCase() ?? "pending"}`,
                                  children: event.reviewStatus ?? "PENDING",
                                }),
                              }),
                              _jsx("td", {
                                children: _jsx("button", {
                                  className: "row-action",
                                  type: "button",
                                  onClick: () => setSelected(event),
                                  "aria-label": `View ${event.eventId}`,
                                  children: _jsx(Eye, { size: 15 }),
                                }),
                              }),
                            ],
                          },
                          event.eventId,
                        ),
                      ),
                    loading &&
                      _jsx("tr", {
                        children: _jsx("td", {
                          colSpan: 7,
                          children: _jsxs("div", {
                            className: "table-state",
                            children: [
                              _jsx(LoaderCircle, {
                                size: 18,
                                className: "spinning",
                              }),
                              " Loading persisted violation records\u2026",
                            ],
                          }),
                        }),
                      }),
                    !loading &&
                      !error &&
                      events.length === 0 &&
                      _jsx("tr", {
                        children: _jsx("td", {
                          colSpan: 7,
                          children: _jsxs("div", {
                            className: "table-state",
                            children: [
                              _jsx(ShieldAlert, { size: 19 }),
                              _jsx("strong", {
                                children: "No matching violations",
                              }),
                              _jsx("span", {
                                children:
                                  "Adjust the filters or wait for the simulator to generate events.",
                              }),
                            ],
                          }),
                        }),
                      }),
                  ],
                }),
              ],
            }),
          }),
          _jsx(Pagination, {
            page: page,
            pages: pages,
            total: total,
            onPage: changePage,
          }),
        ],
      }),
      selected &&
        _jsx("div", {
          className: "modal-backdrop",
          role: "presentation",
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) setSelected(undefined);
          },
          children: _jsxs("section", {
            className: "panel event-modal",
            role: "dialog",
            "aria-modal": "true",
            "aria-labelledby": "event-modal-title",
            children: [
              _jsxs("div", {
                className: "modal-heading",
                children: [
                  _jsxs("div", {
                    children: [
                      _jsx("div", {
                        className: "eyebrow",
                        children: "SIMULATED VIOLATION EVENT",
                      }),
                      _jsx("h2", {
                        id: "event-modal-title",
                        children: violationLabels[selected.eventType],
                      }),
                    ],
                  }),
                  _jsx("button", {
                    type: "button",
                    className: "icon-button",
                    "aria-label": "Close event details",
                    onClick: () => setSelected(undefined),
                    children: _jsx(X, { size: 17 }),
                  }),
                ],
              }),
              _jsxs("div", {
                className: "modal-detail-grid",
                children: [
                  _jsx(Detail, { label: "Event ID", value: selected.eventId }),
                  _jsx(Detail, {
                    label: "Number plate",
                    value: selected.plateNumber,
                  }),
                  _jsx(Detail, {
                    label: "Vehicle type",
                    value: selected.vehicleType,
                  }),
                  _jsx(Detail, {
                    label: "Camera",
                    value: `${selected.cameraId} · ${selected.cameraName ?? ""}`,
                  }),
                  _jsx(Detail, {
                    label: "Location",
                    value: selected.cameraLocation ?? "Location unavailable",
                  }),
                  _jsx(Detail, {
                    label: "Detected at",
                    value: formatDateTime(selected.timestamp),
                  }),
                  _jsx(Detail, {
                    label: "Confidence",
                    value: formatConfidence(selected.confidence),
                  }),
                  _jsx(Detail, {
                    label: "Review status",
                    value: selected.reviewStatus ?? "PENDING",
                  }),
                  _jsx(Detail, { label: "Source", value: "SIMULATED" }),
                ],
              }),
              selected.reviewStatus === "PENDING" &&
                _jsxs("div", {
                  className: "modal-actions",
                  children: [
                    !user &&
                      _jsx(Link, {
                        to: "/login",
                        state: { from: "/violations" },
                        className: "primary-button",
                        children: "Admin sign in to review",
                      }),
                    user &&
                      _jsxs(_Fragment, {
                        children: [
                          _jsxs("button", {
                            type: "button",
                            className: "secondary-button dismiss-button",
                            disabled: statusPending,
                            onClick: () =>
                              void changeStatus(selected, "DISMISSED"),
                            children: [_jsx(X, { size: 14 }), " Dismiss"],
                          }),
                          _jsxs("button", {
                            type: "button",
                            className: "primary-button",
                            disabled: statusPending,
                            onClick: () =>
                              void changeStatus(selected, "REVIEWED"),
                            children: [
                              _jsx(Check, { size: 14 }),
                              " ",
                              statusPending ? "Saving…" : "Mark reviewed",
                            ],
                          }),
                        ],
                      }),
                  ],
                }),
            ],
          }),
        }),
    ],
  });
}
function Detail({ label, value }) {
  return _jsxs("div", {
    className: "modal-detail",
    children: [
      _jsx("span", { children: label }),
      _jsx("strong", { children: value }),
    ],
  });
}
function Pagination({ page, pages, total, onPage }) {
  return _jsxs("div", {
    className: "pagination",
    children: [
      _jsx("span", {
        children: total
          ? `Showing page ${page} of ${pages} · ${total} records`
          : "No records to display",
      }),
      _jsxs("div", {
        children: [
          _jsx("button", {
            type: "button",
            "aria-label": "Previous page",
            disabled: page <= 1,
            onClick: () => onPage(page - 1),
            children: _jsx(ChevronLeft, { size: 15 }),
          }),
          _jsx("button", {
            type: "button",
            "aria-label": "Next page",
            disabled: page >= pages,
            onClick: () => onPage(page + 1),
            children: _jsx(ChevronRight, { size: 15 }),
          }),
        ],
      }),
    ],
  });
}
function formatConfidence(value) {
  return `${Math.round(value * 100)}%`;
}
function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}
