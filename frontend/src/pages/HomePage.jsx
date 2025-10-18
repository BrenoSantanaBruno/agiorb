// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage(){
    const { auth, hasAnyRole } = useAuth();

    return (
        <div style={{maxWidth:900, margin:'2rem auto', padding:'0 1rem'}}>
            <h1 style={{textAlign:'center', color:'#264653'}}>Bem-vindo{auth?.user?.name ? `, ${auth.user.name}` : ''}</h1>
            {!auth.token && (
                <div style={{textAlign:'center', marginTop:20}}>
                    <Link to="/login" style={btn}>Entrar</Link>
                </div>
            )}
            {auth.token && (
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginTop:20}}>
                    {hasAnyRole(['admin','secretaria_user','secretaria_manager']) && (
                        <Link to="/secretaria" style={card}>Secretaria</Link>
                    )}
                    {hasAnyRole(['admin','tesouraria_user','tesouraria_manager']) && (
                        <Link to="/tesouraria" style={card}>Tesouraria</Link>
                    )}
                </div>
            )}
        </div>
    );
}

const btn={background:'#2a9d8f', color:'#fff', padding:'10px 16px', borderRadius:8, textDecoration:'none', fontWeight:700};
const card={textDecoration:'none', background:'#f1f6f9', border:'1px solid #e0e0e0', borderRadius:10, padding:'1.5rem', color:'#264653', fontWeight:700, textAlign:'center'};
