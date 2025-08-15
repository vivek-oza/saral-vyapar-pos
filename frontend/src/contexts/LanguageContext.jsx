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
            'common.signInHere': 'Login here',
            'common.signUpHere': 'Sign up here',
            'common.createAccount': 'Create Account',
            'common.signInToAccount': 'Sign in to your account',
            'common.getStarted': 'Get started with your business management',
            'common.welcomeBack': 'Welcome back',
            'common.joinUs': 'Join us today',

            // Descriptions
            'desc.chooseModule': 'Choose a module to get started with managing your business',

            // Auth
            'auth.loginTitle': 'Login',
            'auth.loginSubtitle': 'Welcome back! Please enter your details.',
            'auth.signupTitle': 'Sign up',
            'auth.signupSubtitle': 'Get started with your business management platform.',
            'auth.enterEmail': 'Enter your email',
            'auth.enterPassword': 'Enter your password',
            'auth.enterConfirmPassword': 'Confirm your password',
            'auth.enterFullName': 'Enter your full name',
            'auth.enterShopName': 'Enter your shop name',

            // Products
            'products.title': 'Product Management',
            'products.backToModules': 'Back to Modules',
            'products.addProduct': 'Add Product',
            'products.manageCategories': 'Manage Categories',
            'products.searchPlaceholder': 'Search products by name...',
            'products.filters': 'Filters',
            'products.clearFilters': 'Clear',
            'products.noProductsFound': 'No products found',
            'products.noProductsMessage': 'Get started by adding your first product to the catalog.',
            'products.showingResults': 'Showing {start}-{end} of {total} products',
            'products.page': 'Page',
            'products.of': 'of',
            'products.previous': 'Previous',
            'products.next': 'Next',
            'products.loadingProducts': 'Loading products...',

            // Product Form
            'productForm.addTitle': 'Add New Product',
            'productForm.editTitle': 'Edit Product',
            'productForm.productName': 'Product Name',
            'productForm.productNameRequired': 'Product name is required',
            'productForm.productNameLength': 'Product name must be 2-100 characters',
            'productForm.productNamePlaceholder': 'Enter product name',
            'productForm.description': 'Description',
            'productForm.descriptionPlaceholder': 'Enter product description',
            'productForm.descriptionLength': 'Description must be less than 500 characters',
            'productForm.basePrice': 'Base Price (₹)',
            'productForm.basePriceRequired': 'Base price is required',
            'productForm.basePricePositive': 'Base price must be a positive number',
            'productForm.profitMargin': 'Profit Margin (₹)',
            'productForm.profitMarginPositive': 'Margin must be a non-negative number',
            'productForm.sellingPrice': 'Selling Price: ₹{price}',
            'productForm.category': 'Category',
            'productForm.selectCategory': 'Select a category',
            'productForm.orTypeCategory': 'Or type new category',
            'productForm.categoryHelp': 'Select from existing categories or type a new one',
            'productForm.initialStock': 'Initial Stock',
            'productForm.stockPositive': 'Stock must be a non-negative integer',
            'productForm.sku': 'SKU (Stock Keeping Unit)',
            'productForm.skuPlaceholder': 'Enter unique SKU',
            'productForm.skuLength': 'SKU must be less than 50 characters',
            'productForm.addButton': 'Add Product',
            'productForm.updateButton': 'Update Product',
            'productForm.saving': 'Saving...',
            'productForm.cancel': 'Cancel',

            // Product Card
            'productCard.sku': 'SKU: {sku}',
            'productCard.basePrice': 'Base Price:',
            'productCard.margin': 'Margin:',
            'productCard.sellingPrice': 'Selling Price:',
            'productCard.stock': 'Stock:',
            'productCard.category': 'Category:',
            'productCard.inStock': 'In Stock',
            'productCard.lowStock': 'Low Stock',
            'productCard.outOfStock': 'Out of Stock',
            'productCard.deleteConfirm': 'Are you sure you want to delete this product?',

            // Product Search & Filters
            'productSearch.allCategories': 'All Categories',
            'productSearch.allStockLevels': 'All Stock Levels',
            'productSearch.inStock': 'In Stock (>10)',
            'productSearch.lowStock': 'Low Stock (1-10)',
            'productSearch.outOfStock': 'Out of Stock (0)',
            'productSearch.sortBy': 'Sort By',
            'productSearch.sortName': 'Name (A-Z)',
            'productSearch.sortPrice': 'Price (Low to High)',
            'productSearch.sortStock': 'Stock (High to Low)',
            'productSearch.sortDate': 'Date Added (Newest)',

            // Category Manager
            'categories.title': 'Manage Categories',
            'categories.addCategory': 'Add Category',
            'categories.addTitle': 'Add New Category',
            'categories.editTitle': 'Edit Category',
            'categories.noCategories': 'No categories yet',
            'categories.noCategoriesMessage': 'Create your first category to organize your products.',
            'categories.loadingCategories': 'Loading categories...',
            'categories.categoryName': 'Category Name',
            'categories.categoryNameRequired': 'Category name is required',
            'categories.categoryNameLength': 'Category name must be 2-50 characters',
            'categories.categoryNamePlaceholder': 'Enter category name',
            'categories.categoryDescription': 'Description',
            'categories.categoryDescriptionPlaceholder': 'Enter category description (optional)',
            'categories.categoryDescriptionLength': 'Description must be less than 200 characters',
            'categories.categoryColor': 'Color',
            'categories.categoryColorValid': 'Please select a valid color',
            'categories.addButton': 'Add Category',
            'categories.updateButton': 'Update Category',
            'categories.saving': 'Saving...',
            'categories.cancel': 'Cancel',
            'categories.deleteConfirm': 'Are you sure you want to delete this category? This action cannot be undone.',
            'categories.deleteInUse': 'Cannot delete category that is being used by products. Please reassign products first.',
            'categories.nameExists': 'Category name already exists'
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
            'auth.enterShopName': 'अपनी दुकान का नाम दर्ज करें',

            // Products
            'products.title': 'उत्पाद प्रबंधन',
            'products.backToModules': 'मॉड्यूल पर वापस',
            'products.addProduct': 'उत्पाद जोड़ें',
            'products.manageCategories': 'श्रेणियां प्रबंधित करें',
            'products.searchPlaceholder': 'नाम से उत्पाद खोजें...',
            'products.filters': 'फिल्टर',
            'products.clearFilters': 'साफ़ करें',
            'products.noProductsFound': 'कोई उत्पाद नहीं मिला',
            'products.noProductsMessage': 'अपना पहला उत्पाद कैटलॉग में जोड़कर शुरुआत करें।',
            'products.showingResults': '{total} में से {start}-{end} उत्पाद दिखाए जा रहे हैं',
            'products.page': 'पृष्ठ',
            'products.of': 'का',
            'products.previous': 'पिछला',
            'products.next': 'अगला',
            'products.loadingProducts': 'उत्पाद लोड हो रहे हैं...',

            // Product Form
            'productForm.addTitle': 'नया उत्पाद जोड़ें',
            'productForm.editTitle': 'उत्पाद संपादित करें',
            'productForm.productName': 'उत्पाद का नाम',
            'productForm.productNameRequired': 'उत्पाद का नाम आवश्यक है',
            'productForm.productNameLength': 'उत्पाद का नाम 2-100 अक्षरों का होना चाहिए',
            'productForm.productNamePlaceholder': 'उत्पाद का नाम दर्ज करें',
            'productForm.description': 'विवरण',
            'productForm.descriptionPlaceholder': 'उत्पाद का विवरण दर्ज करें',
            'productForm.descriptionLength': 'विवरण 500 अक्षरों से कम होना चाहिए',
            'productForm.basePrice': 'मूल मूल्य (₹)',
            'productForm.basePriceRequired': 'मूल मूल्य आवश्यक है',
            'productForm.basePricePositive': 'मूल मूल्य एक सकारात्मक संख्या होनी चाहिए',
            'productForm.profitMargin': 'लाभ मार्जिन (₹)',
            'productForm.profitMarginPositive': 'मार्जिन एक गैर-नकारात्मक संख्या होनी चाहिए',
            'productForm.sellingPrice': 'विक्रय मूल्य: ₹{price}',
            'productForm.category': 'श्रेणी',
            'productForm.selectCategory': 'एक श्रेणी चुनें',
            'productForm.orTypeCategory': 'या नई श्रेणी टाइप करें',
            'productForm.categoryHelp': 'मौजूदा श्रेणियों से चुनें या नई टाइप करें',
            'productForm.initialStock': 'प्रारंभिक स्टॉक',
            'productForm.stockPositive': 'स्टॉक एक गैर-नकारात्मक पूर्णांक होना चाहिए',
            'productForm.sku': 'SKU (स्टॉक कीपिंग यूनिट)',
            'productForm.skuPlaceholder': 'अनूठा SKU दर्ज करें',
            'productForm.skuLength': 'SKU 50 अक्षरों से कम होना चाहिए',
            'productForm.addButton': 'उत्पाद जोड़ें',
            'productForm.updateButton': 'उत्पाद अपडेट करें',
            'productForm.saving': 'सहेजा जा रहा है...',
            'productForm.cancel': 'रद्द करें',

            // Product Card
            'productCard.sku': 'SKU: {sku}',
            'productCard.basePrice': 'मूल मूल्य:',
            'productCard.margin': 'मार्जिन:',
            'productCard.sellingPrice': 'विक्रय मूल्य:',
            'productCard.stock': 'स्टॉक:',
            'productCard.category': 'श्रेणी:',
            'productCard.inStock': 'स्टॉक में',
            'productCard.lowStock': 'कम स्टॉक',
            'productCard.outOfStock': 'स्टॉक खत्म',
            'productCard.deleteConfirm': 'क्या आप वाकई इस उत्पाद को हटाना चाहते हैं?',

            // Product Search & Filters
            'productSearch.allCategories': 'सभी श्रेणियां',
            'productSearch.allStockLevels': 'सभी स्टॉक स्तर',
            'productSearch.inStock': 'स्टॉक में (>10)',
            'productSearch.lowStock': 'कम स्टॉक (1-10)',
            'productSearch.outOfStock': 'स्टॉक खत्म (0)',
            'productSearch.sortBy': 'इसके अनुसार क्रमबद्ध करें',
            'productSearch.sortName': 'नाम (A-Z)',
            'productSearch.sortPrice': 'मूल्य (कम से अधिक)',
            'productSearch.sortStock': 'स्टॉक (अधिक से कम)',
            'productSearch.sortDate': 'जोड़ने की तारीख (नवीनतम)',

            // Category Manager
            'categories.title': 'श्रेणियां प्रबंधित करें',
            'categories.addCategory': 'श्रेणी जोड़ें',
            'categories.addTitle': 'नई श्रेणी जोड़ें',
            'categories.editTitle': 'श्रेणी संपादित करें',
            'categories.noCategories': 'अभी तक कोई श्रेणी नहीं',
            'categories.noCategoriesMessage': 'अपने उत्पादों को व्यवस्थित करने के लिए अपनी पहली श्रेणी बनाएं।',
            'categories.loadingCategories': 'श्रेणियां लोड हो रही हैं...',
            'categories.categoryName': 'श्रेणी का नाम',
            'categories.categoryNameRequired': 'श्रेणी का नाम आवश्यक है',
            'categories.categoryNameLength': 'श्रेणी का नाम 2-50 अक्षरों का होना चाहिए',
            'categories.categoryNamePlaceholder': 'श्रेणी का नाम दर्ज करें',
            'categories.categoryDescription': 'विवरण',
            'categories.categoryDescriptionPlaceholder': 'श्रेणी का विवरण दर्ज करें (वैकल्पिक)',
            'categories.categoryDescriptionLength': 'विवरण 200 अक्षरों से कम होना चाहिए',
            'categories.categoryColor': 'रंग',
            'categories.categoryColorValid': 'कृपया एक वैध रंग चुनें',
            'categories.addButton': 'श्रेणी जोड़ें',
            'categories.updateButton': 'श्रेणी अपडेट करें',
            'categories.saving': 'सहेजा जा रहा है...',
            'categories.cancel': 'रद्द करें',
            'categories.deleteConfirm': 'क्या आप वाकई इस श्रेणी को हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।',
            'categories.deleteInUse': 'उत्पादों द्वारा उपयोग की जा रही श्रेणी को हटाया नहीं जा सकता। कृपया पहले उत्पादों को पुनः असाइन करें।',
            'categories.nameExists': 'श्रेणी का नाम पहले से मौजूद है'
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
            'auth.enterShopName': 'તમારી દુકાનનું નામ દાખલ કરો',

            // Products
            'products.title': 'ઉત્પાદન વ્યવસ્થાપન',
            'products.backToModules': 'મોડ્યુલ પર પાછા',
            'products.addProduct': 'ઉત્પાદન ઉમેરો',
            'products.manageCategories': 'કેટેગરીઓ સંચાલિત કરો',
            'products.searchPlaceholder': 'નામથી ઉત્પાદન શોધો...',
            'products.filters': 'ફિલ્ટર',
            'products.clearFilters': 'સાફ કરો',
            'products.noProductsFound': 'કોઈ ઉત્પાદન મળ્યું નથી',
            'products.noProductsMessage': 'કેટલોગમાં તમારું પહેલું ઉત્પાદન ઉમેરીને શરૂઆત કરો.',
            'products.showingResults': '{total} માંથી {start}-{end} ઉત્પાદનો બતાવાઈ રહ્યા છે',
            'products.page': 'પૃષ્ઠ',
            'products.of': 'નું',
            'products.previous': 'પહેલાનું',
            'products.next': 'આગળનું',
            'products.loadingProducts': 'ઉત્પાદનો લોડ થઈ રહ્યા છે...',

            // Product Form
            'productForm.addTitle': 'નવું ઉત્પાદન ઉમેરો',
            'productForm.editTitle': 'ઉત્પાદન સંપાદિત કરો',
            'productForm.productName': 'ઉત્પાદનનું નામ',
            'productForm.productNameRequired': 'ઉત્પાદનનું નામ આવશ્યક છે',
            'productForm.productNameLength': 'ઉત્પાદનનું નામ 2-100 અક્ષરોનું હોવું જોઈએ',
            'productForm.productNamePlaceholder': 'ઉત્પાદનનું નામ દાખલ કરો',
            'productForm.description': 'વર્ણન',
            'productForm.descriptionPlaceholder': 'ઉત્પાદનનું વર્ણન દાખલ કરો',
            'productForm.descriptionLength': 'વર્ણન 500 અક્ષરોથી ઓછું હોવું જોઈએ',
            'productForm.basePrice': 'મૂળ કિંમત (₹)',
            'productForm.basePriceRequired': 'મૂળ કિંમત આવશ્યક છે',
            'productForm.basePricePositive': 'મૂળ કિંમત સકારાત્મક સંખ્યા હોવી જોઈએ',
            'productForm.profitMargin': 'નફાનું માર્જિન (₹)',
            'productForm.profitMarginPositive': 'માર્જિન બિન-નકારાત્મક સંખ્યા હોવું જોઈએ',
            'productForm.sellingPrice': 'વેચાણ કિંમત: ₹{price}',
            'productForm.category': 'કેટેગરી',
            'productForm.selectCategory': 'કેટેગરી પસંદ કરો',
            'productForm.orTypeCategory': 'અથવા નવી કેટેગરી ટાઈપ કરો',
            'productForm.categoryHelp': 'હાલની કેટેગરીઓમાંથી પસંદ કરો અથવા નવી ટાઈપ કરો',
            'productForm.initialStock': 'પ્રારંભિક સ્ટોક',
            'productForm.stockPositive': 'સ્ટોક બિન-નકારાત્મક પૂર્ણાંક હોવો જોઈએ',
            'productForm.sku': 'SKU (સ્ટોક કીપિંગ યુનિટ)',
            'productForm.skuPlaceholder': 'અનન્ય SKU દાખલ કરો',
            'productForm.skuLength': 'SKU 50 અક્ષરોથી ઓછું હોવું જોઈએ',
            'productForm.addButton': 'ઉત્પાદન ઉમેરો',
            'productForm.updateButton': 'ઉત્પાદન અપડેટ કરો',
            'productForm.saving': 'સેવ થઈ રહ્યું છે...',
            'productForm.cancel': 'રદ કરો',

            // Product Card
            'productCard.sku': 'SKU: {sku}',
            'productCard.basePrice': 'મૂળ કિંમત:',
            'productCard.margin': 'માર્જિન:',
            'productCard.sellingPrice': 'વેચાણ કિંમત:',
            'productCard.stock': 'સ્ટોક:',
            'productCard.category': 'કેટેગરી:',
            'productCard.inStock': 'સ્ટોકમાં',
            'productCard.lowStock': 'ઓછો સ્ટોક',
            'productCard.outOfStock': 'સ્ટોક ખતમ',
            'productCard.deleteConfirm': 'શું તમે ખરેખર આ ઉત્પાદન ડિલીટ કરવા માંગો છો?',

            // Product Search & Filters
            'productSearch.allCategories': 'બધી કેટેગરીઓ',
            'productSearch.allStockLevels': 'બધા સ્ટોક લેવલ',
            'productSearch.inStock': 'સ્ટોકમાં (>10)',
            'productSearch.lowStock': 'ઓછો સ્ટોક (1-10)',
            'productSearch.outOfStock': 'સ્ટોક ખતમ (0)',
            'productSearch.sortBy': 'આના પ્રમાણે ક્રમબદ્ધ કરો',
            'productSearch.sortName': 'નામ (A-Z)',
            'productSearch.sortPrice': 'કિંમત (ઓછીથી વધુ)',
            'productSearch.sortStock': 'સ્ટોક (વધુથી ઓછું)',
            'productSearch.sortDate': 'ઉમેરવાની તારીખ (નવીનતમ)',

            // Category Manager
            'categories.title': 'કેટેગરીઓ સંચાલિત કરો',
            'categories.addCategory': 'કેટેગરી ઉમેરો',
            'categories.addTitle': 'નવી કેટેગરી ઉમેરો',
            'categories.editTitle': 'કેટેગરી સંપાદિત કરો',
            'categories.noCategories': 'હજુ સુધી કોઈ કેટેગરી નથી',
            'categories.noCategoriesMessage': 'તમારા ઉત્પાદનોને વ્યવસ્થિત કરવા માટે તમારી પહેલી કેટેગરી બનાવો.',
            'categories.loadingCategories': 'કેટેગરીઓ લોડ થઈ રહી છે...',
            'categories.categoryName': 'કેટેગરીનું નામ',
            'categories.categoryNameRequired': 'કેટેગરીનું નામ આવશ્યક છે',
            'categories.categoryNameLength': 'કેટેગરીનું નામ 2-50 અક્ષરોનું હોવું જોઈએ',
            'categories.categoryNamePlaceholder': 'કેટેગરીનું નામ દાખલ કરો',
            'categories.categoryDescription': 'વર્ણન',
            'categories.categoryDescriptionPlaceholder': 'કેટેગરીનું વર્ણન દાખલ કરો (વૈકલ્પિક)',
            'categories.categoryDescriptionLength': 'વર્ણન 200 અક્ષરોથી ઓછું હોવું જોઈએ',
            'categories.categoryColor': 'રંગ',
            'categories.categoryColorValid': 'કૃપા કરીને માન્ય રંગ પસંદ કરો',
            'categories.addButton': 'કેટેગરી ઉમેરો',
            'categories.updateButton': 'કેટેગરી અપડેટ કરો',
            'categories.saving': 'સેવ થઈ રહ્યું છે...',
            'categories.cancel': 'રદ કરો',
            'categories.deleteConfirm': 'શું તમે ખરેખર આ કેટેગરી ડિલીટ કરવા માંગો છો? આ ક્રિયા પૂર્વવત કરી શકાશે નહીં.',
            'categories.deleteInUse': 'ઉત્પાદનો દ્વારા ઉપયોગમાં લેવાતી કેટેગરી ડિલીટ કરી શકાતી નથી. કૃપા કરીને પહેલા ઉત્પાદનોને ફરીથી અસાઇન કરો.',
            'categories.nameExists': 'કેટેગરીનું નામ પહેલેથી અસ્તિત્વમાં છે'
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
            'auth.enterShopName': 'तुमच्या दुकानाचे नाव प्रविष्ट करा',

            // Products
            'products.title': 'उत्पादन व्यवस्थापन',
            'products.backToModules': 'मॉड्यूलवर परत',
            'products.addProduct': 'उत्पादन जोडा',
            'products.manageCategories': 'श्रेणी व्यवस्थापित करा',
            'products.searchPlaceholder': 'नावाने उत्पादन शोधा...',
            'products.filters': 'फिल्टर',
            'products.clearFilters': 'साफ करा',
            'products.noProductsFound': 'कोणतेही उत्पादन सापडले नाही',
            'products.noProductsMessage': 'कॅटलॉगमध्ये तुमचे पहिले उत्पादन जोडून सुरुवात करा.',
            'products.showingResults': '{total} पैकी {start}-{end} उत्पादने दाखवली जात आहेत',
            'products.page': 'पान',
            'products.of': 'चे',
            'products.previous': 'मागील',
            'products.next': 'पुढील',
            'products.loadingProducts': 'उत्पादने लोड होत आहेत...',

            // Product Form
            'productForm.addTitle': 'नवीन उत्पादन जोडा',
            'productForm.editTitle': 'उत्पादन संपादित करा',
            'productForm.productName': 'उत्पादनाचे नाव',
            'productForm.productNameRequired': 'उत्पादनाचे नाव आवश्यक आहे',
            'productForm.productNameLength': 'उत्पादनाचे नाव 2-100 अक्षरांचे असावे',
            'productForm.productNamePlaceholder': 'उत्पादनाचे नाव प्रविष्ट करा',
            'productForm.description': 'वर्णन',
            'productForm.descriptionPlaceholder': 'उत्पादनाचे वर्णन प्रविष्ट करा',
            'productForm.descriptionLength': 'वर्णन 500 अक्षरांपेक्षा कमी असावे',
            'productForm.basePrice': 'मूळ किंमत (₹)',
            'productForm.basePriceRequired': 'मूळ किंमत आवश्यक आहे',
            'productForm.basePricePositive': 'मूळ किंमत सकारात्मक संख्या असावी',
            'productForm.profitMargin': 'नफा मार्जिन (₹)',
            'productForm.profitMarginPositive': 'मार्जिन गैर-नकारात्मक संख्या असावी',
            'productForm.sellingPrice': 'विक्री किंमत: ₹{price}',
            'productForm.category': 'श्रेणी',
            'productForm.selectCategory': 'श्रेणी निवडा',
            'productForm.orTypeCategory': 'किंवा नवीन श्रेणी टाइप करा',
            'productForm.categoryHelp': 'अस्तित्वात असलेल्या श्रेणींमधून निवडा किंवा नवीन टाइप करा',
            'productForm.initialStock': 'प्रारंभिक स्टॉक',
            'productForm.stockPositive': 'स्टॉक गैर-नकारात्मक पूर्णांक असावा',
            'productForm.sku': 'SKU (स्टॉक कीपिंग युनिट)',
            'productForm.skuPlaceholder': 'अनन्य SKU प्रविष्ट करा',
            'productForm.skuLength': 'SKU 50 अक्षरांपेक्षा कमी असावा',
            'productForm.addButton': 'उत्पादन जोडा',
            'productForm.updateButton': 'उत्पादन अपडेट करा',
            'productForm.saving': 'सेव्ह होत आहे...',
            'productForm.cancel': 'रद्द करा',

            // Product Card
            'productCard.sku': 'SKU: {sku}',
            'productCard.basePrice': 'मूळ किंमत:',
            'productCard.margin': 'मार्जिन:',
            'productCard.sellingPrice': 'विक्री किंमत:',
            'productCard.stock': 'स्टॉक:',
            'productCard.category': 'श्रेणी:',
            'productCard.inStock': 'स्टॉकमध्ये',
            'productCard.lowStock': 'कमी स्टॉक',
            'productCard.outOfStock': 'स्टॉक संपला',
            'productCard.deleteConfirm': 'तुम्हाला खरोखर हे उत्पादन हटवायचे आहे का?',

            // Product Search & Filters
            'productSearch.allCategories': 'सर्व श्रेणी',
            'productSearch.allStockLevels': 'सर्व स्टॉक पातळी',
            'productSearch.inStock': 'स्टॉकमध्ये (>10)',
            'productSearch.lowStock': 'कमी स्टॉक (1-10)',
            'productSearch.outOfStock': 'स्टॉक संपला (0)',
            'productSearch.sortBy': 'यानुसार क्रमवारी लावा',
            'productSearch.sortName': 'नाव (A-Z)',
            'productSearch.sortPrice': 'किंमत (कमी ते जास्त)',
            'productSearch.sortStock': 'स्टॉक (जास्त ते कमी)',
            'productSearch.sortDate': 'जोडण्याची तारीख (नवीनतम)',

            // Category Manager
            'categories.title': 'श्रेणी व्यवस्थापित करा',
            'categories.addCategory': 'श्रेणी जोडा',
            'categories.addTitle': 'नवीन श्रेणी जोडा',
            'categories.editTitle': 'श्रेणी संपादित करा',
            'categories.noCategories': 'अजून कोणतीही श्रेणी नाही',
            'categories.noCategoriesMessage': 'तुमची उत्पादने व्यवस्थित करण्यासाठी तुमची पहिली श्रेणी तयार करा.',
            'categories.loadingCategories': 'श्रेणी लोड होत आहेत...',
            'categories.categoryName': 'श्रेणीचे नाव',
            'categories.categoryNameRequired': 'श्रेणीचे नाव आवश्यक आहे',
            'categories.categoryNameLength': 'श्रेणीचे नाव 2-50 अक्षरांचे असावे',
            'categories.categoryNamePlaceholder': 'श्रेणीचे नाव प्रविष्ट करा',
            'categories.categoryDescription': 'वर्णन',
            'categories.categoryDescriptionPlaceholder': 'श्रेणीचे वर्णन प्रविष्ट करा (पर्यायी)',
            'categories.categoryDescriptionLength': 'वर्णन 200 अक्षरांपेक्षा कमी असावे',
            'categories.categoryColor': 'रंग',
            'categories.categoryColorValid': 'कृपया वैध रंग निवडा',
            'categories.addButton': 'श्रेणी जोडा',
            'categories.updateButton': 'श्रेणी अपडेट करा',
            'categories.saving': 'सेव्ह होत आहे...',
            'categories.cancel': 'रद्द करा',
            'categories.deleteConfirm': 'तुम्हाला खरोखर ही श्रेणी हटवायची आहे का? ही क्रिया पूर्ववत केली जाऊ शकत नाही.',
            'categories.deleteInUse': 'उत्पादनांद्वारे वापरली जाणारी श्रेणी हटवली जाऊ शकत नाही. कृपया प्रथम उत्पादने पुन्हा नियुक्त करा.',
            'categories.nameExists': 'श्रेणीचे नाव आधीच अस्तित्वात आहे'
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
            'auth.enterShopName': 'ನಿಮ್ಮ ಅಂಗಡಿಯ ಹೆಸರು ನಮೂದಿಸಿ',

            // Products
            'products.title': 'ಉತ್ಪಾದನ ನಿರ್ವಹಣೆ',
            'products.backToModules': 'ಮಾಡ್ಯೂಲ್‌ಗಳಿಗೆ ಹಿಂತಿರುಗಿ',
            'products.addProduct': 'ಉತ್ಪಾದನ ಸೇರಿಸಿ',
            'products.manageCategories': 'ವರ್ಗಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
            'products.searchPlaceholder': 'ಹೆಸರಿನಿಂದ ಉತ್ಪಾದನಗಳನ್ನು ಹುಡುಕಿ...',
            'products.filters': 'ಫಿಲ್ಟರ್‌ಗಳು',
            'products.clearFilters': 'ತೆರವುಗೊಳಿಸಿ',
            'products.noProductsFound': 'ಯಾವುದೇ ಉತ್ಪಾದನಗಳು ಕಂಡುಬಂದಿಲ್ಲ',
            'products.noProductsMessage': 'ಕ್ಯಾಟಲಾಗ್‌ಗೆ ನಿಮ್ಮ ಮೊದಲ ಉತ್ಪಾದನವನ್ನು ಸೇರಿಸುವ ಮೂಲಕ ಪ್ರಾರಂಭಿಸಿ.',
            'products.showingResults': '{total} ರಲ್ಲಿ {start}-{end} ಉತ್ಪಾದನಗಳನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ',
            'products.page': 'ಪುಟ',
            'products.of': 'ರ',
            'products.previous': 'ಹಿಂದಿನ',
            'products.next': 'ಮುಂದಿನ',
            'products.loadingProducts': 'ಉತ್ಪಾದನಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',

            // Product Form
            'productForm.addTitle': 'ಹೊಸ ಉತ್ಪಾದನ ಸೇರಿಸಿ',
            'productForm.editTitle': 'ಉತ್ಪಾದನವನ್ನು ಸಂಪಾದಿಸಿ',
            'productForm.productName': 'ಉತ್ಪಾದನದ ಹೆಸರು',
            'productForm.productNameRequired': 'ಉತ್ಪಾದನದ ಹೆಸರು ಅಗತ್ಯವಿದೆ',
            'productForm.productNameLength': 'ಉತ್ಪಾದನದ ಹೆಸರು 2-100 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು',
            'productForm.productNamePlaceholder': 'ಉತ್ಪಾದನದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
            'productForm.description': 'ವಿವರಣೆ',
            'productForm.descriptionPlaceholder': 'ಉತ್ಪಾದನದ ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ',
            'productForm.descriptionLength': 'ವಿವರಣೆ 500 ಅಕ್ಷರಗಳಿಗಿಂತ ಕಡಿಮೆಯಾಗಿರಬೇಕು',
            'productForm.basePrice': 'ಮೂಲ ಬೆಲೆ (₹)',
            'productForm.basePriceRequired': 'ಮೂಲ ಬೆಲೆ ಅಗತ್ಯವಿದೆ',
            'productForm.basePricePositive': 'ಮೂಲ ಬೆಲೆ ಧನಾತ್ಮಕ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು',
            'productForm.profitMargin': 'ಲಾಭದ ಅಂತರ (₹)',
            'productForm.profitMarginPositive': 'ಅಂತರವು ಋಣಾತ್ಮಕವಲ್ಲದ ಸಂಖ್ಯೆಯಾಗಿರಬೇಕು',
            'productForm.sellingPrice': 'ಮಾರಾಟ ಬೆಲೆ: ₹{price}',
            'productForm.category': 'ವರ್ಗ',
            'productForm.selectCategory': 'ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            'productForm.orTypeCategory': 'ಅಥವಾ ಹೊಸ ವರ್ಗವನ್ನು ಟೈಪ್ ಮಾಡಿ',
            'productForm.categoryHelp': 'ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ವರ್ಗಗಳಿಂದ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಹೊಸದನ್ನು ಟೈಪ್ ಮಾಡಿ',
            'productForm.initialStock': 'ಆರಂಭಿಕ ಸ್ಟಾಕ್',
            'productForm.stockPositive': 'ಸ್ಟಾಕ್ ಋಣಾತ್ಮಕವಲ್ಲದ ಪೂರ್ಣಾಂಕವಾಗಿರಬೇಕು',
            'productForm.sku': 'SKU (ಸ್ಟಾಕ್ ಕೀಪಿಂಗ್ ಯೂನಿಟ್)',
            'productForm.skuPlaceholder': 'ಅನನ್ಯ SKU ನಮೂದಿಸಿ',
            'productForm.skuLength': 'SKU 50 ಅಕ್ಷರಗಳಿಗಿಂತ ಕಡಿಮೆಯಾಗಿರಬೇಕು',
            'productForm.addButton': 'ಉತ್ಪಾದನ ಸೇರಿಸಿ',
            'productForm.updateButton': 'ಉತ್ಪಾದನವನ್ನು ನವೀಕರಿಸಿ',
            'productForm.saving': 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
            'productForm.cancel': 'ರದ್ದುಮಾಡಿ',

            // Product Card
            'productCard.sku': 'SKU: {sku}',
            'productCard.basePrice': 'ಮೂಲ ಬೆಲೆ:',
            'productCard.margin': 'ಅಂತರ:',
            'productCard.sellingPrice': 'ಮಾರಾಟ ಬೆಲೆ:',
            'productCard.stock': 'ಸ್ಟಾಕ್:',
            'productCard.category': 'ವರ್ಗ:',
            'productCard.inStock': 'ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ',
            'productCard.lowStock': 'ಕಡಿಮೆ ಸ್ಟಾಕ್',
            'productCard.outOfStock': 'ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ',
            'productCard.deleteConfirm': 'ನೀವು ನಿಜವಾಗಿಯೂ ಈ ಉತ್ಪಾದನವನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?',

            // Product Search & Filters
            'productSearch.allCategories': 'ಎಲ್ಲಾ ವರ್ಗಗಳು',
            'productSearch.allStockLevels': 'ಎಲ್ಲಾ ಸ್ಟಾಕ್ ಮಟ್ಟಗಳು',
            'productSearch.inStock': 'ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ (>10)',
            'productSearch.lowStock': 'ಕಡಿಮೆ ಸ್ಟಾಕ್ (1-10)',
            'productSearch.outOfStock': 'ಸ್ಟಾಕ್ ಮುಗಿದಿದೆ (0)',
            'productSearch.sortBy': 'ಇದರ ಪ್ರಕಾರ ವಿಂಗಡಿಸಿ',
            'productSearch.sortName': 'ಹೆಸರು (A-Z)',
            'productSearch.sortPrice': 'ಬೆಲೆ (ಕಡಿಮೆಯಿಂದ ಹೆಚ್ಚಿಗೆ)',
            'productSearch.sortStock': 'ಸ್ಟಾಕ್ (ಹೆಚ್ಚಿನಿಂದ ಕಡಿಮೆಗೆ)',
            'productSearch.sortDate': 'ಸೇರಿಸಿದ ದಿನಾಂಕ (ಹೊಸದು)',

            // Category Manager
            'categories.title': 'ವರ್ಗಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
            'categories.addCategory': 'ವರ್ಗ ಸೇರಿಸಿ',
            'categories.addTitle': 'ಹೊಸ ವರ್ಗ ಸೇರಿಸಿ',
            'categories.editTitle': 'ವರ್ಗವನ್ನು ಸಂಪಾದಿಸಿ',
            'categories.noCategories': 'ಇನ್ನೂ ಯಾವುದೇ ವರ್ಗಗಳಿಲ್ಲ',
            'categories.noCategoriesMessage': 'ನಿಮ್ಮ ಉತ್ಪಾದನಗಳನ್ನು ಸಂಘಟಿಸಲು ನಿಮ್ಮ ಮೊದಲ ವರ್ಗವನ್ನು ರಚಿಸಿ.',
            'categories.loadingCategories': 'ವರ್ಗಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...',
            'categories.categoryName': 'ವರ್ಗದ ಹೆಸರು',
            'categories.categoryNameRequired': 'ವರ್ಗದ ಹೆಸರು ಅಗತ್ಯವಿದೆ',
            'categories.categoryNameLength': 'ವರ್ಗದ ಹೆಸರು 2-50 ಅಕ್ಷರಗಳಾಗಿರಬೇಕು',
            'categories.categoryNamePlaceholder': 'ವರ್ಗದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ',
            'categories.categoryDescription': 'ವಿವರಣೆ',
            'categories.categoryDescriptionPlaceholder': 'ವರ್ಗದ ವಿವರಣೆಯನ್ನು ನಮೂದಿಸಿ (ಐಚ್ಛಿಕ)',
            'categories.categoryDescriptionLength': 'ವಿವರಣೆ 200 ಅಕ್ಷರಗಳಿಗಿಂತ ಕಡಿಮೆಯಾಗಿರಬೇಕು',
            'categories.categoryColor': 'ಬಣ್ಣ',
            'categories.categoryColorValid': 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ ಬಣ್ಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
            'categories.addButton': 'ವರ್ಗ ಸೇರಿಸಿ',
            'categories.updateButton': 'ವರ್ಗವನ್ನು ನವೀಕರಿಸಿ',
            'categories.saving': 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
            'categories.cancel': 'ರದ್ದುಮಾಡಿ',
            'categories.deleteConfirm': 'ನೀವು ನಿಜವಾಗಿಯೂ ಈ ವರ್ಗವನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ? ಈ ಕ್ರಿಯೆಯನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗುವುದಿಲ್ಲ.',
            'categories.deleteInUse': 'ಉತ್ಪಾದನಗಳಿಂದ ಬಳಸಲ್ಪಡುತ್ತಿರುವ ವರ್ಗವನ್ನು ಅಳಿಸಲಾಗುವುದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೊದಲು ಉತ್ಪಾದನಗಳನ್ನು ಮರುನಿಯೋಜಿಸಿ.',
            'categories.nameExists': 'ವರ್ಗದ ಹೆಸರು ಈಗಾಗಲೇ ಅಸ್ತಿತ್ವದಲ್ಲಿದೆ'
        }
    };

    return translations[language]?.[key] || translations['en']?.[key] || key;
};