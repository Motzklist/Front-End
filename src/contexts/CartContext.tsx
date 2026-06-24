/**
 * @fileoverview Shopping Cart Context Provider
 *
 * Manages shopping cart state and synchronization with the backend API.
 * Provides cart operations (add, remove, clear) with optimistic updates
 * and automatic sync with the server.
 *
 * @module contexts/CartContext
 *
 * @example
 * ```tsx
 * // In a component
 * const { cartEntries, addToCart, removeFromCart, loading } = useCart();
 *
 * await addToCart({
 *   school: { id: 1, name: 'School A' },
 *   grade: { id: 1, name: 'Grade 1' },
 *   items: [{ id: 1, name: 'Notebook', quantity: 2 }]
 * });
 * ```
 */
'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import * as api from '@/services/api';
import type { CartApiEntry, CartApiItem } from '@/services/api';
import { CartEntryPayload, CartItem } from '@/types/cart';
import { useAuth } from './AuthContext';

/**
 * Represents a cart entry stored in the application.
 * Extended from CartEntryPayload with unique ID and timestamp.
 */
export interface CartEntry {
    id: string;
    timestamp: number;
    school: {
        id: number;
        name: string;
    };
    grade: {
        id: number;
        name: string;
    };
    items: CartItem[];
}

interface CartContextType {
    cartEntries: CartEntry[];
    addToCart: (entry: CartEntryPayload) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    clearCart: () => void;
    loading: boolean;
    error: string | null;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { userid, isAuthenticated } = useAuth();
    const locale = useLocale();
    const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const normalizeEntry = (entry: CartApiEntry, index: number): CartEntry => {
        const school = entry.school ?? { id: 0, name: 'Unknown school' };
        const grade = entry.grade ?? { id: 0, name: 'Unknown grade' };
        const items = Array.isArray(entry.items) ? entry.items : [];

        return {
            id: typeof entry.id === 'string' && entry.id.trim() !== '' ? entry.id : `${Date.now()}-${index}`,
            timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
            school: {
                id: Number(school.id),
                name: school.name ?? 'Unknown school',
            },
            grade: {
                id: Number(grade.id),
                name: grade.name ?? 'Unknown grade',
            },
            items: items.map((item: CartApiItem) => ({
                id: Number(item.id),
                name: item.name ?? 'Unknown item',
                quantity: typeof item.quantity === 'number' ? item.quantity : 0,
                unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : undefined,
            })),
        };
    };

    // Serialize all cart mutations so concurrent add/remove/clear calls never
    // overlap and overwrite each other (e.g. two rapid "Save to Cart" clicks
    // both reading the same server snapshot and racing on the write).
    const mutationQueueRef = useRef<Promise<void>>(Promise.resolve());

    const enqueueMutation = useCallback((task: () => Promise<void>) => {
        const next = mutationQueueRef.current.then(task, task);
        mutationQueueRef.current = next.catch(() => {});
        return next;
    }, []);

    const fetchCart = useCallback(async () => {
        if (!userid) {
            setCartEntries([]);
            setLoading(false);
            console.log('[CartContext] fetchCart: No userid, setCartEntries([])');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await api.getCart(userid, locale);
            const normalized: CartEntry[] = Array.isArray(data)
                ? data.map((entry: CartApiEntry, index: number) => normalizeEntry(entry, index))
                : [];
            setCartEntries(normalized);
            console.log('[CartContext] fetchCart: setCartEntries', normalized);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            setError(message || 'Failed to fetch cart');
            setCartEntries([]);
            console.log('[CartContext] fetchCart: setCartEntries([]) after error');
        } finally {
            setLoading(false);
        }
    }, [userid, locale]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchCart();
        }, 0);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [fetchCart, isAuthenticated]);

    const addToCart = useCallback(async (entry: CartEntryPayload) => {
        if (!userid) return;
        return enqueueMutation(async () => {
            setError(null);
            const newEntry: CartEntry = {
                ...entry,
                id: Date.now().toString(),
                timestamp: Date.now(),
                school: {
                    ...entry.school,
                    id: Number(entry.school.id),
                },
                grade: {
                    ...entry.grade,
                    id: Number(entry.grade.id),
                },
                items: entry.items.map(item => ({
                    ...item,
                    id: Number(item.id),
                    unitPrice: item.unitPrice ?? 1, // TODO: Replace with backend-provided per-item prices.
                })),
            };
            try {
                const current = (await api.getCart(userid, locale)) as CartEntry[];
                const next = [...current, newEntry];
                setCartEntries(next); // Optimistic update.
                await api.updateCart(userid, next);
                await fetchCart(); // Reconcile with backend (gets real ids/prices).
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : '';
                setError(message || 'Failed to add to cart');
                await fetchCart(); // Roll back to authoritative server state.
            }
        });
    }, [userid, locale, fetchCart, enqueueMutation]);

    const removeFromCart = useCallback(async (id: string) => {
        if (!userid) return;
        return enqueueMutation(async () => {
            setError(null);
            try {
                const current = (await api.getCart(userid, locale)) as CartEntry[];
                const next = current.filter(entry => entry.id !== id);
                setCartEntries(next);
                await api.updateCart(userid, next);
                await fetchCart();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : '';
                setError(message || 'Failed to remove from cart');
                await fetchCart();
            }
        });
    }, [userid, locale, fetchCart, enqueueMutation]);

    const clearCart = useCallback(async () => {
        if (!userid) return;
        return enqueueMutation(async () => {
            setError(null);
            setCartEntries([]);
            try {
                await api.updateCart(userid, []);
                await fetchCart();
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : '';
                setError(message || 'Failed to clear cart');
                await fetchCart();
            }
        });
    }, [userid, fetchCart, enqueueMutation]);

    const refreshCart = fetchCart;

    return (
        <CartContext.Provider value={{ cartEntries, addToCart, removeFromCart, clearCart, loading, error, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}