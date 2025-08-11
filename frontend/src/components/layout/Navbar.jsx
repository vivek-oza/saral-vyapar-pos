import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
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
    Settings
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    const menuItems = [
        {
            id: 'modules',
            title: 'Module Selection',
            icon: Grid3X3,
            path: `/${user?.shop?.username}/modules`,
            description: 'Choose a module to work with'
        },
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: LayoutDashboard,
            path: `/${user?.shop?.username}/dashboard`,
            description: 'View business overview'
        },
        {
            id: 'products',
            title: 'Product Management',
            icon: Package,
            path: `/${user?.shop?.username}/products`,
            description: 'Manage your product catalog'
        },
        {
            id: 'inventory',
            title: 'Inventory View',
            icon: Warehouse,
            path: `/${user?.shop?.username}/inventory`,
            description: 'Track stock levels'
        },
        {
            id: 'billing',
            title: 'Billing System',
            icon: Receipt,
            path: `/${user?.shop?.username}/billing`,
            description: 'Process sales and payments'
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            icon: BarChart3,
            path: `/${user?.shop?.username}/reports`,
            description: 'View business insights'
        },
        {
            id: 'mobile-pos',
            title: 'Mobile POS',
            icon: Smartphone,
            path: `/${user?.shop?.username}/mobile-pos`,
            description: 'Mobile point of sale'
        },
        {
            id: 'settings',
            title: 'Shop Settings',
            icon: Settings,
            path: `/${user?.shop?.username}/settings`,
            description: 'Manage shop configuration'
        }
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
                                    src="/saral_logo_favicon.png"
                                    alt="Saral Vyapar POS"
                                    className="h-8 w-auto mr-2"
                                />
                                <h1 className="text-xl font-semibold hidden sm:block">Saral Vyapar POS</h1>
                                <h1 className="text-lg font-semibold sm:hidden">Saral</h1>
                            </div>
                        </div>

                        {/* Right side - Shop name and logout */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
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
                            </Button>
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
                                <h2 className="font-semibold text-lg">Navigation</h2>
                                <p className="text-sm text-muted-foreground">{user?.shop?.name}</p>
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
                                        <IconComponent className="h-5 w-5 flex-shrink-0" />
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
                                Logged in as {user?.email}
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                                className="gap-2 w-full sm:w-auto"
                            >
                                <LogOut className="h-4 w-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;