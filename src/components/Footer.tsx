export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-zinc-600 dark:text-zinc-400">
                        <p className="text-sm">
                            © {currentYear} Motzkin Store. All rights reserved.
                        </p>
                    </div>
                    <div className="flex space-x-6">
                        {/* TODO: Replace with actual routes when pages are implemented */}
                        <a
                            href="/privacy"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="/terms"
                            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm"
                        >
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
