'use client';

import Layout from '@/components/Layout';
import Link from 'next/link';

export default function ContactPage() {
    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Have questions or need assistance? Get in touch with us through the channels below.
                    </p>
                </div>

                {/* Contact Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Kiryat Motzkin Contact Card */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
                            Kiryat Motzkin Municipality
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                    Address
                                </h3>
                                <a
                                    href="https://maps.app.goo.gl/jz7yv3hggruuKcjs9"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    Lev Hakrayot Center<br />
                                    Ben Gurion Boulevard 80<br />
                                    Kiryat Motzkin, Israel
                                </a>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                    Municipal Service Center
                                </h3>
                                <div className="text-zinc-900 dark:text-white space-y-1">
                                    <p><b>Phone:</b> 04-878-0900</p>
                                    <p><b>Quick Dial:</b> *5470</p>
                                    <p><b>WhatsApp:</b> <a
                                        href="https://wa.me/972542223352"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        +972 54-222-3352
                                    </a></p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                    General Inquiries
                                </h3>
                                <p className="text-zinc-900 dark:text-white">
                                    04-878-0222
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                    Website
                                </h3>
                                <a
                                    href="https://www.kiryat-motzkin.muni.il"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    www.kiryat-motzkin.muni.il
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Development Team Contact Card */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
                        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
                            Contact the Development Team
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                            For technical support, bug reports, or feature requests, please reach out to our development team through GitHub.
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                            You can find all team members and their GitHub profiles on our About page.
                        </p>
                        <Link
                            href="/about"
                            className="inline-flex items-center justify-center px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors duration-200 shadow-sm hover:shadow-md"
                        >
                            View Team on About Page
                        </Link>
                    </div>
                </div>

                {/* Office Hours Section */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-8 border border-zinc-200 dark:border-zinc-700">
                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                        Office Hours
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-zinc-600 dark:text-zinc-400">
                        <div>
                            <p className="font-medium text-zinc-900 dark:text-white mb-1">
                                Sunday - Tuesday, Thursday
                            </p>
                            <p>8:00 AM - 3:30 PM</p>
                        </div>
                        <div>
                            <p className="font-medium text-zinc-900 dark:text-white mb-1">
                                Wednesday
                            </p>
                            <p>8:00 AM - 1:00 PM<br />4:00 PM - 6:00 PM</p>
                        </div>
                        <div>
                            <p className="font-medium text-zinc-900 dark:text-white mb-1">
                                Friday - Saturday
                            </p>
                            <p>Closed</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

