import axios from 'axios';

function getBase() {
    // Vite
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) {
        return import.meta.env.VITE_API_BASE;
    }
    // CRA
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE) {
        return process.env.REACT_APP_API_BASE;
    }
    return '/api'; // padrão
}

function normalize(base) {
    const origin = window.location.origin; // ex.: http://localhost:8080
    if (/^https?:\/\//.test(base)) return base.replace(/\/+$/, '');
    if (base.startsWith('/'))      return `${origin}${base}`.replace(/\/+$/, '');
    return `${origin}/${base}`.replace(/\/+$/, '');
}

const API_BASE = normalize(getBase());

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: false,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
    const t = localStorage.getItem('token');
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
});

export default api;
