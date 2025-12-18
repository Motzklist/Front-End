'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CartItem {
    id: number;
    name: string;
    quantity: number;
}

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
    class: {
        id: number;
        name: string;
    };
    items: CartItem[];
}

interface CartContextType {
    cartEntries: CartEntry[];
    addToCart: (entry: Omit<CartEntry, 'id' | 'timestamp'>) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'motzkin_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartEntries, setCartEntries] = useState<CartEntry[]>(() => {
        // Initialize from sessionStorage (client-side only)
        if (typeof window !== 'undefined') {
            try {
                const stored = sessionStorage.getItem(CART_STORAGE_KEY);
                return stored ? JSON.parse(stored) : [];
            } catch {
                return [];
            }
        }
        return [];
    });

    const saveToStorage = useCallback((entries: CartEntry[]) => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries));
            } catch (error) {
                console.error('Failed to save cart to sessionStorage:', error);
            }
        }
    }, []);

    const addToCart = useCallback((entry: Omit<CartEntry, 'id' | 'timestamp'>) => {
        const newEntry: CartEntry = {
            ...entry,
            // Generate unique ID: timestamp + random alphanumeric string (base-36 skips "0." prefix, takes 9 chars)
            id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            timestamp: Date.now(),
        };

        setCartEntries(prev => {
            const updated = [...prev, newEntry];
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    const removeFromCart = useCallback((id: string) => {
        setCartEntries(prev => {
            const updated = prev.filter(entry => entry.id !== id);
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    const clearCart = useCallback(() => {
        setCartEntries([]);
        saveToStorage([]);
    }, [saveToStorage]);

    return (
        <CartContext.Provider value={{ cartEntries, addToCart, removeFromCart, clearCart }}>
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

