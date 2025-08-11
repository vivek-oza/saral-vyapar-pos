import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPassword = () => {
    return (
        <div className="min-h-screen bg-background py-12">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Saral Vyapar POS</h1>
                    <p className="text-muted-foreground mt-2">Reset your password</p>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    );
};

export default ForgotPassword;