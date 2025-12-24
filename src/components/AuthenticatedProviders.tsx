'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

interface AuthenticatedProvidersProps {
    children: ReactNode;
}

export default function AuthenticatedProviders({ children }: AuthenticatedProvidersProps) {
    const { isAuthenticated } = useAuth();

    // Only wrap with CartProvider when authenticated
    if (isAuthenticated) {
        return <CartProvider>{children}</CartProvider>;
    }

    return <>{children}</>;
}
