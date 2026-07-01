'use client';

import { useTranslations } from 'next-intl';
import Layout from '@/components/Layout';

export default function ContactPage() {
    const t = useTranslations('Contact');

    return (
        <Layout>
            <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
                {/* Hero */}
                <header className="mb-12 max-w-2xl animate-rise-in">
                    <p className="eyebrow mb-3">{t('eyebrow')}</p>
                    <h1 className="font-display text-[2.6rem] sm:text-[3rem] leading-[1.05] tracking-tight text-(--ink-1) mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-[1.05rem] leading-relaxed text-ink-2">
                        {t('subtitle')}
                    </p>
                </header>

                <div className="mb-12">
                    {/* Municipality */}
                    <section className="surface-card overflow-hidden animate-rise-in delay-1">
                        <div className="px-7 pt-6 pb-1 bg-(--surface-sunken) border-b border-(--line)">
                            <p className="eyebrow mb-1">{t('municipalityEyebrow')}</p>
                            <h2 className="font-display text-[1.7rem] tracking-tight text-(--ink-1) mb-3 leading-tight">
                                {t('municipalityHeading')}
                            </h2>
                        </div>

                        <div className="px-7 py-6 space-y-6">
                            <ContactRow label={t('address')}>
                                <a
                                    href="https://maps.app.goo.gl/jz7yv3hggruuKcjs9"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-(--ink-1) hover:text-(--brand-900) transition-colors underline decoration-(--line-strong) underline-offset-4 hover:decoration-(--brand-700)"
                                >
                                    {t('addressLine1')}<br />
                                    {t('addressLine2')}<br />
                                    {t('addressLine3')}
                                </a>
                            </ContactRow>

                            <ContactRow label={t('serviceCenter')}>
                                <ul className="space-y-1.5">
                                    <li className="flex items-center justify-between gap-4">
                                        <span className="text-ink-2 text-[13.5px]">{t('mainLine')}</span>
                                        <a href="tel:+97248780900" className="text-(--ink-1) tabular-nums hover:text-(--brand-900) transition-colors">
                                            04-878-0900
                                        </a>
                                    </li>
                                    <li className="flex items-center justify-between gap-4">
                                        <span className="text-ink-2 text-[13.5px]">{t('quickDial')}</span>
                                        <a href="tel:*5470" className="text-(--ink-1) tabular-nums hover:text-(--brand-900) transition-colors">
                                            *5470
                                        </a>
                                    </li>
                                    <li className="flex items-center justify-between gap-4">
                                        <span className="text-ink-2 text-[13.5px]">{t('whatsapp')}</span>
                                        <a
                                            href="https://wa.me/972542223352"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-(--ink-1) tabular-nums hover:text-(--brand-900) transition-colors"
                                        >
                                            +972 54-222-3352
                                        </a>
                                    </li>
                                </ul>
                            </ContactRow>

                            <ContactRow label={t('generalInquiries')}>
                                <a href="tel:+97248780222" className="text-(--ink-1) tabular-nums hover:text-(--brand-900) transition-colors">
                                    04-878-0222
                                </a>
                            </ContactRow>

                            <ContactRow label={t('website')}>
                                <a
                                    href="https://www.kiryat-motzkin.muni.il"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-(--brand-700) hover:text-(--brand-900) transition-colors"
                                >
                                    kiryat-motzkin.muni.il →
                                </a>
                            </ContactRow>
                        </div>
                    </section>
                </div>

                {/* Hours */}
                <section className="surface-card p-7 sm:p-8 animate-rise-in delay-3">
                    <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2">
                        <h2 className="font-display text-[1.4rem] tracking-tight text-(--ink-1)">
                            {t('officeHours')}
                        </h2>
                        <p className="text-[12px] text-(--ink-3)">{t('timezoneNote')}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-(--line) border border-(--line) rounded overflow-hidden">
                        <Hours title={t('weekdays')} hours={t('weekdaysHours')} />
                        <Hours title={t('wednesday')} hours={t('wednesdayHours')} />
                        <Hours title={t('weekend')} hours={t('weekendHours')} muted />
                    </div>
                </section>
            </div>
        </Layout>
    );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-[10.5px] uppercase tracking-[0.16em] text-(--ink-3) font-semibold mb-2">
                {label}
            </p>
            <div className="text-[14.5px] leading-relaxed">{children}</div>
        </div>
    );
}

function Hours({ title, hours, muted = false }: { title: string; hours: string; muted?: boolean }) {
    return (
        <div className="bg-(--surface-card) px-5 py-4">
            <p className="text-[11.5px] uppercase tracking-[0.14em] font-semibold text-(--ink-1) mb-1.5">
                {title}
            </p>
            <p className={`text-[14px] tabular-nums whitespace-pre-line ${muted ? 'text-(--ink-3)' : 'text-ink-2'}`}>
                {hours.replace(/\\n/g, '\n')}
            </p>
        </div>
    );
}
