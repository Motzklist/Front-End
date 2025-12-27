'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import * as api from '@/services/api';
import { CartEntryPayload } from '@/types/cart';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: string;
    name: string;
    quantity: number;
}

export interface CartEntry {
    id: string;
    timestamp: number;
    school: {
        id: string;
        name: string;
    };
    grade: {
        id: string;
        name: string;
    };
    class: {
        id: string;
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
            setCartEntries(data);
            console.log('[CartContext] fetchCart: setCartEntries', data);
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
                        id: String(entry.school.id),
                    },
                    grade: {
                        ...entry.grade,
                        id: String(entry.grade.id),
                    },
                    class: {
                        ...entry.class,
                        id: String(entry.class.id),
                    },
                    items: entry.items.map(item => ({
                        ...item,
                        id: String(item.id),
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
                    id: String(entry.school.id),
                },
                grade: {
                    ...entry.grade,
                    id: String(entry.grade.id),
                },
                class: {
                    ...entry.class,
                    id: String(entry.class.id),
                },
                items: entry.items.map(item => ({
                    ...item,
                    id: String(item.id),
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