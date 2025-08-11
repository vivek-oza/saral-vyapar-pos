import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasswordResetOTPForm from '../PasswordResetOTPForm';

describe('PasswordResetOTPForm', () => {
    const mockProps = {
        email: 'test@example.com',
        onVerify: jest.fn(),
        onBack: jest.fn(),
        onResend: jest.fn(),
        loading: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders OTP form with email display', () => {
        render(<PasswordResetOTPForm {...mockProps} />);

        expect(screen.getByText(/enter reset code/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
        expect(screen.getByLabelText(/enter 6-digit code/i)).toBeInTheDocument();
    });

    test('validates OTP input length', async () => {
        render(<PasswordResetOTPForm {...mockProps} />);

        const otpInput = screen.getByLabelText(/enter 6-digit code/i);
        const verifyButton = screen.getByRole('button', { name: /verify code/i });

        // Enter short OTP
        fireEvent.change(otpInput, { target: { value: '123' } });
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(screen.getByText(/please enter a valid 6-digit otp/i)).toBeInTheDocument();
        });

        expect(mockProps.onVerify).not.toHaveBeenCalled();
    });

    test('calls onVerify with valid OTP', async () => {
        render(<PasswordResetOTPForm {...mockProps} />);

        const otpInput = screen.getByLabelText(/enter 6-digit code/i);
        const verifyButton = screen.getByRole('button', { name: /verify code/i });

        // Enter valid OTP
        fireEvent.change(otpInput, { target: { value: '123456' } });
        fireEvent.click(verifyButton);

        await waitFor(() => {
            expect(mockProps.onVerify).toHaveBeenCalledWith('123456');
        });
    });

    test('handles resend OTP with cooldown', async () => {
        render(<PasswordResetOTPForm {...mockProps} />);

        const resendButton = screen.getByRole('button', { name: /resend code/i });

        fireEvent.click(resendButton);

        await waitFor(() => {
            expect(mockProps.onResend).toHaveBeenCalled();
        });
    });

    test('calls onBack when back button is clicked', () => {
        render(<PasswordResetOTPForm {...mockProps} />);

        const backButton = screen.getByRole('button', { name: /back to email/i });
        fireEvent.click(backButton);

        expect(mockProps.onBack).toHaveBeenCalled();
    });

    test('only allows numeric input and limits to 6 digits', () => {
        render(<PasswordResetOTPForm {...mockProps} />);

        const otpInput = screen.getByLabelText(/enter 6-digit code/i);

        // Try to enter non-numeric characters
        fireEvent.change(otpInput, { target: { value: 'abc123def456789' } });

        // Should only contain numeric characters and be limited to 6 digits
        expect(otpInput.value).toBe('123456');
    });
});