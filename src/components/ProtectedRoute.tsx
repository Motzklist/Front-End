"use client";
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function AuthSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-(--surface-page)">
            <svg
                className="animate-spin h-8 w-8 text-(--brand-700)"
                viewBox="0 0 24 24"
                fill="none"
                role="status"
                aria-label="Loading"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        </div>
    );
}

// Paths reachable while unauthenticated. `/login` is the sign-in screen; the
// `/auth/*` routes handle the round-trip to a third-party identity provider
// (the OAuth callback and the local mock consent screen), which by definition
// runs before a session exists.
const PUBLIC_PATHS = ['/login', '/auth/callback', '/auth/mock-consent'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const isPublicPath = PUBLIC_PATHS.includes(pathname);
    const needsRedirect = !isLoading && !isAuthenticated && !isPublicPath;

    useEffect(() => {
        // Wait for the initial auth check to settle before redirecting.
        // Otherwise a cold mount (e.g. browser back from Stripe) would bounce
        // through /login for a moment.
        if (needsRedirect) {
            router.replace('/login');
        }
    }, [needsRedirect, router]);

    // Cover three blank-screen windows with a single spinner:
    //   1. Initial auth check still in flight (cold mount).
    //   2. Auth resolved as unauthenticated -> redirect to /login pending.
    //   3. Anything else where we'd otherwise paint nothing.
    // Crucially, this avoids the historical `return null` flash that showed a
    // white page on browser-back from Stripe when the session cookie was lost
    // and the redirect to /login hadn't committed yet.
    if (isLoading || needsRedirect) {
        return <AuthSpinner />;
    }

    return <>{children}</>;
}

