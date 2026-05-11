/**
 * @fileoverview Centralized API Service
 *
 * This module provides all API communication functions for the Motzkin Store
 * web application. It handles authentication, cart operations, and error parsing.
 *
 * All requests include credentials for session-based authentication.
 *
 * @module services/api
 */

import { CartEntryPayload } from '@/types/cart';

/**
 * Gets the API base URL.
 * Uses a getter to avoid issues during SSR/module evaluation.
 */
function getApiBase(): string {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base && typeof window !== 'undefined') {
        console.error('[CRITICAL] NEXT_PUBLIC_API_URL is not set. All API requests will fail. Set this in your .env.local or environment variables.');
    }
    return base || '';
}

// =============================================================================
// Authentication API
// =============================================================================

/**
 * Authenticates a user with the backend.
 *
 * @param credentials - User login credentials
 * @param credentials.username - The username
 * @param credentials.password - The password
 * @returns Promise resolving to the authentication response data
 * @throws {Error} If login fails or credentials are invalid
 *
 * @example
 * ```ts
 * try {
 *   const user = await login({ username: 'admin', password: 'secret' });
 *   console.log('Logged in as:', user.username);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 * ```
 */
export async function login(credentials: { username: string; password: string }) {
    console.log('Attempting login with', credentials);
    const res = await fetch(`${getApiBase()}/api/login`, {
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

/**
 * Logs out the current user by invalidating their session.
 *
 * @returns Promise resolving to an empty object or logout confirmation
 * @throws {Error} If logout request fails
 */
export async function logout() {
    // Call backend /api/logout to clear session
    const res = await fetch(`${getApiBase()}/api/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Logout failed');
    return res.json().catch(() => ({})); // In case backend returns no body
}

/**
 * Checks if the current user session is authenticated.
 *
 * @returns Promise resolving to the current user's authentication status
 * @throws {Error} If user is not authenticated
 */
export async function checkAuth() {
    // Checks if the user is authenticated (e.g., GET /api/auth/status or /api/auth/me)
    const res = await fetch(`${getApiBase()}/api/auth/status`, {
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

// =============================================================================
// Cart API
// =============================================================================

/**
 * Retrieves the shopping cart for a specific user.
 *
 * @param userid - The unique identifier of the user
 * @returns Promise resolving to the user's cart data
 * @throws {Error} If cart fetch fails
 */
export async function getCart(userid: string) {
    const res = await fetch(`${getApiBase()}/api/cart?userid=${encodeURIComponent(userid)}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to fetch cart');
    return res.json();
}

/**
 * Updates the shopping cart for a specific user.
 *
 * @param userid - The unique identifier of the user
 * @param items - Array of cart entries to save
 * @returns Promise resolving to the updated cart data
 * @throws {Error} If cart update fails
 */
export async function updateCart(userid: string, items: CartEntryPayload[]) {
    // Ensure all item ids in items[].items are strings before sending
    const itemsWithStringIds = items.map(entry => ({
        ...entry,
        school: {
            ...entry.school,
            id: String(entry.school.id)
        },
        grade: {
            ...entry.grade,
            id: String(entry.grade.id)
        },
        items: entry.items.map(item => ({
            ...item,
            id: String(item.id)
        }))
    }));
    const res = await fetch(`${getApiBase()}/api/cart?userid=${encodeURIComponent(userid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemsWithStringIds),
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to update cart');
    return res.json();
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Parses error responses from API calls.
 * Attempts to extract error message from JSON response body.
 *
 * @param res - The fetch Response object
 * @param fallback - Fallback error message if parsing fails
 * @returns Never returns; always throws an Error
 * @throws {Error} With the parsed or fallback error message
 * @internal
 */
function parseError(res: Response, fallback: string): Promise<never> {
    return res.json().then(data => {
        throw new Error(data?.error || fallback);
    }).catch(() => {
        throw new Error(fallback);
    });
}

