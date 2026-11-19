import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function MetricCard({ label, value, icon: Icon, tone, hint }) {
    return (_jsxs("article", { className: "metric-card", children: [_jsx("div", { className: `metric-icon ${tone}`, children: _jsx(Icon, { size: 18 }) }), _jsx("div", { className: "metric-label", children: label }), _jsx("div", { className: "metric-value", children: value === undefined ? '—' : value.toLocaleString() }), _jsx("div", { className: "metric-hint", children: hint })] }));
}
