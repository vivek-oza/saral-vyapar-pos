import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from './button';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { currentLanguage, changeLanguage, getCurrentLanguage, languages, t } = useLanguage();

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLanguageChange = (languageCode) => {
        changeLanguage(languageCode);
        setIsDropdownOpen(false);
    };

    const currentLang = getCurrentLanguage();

    return (
        <div className="relative">
            {/* Language Switcher Button */}
            <button
                onClick={handleDropdownToggle}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                aria-label={t('common.selectLanguage')}
                title={t('common.language')}
            >
                <Globe className="h-5 w-5 text-black" />
            </button>

            {/* Language Dropdown Menu */}
            {isDropdownOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-md bg-white border shadow-lg">
                        <div className="p-2">
                            <div className="text-sm font-medium text-gray-600 px-2 py-1 border-b mb-2">
                                {t('common.selectLanguage')}
                            </div>
                            <div className="space-y-1">
                                {languages.map((language) => (
                                    <button
                                        key={language.code}
                                        onClick={() => handleLanguageChange(language.code)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${currentLanguage === language.code
                                            ? 'bg-blue-500 text-white'
                                            : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{language.nativeName}</span>
                                            <span className="text-xs opacity-70">{language.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;