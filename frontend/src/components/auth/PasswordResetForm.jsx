import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";

const PasswordResetForm = ({
  token: propToken,
  onSubmit: propOnSubmit,
  onBack: propOnBack,
  loading: propLoading,
  isOTPBased = false,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = propToken || searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(propLoading || false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Validate token on component mount
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const response = await fetch(`${apiUrl}/auth/validate-reset-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      setTokenValid(data.valid);

      if (!data.valid) {
        setError(data.error || "Invalid or expired reset token");
      }
    } catch (error) {
      setTokenValid(false);
      setError("Failed to validate reset token");
    }
  };

  const validateForm = () => {
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (propOnSubmit) {
      try {
        await propOnSubmit(formData.password, formData.confirmPassword);
        setSuccess(true);
      } catch (err) {
        setError(err.message || "Failed to reset password");
      }
      return;
    }

    // -- changed by cursor --

    // setLoading(true);
    // setError('');

    // try {
    //     const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    //     const endpoint = isOTPBased ? 'reset-password-with-otp' : 'reset-password';
    //     const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             token,
    //             password: formData.password
    //         }),
    //     });

    //     const data = await response.json();

    //     if (data.success) {
    //         setSuccess(true);
    //         setTimeout(() => {
    //             navigate('/login');
    //         }, 3000);
    //     } else {
    //         setError(data.error || 'Failed to reset password');
    //     }
    // } catch (error) {
    //     setError('Network error. Please try again.');
    // } finally {
    //     setLoading(false);
    // }

    // -- changed by cursor --

    setLoading(true);
    setError("");

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const endpoint = isOTPBased
        ? "reset-password-with-otp"
        : "reset-password";
      const response = await fetch(`${apiUrl}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          confirmPassword: formData.confirmPassword, // added to pass backend validation
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">Invalid Reset Link</CardTitle>
          <CardDescription>
            This password reset link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Password reset links expire after 24 hours for security reasons.
            </p>
            <Button
              onClick={() => navigate("/forgot-password")}
              className="w-full"
            >
              Request New Reset Link
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            {/* <CheckCircle className="h-6 w-6 text-green-600" /> */}
          </div>
          <CardTitle>Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can now log in with your new password. Redirecting to login
              page...
            </p>
            <Button onClick={() => navigate("/login")} className="w-full">
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tokenValid === null) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              Validating reset link...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        {/* <CardDescription>Enter your new password below</CardDescription> */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter new password"
                className={error ? "border-destructive" : ""}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {/* {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )} */}
              </Button>
            </div>
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                className={error ? "border-destructive" : ""}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {/* {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )} */}
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </Button>

          {propOnBack && (
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={propOnBack}
                disabled={loading}
                className="text-sm"
              >
                {/* <ArrowLeft className="h-4 w-4 mr-2" /> */}
                Back to OTP
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordResetForm;
