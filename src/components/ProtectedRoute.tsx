"use client";
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated && pathname !== '/login') {
            router.replace('/login');
        }
    }, [isAuthenticated, pathname, router]);

    // Only render children if authenticated or on login page
    if (!isAuthenticated && pathname !== '/login') {
        return null;
    }
    return <>{children}</>;
}

