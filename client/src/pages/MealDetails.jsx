import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { resolveImageUrl } from '../utils/imageUrl';
import { getKitchenId } from '../utils/kitchen';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Minus, Plus, ShoppingCart, Star, Clock, Users, Leaf, Drumstick, Calendar, ChefHat, Phone } from 'lucide-react';

const MealDetails = () => {
    const { id } = useParams();
    const { API_URL, addToCart } = useApp();
    const [meal, setMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        fetchMealDetails();
    }, [id]);

    const fetchMealDetails = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/meals/${id}`);
            if (response.data.success) {
                setMeal(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching meal details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (meal && meal.isAvailable) {
            addToCart(meal, quantity);
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'veg':
                return <Leaf className="w-5 h-5 text-green-600" />;
            case 'non-veg':
                return <Drumstick className="w-5 h-5 text-red-600" />;
            case 'jain':
                return <Leaf className="w-5 h-5 text-yellow-600" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    if (!meal) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-xl text-gray-500 mb-4">Meal not found</p>
                <Link to="/menu" className="text-orange-600 hover:text-orange-700 font-medium">
                    Back to Menu
                </Link>
            </div>
        );
    }

    const imageUrl = resolveImageUrl(meal.images?.[selectedImage], API_URL);
    const kitchen = typeof meal.kitchen === 'object' ? meal.kitchen : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    to="/menu"
                    className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Menu
                </Link>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
                        {/* Images Section */}
                        <div>
                            <div className="relative rounded-xl overflow-hidden aspect-square">
                                <img
                                    src={imageUrl}
                                    alt={meal.name}
                                    className="w-full h-full object-cover"
                                />
                                {!meal.isAvailable && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-semibold bg-red-500 px-4 py-2 rounded-lg">
                                            Currently Unavailable
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            {/* Thumbnail Images */}
                            {meal.images && meal.images.length > 1 && (
                                <div className="flex space-x-2 mt-4 overflow-x-auto">
                                    {meal.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                                                selectedImage === index ? 'border-orange-500' : 'border-transparent'
                                            }`}
                                        >
                                            <img
                                                src={resolveImageUrl(img, API_URL)}
                                                alt={`${meal.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                {getCategoryIcon(meal.category)}
                                <span className="text-sm font-medium capitalize text-gray-600">
                                    {meal.category}
                                </span>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900">{meal.name}</h1>

                            {meal.ratings?.count > 0 && (
                                <div className="flex items-center space-x-2 mt-2">
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                        <span className="ml-1 font-medium">{meal.ratings.average.toFixed(1)}</span>
                                    </div>
                                    <span className="text-gray-400">({meal.ratings.count} reviews)</span>
                                </div>
                            )}

                            {kitchen && (
                                <div className="mt-4 flex flex-wrap items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                        <ChefHat className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">Cooked by</p>
                                        <Link
                                            to={`/menu?kitchen=${getKitchenId(meal)}`}
                                            className="font-semibold text-gray-900 hover:text-orange-600"
                                        >
                                            {kitchen.name}
                                        </Link>
                                    </div>
                                    {kitchen.phone && (
                                        <a
                                            href={`tel:${kitchen.phone}`}
                                            className="ml-auto flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                                        >
                                            <Phone className="w-4 h-4" />
                                            <span>Call</span>
                                        </a>
                                    )}
                                </div>
                            )}

                            <p className="mt-4 text-gray-600">{meal.description}</p>

                            {/* Meal Info */}
                            <div className="flex flex-wrap gap-4 mt-6">
                                {meal.preparationTime && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Clock className="w-5 h-5" />
                                        <span>{meal.preparationTime} mins</span>
                                    </div>
                                )}
                                {meal.servingSize && (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                        <Users className="w-5 h-5" />
                                        <span>{meal.servingSize}</span>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            {meal.tags && meal.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {meal.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Pricing */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-3xl font-bold text-orange-600">₹{meal.price}</span>
                                    <span className="text-gray-500">per serving</span>
                                </div>

                                {/* Subscription Prices */}
                                {(meal.weeklyPrice || meal.monthlyPrice) && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            Subscription Plans
                                        </p>
                                        <div className="flex space-x-4">
                                            {meal.weeklyPrice && (
                                                <div className="px-3 py-2 bg-green-100 rounded-lg">
                                                    <p className="text-xs text-green-700">Weekly</p>
                                                    <p className="font-semibold text-green-800">₹{meal.weeklyPrice}/day</p>
                                                </div>
                                            )}
                                            {meal.monthlyPrice && (
                                                <div className="px-3 py-2 bg-blue-100 rounded-lg">
                                                    <p className="text-xs text-blue-700">Monthly</p>
                                                    <p className="font-semibold text-blue-800">₹{meal.monthlyPrice}/day</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                                <div className="flex items-center border rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 hover:bg-gray-100"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <span className="px-6 font-medium">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 hover:bg-gray-100"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!meal.isAvailable}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                                        meal.isAvailable
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    <span>Add to Cart - ₹{meal.price * quantity}</span>
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Nutrition Info */}
                    {meal.nutritionInfo && (meal.nutritionInfo.calories || meal.nutritionInfo.protein || meal.nutritionInfo.carbs) && (
                        <div className="border-t px-6 md:px-8 py-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Information</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {meal.nutritionInfo.calories && (
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">{meal.nutritionInfo.calories}</p>
                                        <p className="text-sm text-gray-500">Calories</p>
                                    </div>
                                )}
                                {meal.nutritionInfo.protein && (
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">{meal.nutritionInfo.protein}</p>
                                        <p className="text-sm text-gray-500">Protein</p>
                                    </div>
                                )}
                                {meal.nutritionInfo.carbs && (
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <p className="text-2xl font-bold text-orange-600">{meal.nutritionInfo.carbs}</p>
                                        <p className="text-sm text-gray-500">Carbs</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealDetails;
