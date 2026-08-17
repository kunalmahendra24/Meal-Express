import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { getKitchenId } from '../utils/kitchen';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, X, Leaf, Drumstick, Store, ChefHat, Star, Clock, Phone } from 'lucide-react';

const Menu = () => {
    const { API_URL } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const kitchenFilter = searchParams.get('kitchen') || 'all';

    const [meals, setMeals] = useState([]);
    const [kitchens, setKitchens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('');
    const [viewMode, setViewMode] = useState('kitchen'); // 'kitchen' or 'all'
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    // Group meals by the kitchen that cooks them
    const mealsByKitchen = useMemo(() => {
        const grouped = {};
        meals.forEach(meal => {
            const kitchenId = getKitchenId(meal) || 'unknown';
            const kitchen = typeof meal.kitchen === 'object' ? meal.kitchen : null;

            if (!grouped[kitchenId]) {
                grouped[kitchenId] = {
                    id: kitchenId,
                    name: kitchen?.name || 'Meal Express Kitchen',
                    phone: kitchen?.phone || null,
                    meals: [],
                    totalMeals: 0
                };
            }
            grouped[kitchenId].meals.push(meal);
            grouped[kitchenId].totalMeals++;
        });
        return Object.values(grouped);
    }, [meals]);

    const selectedKitchen = kitchens.find(k => k._id === kitchenFilter);

    // Call kitchen function
    const callKitchen = (phone, name) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            alert(`Phone number not available for ${name}.`);
        }
    };

    const selectKitchen = (kitchenId) => {
        const next = new URLSearchParams(searchParams);
        if (kitchenId === 'all') {
            next.delete('kitchen');
        } else {
            next.set('kitchen', kitchenId);
        }
        setSearchParams(next);
    };

    useEffect(() => {
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
        fetchKitchens();
    }, [API_URL]);

    useEffect(() => {
        fetchMeals();
    }, [category, sort, kitchenFilter]);

    const fetchMeals = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 12 };
            if (category !== 'all') params.category = category;
            if (sort) params.sort = sort;
            if (search) params.search = search;
            if (kitchenFilter !== 'all') params.kitchen = kitchenFilter;

            const response = await axios.get(`${API_URL}/api/meals`, { params });
            if (response.data.success) {
                setMeals(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Error fetching meals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMeals(1);
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('all');
        setSort('');
        selectKitchen('all');
    };

    const categories = [
        { value: 'all', label: 'All', icon: null },
        { value: 'veg', label: 'Vegetarian', icon: Leaf, color: 'text-green-600' },
        { value: 'non-veg', label: 'Non-Veg', icon: Drumstick, color: 'text-red-600' },
        { value: 'jain', label: 'Jain', icon: Leaf, color: 'text-yellow-600' }
    ];

    const sortOptions = [
        { value: '', label: 'Default' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Top Rated' },
        { value: 'name', label: 'Name: A-Z' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
                        {selectedKitchen ? selectedKitchen.name : 'Our Menu'}
                    </h1>
                    <p className="mt-2 text-orange-100 text-center">
                        {selectedKitchen
                            ? 'Browsing meals from this kitchen'
                            : 'Discover delicious homemade meals'}
                    </p>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
                        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search for meals..."
                                className="w-full px-5 py-4 pl-14 pr-28 text-gray-800 placeholder-gray-400 bg-white border-0 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
                            />
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                            >
                                Search
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Kitchen Filter */}
                {kitchens.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center space-x-2 mb-3">
                            <ChefHat className="w-5 h-5 text-orange-500" />
                            <h2 className="font-semibold text-gray-900">Browse by kitchen</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => selectKitchen('all')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    kitchenFilter === 'all'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border'
                                }`}
                            >
                                All Kitchens
                            </button>
                            {kitchens.map(kitchen => (
                                <button
                                    key={kitchen._id}
                                    onClick={() => selectKitchen(kitchen._id)}
                                    className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        kitchenFilter === kitchen._id
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border'
                                    }`}
                                >
                                    <ChefHat className="w-4 h-4" />
                                    <span>{kitchen.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`flex items-center space-x-1 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    category === cat.value
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white text-gray-600 hover:bg-orange-50 border'
                                }`}
                            >
                                {cat.icon && <cat.icon className={`w-4 h-4 ${category === cat.value ? 'text-white' : cat.color}`} />}
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Sort & Filter Toggle */}
                    <div className="flex items-center gap-2">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="px-4 py-2 rounded-lg border bg-white text-sm focus:ring-2 focus:ring-orange-300"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        
                        {(search || category !== 'all' || sort || kitchenFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                                <span className="text-sm">Clear</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* View Mode Toggle & Results Count */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <p className="text-gray-600">
                        Showing {meals.length} of {pagination.total} meals
                        {viewMode === 'kitchen' && mealsByKitchen.length > 0 && (
                            <span className="ml-2 text-orange-600">• {mealsByKitchen.length} kitchen{mealsByKitchen.length > 1 ? 's' : ''}</span>
                        )}
                    </p>
                    <div className="flex items-center bg-white rounded-lg border p-1">
                        <button
                            onClick={() => setViewMode('kitchen')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                viewMode === 'kitchen'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Store className="w-4 h-4" />
                            <span>By Kitchen</span>
                        </button>
                        <button
                            onClick={() => setViewMode('all')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                viewMode === 'all'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>All Items</span>
                        </button>
                    </div>
                </div>

                {/* Meals Display */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="large" />
                    </div>
                ) : meals.length > 0 ? (
                    <>
                        {viewMode === 'kitchen' ? (
                            /* Kitchen-wise View */
                            <div className="space-y-8">
                                {mealsByKitchen.map(kitchen => (
                                    <div key={kitchen.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                        {/* Kitchen Header */}
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 border-b">
                                            <div className="flex items-center justify-between flex-wrap gap-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                                                        <ChefHat className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">{kitchen.name}</h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                Verified Kitchen
                                                            </span>
                                                            <span className="flex items-center text-sm text-gray-500">
                                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                                                                4.5
                                                            </span>
                                                            <span className="flex items-center text-sm text-gray-500">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                30-45 min
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    {kitchenFilter !== kitchen.id && kitchen.id !== 'unknown' && (
                                                        <button
                                                            onClick={() => selectKitchen(kitchen.id)}
                                                            className="px-4 py-2.5 border border-orange-300 text-orange-600 rounded-xl hover:bg-orange-50 transition-all font-medium"
                                                        >
                                                            Only this kitchen
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => callKitchen(kitchen.phone, kitchen.name)}
                                                        className="flex items-center space-x-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                        <span className="font-medium">Call Kitchen</span>
                                                    </button>
                                                    <div className="text-right hidden sm:block">
                                                        <span className="text-2xl font-bold text-orange-600">{kitchen.totalMeals}</span>
                                                        <p className="text-sm text-gray-500">Items</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Kitchen's Meals */}
                                        <div className="p-5">
                                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {kitchen.meals.map(meal => (
                                                    <MealCard key={meal._id} meal={meal} compact />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* All Items View */
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {meals.map(meal => (
                                    <MealCard key={meal._id} meal={meal} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-12">
                                <button
                                    onClick={() => fetchMeals(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">
                                    Page {pagination.page} of {pagination.pages}
                                </span>
                                <button
                                    onClick={() => fetchMeals(pagination.page + 1)}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-4 py-2 rounded-lg border bg-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No meals found matching your criteria.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 text-orange-600 hover:text-orange-700 font-medium"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;
