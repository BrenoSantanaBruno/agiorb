// src/utils/auth.js
export function isAuthenticated() {
    return !!localStorage.getItem('agi_token');
}

export function getRoles() {
    try {
        return JSON.parse(localStorage.getItem('agi_roles') || '[]');
    } catch {
        return [];
    }
}

export function hasRole(role) {
    const roles = getRoles();
    return roles.includes('admin') || roles.includes(role);
}

export function hasAnyRole(list = []) {
    const roles = getRoles();
    if (roles.includes('admin')) return true;
    return list.some((r) => roles.includes(r));
}
