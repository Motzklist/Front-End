/**
 * @fileoverview Auth provider abstraction tests
 *
 * Verifies the pluggable authentication strategy: the default factory choice,
 * the backend credential provider, and the redirect (third-party / OAuth)
 * providers all conform to the AuthProvider interface and behave as expected.
 */

// Mock the API layer. `login`/`logout`/`checkAuth` are spies; `getOAuthStartUrl`
// keeps a deterministic implementation so URL construction can be asserted.
jest.mock('@/services/api', () => ({
    login: jest.fn(),
    logout: jest.fn(),
    checkAuth: jest.fn(),
    getOAuthStartUrl: (provider: string, callbackUrl: string) =>
        `http://localhost:8080/api/auth/${provider}/start?redirect_uri=${encodeURIComponent(callbackUrl)}`,
}));

import * as api from '@/services/api';
import { ApiAuthProvider } from '@/services/auth/api-provider';
import { OAuthRedirectProvider } from '@/services/auth/oauth-provider';
import { MockOAuthProvider } from '@/services/auth/mock-oauth-provider';
import { getAuthProvider } from '@/services/auth';

describe('auth provider abstraction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAuthProvider factory', () => {
        it('defaults to the backend credential provider and caches it', () => {
            const provider = getAuthProvider();
            expect(provider.name).toBe('api');
            expect(provider.method).toBe('credentials');
            // Cached: repeated calls return the same instance.
            expect(getAuthProvider()).toBe(provider);
        });
    });

    describe('ApiAuthProvider (credentials)', () => {
        const provider = new ApiAuthProvider();

        it('signs in with credentials and echoes the submitted username', async () => {
            (api.login as jest.Mock).mockResolvedValue({ userid: 'u1' });
            const user = await provider.signInWithCredentials({ username: 'alice', password: 'pw' });
            expect(api.login).toHaveBeenCalledWith({ username: 'alice', password: 'pw' });
            expect(user).toEqual({ userid: 'u1', username: 'alice' });
        });

        it('reads the current session', async () => {
            (api.checkAuth as jest.Mock).mockResolvedValue({ userid: 'u2', username: 'bob' });
            expect(await provider.getSession()).toEqual({ userid: 'u2', username: 'bob' });
        });

        it('signs out via the backend', async () => {
            (api.logout as jest.Mock).mockResolvedValue({});
            await provider.signOut();
            expect(api.logout).toHaveBeenCalled();
        });
    });

    describe('OAuthRedirectProvider (redirect)', () => {
        const provider = new OAuthRedirectProvider('google');

        it('is a redirect provider named after the identity provider', () => {
            expect(provider.name).toBe('google');
            expect(provider.method).toBe('redirect');
        });

        it('builds a backend start URL carrying the callback', async () => {
            const url = await provider.getSignInUrl({ callbackUrl: 'http://localhost:3000/auth/callback' });
            expect(url).toContain('/api/auth/google/start');
            expect(url).toContain(encodeURIComponent('http://localhost:3000/auth/callback'));
        });

        it('completes sign-in by reading the backend-established session', async () => {
            (api.checkAuth as jest.Mock).mockResolvedValue({ userid: 'g1', username: 'gina' });
            expect(await provider.completeSignIn()).toEqual({ userid: 'g1', username: 'gina' });
        });
    });

    describe('MockOAuthProvider (redirect)', () => {
        const provider = new MockOAuthProvider();

        it('redirects to the local mock consent screen', async () => {
            const url = await provider.getSignInUrl({ callbackUrl: '/auth/callback' });
            expect(url).toContain('/auth/mock-consent');
            expect(url).toContain(encodeURIComponent('/auth/callback'));
        });

        it('completes sign-in with a fixed fake user', async () => {
            const user = await provider.completeSignIn();
            expect(user.userid).toBe('mock-oauth-user');
        });

        it('has no real server session', async () => {
            await expect(provider.getSession()).rejects.toThrow();
        });
    });
});
