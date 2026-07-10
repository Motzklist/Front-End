/**
 * @fileoverview Backend-Proxied OAuth Authentication Provider (redirect)
 *
 * A generic redirect provider for third-party identity providers such as
 * Google, Microsoft, GitHub, etc. It is deliberately provider-agnostic: all the
 * sensitive work (client secret, authorization-code exchange) happens on the
 * backend, exactly like `ApiPaymentProvider` delegates to the backend.
 *
 * Flow:
 *   1. getSignInUrl()  -> browser navigates to the backend start endpoint
 *      (GET /api/auth/{name}/start?redirect_uri=/auth/callback).
 *   2. The backend redirects to the identity provider, handles the provider
 *      callback, exchanges the code, sets the session cookie, and finally
 *      redirects the browser back to our `/auth/callback` route.
 *   3. completeSignIn() -> our callback route just reads the freshly-established
 *      session (GET /api/auth/status). No secrets ever touch the frontend.
 *
 * To add Google specifically, the backend only needs to expose
 * `/api/auth/google/start`; no frontend change beyond selecting this provider
 * (NEXT_PUBLIC_AUTH_PROVIDER=google) is required.
 *
 * @module services/auth/oauth-provider
 */

import { AuthProvider, AuthUser } from '@/types/auth';
import { checkAuth, getOAuthStartUrl, logout } from '@/services/api';

export class OAuthRedirectProvider implements AuthProvider {
    readonly method = 'redirect' as const;

    /**
     * @param name - The identity provider id used in the backend route
     *   (`/api/auth/{name}/start`), e.g. 'google' or 'microsoft'.
     */
    constructor(readonly name: string) {}

    async getSignInUrl({ callbackUrl }: { callbackUrl: string }): Promise<string> {
        return getOAuthStartUrl(this.name, callbackUrl);
    }

    async completeSignIn(): Promise<AuthUser> {
        // By the time the browser is back on /auth/callback, the backend has
        // already set the session cookie. Read it to hydrate our auth state.
        const data = await checkAuth();
        return { userid: data.userid, username: data.username ?? null };
    }

    async getSession(): Promise<AuthUser> {
        const data = await checkAuth();
        return { userid: data.userid, username: data.username ?? null };
    }

    async signOut(): Promise<void> {
        await logout();
    }
}
