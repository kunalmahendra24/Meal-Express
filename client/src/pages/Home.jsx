import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ChefHat, Truck, Clock, Heart, ArrowRight, Star, Utensils } from 'lucide-react';

const Home = () => {
    const { API_URL, settings } = useApp();
    const [featuredMeals, setFeaturedMeals] = useState([]);
    const [kitchens, setKitchens] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedMeals();
        fetchKitchens();
    }, []);

    const fetchFeaturedMeals = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/meals/featured`);
            if (response.data.success) {
                setFeaturedMeals(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching featured meals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKitchens = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/kitchens`);
            if (response.data.success) {
                setKitchens(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching kitchens:', error);
        }
    };

    const features = [
        {
            icon: ChefHat,
            title: 'Homemade Quality',
            description: 'Fresh meals prepared daily with authentic recipes and love'
        },
        {
            icon: Truck,
            title: 'Fast Delivery',
            description: 'Get your meals delivered hot and fresh to your doorstep'
        },
        {
            icon: Clock,
            title: 'Flexible Plans',
            description: 'Choose one-time orders or subscribe for weekly/monthly plans'
        },
        {
            icon: Heart,
            title: 'Healthy Options',
            description: 'Veg, Non-veg, and Jain options to suit your preferences'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmOTczMTYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <Utensils className="w-4 h-4 mr-2" />
                                Homemade Tiffin Service
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Delicious <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Homemade</span> Meals Delivered
                            </h1>
                            <p className="mt-6 text-lg text-gray-600 max-w-xl">
                                Skip the cooking, not the taste! Fresh, healthy, and delicious tiffin meals prepared daily and delivered right to your doorstep.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <Link
                                    to="/menu"
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
                                >
                                    Explore Menu
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                                <Link
                                    to="/menu"
                                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-orange-500 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all"
                                >
                                    View Our Chefs
                                </Link>
                            </div>
                            <div className="mt-8 flex items-center justify-center md:justify-start space-x-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">500+</p>
                                    <p className="text-sm text-gray-500">Happy Customers</p>
                                </div>
                                <div className="h-10 w-px bg-gray-300"></div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">50+</p>
                                    <p className="text-sm text-gray-500">Meal Options</p>
                                </div>
                                <div className="h-10 w-px bg-gray-300"></div>
                                <div className="flex items-center">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <p className="text-2xl font-bold text-gray-900 ml-1">4.8</p>
                                    <p className="text-sm text-gray-500 ml-1">Rating</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative z-10">
                                <img
                                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"
                                    alt="Delicious meal"
                                    className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-50"></div>
                            <div className="absolute -top-6 -right-6 w-40 h-40 bg-red-200 rounded-full blur-3xl opacity-50"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Why Choose {settings.businessName}?</h2>
                        <p className="mt-4 text-gray-600">Experience the comfort of homemade food without the hassle</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-orange-50 transition-colors">
                                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white mb-4">
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                <p className="mt-2 text-gray-600 text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Kitchens Section */}
            {kitchens.length > 0 && (
                <section className="py-16 bg-white border-t">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Our Kitchens</h2>
                                <p className="mt-2 text-gray-600">Order from a kitchen near you — one kitchen per order</p>
                            </div>
                            <Link
                                to="/menu"
                                className="hidden sm:inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                            >
                                Browse All
                                <ArrowRight className="ml-1 w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {kitchens.map(kitchen => (
                                <Link
                                    key={kitchen._id}
                                    to={`/menu?kitchen=${kitchen._id}`}
                                    className="flex items-center space-x-4 p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                                >
                                    <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                        <ChefHat className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{kitchen.name}</h3>
                                        <p className="text-sm text-gray-500">View menu</p>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Meals Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Popular Meals</h2>
                            <p className="mt-2 text-gray-600">Our most loved dishes by customers</p>
                        </div>
                        <Link
                            to="/menu"
                            className="hidden sm:inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                        >
                            View All
                            <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="large" />
                        </div>
                    ) : featuredMeals.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredMeals.map(meal => (
                                <MealCard key={meal._id} meal={meal} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No featured meals available at the moment.</p>
                        </div>
                    )}

                    <div className="text-center mt-8 sm:hidden">
                        <Link
                            to="/menu"
                            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                        >
                            View All Meals
                            <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Subscription CTA */}
            <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white">Subscribe & Save</h2>
                    <p className="mt-4 text-orange-100 max-w-2xl mx-auto">
                        Get up to 20% off with our weekly and monthly subscription plans. 
                        Enjoy hassle-free daily meals with flexible delivery schedules.
                    </p>
                    <Link
                        to="/menu"
                        className="inline-flex items-center mt-8 px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-all"
                    >
                        Explore Subscription Plans
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </section>

        </div>
    );
};

export default Home;
