import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { getCurrentAdmin, loginAdmin } from "../services/api";
import { AuthContext } from "./authContextValue";
const tokenStorageKey = "trafficiq-admin-token";
export function AuthProvider({ children }) {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(() => Boolean(window.sessionStorage.getItem(tokenStorageKey)));
    useEffect(() => {
        const handleUnauthorized = () => setUser(undefined);
        window.addEventListener("trafficiq:unauthorized", handleUnauthorized);
        if (!window.sessionStorage.getItem(tokenStorageKey)) {
            return () => window.removeEventListener("trafficiq:unauthorized", handleUnauthorized);
        }
        let active = true;
        getCurrentAdmin()
            .then((admin) => {
            if (active)
                setUser(admin);
        })
            .catch(() => {
            window.sessionStorage.removeItem(tokenStorageKey);
        })
            .finally(() => {
            if (active)
                setLoading(false);
        });
        return () => {
            active = false;
            window.removeEventListener("trafficiq:unauthorized", handleUnauthorized);
        };
    }, []);
    async function signIn(email, password) {
        const session = await loginAdmin(email, password);
        window.sessionStorage.setItem(tokenStorageKey, session.token);
        setUser(session.user);
    }
    function signOut() {
        window.sessionStorage.removeItem(tokenStorageKey);
        setUser(undefined);
    }
    const value = useMemo(() => ({ user, loading, signIn, signOut }), [user, loading]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
