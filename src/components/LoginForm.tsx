'use client';

import {useState, FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/contexts/AuthContext';

export default function LoginForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const {login} = useAuth();

    const isFormValid = username.trim() !== '' && password.trim() !== '';

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (isFormValid) {
            login(username, password);
            router.push('/');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    Login
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
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
                            className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid}
                        className="w-full px-4 py-2 mt-6 text-white font-semibold rounded shadow-sm transition-colors duration-200 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-zinc-700"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

