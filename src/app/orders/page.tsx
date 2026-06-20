'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderHistory } from '@/services/api';
import { OrderHistoryEntry } from '@/types/order';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

export default function OrderHistoryPage() {
    const { isAuthenticated, userid } = useAuth();
    const t = useTranslations('Orders');
    const tCommon = useTranslations('Common');
    const locale = useLocale();

    const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
    const [state, setState] = useState<LoadState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!isAuthenticated || !userid) return;
        let cancelled = false;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState('loading');
        setErrorMessage(null);

        getOrderHistory(locale)
            .then(data => {
                if (cancelled) return;
                setOrders(data);
                setState('ready');
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setOrders([]);
                setErrorMessage(err instanceof Error ? err.message : t('genericError'));
                setState('error');
            });

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated, userid, t, locale]);

    const dateLocale = locale === 'he' ? 'he-IL' : 'en-GB';
    const formatCurrency = (amount: number) => tCommon('currencyILS', { amount: amount.toFixed(2) });

    const parsePurchaseDate = (raw: string): Date | null => {
        if (!raw) return null;
        // Backend returns "YYYY-MM-DD HH:mm:ss". Convert to ISO so Date parses
        // it consistently across browsers (Safari rejects the space form).
        const isoish = raw.includes('T') ? raw : raw.replace(' ', 'T');
        const d = new Date(isoish);
        return Number.isNaN(d.getTime()) ? null : d;
    };

    const formatDate = (raw: string) => {
        const d = parsePurchaseDate(raw);
        if (!d) return raw;
        return d.toLocaleDateString(dateLocale, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (raw: string) => {
        const d = parsePurchaseDate(raw);
        if (!d) return '';
        return d.toLocaleTimeString(dateLocale, {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totals = useMemo(() => {
        const itemCount = orders.reduce(
            (sum, order) => sum + order.items.reduce((s, item) => s + item.quantity, 0),
            0
        );
        const lifetime = orders.reduce((sum, order) => sum + (order.total_amount ?? 0), 0);
        return { orders: orders.length, items: itemCount, lifetime };
    }, [orders]);

    const toggle = (id: string) =>
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <Layout>
            <div className="relative">
                <div className="absolute inset-x-0 top-0 h-[260px] pointer-events-none overflow-hidden">
                    <div
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[400px] rounded-[50%]"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, rgba(181, 102, 58, 0.08) 0%, transparent 70%)',
                        }}
                    />
                </div>

                <div className="relative max-w-4xl mx-auto px-5 sm:px-8 py-12">
                    <header className="mb-8 animate-rise-in">
                        <p className="eyebrow mb-2">{t('eyebrow')}</p>
                        <h1 className="font-display text-[2.4rem] sm:text-[2.8rem] tracking-tight text-(--ink-1) leading-none">
                            {t('title')}
                        </h1>
                        <p className="mt-3 text-[0.97rem] leading-relaxed text-ink-2 max-w-2xl">
                            {t('subtitle')}
                        </p>
                    </header>

                    {state === 'loading' && <LoadingState label={t('loading')} />}

                    {state === 'error' && (
                        <div className="surface-card p-6 animate-rise-in delay-1" role="alert">
                            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-(--bad-700) mb-1">
                                {t('errorEyebrow')}
                            </p>
                            <p className="text-[0.95rem] text-(--ink-1)">
                                {errorMessage ?? t('genericError')}
                            </p>
                        </div>
                    )}

                    {state === 'ready' && orders.length === 0 && (
                        <div className="surface-card py-16 px-6 text-center animate-rise-in delay-1">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-(--surface-sunken) text-(--ink-3) mb-5">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M4 6h16M6 6v13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M9 11h6M9 15h6"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <h2 className="font-display text-[1.4rem] text-(--ink-1) mb-1.5">
                                {t('emptyTitle')}
                            </h2>
                            <p className="text-[0.93rem] text-ink-2 mb-6 max-w-sm mx-auto">
                                {t('emptySubtitle')}
                            </p>
                            <Link href="/" className="btn btn-primary">
                                {t('browseEquipment')}
                            </Link>
                        </div>
                    )}

                    {state === 'ready' && orders.length > 0 && (
                        <>
                            <div className="grid grid-cols-3 gap-px bg-(--line) border border-(--line) rounded overflow-hidden mb-8 animate-rise-in delay-1">
                                <Stat label={t('statOrders')} value={totals.orders} />
                                <Stat label={t('statItems')} value={totals.items} />
                                <Stat
                                    label={t('statLifetime')}
                                    value={formatCurrency(totals.lifetime)}
                                    accent
                                />
                            </div>

                            <ul className="space-y-5">
                                {orders.map((order, idx) => {
                                    const isOpen = expanded.has(order.order_id);
                                    const itemCount = order.items.reduce(
                                        (s, item) => s + item.quantity,
                                        0
                                    );
                                    return (
                                        <li
                                            key={order.order_id}
                                            className="surface-card overflow-hidden animate-rise-in"
                                            style={{ animationDelay: `${140 + idx * 80}ms` }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggle(order.order_id)}
                                                className="w-full text-start px-5 sm:px-6 py-5 bg-(--surface-sunken) border-b border-(--line) hover:bg-(--surface-muted) transition-colors"
                                                aria-expanded={isOpen}
                                                aria-controls={`order-${order.order_id}-detail`}
                                            >
                                                <div className="flex flex-wrap items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] uppercase tracking-[0.14em] text-(--ink-3) font-semibold tabular-nums">
                                                            {t('orderLabel', { id: order.order_id })}
                                                        </p>
                                                        <h3 className="font-display text-[1.2rem] text-(--ink-1) tracking-tight leading-tight mt-1">
                                                            {t('itemSummary', {
                                                                count: itemCount,
                                                                lists: order.items.length,
                                                            })}
                                                        </h3>
                                                        <p className="text-[12px] text-(--ink-3) mt-1.5 tabular-nums">
                                                            {t('purchasedOn', {
                                                                date: formatDate(order.purchase_date),
                                                                time: formatTime(order.purchase_date),
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4 ms-auto">
                                                        <div className="text-right">
                                                            <p className="text-[10.5px] uppercase tracking-[0.14em] text-(--ink-3) font-semibold">
                                                                {t('orderTotal')}
                                                            </p>
                                                            <p className="font-display text-[1.5rem] tabular-nums text-(--clay-900) leading-none mt-1">
                                                                {formatCurrency(order.total_amount ?? 0)}
                                                            </p>
                                                        </div>
                                                        <Chevron open={isOpen} />
                                                    </div>
                                                </div>
                                            </button>

                                            {isOpen && (
                                                <div
                                                    id={`order-${order.order_id}-detail`}
                                                    className="px-5 sm:px-6 py-5 animate-rise-in"
                                                >
                                                    {order.items.length === 0 ? (
                                                        <p className="text-[13px] text-(--ink-3) italic">
                                                            {t('noItems')}
                                                        </p>
                                                    ) : (
                                                        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-5 text-[0.92rem]">
                                                            <div className="contents text-[10.5px] uppercase tracking-[0.14em] text-(--ink-3) font-semibold pb-2">
                                                                <span>{t('itemColumn')}</span>
                                                                <span className="text-right">{t('qtyColumn')}</span>
                                                                <span className="text-right">{t('unitColumn')}</span>
                                                                <span className="text-right">{t('totalColumn')}</span>
                                                            </div>
                                                            {order.items.map((item, i) => (
                                                                <div
                                                                    key={`${order.order_id}-${i}-${item.equipment_name}`}
                                                                    className="contents"
                                                                >
                                                                    <span className="py-2 text-(--ink-1) border-t border-(--line)">
                                                                        {item.equipment_name}
                                                                    </span>
                                                                    <span className="py-2 text-right tabular-nums text-(--ink-2) border-t border-(--line)">
                                                                        <bdi>×{item.quantity}</bdi>
                                                                    </span>
                                                                    <span className="py-2 text-right tabular-nums text-(--ink-2) border-t border-(--line)">
                                                                        {formatCurrency(item.price)}
                                                                    </span>
                                                                    <span className="py-2 text-right tabular-nums text-(--ink-1) font-medium border-t border-(--line)">
                                                                        {formatCurrency(item.total_price)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
}

function Stat({
    label,
    value,
    accent = false,
}: {
    label: string;
    value: string | number;
    accent?: boolean;
}) {
    return (
        <div className="bg-(--surface-card) px-5 py-4">
            <p className="text-[10.5px] uppercase tracking-[0.16em] text-(--ink-3) font-semibold mb-1.5">
                {label}
            </p>
            <p
                className={`tabular-nums font-display text-[1.5rem] leading-none tracking-tight ${
                    accent ? 'text-(--clay-900)' : 'text-(--ink-1)'
                }`}
            >
                {value}
            </p>
        </div>
    );
}

function Chevron({ open }: { open: boolean }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
            <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function LoadingState({ label }: { label: string }) {
    return (
        <div className="surface-card py-16 px-6 flex items-center justify-center gap-3 text-(--ink-3) animate-rise-in delay-1">
            <svg className="animate-spin-slow" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
            <span className="text-[13px]">{label}</span>
        </div>
    );
}
