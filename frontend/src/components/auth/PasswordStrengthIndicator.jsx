import { useMemo } from 'react';

const PasswordStrengthIndicator = ({ password }) => {
    const strength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        const strengthLevels = {
            0: { label: '', color: '', bgColor: '' },
            1: { label: 'Very Weak', color: 'text-red-600', bgColor: 'bg-red-200' },
            2: { label: 'Weak', color: 'text-red-500', bgColor: 'bg-red-200' },
            3: { label: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-200' },
            4: { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-200' },
            5: { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-200' }
        };

        return {
            score,
            checks,
            ...strengthLevels[score]
        };
    }, [password]);

    if (!password) return null;

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${strength.bgColor}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                </div>
                <span className={`text-xs font-medium ${strength.color}`}>
                    {strength.label}
                </span>
            </div>

            <div className="text-xs text-muted-foreground">
                <div className="grid grid-cols-2 gap-1">
                    <div className={strength.checks.length ? 'text-green-600' : 'text-gray-400'}>
                        ✅ At least 8 characters
                    </div>
                    <div className={strength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                        ✅ Lowercase letter
                    </div>
                    <div className={strength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                        ✅ Uppercase letter
                    </div>
                    <div className={strength.checks.number ? 'text-green-600' : 'text-gray-400'}>
                        ✅ Number
                    </div>
                    <div className={strength.checks.special ? 'text-green-600' : 'text-gray-400'}>
                        ✅ Special character
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;