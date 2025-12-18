'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    delay?: number;
}

export default function Toast({ message, isVisible, onClose, duration = 3000, delay = 0 }: ToastProps) {
    const onCloseRef = useRef(onClose);
    const [showContent, setShowContent] = useState(false);
    const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
    const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Keep the ref up to date with the latest callback
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    // Cleanup function to clear all timers
    const clearAllTimers = useCallback(() => {
        if (delayTimerRef.current) {
            clearTimeout(delayTimerRef.current);
            delayTimerRef.current = null;
        }
        if (dismissTimerRef.current) {
            clearTimeout(dismissTimerRef.current);
            dismissTimerRef.current = null;
        }
    }, []);

    // Handle visibility changes
    useEffect(() => {
        if (isVisible) {
            // Start delay timer
            delayTimerRef.current = setTimeout(() => {
                setShowContent(true);
                // Start dismiss timer after delay completes
                dismissTimerRef.current = setTimeout(() => {
                    onCloseRef.current();
                }, duration);
            }, delay);
        }

        return () => {
            // Cleanup: clear timers and reset state
            clearAllTimers();
            // Use setTimeout to avoid synchronous setState in effect
            setTimeout(() => setShowContent(false), 0);
        };
    }, [isVisible, delay, duration, clearAllTimers]);

    if (!showContent) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div
                className="relative bg-emerald-600 text-white px-6 py-4 rounded-lg shadow-lg overflow-hidden min-w-[280px] animate-toast-lifecycle"
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

