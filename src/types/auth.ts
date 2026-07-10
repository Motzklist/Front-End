/**
 * @fileoverview Authentication Provider Interface (Strategy Pattern)
 *
 * Any authentication backend or identity provider — the existing username /
 * password backend, Google, Microsoft, a mock for local development, etc. —
 * implements this interface. Swapping providers means implementing the
 * interface and setting the NEXT_PUBLIC_AUTH_PROVIDER env var. This mirrors the
 * PaymentProvider strategy in `types/payment.ts`.
 *
 * NOTE: This `AuthProvider` interface (an authentication *strategy*) is a
 * different thing from the React `<AuthProvider>` context component in
 * `contexts/AuthContext.tsx`, which distributes auth *state* to the tree. They
 * intentionally share a name to match the payment-module vocabulary, but they
 * live in different modules and are never imported together.
 *
 * @module types/auth
 */

/**
 * The two families of sign-in a provider can offer.
 *
 * - `credentials`: the user submits a username/password through our own
 *   LoginForm (the existing backend session login).
 * - `redirect`: the user is sent out to an external identity provider
 *   (Google, Microsoft, ...) and returns to a callback route once they have
 *   authenticated. The client secret / token exchange stays on the backend.
 */
export type AuthMethod = 'credentials' | 'redirect';

/** The minimal identity we track for an authenticated user. */
export interface AuthUser {
    userid: string;
    /** Display name. May be null when the backend does not return one. */
    username: string | null;
}

/** Username / password pair for `credentials` providers. */
export interface AuthCredentials {
    username: string;
    password: string;
}

export interface AuthProvider {
    /** Human-readable provider name for logging/debugging (e.g. 'api', 'google'). */
    readonly name: string;

    /** Which sign-in family this provider offers. Drives the login UI. */
    readonly method: AuthMethod;

    /**
     * Restores / verifies the active session, e.g. from a session cookie the
     * backend set. Resolves with the current user or rejects if there is no
     * authenticated session.
     */
    getSession(): Promise<AuthUser>;

    /** Ends the active session. */
    signOut(): Promise<void>;

    // --- Capability methods -------------------------------------------------
    // A provider implements exactly one of the two sign-in families below,
    // matching its `method`. The AuthContext guards on `method` before calling,
    // so the unused one is left undefined.

    /**
     * Credential sign-in. Present on `credentials` providers.
     *
     * @param credentials - The submitted username and password
     * @returns The authenticated user
     * @throws If the credentials are rejected
     */
    signInWithCredentials?(credentials: AuthCredentials): Promise<AuthUser>;

    /**
     * Begins a redirect sign-in. Present on `redirect` providers.
     *
     * @param options.callbackUrl - Absolute URL the provider should return the
     *   user to once they have authenticated (our `/auth/callback` route)
     * @returns The absolute URL to navigate the browser to
     */
    getSignInUrl?(options: { callbackUrl: string }): Promise<string>;

    /**
     * Completes a redirect sign-in from the callback route, using the query
     * params the identity provider (or our backend) returned. Present on
     * `redirect` providers.
     *
     * @param params - The callback URL's query parameters
     * @returns The authenticated user
     * @throws If the sign-in could not be completed
     */
    completeSignIn?(params: Record<string, string>): Promise<AuthUser>;
}
