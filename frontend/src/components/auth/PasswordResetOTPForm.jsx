import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Mail, Clock } from 'lucide-react';

const PasswordResetOTPForm = ({ email, onVerify, onBack, onResend, loading }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            return;
        }

        setError('');
        try {
            await onVerify(otp);
        } catch (err) {
            setError(err.message || 'Invalid OTP. Please try again.');
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        setError('');

        try {
            await onResend();
            // Reset timer and start 60-second cooldown
            setTimeLeft(5 * 60); // Reset to 5 minutes
            setError(''); // Clear any expiration error
            setResendCooldown(60);
            const interval = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            setError(err.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    const handleOtpChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setOtp(value);
        setError('');
    };

    // Countdown timer effect
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            setError('OTP has expired. Please request a new one.');
        }
    }, [timeLeft]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    {/* <Mail className="h-6 w-6 text-blue-600" /> */}
                </div>
                <CardTitle>Enter Reset Code</CardTitle>
                <CardDescription>
                    We've sent a 6-digit code to<br />
                    <strong>{email}</strong>
                </CardDescription>

                {/* Timer display */}
                <div className="flex items-center justify-center mt-4 p-2 bg-blue-50 rounded-lg">
                    {/* <Clock className="h-4 w-4 text-blue-600 mr-2" /> */}
                    <span className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                        Code expires in: {formatTime(timeLeft)}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="otp" className="text-sm font-medium">
                            Enter 6-digit code
                        </label>
                        <Input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={handleOtpChange}
                            placeholder="000000"
                            className={`text-center text-lg tracking-widest ${error ? 'border-destructive' : ''}`}
                            maxLength={6}
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || otp.length !== 6 || timeLeft === 0}>
                        {loading ? 'Verifying...' : timeLeft === 0 ? 'Code Expired' : 'Verify Code'}
                    </Button>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-muted-foreground">
                            Didn't receive the code?
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleResend}
                            disabled={resendLoading || resendCooldown > 0}
                            className="text-sm"
                        >
                            {resendLoading ? 'Sending...' :
                                resendCooldown > 0 ? `Resend in ${resendCooldown}s` :
                                    'Resend Code'}
                        </Button>
                    </div>

                    <div className="text-center">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onBack}
                            disabled={loading}
                            className="text-sm"
                        >
                            {/* <ArrowLeft className="h-4 w-4 mr-2" /> */}
                            Back to Email
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default PasswordResetOTPForm;