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

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import * as api from '@/services/api';
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
    const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            const data = await api.getCart(userid);
            // Normalize all ids to number for CartEntry and CartItem
            const normalized = Array.isArray(data)
                ? data.map((entry: any) => ({
                    ...entry,
                    school: {
                        ...entry.school,
                        id: Number(entry.school.id),
                    },
                    grade: {
                        ...entry.grade,
                        id: Number(entry.grade.id),
                    },
                    items: Array.isArray(entry.items)
                        ? entry.items.map((item: any) => ({
                            ...item,
                            id: Number(item.id),
                        }))
                        : [],
                }))
                : [];
            setCartEntries(normalized);
            console.log('[CartContext] fetchCart: setCartEntries', normalized);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch cart');
            setCartEntries([]);
            console.log('[CartContext] fetchCart: setCartEntries([]) after error');
        } finally {
            setLoading(false);
        }
    }, [userid]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart, isAuthenticated]);

    const addToCart = useCallback(async (entry: CartEntryPayload) => {
        setError(null);
        if (!userid) throw new Error('Not authenticated');
        try {
            // Optimistically update local state first
            setCartEntries(prev => {
                const newEntry = {
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
                    })),
                };
                return [...prev, newEntry];
            });
            // Now update backend
            const current = await api.getCart(userid);
            const newEntry = {
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
                })),
            };
            const updated = [...current, newEntry];
            await api.updateCart(userid, updated);
            await fetchCart(); // Always refresh from backend
        } catch (err: any) {
            setError(err.message || 'Failed to add to cart');
        }
    }, [userid, fetchCart]);

    const removeFromCart = useCallback(async (id: string) => {
        setError(null);
        if (!userid) throw new Error('Not authenticated');
        try {
            // Optimistically update local state first
            setCartEntries(prev => prev.filter((entry: any) => entry.id !== id));
            const current = await api.getCart(userid);
            const updated = current.filter((entry: any) => entry.id !== id);
            await api.updateCart(userid, updated);
            // After backend update, re-fetch to ensure consistency
            await fetchCart();
        } catch (err: any) {
            setError(err.message || 'Failed to remove from cart');
        }
    }, [userid, fetchCart]);

    const clearCart = useCallback(async () => {
        setError(null);
        if (!userid) throw new Error('Not authenticated');
        try {
            // Optimistically update local state first
            setCartEntries([]);
            await api.updateCart(userid, []);
            await fetchCart(); // Always refresh from backend
        } catch (err: any) {
            setError(err.message || 'Failed to clear cart');
        }
    }, [userid, fetchCart]);

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