import api from './axios';

export async function getChurches(params = {}) {
    const { data } = await api.get('/churches', { params });
    // data = { items, page, per_page, total, total_pages }
    return data;
}
export async function createChurch(body) {
    const { data } = await api.post('/churches', body);
    return data;
}
export async function updateChurch(id, body) {
    const { data } = await api.put(`/churches/${id}`, body);
    return data;
}
export async function deleteChurch(id) {
    const { data } = await api.delete(`/churches/${id}`);
    return data;
}
