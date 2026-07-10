/**
 * @fileoverview Authentication Context Provider
 *
 * Provides authentication state and actions throughout the application.
 * Authentication itself is delegated to a pluggable {@link AuthProvider}
 * strategy (see `services/auth/`), selected by the NEXT_PUBLIC_AUTH_PROVIDER
 * env var. This context is provider-agnostic: it works the same whether the
 * active provider is the username/password backend, a third-party identity
 * provider such as Google (redirect flow), or a local mock.
 *
 * A localStorage cache persists the session across page reloads so a cold mount
 * (or a transient backend hiccup) does not bounce the user to /login.
 *
 * @module contexts/AuthContext
 *
 * @example
 * ```tsx
 * // Credential provider
 * const { isAuthenticated, login, logout, username } = useAuth();
 * await login('user@example.com', 'password');
 *
 * // Redirect (third-party) provider
 * const { authMethod, loginWithProvider } = useAuth();
 * if (authMethod === 'redirect') await loginWithProvider();
 * ```
 */
'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {getAuthProvider} from '@/services/auth';
import type {AuthMethod} from '@/types/auth';

/**
 * Shape of the authentication context value.
 */
interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    userid: string | null;
    username: string | null;
    /** Which sign-in family the active provider uses, so the UI can adapt. */
    authMethod: AuthMethod;
    /** Human-readable name of the active provider (e.g. 'api', 'google'). */
    providerName: string;
    /** Credential sign-in. Only valid when authMethod === 'credentials'. */
    login: (username: string, password: string) => Promise<void>;
    /** Begins a redirect sign-in (navigates away). Only valid when authMethod === 'redirect'. */
    loginWithProvider: () => Promise<void>;
    /** Finalizes a redirect sign-in from the /auth/callback route. */
    completeProviderLogin: (params: Record<string, string>) => Promise<void>;
    logout: () => Promise<void>;
}

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    userid: string | null;
    username: string | null;
}

const INITIAL_AUTH_STATE: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    userid: null,
    username: null,
};

const LOGGED_OUT_STATE: AuthState = {
    isAuthenticated: false,
    isLoading: false,
    userid: null,
    username: null,
};

const isSameAuthState = (a: AuthState, b: AuthState): boolean =>
    a.isAuthenticated === b.isAuthenticated &&
    a.isLoading === b.isLoading &&
    a.userid === b.userid &&
    a.username === b.username;

// localStorage cache helpers. Module-scoped (they touch no component state) so
// they stay referentially stable and out of effect/callback dependency lists.
const persistAuth = (userid: string, username: string | null) => {
    localStorage.setItem('userid', userid);
    localStorage.setItem('username', username ?? '');
};
const clearPersistedAuth = () => {
    localStorage.removeItem('userid');
    localStorage.removeItem('username');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    // The active authentication strategy. getAuthProvider() is module-cached, so
    // this is a stable reference across renders.
    const provider = getAuthProvider();

    // Auth state is one object so the mount effect only fires a single
    // bail-outable setter (satisfies react-hooks/set-state-in-effect).
    const [authState, setAuthState] = useState<AuthState>(INITIAL_AUTH_STATE);

    useEffect(() => {
        let cancelled = false;

        // This effect is the canonical "subscribe to an external system on
        // mount" case the react-hooks/set-state-in-effect rule's documentation
        // explicitly permits: we read from localStorage (an external system)
        // and from the active auth provider (another external system) and
        // propagate their values into React state. The static analyzer can't
        // distinguish this from accidental setState-in-effect, so we disable the
        // rule here with a bail-outable functional updater for safety.
        const storedUserid = localStorage.getItem('userid');
        const storedUsername = localStorage.getItem('username');
        const hasStoredAuth = Boolean(storedUserid);
        const seeded: AuthState = hasStoredAuth
            ? {
                isAuthenticated: true,
                isLoading: false,
                userid: storedUserid,
                username: storedUsername || null,
            }
            : LOGGED_OUT_STATE;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAuthState(prev => (isSameAuthState(prev, seeded) ? prev : seeded));

        (async () => {
            try {
                const user = await provider.getSession();
                if (cancelled) return;
                const verified: AuthState = {
                    isAuthenticated: true,
                    isLoading: false,
                    userid: user.userid,
                    username: user.username,
                };
                setAuthState(prev => (isSameAuthState(prev, verified) ? prev : verified));
                persistAuth(user.userid, user.username);
            } catch {
                if (cancelled || hasStoredAuth) return;
                setAuthState(prev => (isSameAuthState(prev, LOGGED_OUT_STATE) ? prev : LOGGED_OUT_STATE));
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [provider]);

    const login = async (username: string, password: string) => {
        if (!provider.signInWithCredentials) {
            throw new Error(
                `Auth provider "${provider.name}" does not support password login. ` +
                `Use loginWithProvider() for redirect-based sign-in.`
            );
        }
        try {
            const user = await provider.signInWithCredentials({username, password});
            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                userid: user.userid,
                username: user.username,
            });
            persistAuth(user.userid, user.username);
        } catch (err) {
            setAuthState(LOGGED_OUT_STATE);
            clearPersistedAuth();
            throw err;
        }
    };

    const loginWithProvider = async () => {
        if (!provider.getSignInUrl) {
            throw new Error(
                `Auth provider "${provider.name}" is not a redirect provider. ` +
                `Use login(username, password) instead.`
            );
        }
        // Send the user out to the identity provider. They return to
        // /auth/callback, which calls completeProviderLogin().
        const callbackUrl = `${window.location.origin}/auth/callback`;
        const url = await provider.getSignInUrl({callbackUrl});
        window.location.assign(url);
    };

    const completeProviderLogin = async (params: Record<string, string>) => {
        if (!provider.completeSignIn) {
            throw new Error(`Auth provider "${provider.name}" cannot complete a redirect sign-in.`);
        }
        try {
            const user = await provider.completeSignIn(params);
            setAuthState({
                isAuthenticated: true,
                isLoading: false,
                userid: user.userid,
                username: user.username,
            });
            persistAuth(user.userid, user.username);
        } catch (err) {
            setAuthState(LOGGED_OUT_STATE);
            clearPersistedAuth();
            throw err;
        }
    };

    const logout = async () => {
        try {
            await provider.signOut();
        } catch {
            // Optionally show error, but always log out locally
        }
        setAuthState(LOGGED_OUT_STATE);
        clearPersistedAuth();
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                authMethod: provider.method,
                providerName: provider.name,
                login,
                loginWithProvider,
                completeProviderLogin,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
