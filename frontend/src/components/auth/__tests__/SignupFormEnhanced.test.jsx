import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import SignupForm from '../SignupForm';

// Mock the AuthContext
const MockAuthProvider = ({ children }) => (
    <BrowserRouter>
        <AuthProvider>
            {children}
        </AuthProvider>
    </BrowserRouter>
);

describe('SignupForm Enhanced Password Validation', () => {
    beforeEach(() => {
        // Mock fetch
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('displays password length indicator when password is entered', async () => {
        render(
            <MockAuthProvider>
                <SignupForm />
            </MockAuthProvider>
        );

        const passwordInput = screen.getByLabelText(/password \*/i);

        // Enter a short password
        fireEvent.change(passwordInput, { target: { value: 'short' } });

        // Should show password length indicator
        await waitFor(() => {
            expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
        });
    });

    test('enforces 8+ character password requirement', async () => {
        render(
            <MockAuthProvider>
                <SignupForm />
            </MockAuthProvider>
        );

        const emailInput = screen.getByLabelText(/email \*/i);
        const passwordInput = screen.getByLabelText(/password \*/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password \*/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        // Fill form with short password (7 characters)
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'short12' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'short12' } });

        fireEvent.click(submitButton);

        // Should show error for password length
        await waitFor(() => {
            expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
        });
    });

    test('shows valid password indicator for 8+ character password', async () => {
        render(
            <MockAuthProvider>
                <SignupForm />
            </MockAuthProvider>
        );

        const passwordInput = screen.getByLabelText(/password \*/i);

        // Enter a valid password (8+ characters)
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Should show valid password indicator
        await waitFor(() => {
            expect(screen.getByText(/✅.*at least 8 characters/i)).toBeInTheDocument();
        });
    });

    test('validates password confirmation matches', async () => {
        render(
            <MockAuthProvider>
                <SignupForm />
            </MockAuthProvider>
        );

        const emailInput = screen.getByLabelText(/email \*/i);
        const passwordInput = screen.getByLabelText(/password \*/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password \*/i);
        const submitButton = screen.getByRole('button', { name: /create account/i });

        // Fill form with mismatched passwords
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });

        fireEvent.click(submitButton);

        // Should show error for password mismatch
        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        });
    });
});