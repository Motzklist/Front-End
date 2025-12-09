import Link from 'next/link';

export default function Header() {
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
                    </div>
                </div>
            </nav>
        </header>
    );
}
