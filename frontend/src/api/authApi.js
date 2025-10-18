import api from './axios';

export async function loginApi({ email, password }) {
    const { data } = await api.post('/login', { email, password });
    return data; // { token, user }
}

export async function meApi() {
    const { data } = await api.get('/me');
    return data;
}

export function logoutApi() {
    localStorage.removeItem('token');
}
