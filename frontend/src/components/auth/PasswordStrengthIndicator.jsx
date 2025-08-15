import { useMemo } from 'react';

const PasswordStrengthIndicator = ({ password }) => {
    const isValid = useMemo(() => {
        return password && password.length >= 8;
    }, [password]);

    if (!password) return null;

    return (
        <div className="text-xs text-muted-foreground">
            <div className={isValid ? 'text-green-600' : 'text-gray-400'}>
                {isValid ? '✅' : '❌'} At least 8 characters
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;