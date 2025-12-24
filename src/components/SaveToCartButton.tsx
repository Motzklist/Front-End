'use client';

import { useState, useCallback } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';
import Toast from './Toast';

interface SaveToCartButtonProps {
    school: { id: number; name: string } | null;
    grade: { id: number; name: string } | null;
    classInfo: { id: number; name: string } | null;
    selectedIds: Set<number>;
    quantities: Map<number, number>;
    items: { id: number; name: string; quantity: number }[];
    disabled?: boolean;
}

const DISABLED_DURATION = 3000; // 3 seconds

export default function SaveToCartButton({
    school,
    grade,
    classInfo,
    selectedIds,
    quantities,
    items,
    disabled = false,
}: SaveToCartButtonProps) {
    const { addToCart } = useCart();
    const [isTemporarilyDisabled, setIsTemporarilyDisabled] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const handleSaveToCart = useCallback(() => {
        if (!school || !grade || !classInfo) return;

        // Filter only selected items and map with current quantities
        const cartItems: CartItem[] = items
            .filter(item => selectedIds.has(item.id))
            .map(item => ({
                id: item.id,
                name: item.name,
                quantity: quantities.get(item.id) ?? item.quantity,
            }))
            .filter(item => item.quantity > 0);

        if (cartItems.length === 0) return;

        addToCart({
            school: { id: school.id, name: school.name },
            grade: { id: grade.id, name: grade.name },
            class: { id: classInfo.id, name: classInfo.name },
            items: cartItems,
        });

        // Show toast and disable button temporarily
        setShowToast(true);
        setIsTemporarilyDisabled(true);

        setTimeout(() => {
            setIsTemporarilyDisabled(false);
        }, DISABLED_DURATION);
    }, [school, grade, classInfo, selectedIds, quantities, items, addToCart]);

    const handleCloseToast = useCallback(() => {
        setShowToast(false);
    }, []);

    const isButtonDisabled = disabled || isTemporarilyDisabled || !school || !grade || !classInfo || selectedIds.size === 0;

    // Count selected items with quantity > 0
    const validItemCount = items
        .filter(item => selectedIds.has(item.id))
        .filter(item => (quantities.get(item.id) ?? item.quantity) > 0)
        .length;

    return (
        <>
            <div className="mt-6">
                <button
                    onClick={handleSaveToCart}
                    disabled={isButtonDisabled}
                    className={`relative w-full py-3 px-6 rounded-lg font-semibold text-white transition-all overflow-hidden ${
                        isButtonDisabled
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                    }`}
                >
                    <span className="relative z-10">
                        {isTemporarilyDisabled
                            ? 'Saved!'
                            : `Save to Cart${validItemCount > 0 ? ` (${validItemCount} items)` : ''}`
                        }
                    </span>

                    {/* Line timer on bottom edge - darker shade of blue */}
                    {isTemporarilyDisabled && (
                        <div
                            className="absolute bottom-0 left-0 h-1 bg-blue-800 animate-timer-line"
                            style={{ animationDuration: `${DISABLED_DURATION}ms` }}
                        />
                    )}
                </button>
            </div>

            <Toast
                message="List saved to cart!"
                isVisible={showToast}
                onClose={handleCloseToast}
                duration={DISABLED_DURATION}
                delay={100}
            />
        </>
    );
}

