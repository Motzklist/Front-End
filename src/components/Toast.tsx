'use client';

import { useEffect, useRef } from 'react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
    const onCloseRef = useRef(onClose);

    // Keep the ref up to date with the latest callback
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onCloseRef.current();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div
                className="relative bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg overflow-hidden min-w-[280px] animate-toast-fade-out"
                style={{ animationDuration: `${duration}ms` }}
            >
                <div className="flex items-center gap-3">
                    {/* Success checkmark icon */}
                    <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                    <span className="font-medium">{message}</span>
                </div>

                {/* Line timer on bottom edge - darker shade of emerald */}
                <div
                    className="absolute bottom-0 left-0 h-1 bg-emerald-800 animate-timer-line"
                    style={{ animationDuration: `${duration}ms` }}
                />
            </div>
        </div>
    );
}

