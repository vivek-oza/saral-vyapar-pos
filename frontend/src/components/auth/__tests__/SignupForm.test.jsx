import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SignupForm from "../SignupForm";
import { vi } from "vitest";

// Mock the auth context
const mockSignup = vi.fn();
const mockNavigate = vi.fn();

// Mock the useAuth hook
vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    signup: mockSignup,
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
}));

// Mock only the useNavigate hook while preserving other exports
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithProviders = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders signup form initially", () => {
    renderWithProviders(<SignupForm />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Email *")).toBeInTheDocument();
    expect(screen.getByLabelText("Password *")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password *")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  test("shows validation errors for empty fields", async () => {
    renderWithProviders(<SignupForm />);

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  test("shows validation error for invalid email", async () => {
    renderWithProviders(<SignupForm />);

    const emailInput = screen.getByLabelText("Email *");
    const submitButton = screen.getByRole("button", { name: "Create Account" });

    // Set invalid email and submit immediately
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email is invalid")).toBeInTheDocument();
    });
  });

  test("shows validation error for short password", async () => {
    renderWithProviders(<SignupForm />);

    const passwordInput = screen.getByLabelText("Password *");
    fireEvent.change(passwordInput, { target: { value: "1234567" } });

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters long")
      ).toBeInTheDocument();
    });
  });

  test("shows validation error for mismatched passwords", async () => {
    renderWithProviders(<SignupForm />);

    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password *");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password456" },
    });

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
  });

  test("proceeds to OTP verification when form is valid", async () => {
    // Mock fetch for successful signup
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      })
    );

    renderWithProviders(<SignupForm />);

    const emailInput = screen.getByLabelText("Email *");
    const passwordInput = screen.getByLabelText("Password *");
    const confirmPasswordInput = screen.getByLabelText("Confirm Password *");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, {
      target: { value: "password123" },
    });

    const submitButton = screen.getByRole("button", { name: "Create Account" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Verify Your Email")).toBeInTheDocument();
      expect(screen.getByText("Enter the 6-digit code sent to test@example.com")).toBeInTheDocument();
    });
  });
});
