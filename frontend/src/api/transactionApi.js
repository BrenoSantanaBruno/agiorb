import api from './axios';

export async function getTransactions(params = {}) {
    const { data } = await api.get('/transactions', { params });
    return data;
}
export async function createTransaction(body) {
    const { data } = await api.post('/transactions', body); // JSON
    return data;
}
export async function updateTransaction(id, body) {
    const { data } = await api.put(`/transactions/${id}`, body);
    return data;
}
export async function deleteTransaction(id) {
    const { data } = await api.delete(`/transactions/${id}`);
    return data;
}
export async function uploadTransactionImage(id, file) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post(`/transactions/${id}/images`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data; // { path }
}
export async function deleteTransactionImage(imageId) {
    const { data } = await api.delete(`/transaction-images/${imageId}`);
    return data;
}
