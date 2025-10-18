import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
    bar: {
        background: '#264653',
        color: '#fff',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    btn: {
        border: '1px solid rgba(255,255,255,.25)',
        background: 'transparent',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: 6,
        cursor: 'pointer',
        textDecoration: 'none',
        fontSize: '.9rem',
        transition: 'background .2s',
    },
    btnActive: {
        background: '#2a9d8f',
        borderColor: '#2a9d8f',
    },
    btnDanger: {
        background: '#e63946',
        borderColor: '#e63946',
    },
    burger: {
        display: 'none',
        border: '1px solid rgba(255,255,255,.25)',
        background: 'transparent',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: 6,
        cursor: 'pointer',
    },
    drawer: {
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        background: '#274f5a',
        borderTop: '1px solid rgba(255,255,255,.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        zIndex: 999,
    },
};

// helper para unir estilos
function sx(...objs) {
    return Object.assign({}, ...objs);
}

export default function TopNav() {
    const { isAuthenticated, hasAnyRole, logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path);

    const items = useMemo(() => [
        {
            key: 'secretaria',
            label: 'Secretaria',
            to: '/secretaria',
            roles: ['admin', 'secretaria_user', 'secretaria_manager'],
        },
        {
            key: 'tesouraria',
            label: 'Tesouraria',
            to: '/tesouraria',
            roles: ['admin', 'tesouraria_user', 'tesouraria_manager'],
        },
        {
            key: 'eventos',
            label: 'Eventos',
            to: '/eventos',
            roles: ['admin', 'secretaria_user', 'secretaria_manager', 'tesouraria_user', 'tesouraria_manager'],
        },
        {
            key: 'members',
            label: 'Membros',
            to: '/admin/members',
            roles: ['admin'],
        },
        {
            key: 'admin',
            label: 'Logs',
            to: '/admin/logs',
            roles: ['admin'],
        },
        {
            key: 'users',
            label: 'Usuários',
            to: '/admin/users',
            roles: ['admin'],
        },
        {
            key: 'settings',
            label: 'Configurações',
            to: '/configuracoes',
            roles: ['admin'],
        },
    ], []);

    const allowedItems = useMemo(() => {
        if (!isAuthenticated) return [];
        return items.filter(it => hasAnyRole(it.roles));
    }, [isAuthenticated, items, hasAnyRole]);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

    return (
        <>
            <div style={styles.bar}>
                <Link to={isAuthenticated ? '/secretaria' : '/login'} style={sx(styles.btn, { border: 'none', fontWeight:800 })}>
                    AGIORB
                </Link>

                {!isMobile && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {isAuthenticated && allowedItems.map(it => (
                            <Link
                                key={it.key}
                                to={it.to}
                                style={sx(styles.btn, isActive(it.to) && styles.btnActive)}
                            >
                                {it.label}
                            </Link>
                        ))}

                        {!isAuthenticated ? (
                            <Link to="/login" style={sx(styles.btn, styles.btnActive)}>Entrar</Link>
                        ) : (
                            <>
                                <span style={{ opacity:.85, fontSize:'.85rem', marginRight:6 }}>
                                    {user?.name || 'Usuário'}
                                </span>
                                <button onClick={handleLogout} style={sx(styles.btn, styles.btnDanger)}>Sair</button>
                            </>
                        )}
                    </div>
                )}

                {isMobile && (
                    <button style={styles.burger} onClick={() => setOpen(v => !v)}>
                        {open ? 'Fechar' : 'Menu'}
                    </button>
                )}
            </div>

            {isMobile && open && (
                <div style={styles.drawer}>
                    {isAuthenticated && allowedItems.map(it => (
                        <Link
                            key={it.key}
                            to={it.to}
                            onClick={() => setOpen(false)}
                            style={sx(styles.btn, isActive(it.to) && styles.btnActive)}
                        >
                            {it.label}
                        </Link>
                    ))}
                    {!isAuthenticated ? (
                        <Link to="/login" onClick={() => setOpen(false)} style={sx(styles.btn, styles.btnActive)}>
                            Entrar
                        </Link>
                    ) : (
                        <>
                            <div style={{ color:'#fff',opacity:.9,marginBottom:6 }}>{user?.name}</div>
                            <button onClick={() => { setOpen(false); handleLogout(); }} style={sx(styles.btn, styles.btnDanger)}>
                                Sair
                            </button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
