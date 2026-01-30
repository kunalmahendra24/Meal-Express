import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Menu, X, ShoppingCart, User, LogOut, Home, UtensilsCrossed, ClipboardList, MessageCircle, Instagram, Twitter, Mail } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout, getCartItemsCount, settings } = useApp();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [connectMenuOpen, setConnectMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Social media links (test values - will be updated later)
    const socialLinks = {
        instagram: 'https://instagram.com/mealexpress',
        twitter: 'https://twitter.com/mealexpress',
        email: 'contact@mealexpress.com'
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setUserMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/menu', label: 'Menu', icon: UtensilsCrossed },
    ];

    const authLinks = isAuthenticated ? [
        { path: '/orders', label: 'My Orders', icon: ClipboardList },
    ] : [];

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <UtensilsCrossed className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-800">
                                {settings.businessName || 'Meal Express'}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {[...navLinks, ...authLinks].map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive(path)
                                        ? 'text-orange-600 bg-orange-50'
                                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                            </Link>
                        ))}

                        {/* Connect Us Button */}
                        <div className="relative">
                            <button
                                onClick={() => setConnectMenuOpen(!connectMenuOpen)}
                                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Connect Us</span>
                            </button>

                            {connectMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border z-50">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-semibold text-gray-800">Connect With Us</p>
                                        <p className="text-xs text-gray-500">Follow us on social media</p>
                                    </div>
                                    <a
                                        href={socialLinks.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setConnectMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center">
                                            <Instagram className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Instagram</p>
                                            <p className="text-xs text-gray-500">@mealexpress</p>
                                        </div>
                                    </a>
                                    <a
                                        href={socialLinks.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => setConnectMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                            <Twitter className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Twitter</p>
                                            <p className="text-xs text-gray-500">@mealexpress</p>
                                        </div>
                                    </a>
                                    <a
                                        href={`mailto:${socialLinks.email}`}
                                        onClick={() => setConnectMenuOpen(false)}
                                        className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Email</p>
                                            <p className="text-xs text-gray-500">{socialLinks.email}</p>
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {getCartItemsCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {getCartItemsCount()}
                                </span>
                            )}
                        </Link>

                        {/* Auth Section */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <span>{user?.name?.split(' ')[0]}</span>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                                        >
                                            <User className="w-4 h-4" />
                                            <span>Profile</span>
                                        </Link>
                                        <Link
                                            to="/orders"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                                        >
                                            <ClipboardList className="w-4 h-4" />
                                            <span>My Orders</span>
                                        </Link>
                                        {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50"
                                            >
                                                <ClipboardList className="w-4 h-4" />
                                                <span>Admin Panel</span>
                                            </Link>
                                        )}
                                        <hr className="my-2" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden space-x-2">
                        <Link to="/cart" className="relative p-2">
                            <ShoppingCart className="w-6 h-6 text-gray-600" />
                            {getCartItemsCount() > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {getCartItemsCount()}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-md text-gray-600 hover:text-orange-600"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-4 py-3 space-y-2">
                        {[...navLinks, ...authLinks].map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                                    isActive(path)
                                        ? 'text-orange-600 bg-orange-50'
                                        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                            </Link>
                        ))}

                        {/* Connect Us - Mobile */}
                        <div className="space-y-1">
                            <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase">Connect With Us</p>
                            <a
                                href={socialLinks.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-pink-600 hover:bg-pink-50"
                            >
                                <Instagram className="w-4 h-4" />
                                <span>Instagram</span>
                            </a>
                            <a
                                href={socialLinks.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-blue-500 hover:bg-blue-50"
                            >
                                <Twitter className="w-4 h-4" />
                                <span>Twitter</span>
                            </a>
                            <a
                                href={`mailto:${socialLinks.email}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-500 hover:bg-red-50"
                            >
                                <Mail className="w-4 h-4" />
                                <span>Email Us</span>
                            </a>
                        </div>

                        <hr className="my-2" />

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/profile"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </Link>
                                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                    <Link
                                        to="/admin"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                                    >
                                        <ClipboardList className="w-4 h-4" />
                                        <span>Admin Panel</span>
                                    </Link>
                                )}
                                <button
                                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-md text-sm font-medium text-center"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
