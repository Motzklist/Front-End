/**
 * @fileoverview Redirect (third-party) sign-in integration test
 *
 * Renders the REAL AuthProvider + LoginForm together with the mock OAuth
 * provider selected via NEXT_PUBLIC_AUTH_PROVIDER, verifying the client wiring
 * that unit tests don't cover on their own: env -> getAuthProvider() ->
 * authMethod === 'redirect' -> LoginForm swaps the credential form for the
 * third-party provider button. (The button's navigation target is exercised by
 * the MockOAuthProvider.getSignInUrl unit test.)
 */

// Select the mock redirect provider before any module reads the env.
process.env.NEXT_PUBLIC_AUTH_PROVIDER = 'mock-oauth';

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// LoginForm only uses the router on the credential path; stub it.
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

import { AuthProvider } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';

describe('redirect provider sign-in (integration)', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the third-party provider button instead of the credential form', async () => {
        render(
            <AuthProvider>
                <LoginForm />
            </AuthProvider>
        );

        // env -> mock-oauth provider -> authMethod === 'redirect' -> the login UI
        // shows the provider button and drops the username/password fields.
        expect(
            await screen.findByRole('button', { name: /Continue with Mock Google/i })
        ).toBeInTheDocument();
        expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    });
});
