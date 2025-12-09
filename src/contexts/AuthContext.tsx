'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Check sessionStorage on initialization (only runs once on mount)
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem('isAuthenticated') === 'true';
        }
        return false;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mark as loaded after hydration
        setIsLoading(false);
    }, []);

    const login = (username: string, password: string) => {
        // Simple validation - just check non-empty
        if (username.trim() && password.trim()) {
            sessionStorage.setItem('isAuthenticated', 'true');
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        sessionStorage.removeItem('isAuthenticated');
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return null; // Prevent flash of wrong content
    }

    return (
        <AuthContext.Provider value={{isAuthenticated, login, logout}}>
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

