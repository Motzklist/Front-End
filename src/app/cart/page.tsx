'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/Layout';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useCart, CartEntry } from '@/contexts/CartContext';

export default function CartPage() {
    const { cartEntries, removeFromCart, clearCart } = useCart();

    // Dialog state
    const [dialogState, setDialogState] = useState<{
        isOpen: boolean;
        type: 'remove' | 'clear';
        entryId?: string;
        entryName?: string;
    }>({
        isOpen: false,
        type: 'remove',
    });

    const handleRemoveClick = (entry: CartEntry) => {
        setDialogState({
            isOpen: true,
            type: 'remove',
            entryId: entry.id,
            entryName: `${entry.school.name} - ${entry.grade.name} - ${entry.class.name}`,
        });
    };

    const handleClearClick = () => {
        setDialogState({
            isOpen: true,
            type: 'clear',
        });
    };

    const handleConfirm = () => {
        if (dialogState.type === 'remove' && dialogState.entryId) {
            removeFromCart(dialogState.entryId);
        } else if (dialogState.type === 'clear') {
            clearCart();
        }
        setDialogState({ isOpen: false, type: 'remove' });
    };

    const handleCancel = () => {
        setDialogState({ isOpen: false, type: 'remove' });
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Calculate total items across all entries
    const totalItems = cartEntries.reduce(
        (sum, entry) => sum + (Array.isArray(entry.items) ? entry.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0),
        0
    );

    // Debug: log cartEntries on every render
    console.log('[CartPage] render, cartEntries:', cartEntries);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                        Your Cart
                    </h1>
                    {cartEntries.length > 0 && (
                        <button
                            onClick={handleClearClick}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                        >
                            Clear All
                        </button>
                    )}
                </div>

                {cartEntries.length === 0 ? (
                    // Empty cart state
                    <div className="text-center py-16">
                        <Image
                            src="/cart-empty.svg"
                            alt="Empty cart"
                            width={80}
                            height={80}
                            className="mx-auto mb-6 opacity-50 dark:invert"
                        />
                        <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                            Your cart is empty
                        </h2>
                        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                            Add equipment lists to your cart to get started.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Browse Equipment
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Cart summary */}
                        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                            <p className="text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold text-zinc-900 dark:text-white">{cartEntries.length}</span>
                                {cartEntries.length === 1 ? ' equipment list' : ' equipment lists'} •{' '}
                                <span className="font-semibold text-zinc-900 dark:text-white">{totalItems}</span>
                                {totalItems === 1 ? ' item' : ' items'} total
                            </p>
                        </div>

                        {/* Cart entries */}
                        <div className="space-y-4">
                            {cartEntries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900"
                                >
                                    {/* Entry header */}
                                    <div className="flex justify-between items-start p-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                                        <div>
                                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                                                {entry.school.name}
                                            </h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                {entry.grade.name} • {entry.class.name}
                                            </p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                                                Added {formatDate(entry.timestamp)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveClick(entry)}
                                            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                                            title="Remove from cart"
                                        >
                                            <Image
                                                src="/x-remove.svg"
                                                alt="Remove"
                                                width={20}
                                                height={20}
                                                className="text-red-500"
                                                style={{ filter: 'invert(31%) sepia(98%) saturate(1747%) hue-rotate(337deg) brightness(87%) contrast(97%)' }}
                                            />
                                        </button>
                                    </div>

                                    {/* Items list */}
                                    <div className="p-4">
                                        <div className="grid grid-cols-[1fr_auto] gap-2 text-sm">
                                            {entry.items.map((item) => (
                                                <div key={item.id} className="contents">
                                                    <span className="text-zinc-700 dark:text-zinc-300">
                                                        {item.name}
                                                    </span>
                                                    <span className="text-zinc-500 dark:text-zinc-400 text-right">
                                                        ×{item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkout placeholder */}
                        <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                            <button
                                disabled
                                className="w-full py-4 px-6 bg-emerald-600 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
                                title="Checkout coming soon"
                            >
                                Proceed to Checkout (Coming Soon)
                            </button>
                            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                Checkout functionality will be available soon.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Confirmation dialog */}
            <ConfirmDialog
                isOpen={dialogState.isOpen}
                title={dialogState.type === 'clear' ? 'Clear Cart' : 'Remove Item'}
                message={
                    dialogState.type === 'clear'
                        ? 'Are you sure you want to remove all items from your cart? This action cannot be undone.'
                        : `Are you sure you want to remove "${dialogState.entryName}" from your cart?`
                }
                confirmLabel={dialogState.type === 'clear' ? 'Clear All' : 'Remove'}
                cancelLabel="Cancel"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                variant="danger"
            />
        </Layout>
    );
}