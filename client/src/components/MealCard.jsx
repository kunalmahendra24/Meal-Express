import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Star, Leaf, Drumstick, Plus } from 'lucide-react';

const MealCard = ({ meal, compact = false }) => {
    const { addToCart } = useApp();
    const { API_URL } = useApp();

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'veg':
                return <Leaf className="w-4 h-4 text-green-600" />;
            case 'non-veg':
                return <Drumstick className="w-4 h-4 text-red-600" />;
            case 'jain':
                return <Leaf className="w-4 h-4 text-yellow-600" />;
            default:
                return null;
        }
    };

    const getCategoryBadgeColor = (category) => {
        switch (category) {
            case 'veg':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'non-veg':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'jain':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const imageUrl = meal.images?.[0] 
        ? (meal.images[0].startsWith('http') ? meal.images[0] : `${API_URL}${meal.images[0]}`)
        : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

    // Compact view for vendor cards
    if (compact) {
        return (
            <div className="bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-all duration-200 group border border-gray-100">
                <Link to={`/meal/${meal._id}`} className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                            src={imageUrl}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                        />
                        {!meal.isAvailable && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-[10px] font-medium">Unavailable</span>
                            </div>
                        )}
                        <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center ${
                            meal.category === 'veg' ? 'bg-green-500' : 
                            meal.category === 'non-veg' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                            {meal.category === 'veg' || meal.category === 'jain' ? 
                                <Leaf className="w-3 h-3 text-white" /> : 
                                <Drumstick className="w-3 h-3 text-white" />
                            }
                        </div>
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                            <h4 className="font-semibold text-gray-800 text-sm line-clamp-1 group-hover:text-orange-600 transition-colors">
                                {meal.name}
                            </h4>
                            <p className="text-gray-500 text-xs line-clamp-1 mt-0.5">
                                {meal.description}
                            </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-base font-bold text-orange-600">₹{meal.price}</span>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (meal.isAvailable) {
                                        addToCart(meal);
                                    }
                                }}
                                disabled={!meal.isAvailable}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                    meal.isAvailable
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </Link>
            </div>
        );
    }

    // Regular full card view
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <Link to={`/meal/${meal._id}`}>
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!meal.isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold bg-red-500 px-3 py-1 rounded">
                                Currently Unavailable
                            </span>
                        </div>
                    )}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 border ${getCategoryBadgeColor(meal.category)}`}>
                        {getCategoryIcon(meal.category)}
                        <span className="capitalize">{meal.category}</span>
                    </div>
                    {meal.weeklyPrice && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Subscription Available
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4">
                <Link to={`/meal/${meal._id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors line-clamp-1">
                        {meal.name}
                    </h3>
                </Link>
                
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {meal.description}
                </p>

                {meal.ratings?.count > 0 && (
                    <div className="flex items-center space-x-1 mt-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{meal.ratings.average.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm">({meal.ratings.count})</span>
                    </div>
                )}

                <div className="flex items-center justify-between mt-4">
                    <div>
                        <span className="text-2xl font-bold text-orange-600">₹{meal.price}</span>
                        {meal.servingSize && (
                            <span className="text-gray-400 text-sm ml-1">/ {meal.servingSize}</span>
                        )}
                    </div>
                    
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (meal.isAvailable) {
                                addToCart(meal);
                            }
                        }}
                        disabled={!meal.isAvailable}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                            meal.isAvailable
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MealCard;
