import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PasswordResetForm from "../PasswordResetForm";
import { vi } from "vitest";

// Mock fetch
global.fetch = vi.fn();

// Mock useSearchParams
const mockSearchParams = new URLSearchParams();
mockSearchParams.set('token', 'valid-token');

vi.mock("react-router-dom", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useSearchParams: () => [mockSearchParams],
        useNavigate: () => vi.fn(),
    };
});

const renderWithProviders = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("PasswordResetForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch.mockClear();
    });

    test("validates token on mount", async () => {
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ valid: true }),
        });

        renderWithProviders(<PasswordResetForm />);

        await waitFor(() => {
            expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/auth/validate-reset-token"),
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify({ token: "valid-token" }),
            })
        );
    });

    test("shows invalid token message when token is invalid", async () => {
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ valid: false, error: "Invalid token" }),
        });

        renderWithProviders(<PasswordResetForm />);

        await waitFor(() => {
            expect(screen.getByText("Invalid Reset Link")).toBeInTheDocument();
            expect(screen.getByText("This password reset link is invalid or has expired")).toBeInTheDocument();
        });
    });

    test("shows validation error for short password", async () => {
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ valid: true }),
        });

        renderWithProviders(<PasswordResetForm />);

        await waitFor(() => {
            expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText("New Password");
        fireEvent.change(passwordInput, { target: { value: "123" } });

        const submitButton = screen.getByText("Reset Password");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Password must be at least 8 characters long")).toBeInTheDocument();
        });
    });

    test("shows validation error for mismatched passwords", async () => {
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ valid: true }),
        });

        renderWithProviders(<PasswordResetForm />);

        await waitFor(() => {
            expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText("New Password");
        const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

        fireEvent.change(passwordInput, { target: { value: "password123" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "password456" } });

        const submitButton = screen.getByText("Reset Password");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
        });
    });

    test("shows success message when password is reset", async () => {
        global.fetch
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ valid: true }),
            })
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ success: true }),
            });

        renderWithProviders(<PasswordResetForm />);

        await waitFor(() => {
            expect(screen.getByText("Reset Your Password")).toBeInTheDocument();
        });

        const passwordInput = screen.getByLabelText("New Password");
        const confirmPasswordInput = screen.getByLabelText("Confirm New Password");

        fireEvent.change(passwordInput, { target: { value: "newpassword123" } });
        fireEvent.change(confirmPasswordInput, { target: { value: "newpassword123" } });

        const submitButton = screen.getByText("Reset Password");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Password Reset Successful")).toBeInTheDocument();
            expect(screen.getByText("Your password has been successfully updated")).toBeInTheDocument();
        });
    });
});