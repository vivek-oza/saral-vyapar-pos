import React, { useState, useEffect, useRef } from 'react';

const AnimatedLanguageText = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState('Language'); // Start with visible text
    const [isTyping, setIsTyping] = useState(false);
    const intervalRef = useRef(null);
    const typeIntervalRef = useRef(null);

    // All "Language" translations for the 5 supported languages with their language codes
    const languageTexts = [
        { text: 'Language', code: 'en', color: 'text-blue-600' },    // English
        { text: 'भाषा', code: 'hi', color: 'text-orange-600' },      // Hindi
        { text: 'ભાષા', code: 'gu', color: 'text-green-600' },      // Gujarati
        { text: 'भाषा', code: 'mr', color: 'text-purple-600' },     // Marathi
        { text: 'ಭಾಷೆ', code: 'kn', color: 'text-red-600' }         // Kannada
    ];

    // Typewriter effect
    const typeText = (text) => {
        if (typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
        }

        setIsTyping(true);
        setDisplayText('');

        let i = 0;
        typeIntervalRef.current = setInterval(() => {
            if (i < text.length) {
                setDisplayText(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typeIntervalRef.current);
                setIsTyping(false);
            }
        }, 120); // Slightly slower typing for better visibility
    };

    useEffect(() => {
        // Set up cycling interval - start after 2 seconds to show initial text
        setTimeout(() => {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % languageTexts.length;
                    // Type the next text after a small delay
                    setTimeout(() => typeText(languageTexts[nextIndex].text), 200);
                    return nextIndex;
                });
            }, 2000); // Change every 2 seconds
        }, 2000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (typeIntervalRef.current) {
                clearInterval(typeIntervalRef.current);
            }
        };
    }, []);

    const currentText = languageTexts[currentIndex];

    return (
        <div className="relative h-8 flex items-center justify-center overflow-hidden w-[100px]">
            {/* Background glow effect */}
            <div
                className={`absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg transition-all duration-300 ${isTyping ? 'opacity-25 scale-105' : 'opacity-10 scale-100'
                    }`}
            />

            {/* Main text container - centered */}
            <div className="relative w-full flex items-center justify-center">
                <div className="flex items-center justify-center min-h-[20px]">
                    <span
                        className={`text-sm font-semibold ${currentText.color}`}
                        style={{
                            fontFamily: currentText.code === 'en' ? 'inherit' : 'system-ui, -apple-system, sans-serif',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            minWidth: '60px',
                            display: 'inline-block'
                        }}
                    >
                        {displayText || 'Language'} {/* Fallback text */}
                    </span>
                    {/* Typing cursor */}
                    {isTyping && (
                        <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
                    )}
                </div>
            </div>

            {/* Decorative dots */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {languageTexts.map((_, index) => (
                    <div
                        key={index}
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'bg-current opacity-80 scale-125'
                            : 'bg-gray-300 opacity-40 scale-100'
                            }`}
                        style={{
                            color: index === currentIndex
                                ? languageTexts[index].color.replace('text-', '')
                                : undefined
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default AnimatedLanguageText;