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
import { CreateOrderPayload, Order, OrderHistoryEntry, PaymentSession, PaymentResult } from '@/types/order';

export type CartApiItem = {
    id: number | string;
    name?: string;
    quantity?: number;
    unitPrice?: number;
    price?: number;
    [key: string]: unknown;
};

export type CartApiEntry = {
    id?: string;
    timestamp?: number;
    school?: { id: number | string; name: string };
    grade?: { id: number | string; name: string };
    items?: CartApiItem[];
    [key: string]: unknown;
};

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

/**
 * Builds the backend URL that starts a third-party (OAuth) sign-in.
 *
 * The frontend never handles OAuth client secrets or token exchange. It simply
 * navigates the browser to this backend endpoint; the backend redirects on to
 * the identity provider (Google, etc.), handles the callback, establishes the
 * session cookie, and redirects the browser back to `callbackUrl`. This mirrors
 * how the payment provider delegates the sensitive work to the backend.
 *
 * Expected backend contract:
 *   GET /api/auth/{provider}/start?redirect_uri={callbackUrl}
 *
 * @param provider - The identity provider id (e.g. 'google')
 * @param callbackUrl - Absolute URL the backend should return the user to
 * @returns The absolute backend start URL to navigate to
 */
export function getOAuthStartUrl(provider: string, callbackUrl: string): string {
    const redirect = encodeURIComponent(callbackUrl);
    return `${getApiBase()}/api/auth/${encodeURIComponent(provider)}/start?redirect_uri=${redirect}`;
}

// =============================================================================
// Cart API
// =============================================================================

/**
 * Retrieves the shopping cart for a specific user.
 *
 * @param userid - The unique identifier of the user
 * @param lang - Active UI locale; the backend localizes school/grade/item names
 * @returns Promise resolving to the user's cart data
 * @throws {Error} If cart fetch fails
 */
export async function getCart(userid: string, lang?: string): Promise<CartApiEntry[]> {
    const langParam = lang ? `&lang=${encodeURIComponent(lang)}` : '';
    const res = await fetch(`${getApiBase()}/api/cart?userid=${encodeURIComponent(userid)}${langParam}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to fetch cart');
    const data = await res.json();
    return applyCartPricing(data);
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
        items: entry.items.map(item => {
            const { unitPrice, ...rest } = item;
            return {
                ...rest,
                id: String(item.id)
            };
        })
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

function applyCartPricing(data: unknown): CartApiEntry[] {
    const placeholderUnitPrice = 1; // TODO: Replace with backend-provided per-item prices.

    if (!Array.isArray(data)) return [];

    return data.map(entry => {
        const safeEntry = entry as CartApiEntry;
        const items = Array.isArray(safeEntry.items) ? safeEntry.items : [];
        return {
            ...safeEntry,
            items: items.map(item => ({
                ...item,
                unitPrice:
                    typeof item.unitPrice === 'number'
                        ? item.unitPrice
                        : (typeof item.price === 'number' ? item.price : placeholderUnitPrice),
            })),
        };
    });
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

// =============================================================================
// Order API
// =============================================================================

/**
 * Creates a new order from the user's cart.
 *
 * @param payload - The order creation payload with userId and item groups
 * @returns Promise resolving to the created Order
 * @throws {Error} If order creation fails
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await fetch(`${getApiBase()}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to create order');
    return res.json();
}

/**
 * Fetches an order by its ID.
 *
 * @param orderId - The unique order identifier
 * @returns Promise resolving to the Order
 * @throws {Error} If order fetch fails
 */
export async function getOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${getApiBase()}/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to fetch order');
    return res.json();
}

/**
 * Fetches the authenticated user's full order history.
 * The backend reads the user from the session cookie.
 *
 * @param lang - Active UI locale; the backend localizes equipment names
 * @returns Promise resolving to the user's past orders, most recent first
 * @throws {Error} If the history fetch fails or the user is unauthenticated
 */
export async function getOrderHistory(lang?: string): Promise<OrderHistoryEntry[]> {
    const langParam = lang ? `?lang=${encodeURIComponent(lang)}` : '';
    const res = await fetch(`${getApiBase()}/api/history${langParam}`, {
        method: 'GET',
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to fetch order history');
    const data = await res.json();
    return Array.isArray(data) ? (data as OrderHistoryEntry[]) : [];
}

// =============================================================================
// Payment API
// =============================================================================

/**
 * Creates a payment session with the backend.
 * The backend communicates with the configured payment provider
 * and returns a redirect URL.
 *
 * @param orderId - The order to pay for
 * @param callbackUrls - Success and failure redirect URLs
 * @returns Promise resolving to a PaymentSession with redirect URL
 * @throws {Error} If session creation fails
 */
export async function createPaymentSession(
    orderId: string,
    callbackUrls: { successUrl: string; failureUrl: string }
): Promise<PaymentSession> {
    const res = await fetch(`${getApiBase()}/api/payments/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...callbackUrls }),
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to create payment session');
    return res.json();
}

/**
 * Verifies a payment result with the backend after provider redirect.
 *
 * @param orderId - The order ID
 * @param transactionId - The provider's transaction ID from the callback URL
 * @returns Promise resolving to the verified PaymentResult
 * @throws {Error} If verification fails
 */
export async function verifyPaymentResult(
    orderId: string,
    transactionId: string
): Promise<PaymentResult> {
    const res = await fetch(`${getApiBase()}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, transactionId }),
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to verify payment');
    return res.json();
}

// =============================================================================
// Checkout API (Stripe session)
// =============================================================================

type CheckoutSessionRequest = {
    productName: string;
    quantity: number;
    amount: number;
};

type CheckoutSessionResponse = {
    url: string;
};

/**
 * Creates a Stripe checkout session via the backend.
 *
 * @param payload - The checkout session payload (single line item)
 * @returns Promise resolving to the checkout session URL
 * @throws {Error} If session creation fails
 */
export async function createCheckoutSession(payload: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const res = await fetch(`${getApiBase()}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
    });
    if (!res.ok) return parseError(res, 'Failed to create checkout session');
    return res.json();
}
