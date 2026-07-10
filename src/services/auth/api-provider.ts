/**
 * @fileoverview API-Based Authentication Provider (credentials)
 *
 * The default provider. Delegates username / password authentication and
 * session management to the backend API (`/api/login`, `/api/logout`,
 * `/api/auth/status`). This is the behaviour the app shipped with, now sitting
 * behind the AuthProvider strategy interface.
 *
 * @module services/auth/api-provider
 */

import { AuthCredentials, AuthProvider, AuthUser } from '@/types/auth';
import * as api from '@/services/api';

export class ApiAuthProvider implements AuthProvider {
    readonly name = 'api';
    readonly method = 'credentials' as const;

    async signInWithCredentials(credentials: AuthCredentials): Promise<AuthUser> {
        const data = await api.login(credentials);
        // The backend does not return the username, so echo the submitted value.
        return { userid: data.userid, username: credentials.username };
    }

    async getSession(): Promise<AuthUser> {
        const data = await api.checkAuth();
        return { userid: data.userid, username: data.username ?? null };
    }

    async signOut(): Promise<void> {
        await api.logout();
    }
}
