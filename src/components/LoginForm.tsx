'use client';

import {useState, FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    // NEW: Add local error state to show login failures to the user
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const {login} = useAuth();

    const isFormValid = username.trim() !== '' && password.trim() !== '';

    // NEW: Make handleSubmit async
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (isFormValid) {
            setIsLoading(true);
            try {
                // CRITICAL FIX: Await the login action
                await login(username, password);
                // Only redirect if login succeeds (no error thrown)
                router.push('/');
            } catch (err: any) {
                // Show the error message from the backend (e.g., "Invalid password")
                setError(err.message || 'Failed to login');
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* NEW: Error Alert */}
                    {error && (
                        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="username"
                            className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50"
                            placeholder="Enter your username"
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="w-full px-4 py-2 mt-6 text-white font-semibold rounded shadow-sm transition-colors duration-200 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-zinc-700"
                    >
                        {isLoading ? 'Signing in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}