'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    login: (username: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    // Always start with false to match SSR, then update after hydration
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check sessionStorage only after hydration to avoid SSR mismatch
        const storedAuth = sessionStorage.getItem('isAuthenticated') === 'true';
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAuthenticated(storedAuth);
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
        // Also clear cart data on logout
        sessionStorage.removeItem('motzkin_cart');
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

