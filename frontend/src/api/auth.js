import api from "./axios";

export const signup = (data) =>
    api.post("/auth/signup", data);

export const login = (data) =>
    api.post("/auth/login", data);

export const getCurrentUser = (token) =>
    api.get("/auth/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

/**
 * Check if a username is available via GET /auth/check-username/{username}
 * Returns 'available' | 'taken' | 'too_short' | 'error'
 */
export async function checkUsername(username) {
    if (!username || username.length < 3) return 'too_short';

    try {
        const res = await api.get(`/auth/check-username/${encodeURIComponent(username)}`);
        return res.data.available ? 'available' : 'taken';
    } catch {
        return 'error';
    }
}

/**
 * Check if an email is available via GET /auth/check-email/{email}
 * Returns 'available' | 'taken' | 'invalid' | 'error'
 */
export async function checkEmail(email) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)) return 'invalid';

    try {
        const res = await api.get(`/auth/check-email/${encodeURIComponent(email)}`);
        return res.data.available ? 'available' : 'taken';
    } catch {
        return 'error';
    }
}
