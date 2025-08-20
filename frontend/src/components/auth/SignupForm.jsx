import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import ShopSetupForm from "../shop/ShopSetupForm";
import OTPVerification from "./OTPVerification";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Eye, EyeOff } from "lucide-react";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [showShopSetup, setShowShopSetup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpServerError, setOtpServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { signup, login, refreshUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('common.email') + " is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('common.email') + " is invalid";
    }

    if (!formData.password) {
      newErrors.password = t('common.password') + " is required";
    } else if (formData.password.length < 8) {
      newErrors.password = t('common.password') + " must be at least 8 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const normalizedEmail = formData.email.trim().toLowerCase();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setOtpServerError("");
        setUserEmail(data.email || normalizedEmail);
        setShowOTPVerification(true);
      } else {
        setErrors({ general: data.error });
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleShopSubmit = async (shopFormData) => {
    setLoading(true);

    try {
      // First login the user since they're now verified
      const loginResult = await login(formData.email, formData.password);

      if (!loginResult.success) {
        setErrors({ general: loginResult.error });
        setShowShopSetup(false);
        return;
      }

      // Then create the shop
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const shopResponse = await fetch(`${apiUrl}/shop/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(shopFormData),
      });

      const shopData = await shopResponse.json();

      if (shopData.success) {
        // After creating the shop, refresh user so it includes shop
        try {
          await refreshUser();
        } catch (_) { }
        navigate(`/${shopFormData.username}/modules`);
      } else {
        setErrors({ general: shopData.error });
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode) => {
    setLoading(true);
    try {
      setOtpServerError("");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: (userEmail || "").trim().toLowerCase(),
            otp: otpCode,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setShowOTPVerification(false);
        setShowShopSetup(true);
      } else {
        setOtpServerError(data.error || "Verification failed");
      }
    } catch (error) {
      setOtpServerError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      }/auth/resend-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      }
    );

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
  };

  const handleBackToSignup = () => {
    setShowOTPVerification(false);
    setShowShopSetup(false);
    setErrors({});
  };

  const handleBackToOTP = () => {
    setShowShopSetup(false);
    setShowOTPVerification(true);
    setErrors({});
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={userEmail}
        onVerify={handleOTPVerify}
        onBack={handleBackToSignup}
        onResend={handleResendOTP}
        loading={loading}
        serverError={otpServerError}
      />
    );
  }

  if (showShopSetup) {
    return (
      <ShopSetupForm
        onSubmit={handleShopSubmit}
        onBack={handleBackToOTP}
        loading={loading}
      />
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('auth.signupTitle')}</CardTitle>
        {/* <CardDescription>
          {t('auth.signupSubtitle')}
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('common.email')}
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              // placeholder={t('auth.enterEmail')}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('common.password')}
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                // placeholder={t('auth.enterPassword')}
                className={
                  errors.password ? "border-destructive pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            <PasswordStrengthIndicator password={formData.password} />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('common.confirmPassword')}
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                // placeholder={t('auth.enterConfirmPassword')}
                className={
                  errors.confirmPassword ? "border-destructive pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.createAccount') + "..." : t('common.createAccount')}
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('common.alreadyHaveAccount')}{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                {t('common.signInHere')}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
