import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import RotatingText from '../ui/RotatingText';

const AuthLayout = ({ children }) => {
    const { t } = useLanguage();

    // Language texts with colors for rotating display
    const languageTexts = [
        'Language',  // English
        'भाषा',      // Hindi
        'ભાષા',      // Gujarati
        'भाषा',      // Marathi
        'ಭಾಷೆ'       // Kannada
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* Language Switcher - Top Right */}
            <div className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm border border-gray-200 p-3 rounded-lg shadow-sm">
                <div className="flex flex-col space-y-3 justify-center items-center">
                    <LanguageSwitcher />
                    <RotatingText
                        texts={languageTexts}
                        rotationInterval={2000}
                        splitBy="words"
                        staggerDuration={0}
                        mainClassName="text-sm font-semibold text-blue-600 h-8 flex items-center justify-center min-w-[80px]"
                        animatePresenceMode="wait"
                        transition={{
                            type: "spring",
                            damping: 20,
                            stiffness: 200,
                            duration: 0.4
                        }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                    />
                </div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-8">
                    {/* <h1 className="text-3xl tracking-wide font-bold text-gray-900">SARAL VYAPAR</h1> */}
                    {/* <p className="mt-2 text-sm text-gray-600">{t('common.getStarted')}</p> */}
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;