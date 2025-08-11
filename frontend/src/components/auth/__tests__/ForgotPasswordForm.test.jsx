import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ForgotPasswordForm from "../ForgotPasswordForm";
import { vi } from "vitest";

// Mock fetch
global.fetch = vi.fn();

const renderWithProviders = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("ForgotPasswordForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch.mockClear();
    });

    test("renders forgot password form", () => {
        renderWithProviders(<ForgotPasswordForm />);

        expect(screen.getByText("Forgot Password")).toBeInTheDocument();
        expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
        expect(screen.getByText("Send Reset Link")).toBeInTheDocument();
        expect(screen.getByText("Back to Login")).toBeInTheDocument();
    });

    test("shows validation error for empty email", async () => {
        renderWithProviders(<ForgotPasswordForm />);

        const submitButton = screen.getByText("Send Reset Link");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Email is required")).toBeInTheDocument();
        });
    });

    test("shows validation error for invalid email", async () => {
        renderWithProviders(<ForgotPasswordForm />);

        const emailInput = screen.getByLabelText("Email Address");
        fireEvent.change(emailInput, { target: { value: "invalid-email" } });

        const submitButton = screen.getByText("Send Reset Link");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
        });
    });

    test("shows success message when email is sent", async () => {
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ success: true }),
        });

        renderWithProviders(<ForgotPasswordForm />);

        const emailInput = screen.getByLabelText("Email Address");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByText("Send Reset Link");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Check Your Email")).toBeInTheDocument();
            expect(screen.getByText("We've sent password reset instructions to test@example.com")).toBeInTheDocument();
        });
    });

    test("shows error message when API fails", async () => {
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ success: false, error: "User not found" }),
        });

        renderWithProviders(<ForgotPasswordForm />);

        const emailInput = screen.getByLabelText("Email Address");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const submitButton = screen.getByText("Send Reset Link");
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("User not found")).toBeInTheDocument();
        });
    });
});