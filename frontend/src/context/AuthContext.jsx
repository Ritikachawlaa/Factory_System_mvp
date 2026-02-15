import React, { createContext, useState, useContext, useEffect } from 'react';
import API_BASE_URL from '../config';
import authApi from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // Ensure auth header is set if httpClient relies on localStorage, 
                // but since we set it in interceptor from localStorage, it should be fine.
                // However, the interceptor reads from localStorage at request time.
                // We must ensure localStorage is updated before this runs.

                const data = await authApi.getCurrentUser();

                // MOCK RBAC ROLE INJECTION (if backend doesn't send it yet)
                // Backend sends { username: "...", role: "..." } now per main.py update earlier
                // So we can use data.role directly.

                setUser(data);
            } catch (e) {
                console.error("Auth Check Failed:", e);
                logout();
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]);

    const login = (newToken) => {
        setLoading(true);
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const checkPermission = (action) => {
        if (!user) return false;
        const role = user.role || 'viewer';

        switch (action) {
            case 'manage_system': return role === 'admin';
            case 'control_module': return ['admin', 'supervisor'].includes(role);
            case 'view_sensitive': return ['admin', 'supervisor', 'operator'].includes(role);
            default: return true; // Default view access
        }
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout, loading, checkPermission }}>
            {loading ? (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div className="loader" style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        borderTopColor: '#06b6d4',
                        animation: 'spin 1s ease-in-out infinite'
                    }}></div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <div>Loading Application...</div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
