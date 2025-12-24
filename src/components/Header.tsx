'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
    const router = useRouter();
    const { isAuthenticated, logout } = useAuth();

    // Only access cart context when authenticated (CartProvider is available)
    let cartEntries: { id: string }[] = [];
    try {
        const cart = useCart();
        cartEntries = cart.cartEntries;
    } catch {
        // CartProvider not available (not authenticated)
    }

    const hasItems = cartEntries.length > 0;
    
    const handleLogout = () => {
        logout();
        router.replace('/login');
    };

    return (
        <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-white">
                            Motzkin Store
                        </Link>
                    </div>
                    <div className="flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            href="/contact"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                        >
                            Contact
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link
                                    href="/cart"
                                    className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                                    title="View Cart"
                                >
                                    <Image
                                        src={hasItems ? "/cart-full.svg" : "/cart-empty.svg"}
                                        alt="Cart"
                                        width={24}
                                        height={24}
                                        className="dark:invert"
                                    />
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
}
