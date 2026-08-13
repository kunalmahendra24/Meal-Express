import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import MealCard from '../components/MealCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Filter, X, Leaf, Drumstick, Store, ChefHat, Star, Clock, Phone } from 'lucide-react';

const Menu = () => {
    const { API_URL } = useApp();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState('');
    const [viewMode, setViewMode] = useState('vendor'); // 'vendor' or 'all'
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

    // Group meals by admin/vendor
    const mealsByVendor = useMemo(() => {
        const grouped = {};
        meals.forEach(meal => {
            const vendorId = meal.createdBy?._id || 'unknown';
            const vendorName = meal.createdBy?.name || 'Meal Express Kitchen';
            const vendorRole = meal.createdBy?.role || 'admin';
            const vendorPhone = meal.createdBy?.phone || null;
            const vendorEmail = meal.createdBy?.email || null;
            
            if (!grouped[vendorId]) {
                grouped[vendorId] = {
                    id: vendorId,
                    name: vendorName,
                    role: vendorRole,
                    phone: vendorPhone,
                    email: vendorEmail,
                    meals: [],
                    totalMeals: 0
                };
            }
            grouped[vendorId].meals.push(meal);
            grouped[vendorId].totalMeals++;
        });
        return Object.values(grouped);
    }, [meals]);

    // Call admin function
    const callAdmin = (phone, name) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            alert(`Phone number not available for ${name}. Please contact through email.`);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, [category, sort]);

    const fetchMeals = async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 12 };
            if (category !== 'all') params.category = category;
            if (sort) params.sort = sort;
            if (search) params.search = search;

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
                    <h1 className="text-3xl md:text-4xl font-bold text-white text-center">Our Menu</h1>
                    <p className="mt-2 text-orange-100 text-center">Discover delicious homemade meals</p>
                    
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
                        
                        {(search || category !== 'all' || sort) && (
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
                        {viewMode === 'vendor' && mealsByVendor.length > 0 && (
                            <span className="ml-2 text-orange-600">• {mealsByVendor.length} vendor{mealsByVendor.length > 1 ? 's' : ''}</span>
                        )}
                    </p>
                    <div className="flex items-center bg-white rounded-lg border p-1">
                        <button
                            onClick={() => setViewMode('vendor')}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                viewMode === 'vendor'
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <Store className="w-4 h-4" />
                            <span>By Vendor</span>
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
                        {viewMode === 'vendor' ? (
                            /* Vendor-wise View */
                            <div className="space-y-8">
                                {mealsByVendor.map(vendor => (
                                    <div key={vendor.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                        {/* Vendor Header */}
                                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-5 border-b">
                                            <div className="flex items-center justify-between flex-wrap gap-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                                                        <ChefHat className="w-7 h-7 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">{vendor.name}'s Kitchen</h3>
                                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                vendor.role === 'super_admin' 
                                                                    ? 'bg-purple-100 text-purple-700' 
                                                                    : 'bg-blue-100 text-blue-700'
                                                            }`}>
                                                                {vendor.role === 'super_admin' ? 'Premium Chef' : 'Verified Chef'}
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
                                                    {/* Call Admin Button */}
                                                    <button
                                                        onClick={() => callAdmin(vendor.phone, vendor.name)}
                                                        className="flex items-center space-x-2 px-4 py-2.5 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                        <span className="font-medium">Call {vendor.name.split(' ')[0]}</span>
                                                    </button>
                                                    <div className="text-right hidden sm:block">
                                                        <span className="text-2xl font-bold text-orange-600">{vendor.totalMeals}</span>
                                                        <p className="text-sm text-gray-500">Items</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Vendor's Meals */}
                                        <div className="p-5">
                                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                {vendor.meals.map(meal => (
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
