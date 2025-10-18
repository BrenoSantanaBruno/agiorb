import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import TopNav from './components/TopNav';
import LoginPage from './pages/LoginPage';
import ChurchesPage from './pages/ChurchesPage';
import TransactionsPage from './pages/TransactionsPage';
import EventsPage from './pages/EventsPage';
import SettingsPage from './pages/SettingsPage';

// === Páginas do Admin ===
import AdminLogsPage from './pages/admin/AdminLogsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminMembersPage from './pages/admin/AdminMembersPage';

// Exige estar logado
function RequireAuth() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Outlet />;
}

// Exige paper ADMIN
function RequireAdmin() {
    const { isAuthenticated, hasAnyRole } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (!hasAnyRole(['admin'])) return <Navigate to="/" replace />;
    return <Outlet />;
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <TopNav />

                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Rotas que exigem estar logado */}
                    <Route element={<RequireAuth />}>
                        <Route path="/" element={<Navigate to="/secretaria" replace />} />
                        <Route path="/secretaria" element={<ChurchesPage />} />
                        <Route path="/tesouraria" element={<TransactionsPage />} />
                        <Route path="/eventos" element={<EventsPage />} />
                        <Route path="/configuracoes" element={<SettingsPage />} />
                    </Route>

                    {/* Rotas exclusivas ADMIN */}
                    <Route element={<RequireAdmin />}>
                        <Route path="/admin/logs" element={<AdminLogsPage />} />
                        <Route path="/admin/users" element={<AdminUsersPage />} />
                        <Route path="/admin/members" element={<AdminMembersPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
