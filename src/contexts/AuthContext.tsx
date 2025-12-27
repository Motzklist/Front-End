'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import * as api from '@/services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    userid: string | null;
    username: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userid, setUserid] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Helper: persist to localStorage
    const persistAuth = (userid: string, username: string) => {
        localStorage.setItem('userid', userid);
        localStorage.setItem('username', username);
    };
    const clearPersistedAuth = () => {
        localStorage.removeItem('userid');
        localStorage.removeItem('username');
    };

    useEffect(() => {
        // On mount, check auth status from backend or localStorage
        (async () => {
            try {
                const data = await api.checkAuth();
                setIsAuthenticated(true);
                setUserid(data.userid);
                setUsername(data.username);
                persistAuth(data.userid, data.username);
            } catch (err) {
                // Fallback: try localStorage for session continuity (if backend is stateless)
                const storedUserid = localStorage.getItem('userid');
                const storedUsername = localStorage.getItem('username');
                if (storedUserid && storedUsername) {
                    setIsAuthenticated(true);
                    setUserid(storedUserid);
                    setUsername(storedUsername);
                } else {
                    setIsAuthenticated(false);
                    setUserid(null);
                    setUsername(null);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const data = await api.login({ username, password });
            setIsAuthenticated(true);
            setUserid(data.userid);
            setUsername(username); // Backend does not return username, so use input
            persistAuth(data.userid, username);
        } catch (err) {
            setIsAuthenticated(false);
            setUserid(null);
            setUsername(null);
            clearPersistedAuth();
            throw err;
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (err) {
            // Optionally show error, but always log out locally
        }
        setIsAuthenticated(false);
        setUserid(null);
        setUsername(null);
        clearPersistedAuth();
    };

    if (isLoading) {
        return null; // Prevent flash of wrong content
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, userid, username, login, logout}}>
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