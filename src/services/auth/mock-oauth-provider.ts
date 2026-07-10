/**
 * @fileoverview Mock OAuth Authentication Provider for Development and Testing
 *
 * Simulates a redirect-based third-party sign-in (Google, etc.) entirely on the
 * frontend, so the redirect flow can be exercised without a real identity
 * provider or backend OAuth endpoints. Mirrors `MockPaymentProvider`, which
 * bounces through a local `/checkout/mock-payment` page.
 *
 * Flow:
 *   1. getSignInUrl()  -> a local `/auth/mock-consent` page that plays the role
 *      of the provider's consent screen.
 *   2. The mock consent page redirects back to the `/auth/callback` route.
 *   3. completeSignIn() -> returns a fixed fake user. Because there is no real
 *      session cookie, persistence across reloads is handled by the
 *      localStorage cache in AuthContext (see `getSession` below).
 *
 * @module services/auth/mock-oauth-provider
 */

import { AuthProvider, AuthUser } from '@/types/auth';

const MOCK_USER: AuthUser = {
    userid: 'mock-oauth-user',
    username: 'Mock Google User',
};

export class MockOAuthProvider implements AuthProvider {
    readonly name = 'mock-oauth';
    readonly method = 'redirect' as const;

    async getSignInUrl({ callbackUrl }: { callbackUrl: string }): Promise<string> {
        // Simulate network latency to the identity provider.
        await new Promise(resolve => setTimeout(resolve, 300));
        return `/auth/mock-consent?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    }

    async completeSignIn(): Promise<AuthUser> {
        await new Promise(resolve => setTimeout(resolve, 200));
        return MOCK_USER;
    }

    async getSession(): Promise<AuthUser> {
        // No real server session exists for the mock. Reject so the AuthContext
        // falls back to its localStorage cache for cross-reload persistence,
        // exactly as it would if a real backend session check failed offline.
        throw new Error('No mock session');
    }

    async signOut(): Promise<void> {
        // Nothing to revoke server-side; AuthContext clears the local cache.
    }
}
