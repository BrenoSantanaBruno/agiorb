import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const styles = {
    wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fbfc' },
    card: { width: 360, background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,.08)', padding: '1.5rem' },
    brand: { fontWeight: 800, color: '#264653', textAlign: 'center', fontSize: '1.4rem', marginBottom: '.5rem' },
    title: { textAlign: 'center', color: '#264653', marginBottom: '1rem' },
    label: { fontWeight: 600, color: '#264653', marginBottom: 6, display: 'block' },
    input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #a8dadc', outlineColor: '#2a9d8f', marginBottom: 12 },
    button: { width: '100%', padding: '10px 12px', border: 'none', borderRadius: 8, fontWeight: 700, background: '#2a9d8f', color: '#fff', cursor: 'pointer' },
    hint: { fontSize: 12, color: '#6c757d', textAlign: 'center', marginTop: 10 }
};

export default function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPass] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (isAuthenticated) navigate('/secretaria', { replace: true });
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Informe e-mail e senha.');
            return;
        }

        setBusy(true);
        try {
            const { data } = await api.post('/login', { email, password });
            login({ token: data.token, user: data.user });
            toast.success('Login realizado!');
            navigate('/secretaria', { replace: true });
        } catch (err) {
            const msg = err?.response?.data?.message || 'Falha no login.';
            toast.error(msg);
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <div style={styles.wrap}>
                <ToastContainer />
                <div style={styles.card}>
                    <div style={styles.brand}>AGIORB</div>
                    <h2 style={styles.title}>Entrar</h2>
                    <form onSubmit={handleSubmit}>
                        <label style={styles.label}>E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <label style={styles.label}>Senha</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            style={styles.input}
                            value={password}
                            onChange={(e) => setPass(e.target.value)}
                        />

                        <button type="submit" style={styles.button} disabled={busy}>
                            {busy ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                    <div style={styles.hint}>“Porque dele, por ele e para ele são todas as coisas.” – Romanos 11:36</div>
                </div>
            </div>

            {/* Rodapé fora do Flex, centralizado */}
            <div style={{ width: '100%', textAlign: 'center', marginTop: 40, marginBottom: 20 }}>
                <Footer />
            </div>

        </>
    );
}
