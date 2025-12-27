import type {Metadata} from "next";
import "./globals.css";
import {AuthProvider} from "@/contexts/AuthContext";
import AuthenticatedProviders from "@/components/AuthenticatedProviders";
import ProtectedRoute from '@/components/ProtectedRoute';

export const metadata: Metadata = {
    title: "Motzkin Store - School Equipment",
    description: "Select your school, grade, and class to view your equipment list",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
            <AuthenticatedProviders>
                <ProtectedRoute>
                    {children}
                </ProtectedRoute>
            </AuthenticatedProviders>
        </AuthProvider>
        </body>
        </html>
    );
}
