'use client';

/**
 * Mock third-party consent screen (development only).
 *
 * Stands in for a real identity provider's sign-in/consent page so the redirect
 * flow can be exercised end-to-end without Google or backend OAuth endpoints.
 * Only reachable when NEXT_PUBLIC_AUTH_PROVIDER=mock-oauth; mirrors the
 * /checkout/mock-payment dev page.
 */

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

function MockConsentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const callbackUrl = searchParams.get('callbackUrl');
    const t = useTranslations('Auth');

    // Production guard: this page only makes sense for the mock provider.
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_AUTH_PROVIDER !== 'mock-oauth') {
            router.replace('/login');
        }
    }, [router]);

    const handleApprove = () => {
        if (!callbackUrl) return;
        const separator = callbackUrl.includes('?') ? '&' : '?';
        window.location.href = `${callbackUrl}${separator}provider=mock-oauth`;
    };

    const handleCancel = () => {
        if (!callbackUrl) {
            router.replace('/login');
            return;
        }
        const separator = callbackUrl.includes('?') ? '&' : '?';
        window.location.href = `${callbackUrl}${separator}error=access_denied`;
    };

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md border-2 border-yellow-400 dark:border-yellow-600 rounded-lg bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border-b border-yellow-400 dark:border-yellow-600 px-6 py-3">
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium text-center">
                        {t('mockBanner')}
                    </p>
                </div>

                <div className="p-6 text-center">
                    <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                        {t('mockTitle', { provider: 'Mock Google' })}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
                        {t('mockIntro')}
                    </p>

                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={handleApprove}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            {t('mockApprove')}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="w-full py-3 px-4 border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            {t('mockCancel')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MockConsentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
            </div>
        }>
            <MockConsentContent />
        </Suspense>
    );
}
