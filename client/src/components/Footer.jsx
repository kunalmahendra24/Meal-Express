import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UtensilsCrossed, Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
    const { settings, callOwner } = useApp();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <UtensilsCrossed className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold">
                                {settings.businessName || 'Meal Express'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Delicious homemade tiffin meals delivered to your doorstep. 
                            Fresh, healthy, and made with love.
                        </p>
                        <div className="flex space-x-4 mt-4">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/menu" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                                    Menu
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                                    My Orders
                                </Link>
                            </li>
                            <li>
                                <Link to="/profile" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                                    Profile
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            {settings.callOwnerEnabled && settings.ownerPhone && (
                                <li>
                                    <button
                                        onClick={callOwner}
                                        className="flex items-center space-x-2 text-gray-400 hover:text-orange-500 transition-colors text-sm"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>{settings.ownerPhone}</span>
                                    </button>
                                </li>
                            )}
                            <li className="flex items-center space-x-2 text-gray-400 text-sm">
                                <Mail className="w-4 h-4" />
                                <span>contact@mealexpress.com</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400 text-sm">
                                <MapPin className="w-4 h-4" />
                                <span>Mumbai, India</span>
                            </li>
                        </ul>
                    </div>

                    {/* Operating Hours */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Delivery Hours</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2 text-gray-400 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Mon - Sat: 11:00 AM - 9:00 PM</span>
                            </li>
                            <li className="flex items-center space-x-2 text-gray-400 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>Sunday: 12:00 PM - 8:00 PM</span>
                            </li>
                        </ul>
                        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-400">
                                Free delivery on orders above ₹{settings.freeDeliveryAbove || 500}
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-800 my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} {settings.businessName || 'Meal Express'}. All rights reserved.
                    </p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors text-sm">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
