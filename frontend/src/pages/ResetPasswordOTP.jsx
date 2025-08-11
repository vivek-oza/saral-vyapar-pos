import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import PasswordResetOTPForm from "../components/auth/PasswordResetOTPForm";
import PasswordResetForm from "../components/auth/PasswordResetForm";

const ResetPasswordOTP = () => {
  const [step, setStep] = useState("email"); // 'email', 'otp', 'password'
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Check if we came from forgot password with email
  useState(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setStep("otp");
    }
  }, [location]);

  const handleEmailSubmit = async (emailAddress) => {
    setLoading(true);
    setError("");

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailAddress }),
      });

      const data = await response.json();

      if (data.success) {
        setEmail(emailAddress);
        setStep("otp");
      } else {
        throw new Error(data.error || "Failed to send reset code");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otp) => {
    setLoading(true);
    setError("");

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/auth/verify-reset-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setResetToken(data.resetToken);
        setStep("password");
      } else {
        throw new Error(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${apiUrl}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to resend OTP");
    }
  };

  // const handlePasswordReset = async (password) => {
  //     setLoading(true);
  //     setError('');

  //     try {
  //         const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  //         const response = await fetch(`${apiUrl}/auth/reset-password-with-otp`, {
  //             method: 'POST',
  //             headers: {
  //                 'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({ token: resetToken, password }),
  //         });

  const handlePasswordReset = async (password, confirmPassword) => {
    setLoading(true);
    setError("");

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/auth/reset-password-with-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password, confirmPassword }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/login", {
          state: {
            message:
              "Password reset successfully. You can now login with your new password.",
          },
        });
      } else {
        throw new Error(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setEmail("");
    setError("");
  };

  const handleBackToOTP = () => {
    setStep("otp");
    setResetToken("");
    setError("");
  };

  if (step === "email") {
    return (
      <AuthLayout>
        <ForgotPasswordForm
          onSubmit={handleEmailSubmit}
          loading={loading}
          error={error}
        />
      </AuthLayout>
    );
  }

  if (step === "otp") {
    return (
      <AuthLayout>
        <PasswordResetOTPForm
          email={email}
          onVerify={handleOTPVerify}
          onBack={handleBackToEmail}
          onResend={handleResendOTP}
          loading={loading}
        />
      </AuthLayout>
    );
  }

  if (step === "password") {
    return (
      <AuthLayout>
        <PasswordResetForm
          token={resetToken}
          onSubmit={handlePasswordReset}
          onBack={handleBackToOTP}
          loading={loading}
          isOTPBased={true}
        />
      </AuthLayout>
    );
  }

  return null;
};

export default ResetPasswordOTP;
