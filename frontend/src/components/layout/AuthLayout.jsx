import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import AnimatedLanguageText from '../ui/AnimatedLanguageText';

const AuthLayout = ({ children }) => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Language Switcher - Top Right */}
            <div className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 p-3 rounded-lg shadow-sm">
                <div className="flex flex-col space-y-3 justify-center items-center">
                    <LanguageSwitcher />
                    <AnimatedLanguageText />
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl tracking-wide font-bold text-gray-900">SARAL VYAPAR</h1>
                    <p className="mt-2 text-sm text-gray-600">{t('common.getStarted')}</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;