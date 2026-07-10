/**
 * @fileoverview Authentication Provider Factory
 *
 * Selects the active authentication provider based on the
 * NEXT_PUBLIC_AUTH_PROVIDER environment variable. Mirrors the payment provider
 * factory in `services/payment/index.ts`.
 *
 * Usage:
 *   import { getAuthProvider } from '@/services/auth';
 *   const provider = getAuthProvider();
 *   const user = await provider.signInWithCredentials({ username, password });
 *
 * To swap providers, set NEXT_PUBLIC_AUTH_PROVIDER to one of the keys below.
 * To add a third-party identity provider (e.g. Google), either:
 *   - reuse the generic backend-proxied OAuth provider by adding a one-line
 *     registry entry (as `google` does below), and expose the matching
 *     `/api/auth/{name}/start` endpoint on the backend, or
 *   - implement the AuthProvider interface for a bespoke flow and register it.
 *
 * @module services/auth
 */

import { AuthProvider } from '@/types/auth';
import { ApiAuthProvider } from './api-provider';
import { OAuthRedirectProvider } from './oauth-provider';
import { MockOAuthProvider } from './mock-oauth-provider';

export type AuthProviderName = 'api' | 'google' | 'microsoft' | 'mock-oauth';

const providers: Record<AuthProviderName, () => AuthProvider> = {
    // Username / password against our backend — the default, current behaviour.
    api: () => new ApiAuthProvider(),
    // Third-party identity providers, proxied through the backend. Adding a new
    // one is a single line here plus a backend `/api/auth/{name}/start` route.
    google: () => new OAuthRedirectProvider('google'),
    microsoft: () => new OAuthRedirectProvider('microsoft'),
    // Local, backend-less demo of the redirect flow.
    'mock-oauth': () => new MockOAuthProvider(),
};

let cachedProvider: AuthProvider | null = null;

export function getAuthProvider(): AuthProvider {
    if (cachedProvider) return cachedProvider;

    const providerName = (process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'api') as AuthProviderName;

    const factory = providers[providerName];
    if (!factory) {
        throw new Error(
            `[Auth] Unknown provider "${providerName}". ` +
            `Valid options: ${Object.keys(providers).join(', ')}`
        );
    }
    cachedProvider = factory();

    return cachedProvider;
}
