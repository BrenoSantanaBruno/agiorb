// src/utils/files.js
const API_BASE = process.env.REACT_APP_API_BASE || 'http://3.15.56.188';

export function assetUrl(storagePath) {
    const clean = String(storagePath).replace(/^transaction_images\//, '');
    return `${API_BASE}/api/files/transactions/${encodeURIComponent(clean)}`;
}

// se quiser manter compatibilidade com FilePreviewModal:
export function isImage(path) {
    return /\.(jpe?g|png|gif|bmp|webp)$/i.test(path);
}
export function isPdf(path) {
    return /\.pdf$/i.test(path);
}
