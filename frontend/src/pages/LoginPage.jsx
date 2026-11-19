import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowLeft, LockKeyhole, TrafficCone } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getRequestErrorMessage } from '../utils/requestError';
export function LoginPage() {
    const { user, loading, signIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState();
    const [submitting, setSubmitting] = useState(false);
    if (loading)
        return _jsx("div", { className: "page-loading", children: "Checking admin session\u2026" });
    if (user)
        return _jsx(Navigate, { to: location.state?.from ?? '/violations', replace: true });
    async function handleSubmit(event) {
        event.preventDefault();
        setError(undefined);
        setSubmitting(true);
        try {
            await signIn(email.trim(), password);
            navigate(location.state?.from ?? '/violations', { replace: true });
        }
        catch (loginError) {
            setError(getRequestErrorMessage(loginError));
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsxs("div", { className: "login-page", children: [_jsxs(Link, { to: "/", className: "back-link", children: [_jsx(ArrowLeft, { size: 15 }), " Return to dashboard"] }), _jsxs("section", { className: "panel login-panel", children: [_jsx("div", { className: "brand-mark login-brand", children: _jsx(TrafficCone, { size: 21 }) }), _jsx("div", { className: "eyebrow", children: "TRAFFICIQ ADMINISTRATION" }), _jsx("h1", { children: "Administrator sign in" }), _jsx("p", { children: "Sign in to review violation records and control the traffic simulation." }), _jsxs("form", { onSubmit: handleSubmit, className: "login-form", children: [_jsx("label", { htmlFor: "admin-email", children: "Email address" }), _jsx("input", { id: "admin-email", autoComplete: "username", type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true, maxLength: 254 }), _jsx("label", { htmlFor: "admin-password", children: "Password" }), _jsx("input", { id: "admin-password", autoComplete: "current-password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), required: true, maxLength: 128 }), error && _jsx("div", { className: "form-error", role: "alert", children: error }), _jsxs("button", { type: "submit", className: "login-submit", disabled: submitting, children: [_jsx(LockKeyhole, { size: 15 }), " ", submitting ? 'Signing in…' : 'Sign in securely'] })] }), _jsx("div", { className: "login-note", children: "Admin credentials are configured by the system operator in the backend environment." })] })] }));
}
