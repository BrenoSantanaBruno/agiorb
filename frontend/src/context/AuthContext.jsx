// ...
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    });

    // ⬇️ANTES: const roles = Array.isArray(user?.roles) ? user.roles : [];
    const roles = useMemo(
        () => (Array.isArray(user?.roles) ? user.roles : []),
        [user]
    );

    useEffect(() => {
        if (token) {
            api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common.Authorization;
        }
    }, [token]);

    const hasAnyRole = useCallback(
        (list) => {
            const needles = Array.isArray(list) ? list : [list];
            return needles.some((r) => roles.includes(r));
        },
        [roles]
    );

    const login = useCallback((payload) => {
        setToken(payload.token);
        setUser(payload.user || {});
        localStorage.setItem('token', payload.token);
        localStorage.setItem('user', JSON.stringify(payload.user || {}));
        api.defaults.headers.common.Authorization = `Bearer ${payload.token}`;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser({});
        window.location.assign('/login');
    }, []);

    const value = useMemo(
        () => ({
            token,
            user,
            roles,
            isAuthenticated: !!token,
            hasAnyRole,
            login,
            logout,
        }),
        [token, user, roles, hasAnyRole, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
