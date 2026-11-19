import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity } from "lucide-react";
export function PlaceholderPage({ title, icon: Icon }) {
  return _jsxs("div", {
    className: "page-content",
    children: [
      _jsx("div", {
        className: "page-title-row",
        children: _jsxs("div", {
          children: [
            _jsx("div", {
              className: "eyebrow",
              children: "TRAFFIC OPERATIONS CENTER",
            }),
            _jsx("h1", { children: title }),
          ],
        }),
      }),
      _jsxs("div", {
        className: "panel milestone-placeholder",
        children: [
          _jsx("div", {
            className: "metric-icon blue",
            children: _jsx(Icon, { size: 19 }),
          }),
          _jsx("h2", {
            children: "This module is planned for a later milestone",
          }),
          _jsx("p", {
            children:
              "Day 1 establishes the dashboard and camera monitoring foundation. This page will use backend records when implemented.",
          }),
          _jsxs("span", {
            children: [
              _jsx(Activity, { size: 14 }),
              " No demo records are being fabricated.",
            ],
          }),
        ],
      }),
    ],
  });
}
