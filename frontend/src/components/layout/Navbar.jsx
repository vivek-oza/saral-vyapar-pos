import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import { filterByBusinessType, normalizeBusinessTypeForDisplay } from '../../utils/businessTypeUtils';
import {
    LogOut,
    Menu,
    X,
    Package,
    Warehouse,
    Receipt,
    BarChart3,
    Smartphone,
    LayoutDashboard,
    Grid3X3,
    Settings,
    User
} from 'lucide-react';
import RotatingText from '../ui/RotatingText';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        logout();
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        closeMenu();
    };

    const allMenuItems = [
        {
            id: 'modules',
            title: t('nav.moduleSelection'),
            icon: Grid3X3,
            path: `/${user?.shop?.username}/modules`,
            description: t('desc.moduleSelection'),
            businessTypes: ['Freelancer or Service', 'Retail']
        },
        // {
        //     id: 'dashboard',
        //     title: t('nav.dashboard'),
        //     icon: LayoutDashboard,
        //     path: `/${user?.shop?.username}/dashboard`,
        //     description: t('desc.dashboard'),
        //     businessTypes: ['Freelancer or Service', 'Retail']
        // },
        {
            id: 'products',
            title: t('nav.products'),
            // icon: Package,
            path: `/${user?.shop?.username}/products`,
            description: t('desc.products'),
            businessTypes: ['Retail']
        },
        {
            id: 'inventory',
            title: t('nav.inventory'),
            // icon: Warehouse,
            path: `/${user?.shop?.username}/inventory`,
            description: t('desc.inventory'),
            businessTypes: ['Retail']
        },
        {
            id: 'billing',
            title: t('nav.billing'),
            // icon: Receipt,
            path: `/${user?.shop?.username}/billing`,
            description: t('desc.billing'),
            businessTypes: ['Freelancer or Service', 'Retail']
        },
        {
            id: 'reports',
            title: t('nav.reports'),
            // icon: BarChart3,
            path: `/${user?.shop?.username}/reports`,
            description: t('desc.reports'),
            businessTypes: ['Freelancer or Service', 'Retail']
        },
        {
            id: 'mobile-pos',
            title: t('nav.mobilePOS'),
            // icon: Smartphone,
            path: `/${user?.shop?.username}/mobile-pos`,
            description: t('desc.mobilePOS'),
            businessTypes: ['Retail']
        },
        {
            id: 'settings',
            title: t('nav.settings'),
            // icon: Settings,
            path: `/${user?.shop?.username}/settings`,
            description: t('desc.settings'),
            businessTypes: ['Freelancer or Service', 'Retail']
        }
    ];

    // Filter menu items based on business type with backward compatibility
    const businessType = user?.shop?.business_type;
    const menuItems = filterByBusinessType(allMenuItems, businessType);
    // Language texts with colors for rotating display
    const languageTexts = [
        'Language',  // English
        'भाषा',      // Hindi
        'ભાષા',      // Gujarati
        'भाषा',      // Marathi
        'ಭಾಷೆ'       // Kannada
    ];

    const isCurrentPath = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Left side - Hamburger menu and Logo */}
                        <div className="flex items-center space-x-4">
                            {/* Hamburger Menu Button */}
                            <Button
                                onClick={toggleMenu}
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </Button>

                            {/* Logo */}
                            <div className="flex items-center">
                                <img
                                    src="\public\saral_logo_favicon.png"
                                    alt="Saral Vyapar"
                                    className="h-8 w-auto mr-2"
                                />
                                <h1 className="text-xl font-semibold hidden sm:block">Saral Vyapar</h1>
                                <h1 className="text-lg font-semibold sm:hidden">Saral</h1>
                            </div>
                        </div>

                        {/* Right side - Language switcher and user dropdown */}
                        <div className="flex items-center space-x-8">
                            {/* Language Switcher */}
                            {/* <div className="flex flex-row-reverse p-1 h-12 bg-gray-100 rounded-full justify-center items-center">
                                <LanguageSwitcher />
                                <RotatingText
                                    texts={languageTexts}
                                    rotationInterval={4000}
                                    splitBy="characters"
                                    staggerDuration={0.01}
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
                            </div> */}
                            {/* <div className="text-right hidden sm:block">
                                <div className="text-sm font-medium">{user?.shop?.name || 'Shop'}</div>
                                <div className="text-xs text-muted-foreground">{user?.email}</div>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button> */}
                            {/* Dropdown Avatar */}
                            <Button
                                onClick={handleDropdownToggle}
                                // variant="outline"
                                size="sm"
                                className="h-12 w-12 bg-gray-100 hover:bg-gray-200 rounded-full"
                                aria-label="Toggle dropdown"
                            >
                                <User className="h-5 w-5 text-black" />
                            </Button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute border flex flex-col space-y-4 top-14 right-4 z-50 mt-2 w-48 rounded-md bg-card p-2 shadow-md">
                                    <div
                                        className="text-sm font-medium">
                                        {/* {t('nav.welcome')}, */}
                                        {user?.email}{' '}
                                        {user?.shop?.name ? `${user?.shop?.name}` : ''}
                                    </div>
                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 w-full sm:w-auto"
                                    >
                                        {/* <LogOut className="h-4 w-4" /> */}
                                        {t('nav.logout')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hamburger Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={closeMenu} />
            )}

            {/* Hamburger Menu Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-card border-r z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Menu Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-3">
                            <img
                                src="/saral_logo_favicon.png"
                                alt="Saral Vyapar POS"
                                className="h-8 w-auto"
                            />
                            <div>
                                <h2 className="font-semibold text-lg">{t('nav.navigation')}</h2>
                                <p className="text-sm text-muted-foreground">{user?.shop?.name}</p>
                                {user?.shop?.business_type && (
                                    <p className="text-xs text-blue-600 font-medium">{normalizeBusinessTypeForDisplay(user.shop.business_type)} Business</p>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={closeMenu}
                            variant="ghost"
                            size="sm"
                            className="p-2"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {menuItems.map((item) => {
                                const IconComponent = item.icon;
                                const isActive = isCurrentPath(item.path);

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                            }`}
                                    >
                                        {/* <IconComponent className="h-5 w-5 flex-shrink-0" /> */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{item.title}</div>
                                            <div className={`text-sm truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                                                }`}>
                                                {item.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>


                    {/* Menu Footer */}
                    <div className="p-4 border-t">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-sm text-muted-foreground truncate">
                                {t('nav.loggedInAs')} {user?.email}
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="gap-2 w-full sm:w-auto"
                            >
                                {/* <LogOut className="h-4 w-4" /> */}
                                {t('nav.logout')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;