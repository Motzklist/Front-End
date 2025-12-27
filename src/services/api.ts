// src/services/api.ts
// Centralized API service for authentication and cart operations.
// All functions use fetch and the API base URL from environment variables.
// Update endpoint paths and request/response formats as needed when backend is ready.

import { CartEntryPayload } from '@/types/cart';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) {
    console.error('[CRITICAL] NEXT_PUBLIC_API_URL is not set. All API requests will fail. Set this in your .env.local or environment variables.');
}

// --- Auth ---
export async function login(credentials: { username: string; password: string }) {
    console.log('Attempting login with', credentials);
    const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
    });
    console.log('Login response status:', res.status);
    if (!res.ok) {
        let errorMsg = 'Login failed';
        try {
            const data = await res.json();
            errorMsg = data?.error || errorMsg;
            console.error('Login error from backend:', errorMsg);
        } catch (e) {
            console.error('Login error, could not parse backend error:', e);
        }
        throw new Error(errorMsg);
    }
    const data = await res.json();
    console.log('Login successful, response data:', data);
    return data;
}

export async function logout() {
    // Call backend /api/logout to clear session
    const res = await fetch(`${API_BASE}/api/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Logout failed');
    return res.json().catch(() => ({})); // In case backend returns no body
}

export async function checkAuth() {
    // Checks if the user is authenticated (e.g., GET /api/auth/status or /api/auth/me)
    const res = await fetch(`${API_BASE}/api/auth/status`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) {
        let message = 'Not authenticated';
        try {
            const data = await res.json();
            message = data?.error || message;
        } catch {}
        throw new Error(message);
    }
    return res.json();
}

// --- Cart ---
export async function getCart(userid: string) {
    const res = await fetch(`${API_BASE}/api/cart?userid=${encodeURIComponent(userid)}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to fetch cart');
    return res.json();
}

export async function updateCart(userid: string, items: CartEntryPayload[]) {
    const res = await fetch(`${API_BASE}/api/cart?userid=${encodeURIComponent(userid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to update cart');
    return res.json();
}

// --- Improved error handling for all API calls ---
function parseError(res: Response, fallback: string) {
    return res.json().then(data => {
        throw new Error(data?.error || fallback);
    }).catch(() => {
        throw new Error(fallback);
    });
}

// Add more functions as needed for future backend endpoints.
