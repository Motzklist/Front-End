'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';

// Human-readable labels for redirect (third-party) providers. Falls back to the
// raw provider name for anything not listed here.
const PROVIDER_LABELS: Record<string, string> = {
    google: 'Google',
    microsoft: 'Microsoft',
    'mock-oauth': 'Mock Google',
};

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const router = useRouter();
    const { login, loginWithProvider, authMethod, providerName } = useAuth();
    const t = useTranslations('Login');

    const isRedirectProvider = authMethod === 'redirect';
    const providerLabel = PROVIDER_LABELS[providerName] ?? providerName;

    const isFormValid = username.trim() !== '' && password.trim() !== '';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!isFormValid) return;

        setIsLoading(true);
        try {
            await login(username, password);
            router.push('/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            setError(message || t('failed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleProviderLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            // Navigates away to the identity provider; the /auth/callback route
            // finalises the session on return. No router.push here.
            await loginWithProvider();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            setError(message || t('failed'));
            setIsLoading(false);
        }
    };

    const errorBanner = error && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 bg-(--bad-50) border border-(--bad-500)/30 rounded text-[13px] text-(--bad-700) animate-rise-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="12" cy="16" r="0.8" fill="currentColor" />
            </svg>
            <span>{error}</span>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col items-center mb-8 animate-rise-in">
                <Link href="/" className="flex items-center gap-3 mb-2">
                    <span className="crest">M</span>
                    <span className="flex flex-col leading-none">
                        <span className="font-display text-[1.55rem] tracking-tight text-(--ink-1)">
                            {t('brand')}
                        </span>
                        <span className="text-[10.5px] uppercase tracking-[0.18em] text-(--ink-3) mt-1">
                            {t('tagline')}
                        </span>
                    </span>
                </Link>
            </div>

            <div className="surface-card p-8 sm:p-10 animate-rise-in delay-1">
                <header className="mb-7">
                    <p className="eyebrow mb-2">{t('eyebrow')}</p>
                    <h1 className="font-display text-[1.95rem] tracking-tight text-(--ink-1) leading-tight mb-2">
                        {t('title')}
                    </h1>
                    <p className="text-[0.93rem] text-ink-2">
                        {t('intro')}
                    </p>
                </header>

                {isRedirectProvider ? (
                    <div className="space-y-5">
                        {errorBanner}
                        <p className="text-[0.9rem] text-ink-2">
                            {t('redirectIntro', { provider: providerLabel })}
                        </p>
                        <button
                            type="button"
                            onClick={handleProviderLogin}
                            disabled={isLoading}
                            className="btn btn-primary w-full mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                                        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                    {t('redirecting')}
                                </>
                            ) : (
                                t('continueWith', { provider: providerLabel })
                            )}
                        </button>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {errorBanner}

                    <div>
                        <label htmlFor="username" className="field-label">{t('usernameLabel')}</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            disabled={isLoading}
                            className="field-input"
                            placeholder={t('usernamePlaceholder')}
                            autoComplete="username"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="field-label">{t('passwordLabel')}</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPwd ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                disabled={isLoading}
                                className="field-input pr-20"
                                placeholder={t('passwordPlaceholder')}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => setShowPwd(s => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-(--ink-3) hover:text-(--ink-1) rounded transition-colors"
                            >
                                {showPwd ? t('hide') : t('show')}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="btn btn-primary w-full mt-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin-slow" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5" />
                                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                                {t('submitting')}
                            </>
                        ) : (
                            t('submit')
                        )}
                    </button>
                </form>
                )}

                <div className="divider-soft mt-7 mb-5" />

                <p className="text-[12px] text-(--ink-3) text-center leading-relaxed">
                    {t.rich('trouble', {
                        phone: (chunks) => (
                            <a href="tel:+97248780900" className="text-(--brand-700) hover:underline whitespace-nowrap">
                                {chunks}
                            </a>
                        ),
                        quickDial: (chunks) => (
                            <span className="whitespace-nowrap">{chunks}</span>
                        ),
                    })}
                </p>
            </div>
        </div>
    );
}
