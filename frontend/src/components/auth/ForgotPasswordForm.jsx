import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordForm = ({ onSubmit, loading: propLoading, error: propError }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(propLoading || false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(propError || '');

    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    // Update loading and error when props change
    useEffect(() => {
        if (propLoading !== undefined) setLoading(propLoading);
        if (propError !== undefined) setError(propError);
    }, [propLoading, propError]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // If onSubmit prop is provided, use it (for ResetPasswordOTP flow)
        if (onSubmit) {
            try {
                await onSubmit(email);
                // Success is handled by parent component
            } catch (err) {
                setError(err.message || 'Failed to send reset code');
            }
            return;
        }

        // Otherwise, use the original standalone logic
        setLoading(true);
        setError('');

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to send reset email');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle>Check Your Email</CardTitle>
                    <CardDescription>
                        We've sent a reset code to {email}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground text-center">
                        <p>If you don't see the email, check your spam folder.</p>
                        <p>The reset code will expire in 10 minutes.</p>
                    </div>
                    <Link to="/login">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Login
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email address and we'll send you a code to reset your password
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {(error || propError) && (
                        <div className="text-destructive text-sm text-center p-3 bg-destructive/10 rounded-md">
                            {error || propError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email Address
                        </label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className={(error || propError) ? "border-destructive" : ""}
                            disabled={loading || propLoading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || propLoading}>
                        {(loading || propLoading) ? 'Sending...' : 'Send Reset Code'}
                    </Button>

                    <div className="text-center">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-primary">
                            <ArrowLeft className="h-4 w-4 inline mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default ForgotPasswordForm;