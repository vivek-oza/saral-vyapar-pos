import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        console.error('useLanguage must be used within a LanguageProvider');
        // Return a fallback context to prevent crashes
        return {
            currentLanguage: 'en',
            changeLanguage: () => { },
            getCurrentLanguage: () => languages[0],
            languages,
            t: (key) => key
        };
    }
    return context;
};

const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
];

export const LanguageProvider = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('en');

    // Load saved language from localStorage on mount
    useEffect(() => {
        try {
            const savedLanguage = localStorage.getItem('selectedLanguage');
            if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
                setCurrentLanguage(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading language from localStorage:', error);
        }
    }, []);

    // Save language to localStorage when it changes
    useEffect(() => {
        try {
            localStorage.setItem('selectedLanguage', currentLanguage);
        } catch (error) {
            console.error('Error saving language to localStorage:', error);
        }
    }, [currentLanguage]);

    const changeLanguage = (languageCode) => {
        if (languages.find(lang => lang.code === languageCode)) {
            setCurrentLanguage(languageCode);
        }
    };

    const getCurrentLanguage = () => {
        return languages.find(lang => lang.code === currentLanguage) || languages[0];
    };

    const value = {
        currentLanguage,
        changeLanguage,
        getCurrentLanguage,
        languages,
        t: (key) => translate(key, currentLanguage) // Translation function
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Simple translation function - will be enhanced with actual translations
const translate = (key, language) => {
    const translations = {
        en: {
            // Navigation
            'nav.moduleSelection': 'Module Selection',
            'nav.dashboard': 'Dashboard',
            'nav.products': 'Product Management',
            'nav.inventory': 'Inventory View',
            'nav.billing': 'Billing System',
            'nav.reports': 'Reports & Analytics',
            'nav.mobilePOS': 'Mobile POS',
            'nav.settings': 'Shop Settings',
            'nav.logout': 'Logout',
            'nav.welcome': 'Welcome',
            'nav.loggedInAs': 'Logged in as',
            'nav.navigation': 'Navigation',

            // Descriptions
            'desc.moduleSelection': 'Choose a module to work with',
            'desc.dashboard': 'View business overview',
            'desc.products': 'Manage your product catalog',
            'desc.inventory': 'Track stock levels',
            'desc.billing': 'Process sales and payments',
            'desc.reports': 'View business insights',
            'desc.mobilePOS': 'Mobile point of sale',
            'desc.settings': 'Manage shop configuration',

            // Common
            'common.language': 'Language',
            'common.selectLanguage': 'Select Language',
            'common.goTo': 'Go to',
            'common.needHelp': 'Need help? Check Help or Contact support.',
            'common.email': 'Email',
            'common.password': 'Password',
            'common.confirmPassword': 'Confirm Password',
            'common.fullName': 'Full Name',
            'common.shopName': 'Shop Name',
            'common.login': 'Login',
            'common.signup': 'Sign Up',
            'common.forgotPassword': 'Forgot Password?',
            'common.alreadyHaveAccount': 'Already have an account?',
            'common.dontHaveAccount': "Don't have an account?",
            'common.signInHere': 'Sign in here',
            'common.signUpHere': 'Sign up here',
            'common.createAccount': 'Create Account',
            'common.signInToAccount': 'Sign in to your account',
            'common.getStarted': 'Get started with your business management',
            'common.welcomeBack': 'Welcome back',
            'common.joinUs': 'Join us today',

            // Descriptions
            'desc.chooseModule': 'Choose a module to get started with managing your business',

            // Auth
            'auth.loginTitle': 'Sign in to your account',
            'auth.loginSubtitle': 'Welcome back! Please enter your details.',
            'auth.signupTitle': 'Create your account',
            'auth.signupSubtitle': 'Get started with your business management platform.',
            'auth.enterEmail': 'Enter your email',
            'auth.enterPassword': 'Enter your password',
            'auth.enterConfirmPassword': 'Confirm your password',
            'auth.enterFullName': 'Enter your full name',
            'auth.enterShopName': 'Enter your shop name'
        },
        hi: {
            // Navigation
            'nav.moduleSelection': 'मॉड्यूल चयन',
            'nav.dashboard': 'डैशबोर्ड',
            'nav.products': 'उत्पाद प्रबंधन',
            'nav.inventory': 'इन्वेंटरी दृश्य',
            'nav.billing': 'बिलिंग सिस्टम',
            'nav.reports': 'रिपोर्ट और विश्लेषण',
            'nav.mobilePOS': 'मोबाइल POS',
            'nav.settings': 'दुकान सेटिंग्स',
            'nav.logout': 'लॉगआउट',
            'nav.welcome': 'स्वागत',
            'nav.loggedInAs': 'के रूप में लॉग इन',
            'nav.navigation': 'नेवीगेशन',

            // Descriptions
            'desc.moduleSelection': 'काम करने के लिए एक मॉड्यूल चुनें',
            'desc.dashboard': 'व्यापार अवलोकन देखें',
            'desc.products': 'अपने उत्पाद कैटलॉग का प्रबंधन करें',
            'desc.inventory': 'स्टॉक स्तर ट्रैक करें',
            'desc.billing': 'बिक्री और भुगतान प्रक्रिया',
            'desc.reports': 'व्यापार अंतर्दृष्टि देखें',
            'desc.mobilePOS': 'मोबाइल पॉइंट ऑफ सेल',
            'desc.settings': 'दुकान कॉन्फ़िगरेशन प्रबंधित करें',

            // Common
            'common.language': 'भाषा',
            'common.selectLanguage': 'भाषा चुनें',
            'common.goTo': 'जाएं',
            'common.needHelp': 'शुरुआत में मदद चाहिए? हमारी उपयोगकर्ता गाइड देखें या सहायता से संपर्क करें।',
            'common.email': 'ईमेल',
            'common.password': 'पासवर्ड',
            'common.confirmPassword': 'पासवर्ड की पुष्टि करें',
            'common.fullName': 'पूरा नाम',
            'common.shopName': 'दुकान का नाम',
            'common.login': 'लॉगिन',
            'common.signup': 'साइन अप',
            'common.forgotPassword': 'पासवर्ड भूल गए?',
            'common.alreadyHaveAccount': 'पहले से खाता है?',
            'common.dontHaveAccount': 'खाता नहीं है?',
            'common.signInHere': 'यहाँ साइन इन करें',
            'common.signUpHere': 'यहाँ साइन अप करें',
            'common.createAccount': 'खाता बनाएं',
            'common.signInToAccount': 'अपने खाते में साइन इन करें',
            'common.getStarted': 'अपने व्यापार प्रबंधन के साथ शुरुआत करें',
            'common.welcomeBack': 'वापस स्वागत है',
            'common.joinUs': 'आज ही हमसे जुड़ें',

            // Descriptions
            'desc.chooseModule': 'अपने व्यापार के प्रबंधन के लिए एक मॉड्यूल चुनें',

            // Auth
            'auth.loginTitle': 'अपने खाते में साइन इन करें',
            'auth.loginSubtitle': 'वापस स्वागत है! कृपया अपनी जानकारी दर्ज करें।',
            'auth.signupTitle': 'अपना खाता बनाएं',
            'auth.signupSubtitle': 'अपने व्यापार प्रबंधन प्लेटफॉर्म के साथ शुरुआत करें।',
            'auth.enterEmail': 'अपना ईमेल दर्ज करें',
            'auth.enterPassword': 'अपना पासवर्ड दर्ज करें',
            'auth.enterConfirmPassword': 'अपने पासवर्ड की पुष्टि करें',
            'auth.enterFullName': 'अपना पूरा नाम दर्ज करें',
            'auth.enterShopName': 'अपनी दुकान का नाम दर्ज करें'
        },
        gu: {
            // Navigation
            'nav.moduleSelection': 'મોડ્યુલ પસંદગી',
            'nav.dashboard': 'ડેશબોર્ડ',
            'nav.products': 'ઉત્પાદન વ્યવસ્થાપન',
            'nav.inventory': 'ઇન્વેન્ટરી દૃશ્ય',
            'nav.billing': 'બિલિંગ સિસ્ટમ',
            'nav.reports': 'રિપોર્ટ્સ અને વિશ્લેષણ',
            'nav.mobilePOS': 'મોબાઇલ POS',
            'nav.settings': 'દુકાન સેટિંગ્સ',
            'nav.logout': 'લૉગઆઉટ',
            'nav.welcome': 'સ્વાગત',
            'nav.loggedInAs': 'તરીકે લૉગ ઇન',
            'nav.navigation': 'નેવિગેશન',

            // Descriptions
            'desc.moduleSelection': 'કામ કરવા માટે મોડ્યુલ પસંદ કરો',
            'desc.dashboard': 'વ્યવસાય વિહંગાવલોકન જુઓ',
            'desc.products': 'તમારા ઉત્પાદન કેટલોગનું સંચાલન કરો',
            'desc.inventory': 'સ્ટોક સ્તરોને ટ્રેક કરો',
            'desc.billing': 'વેચાણ અને ચુકવણી પ્રક્રિયા',
            'desc.reports': 'વ્યવસાય અંતર્દૃષ્ટિ જુઓ',
            'desc.mobilePOS': 'મોબાઇલ પોઇન્ટ ઓફ સેલ',
            'desc.settings': 'દુકાન કોન્ફિગરેશન સંચાલિત કરો',

            // Common
            'common.language': 'ભાષા',
            'common.selectLanguage': 'ભાષા પસંદ કરો',
            'common.goTo': 'જાઓ',
            'common.needHelp': 'શરૂઆત કરવામાં મદદ જોઈએ છે? અમારી વપરાશકર્તા માર્ગદર્શિકા જુઓ અથવા સહાયનો સંપર્ક કરો.',
            'common.email': 'ઈમેલ',
            'common.password': 'પાસવર્ડ',
            'common.confirmPassword': 'પાસવર્ડની પુષ્ટિ કરો',
            'common.fullName': 'પૂરું નામ',
            'common.shopName': 'દુકાનનું નામ',
            'common.login': 'લૉગિન',
            'common.signup': 'સાઇન અપ',
            'common.forgotPassword': 'પાસવર્ડ ભૂલી ગયા?',
            'common.alreadyHaveAccount': 'પહેલેથી એકાઉન્ટ છે?',
            'common.dontHaveAccount': 'એકાઉન્ટ નથી?',
            'common.signInHere': 'અહીં સાઇન ઇન કરો',
            'common.signUpHere': 'અહીં સાઇન અપ કરો',
            'common.createAccount': 'એકાઉન્ટ બનાવો',
            'common.signInToAccount': 'તમારા એકાઉન્ટમાં સાઇન ઇન કરો',
            'common.getStarted': 'તમારા વ્યવસાય વ્યવસ્થાપન સાથે શરૂઆત કરો',
            'common.welcomeBack': 'પાછા સ્વાગત છે',
            'common.joinUs': 'આજે જ અમારી સાથે જોડાઓ',

            // Descriptions
            'desc.chooseModule': 'તમારા વ્યવસાયના વ્યવસ્થાપન માટે મોડ્યુલ પસંદ કરો',

            // Auth
            'auth.loginTitle': 'તમારા એકાઉન્ટમાં સાઇન ઇન કરો',
            'auth.loginSubtitle': 'પાછા સ્વાગત છે! કૃપા કરીને તમારી વિગતો દાખલ કરો.',
            'auth.signupTitle': 'તમારું એકાઉન્ટ બનાવો',
            'auth.signupSubtitle': 'તમારા વ્યવસાય વ્યવસ્થાપન પ્લેટફોર્મ સાથે શરૂઆત કરો.',
            'auth.enterEmail': 'તમારો ઈમેલ દાખલ કરો',
            'auth.enterPassword': 'તમારો પાસવર્ડ દાખલ કરો',
            'auth.enterConfirmPassword': 'તમારા પાસવર્ડની પુષ્ટિ કરો',
            'auth.enterFullName': 'તમારું પૂરું નામ દાખલ કરો',
            'auth.enterShopName': 'તમારી દુકાનનું નામ દાખલ કરો'
        },
        mr: {
            // Navigation
            'nav.moduleSelection': 'मॉड्यूल निवड',
            'nav.dashboard': 'डॅशबोर्ड',
            'nav.products': 'उत्पादन व्यवस्थापन',
            'nav.inventory': 'इन्व्हेंटरी दृश्य',
            'nav.billing': 'बिलिंग सिस्टम',
            'nav.reports': 'अहवाल आणि विश्लेषण',
            'nav.mobilePOS': 'मोबाइल POS',
            'nav.settings': 'दुकान सेटिंग्स',
            'nav.logout': 'लॉगआउट',
            'nav.welcome': 'स्वागत',
            'nav.loggedInAs': 'म्हणून लॉग इन',
            'nav.navigation': 'नेव्हिगेशन',

            // Descriptions
            'desc.moduleSelection': 'काम करण्यासाठी मॉड्यूल निवडा',
            'desc.dashboard': 'व्यवसाय विहंगावलोकन पहा',
            'desc.products': 'तुमच्या उत्पादन कॅटलॉगचे व्यवस्थापन करा',
            'desc.inventory': 'स्टॉक पातळी ट्रॅक करा',
            'desc.billing': 'विक्री आणि पेमेंट प्रक्रिया',
            'desc.reports': 'व्यवसाय अंतर्दृष्टी पहा',
            'desc.mobilePOS': 'मोबाइल पॉइंट ऑफ सेल',
            'desc.settings': 'दुकान कॉन्फिगरेशन व्यवस्थापित करा',

            // Common
            'common.language': 'भाषा',
            'common.selectLanguage': 'भाषा निवडा',
            'common.goTo': 'जा',
            'common.needHelp': 'सुरुवात करण्यासाठी मदत हवी? आमची वापरकर्ता मार्गदर्शिका पहा किंवा समर्थनाशी संपर्क साधा.',
            'common.email': 'ईमेल',
            'common.password': 'पासवर्ड',
            'common.confirmPassword': 'पासवर्डची पुष्टी करा',
            'common.fullName': 'पूर्ण नाव',
            'common.shopName': 'दुकानाचे नाव',
            'common.login': 'लॉगिन',
            'common.signup': 'साइन अप',
            'common.forgotPassword': 'पासवर्ड विसरलात?',
            'common.alreadyHaveAccount': 'आधीच खाते आहे?',
            'common.dontHaveAccount': 'खाते नाही?',
            'common.signInHere': 'येथे साइन इन करा',
            'common.signUpHere': 'येथे साइन अप करा',
            'common.createAccount': 'खाते तयार करा',
            'common.signInToAccount': 'तुमच्या खात्यात साइन इन करा',
            'common.getStarted': 'तुमच्या व्यवसाय व्यवस्थापनासह सुरुवात करा',
            'common.welcomeBack': 'परत स्वागत आहे',
            'common.joinUs': 'आजच आमच्यात सामील व्हा',

            // Descriptions
            'desc.chooseModule': 'तुमच्या व्यवसायाच्या व्यवस्थापनासाठी मॉड्यूल निवडा',

            // Auth
            'auth.loginTitle': 'तुमच्या खात्यात साइन इन करा',
            'auth.loginSubtitle': 'परत स्वागत आहे! कृपया तुमचे तपशील प्रविष्ट करा.',
            'auth.signupTitle': 'तुमचे खाते तयार करा',
            'auth.signupSubtitle': 'तुमच्या व्यवसाय व्यवस्थापन प्लॅटफॉर्मसह सुरुवात करा.',
            'auth.enterEmail': 'तुमचा ईमेल प्रविष्ट करा',
            'auth.enterPassword': 'तुमचा पासवर्ड प्रविष्ट करा',
            'auth.enterConfirmPassword': 'तुमच्या पासवर्डची पुष्टी करा',
            'auth.enterFullName': 'तुमचे पूर्ण नाव प्रविष्ट करा',
            'auth.enterShopName': 'तुमच्या दुकानाचे नाव प्रविष्ट करा'
        },
        kn: {
            // Navigation
            'nav.moduleSelection': 'ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆ',
            'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            'nav.products': 'ಉತ್ಪಾದನ ನಿರ್ವಹಣೆ',
            'nav.inventory': 'ಇನ್ವೆಂಟರಿ ವೀಕ್ಷಣೆ',
            'nav.billing': 'ಬಿಲ್ಲಿಂಗ್ ಸಿಸ್ಟಂ',
            'nav.reports': 'ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ',
            'nav.mobilePOS': 'ಮೊಬೈಲ್ POS',
            'nav.settings': 'ಅಂಗಡಿ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
            'nav.logout': 'ಲಾಗ್‌ಔಟ್',
            'nav.welcome': 'ಸ್ವಾಗತ',
            'nav.loggedInAs': 'ಆಗಿ ಲಾಗ್ ಇನ್',
            'nav.navigation': 'ನ್ಯಾವಿಗೇಶನ್',

            // Descriptions
            'desc.moduleSelection': 'ಕೆಲಸ ಮಾಡಲು ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆಮಾಡಿ',
            'desc.dashboard': 'ವ್ಯಾಪಾರ ಅವಲೋಕನವನ್ನು ವೀಕ್ಷಿಸಿ',
            'desc.products': 'ನಿಮ್ಮ ಉತ್ಪಾದನ ಕ್ಯಾಟಲಾಗ್ ನಿರ್ವಹಿಸಿ',
            'desc.inventory': 'ಸ್ಟಾಕ್ ಮಟ್ಟಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
            'desc.billing': 'ಮಾರಾಟ ಮತ್ತು ಪಾವತಿ ಪ್ರಕ್ರಿಯೆ',
            'desc.reports': 'ವ್ಯಾಪಾರ ಒಳನೋಟಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
            'desc.mobilePOS': 'ಮೊಬೈಲ್ ಪಾಯಿಂಟ್ ಆಫ್ ಸೇಲ್',
            'desc.settings': 'ಅಂಗಡಿ ಕಾನ್ಫಿಗರೇಶನ್ ನಿರ್ವಹಿಸಿ',

            // Common
            'common.language': 'ಭಾಷೆ',
            'common.selectLanguage': 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
            'common.goTo': 'ಹೋಗಿ',
            'common.needHelp': 'ಪ್ರಾರಂಭಿಸಲು ಸಹಾಯ ಬೇಕೇ? ನಮ್ಮ ಬಳಕೆದಾರ ಮಾರ್ಗದರ್ಶಿ ನೋಡಿ ಅಥವಾ ಬೆಂಬಲವನ್ನು ಸಂಪರ್ಕಿಸಿ.',
            'common.email': 'ಇಮೇಲ್',
            'common.password': 'ಪಾಸ್‌ವರ್ಡ್',
            'common.confirmPassword': 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
            'common.fullName': 'ಪೂರ್ಣ ಹೆಸರು',
            'common.shopName': 'ಅಂಗಡಿಯ ಹೆಸರು',
            'common.login': 'ಲಾಗಿನ್',
            'common.signup': 'ಸೈನ್ ಅಪ್',
            'common.forgotPassword': 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿದ್ದೀರಾ?',
            'common.alreadyHaveAccount': 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
            'common.dontHaveAccount': 'ಖಾತೆ ಇಲ್ಲವೇ?',
            'common.signInHere': 'ಇಲ್ಲಿ ಸೈನ್ ಇನ್ ಮಾಡಿ',
            'common.signUpHere': 'ಇಲ್ಲಿ ಸೈನ್ ಅಪ್ ಮಾಡಿ',
            'common.createAccount': 'ಖಾತೆ ರಚಿಸಿ',
            'common.signInToAccount': 'ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
            'common.getStarted': 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ನಿರ್ವಹಣೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ',
            'common.welcomeBack': 'ಮತ್ತೆ ಸ್ವಾಗತ',
            'common.joinUs': 'ಇಂದೇ ನಮ್ಮೊಂದಿಗೆ ಸೇರಿ',

            // Descriptions
            'desc.chooseModule': 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ನಿರ್ವಹಣೆಗಾಗಿ ಮಾಡ್ಯೂಲ್ ಆಯ್ಕೆಮಾಡಿ',

            // Auth
            'auth.loginTitle': 'ನಿಮ್ಮ ಖಾತೆಗೆ ಸೈನ್ ಇನ್ ಮಾಡಿ',
            'auth.loginSubtitle': 'ಮತ್ತೆ ಸ್ವಾಗತ! ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
            'auth.signupTitle': 'ನಿಮ್ಮ ಖಾತೆ ರಚಿಸಿ',
            'auth.signupSubtitle': 'ನಿಮ್ಮ ವ್ಯಾಪಾರ ನಿರ್ವಹಣಾ ವೇದಿಕೆಯೊಂದಿಗೆ ಪ್ರಾರಂಭಿಸಿ.',
            'auth.enterEmail': 'ನಿಮ್ಮ ಇಮೇಲ್ ನಮೂದಿಸಿ',
            'auth.enterPassword': 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ',
            'auth.enterConfirmPassword': 'ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
            'auth.enterFullName': 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು ನಮೂದಿಸಿ',
            'auth.enterShopName': 'ನಿಮ್ಮ ಅಂಗಡಿಯ ಹೆಸರು ನಮೂದಿಸಿ'
        }
    };

    return translations[language]?.[key] || translations['en']?.[key] || key;
};