'use client';

/**
 * OAuth / redirect sign-in callback.
 *
 * A third-party identity provider (or our backend, after it handled the
 * provider round-trip) redirects the browser here once the user has
 * authenticated. We hand the callback query params to the active auth provider
 * via completeProviderLogin(), then route home. This route is exempt from the
 * ProtectedRoute redirect (see components/ProtectedRoute.tsx) because it runs
 * before the client-side session exists.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { completeProviderLogin } = useAuth();
    const t = useTranslations('Auth');
    const [failed, setFailed] = useState(false);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        // Some providers signal a denied/failed consent with an `error` param.
        // Defer the setState out of the effect body (mirrors PaymentSuccess) to
        // satisfy react-hooks/set-state-in-effect.
        if (searchParams.get('error')) {
            queueMicrotask(() => setFailed(true));
            return;
        }

        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        completeProviderLogin(params)
            .then(() => router.replace('/'))
            .catch(() => setFailed(true));
    }, [completeProviderLogin, router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="surface-card p-8 sm:p-10 w-full max-w-md text-center animate-rise-in">
                {failed ? (
                    <>
                        <p className="eyebrow mb-2 text-(--bad-700)">{t('failedTitle')}</p>
                        <p className="text-[0.95rem] text-ink-2 mb-6">{t('failedMessage')}</p>
                        <Link href="/login" className="btn btn-primary">
                            {t('backToLogin')}
                        </Link>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <svg className="animate-spin-slow text-(--brand-700)" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
                            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                        <p className="text-[0.95rem] text-ink-2">{t('signingIn')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <svg className="animate-spin-slow text-(--brand-700)" width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
            }
        >
            <AuthCallbackContent />
        </Suspense>
    );
}
