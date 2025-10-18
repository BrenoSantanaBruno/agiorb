// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const bar = {
    background:'#264653', color:'#fff', padding:'10px 16px',
    display:'flex', alignItems:'center', justifyContent:'space-between'
};

export default function Header() {
    const { auth, logout, hasAnyRole } = useAuth();
    const nav = useNavigate();

    return (
        <header style={bar}>
            <div style={{fontWeight:700, letterSpacing:1}}>AGIORB</div>
            <nav style={{display:'flex', gap:8}}>
                {auth.token && (
                    <>
                        <Link to="/" style={linkStyle}>Home</Link>
                        {hasAnyRole(['admin','secretaria_user','secretaria_manager']) && (
                            <Link to="/secretaria" style={linkStyle}>Secretaria</Link>
                        )}
                        {hasAnyRole(['admin','tesouraria_user','tesouraria_manager']) && (
                            <Link to="/tesouraria" style={linkStyle}>Tesouraria</Link>
                        )}
                        <button
                            onClick={async ()=>{ await logout(); nav('/login', { replace:true }); }}
                            style={{background:'#e63946', color:'#fff', border:'none', padding:'6px 12px', borderRadius:6, cursor:'pointer'}}
                        >
                            Sair
                        </button>
                    </>
                )}
                {!auth.token && <Link to="/login" style={linkStyle}>Entrar</Link>}
            </nav>
        </header>
    );
}

const linkStyle = { color:'#fff', textDecoration:'none', background:'#2a9d8f', padding:'6px 10px', borderRadius:6 };
