// src/routes/RequireAuth.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ anyRole }) {
    const { auth, hasAnyRole } = useAuth();
    if (auth.loading) return null; // pode trocar por spinner

    if (!auth.token) return <Navigate to="/login" replace />;

    if (anyRole && anyRole.length && !hasAnyRole(anyRole)) {
        return <div style={{padding:'2rem', textAlign:'center'}}>403 - Sem permissão.</div>;
    }
    return <Outlet />;
}
