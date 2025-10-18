// src/layouts/MainLayout.jsx
import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { hasAnyRole } from '../utils/auth';
import { logout } from '../api/authApi';

const styles = {
    bar: { display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.75rem 1rem', background:'#264653', color:'#fff' },
    brand: { fontWeight:700, fontSize:'1.1rem' },
    nav: { display:'flex', gap:'0.75rem', alignItems:'center' },
    link: (active) => ({ color:'#fff', textDecoration:'none', padding:'0.4rem 0.7rem', borderRadius:6, background: active? '#2a9d8f' : 'transparent' }),
    wrap: { maxWidth:1200, margin:'1rem auto', padding:'0 1rem' },
    btn: { background:'#e63946', color:'#fff', border:'none', borderRadius:6, padding:'6px 10px', cursor:'pointer' }
};

export default function MainLayout(){
    const nav = useNavigate();
    const loc = useLocation();
    const canSecretaria = hasAnyRole(['secretaria_user','secretaria_manager']);
    const canTesouraria = hasAnyRole(['tesouraria_user','tesouraria_manager']);

    async function doLogout(){
        await logout();
        nav('/login', { replace: true });
    }

    return (
        <>
            <div style={styles.bar}>
                <div style={styles.brand}>AGIORB</div>
                <div style={styles.nav}>
                    <Link to="/" style={styles.link(loc.pathname==='/')}>Home</Link>
                    {canSecretaria && <Link to="/secretaria" style={styles.link(loc.pathname.startsWith('/secretaria'))}>Secretaria</Link>}
                    {canTesouraria && <Link to="/tesouraria" style={styles.link(loc.pathname.startsWith('/tesouraria'))}>Tesouraria</Link>}
                    <button onClick={doLogout} style={styles.btn}>Sair</button>
                </div>
            </div>
            <div style={styles.wrap}>
                <Outlet />
            </div>
        </>
    );
}
