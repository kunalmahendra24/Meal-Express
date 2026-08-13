import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Upload, X, Leaf, Drumstick, User, Clock } from 'lucide-react';

const MealsManagement = () => {
    const { meals, fetchMeals, createMeal, updateMeal, deleteMeal, toggleMealAvailability, uploadImage, loading } = useAdmin();
    const { API_URL } = useApp();
    
    const [showModal, setShowModal] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'veg',
        images: [],
        preparationTime: '',
        servingSize: '1 person',
        tags: '',
        weeklyPrice: '',
        monthlyPrice: '',
        isAvailable: true
    });
    const [uploading, setUploading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, meal: null });

    useEffect(() => {
        fetchMeals({ search, category: categoryFilter !== 'all' ? categoryFilter : undefined });
    }, [fetchMeals, categoryFilter]);

    useEffect(() => {
        if (!showModal) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.lenis?.stop?.();

        return () => {
            document.body.style.overflow = previousOverflow;
            window.lenis?.start?.();
        };
    }, [showModal]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMeals({ search, category: categoryFilter !== 'all' ? categoryFilter : undefined });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'veg',
            images: [],
            preparationTime: '',
            servingSize: '1 person',
            tags: '',
            weeklyPrice: '',
            monthlyPrice: '',
            isAvailable: true
        });
        setEditingMeal(null);
    };

    const openModal = (meal = null) => {
        if (meal) {
            setEditingMeal(meal);
            setFormData({
                name: meal.name,
                description: meal.description,
                price: meal.price,
                category: meal.category,
                images: meal.images || [],
                preparationTime: meal.preparationTime || '',
                servingSize: meal.servingSize || '1 person',
                tags: meal.tags?.join(', ') || '',
                weeklyPrice: meal.weeklyPrice || '',
                monthlyPrice: meal.monthlyPrice || '',
                isAvailable: meal.isAvailable
            });
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const result = await uploadImage(file);
        if (result.success) {
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, result.url]
            }));
        }
        setUploading(false);
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const mealData = {
            ...formData,
            price: parseFloat(formData.price),
            preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
            weeklyPrice: formData.weeklyPrice ? parseFloat(formData.weeklyPrice) : undefined,
            monthlyPrice: formData.monthlyPrice ? parseFloat(formData.monthlyPrice) : undefined,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        };

        let result;
        if (editingMeal) {
            result = await updateMeal(editingMeal._id, mealData);
        } else {
            result = await createMeal(mealData);
        }

        if (result.success) {
            closeModal();
        }
    };

    const handleDelete = (meal) => {
        setDeleteConfirm({ show: true, meal });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.meal) {
            await deleteMeal(deleteConfirm.meal._id);
            setDeleteConfirm({ show: false, meal: null });
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm({ show: false, meal: null });
    };

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Meals Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your menu items</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Meal</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search meals..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                            />
                        </div>
                    </form>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                    >
                        <option value="all">All Categories</option>
                        <option value="veg">Vegetarian</option>
                        <option value="non-veg">Non-Veg</option>
                        <option value="jain">Jain</option>
                    </select>
                </div>
            </div>

            {/* Meals Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="large" />
                </div>
            ) : meals.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500">No meals found. Add your first meal!</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {meals.map(meal => (
                        <div key={meal._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="relative h-40">
                                <img
                                    src={meal.images?.[0] ? (meal.images[0].startsWith('http') ? meal.images[0] : `${API_URL}${meal.images[0]}`) : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                                    alt={meal.name}
                                    className="w-full h-full object-cover"
                                />
                                {!meal.isAvailable && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <span className="text-white font-medium bg-red-500 px-3 py-1 rounded">Unavailable</span>
                                    </div>
                                )}
                                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-xs">
                                    {getCategoryIcon(meal.category)}
                                    <span className="capitalize">{meal.category}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900">{meal.name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mt-1">{meal.description}</p>
                                <p className="text-orange-600 font-bold mt-2">₹{meal.price}</p>
                                
                                {/* Admin Attribution */}
                                {meal.createdBy && (
                                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                                            <User className="w-3 h-3" />
                                            <span>Added by: <span className="font-medium text-gray-800">{meal.createdBy.name}</span></span>
                                            {meal.createdBy.role && (
                                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                                    meal.createdBy.role === 'super_admin' 
                                                        ? 'bg-purple-100 text-purple-700' 
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {meal.createdBy.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                                </span>
                                            )}
                                        </div>
                                        {meal.updatedBy && meal.updatedBy._id !== meal.createdBy._id && (
                                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Updated by: {meal.updatedBy.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                    <button
                                        onClick={() => toggleMealAvailability(meal._id)}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                            meal.isAvailable
                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {meal.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        <span>{meal.isAvailable ? 'Available' : 'Hidden'}</span>
                                    </button>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openModal(meal)}
                                            className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium"
                                            title="Edit meal"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(meal)}
                                            className="flex items-center space-x-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium"
                                            title="Delete meal"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 overflow-y-auto overscroll-contain"
                    data-lenis-prevent
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
                        <div className="bg-white rounded-xl max-w-2xl w-full my-4 shadow-xl">
                            <div className="flex items-center justify-between p-4 border-b">
                                <h2 className="text-lg font-semibold">
                                    {editingMeal ? 'Edit Meal' : 'Add New Meal'}
                                </h2>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    >
                                        <option value="veg">Vegetarian</option>
                                        <option value="non-veg">Non-Veg</option>
                                        <option value="jain">Jain</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Price/day</label>
                                    <input
                                        type="number"
                                        value={formData.weeklyPrice}
                                        onChange={(e) => setFormData({ ...formData, weeklyPrice: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price/day</label>
                                    <input
                                        type="number"
                                        value={formData.monthlyPrice}
                                        onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (mins)</label>
                                    <input
                                        type="number"
                                        value={formData.preparationTime}
                                        onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Serving Size</label>
                                    <input
                                        type="text"
                                        value={formData.servingSize}
                                        onChange={(e) => setFormData({ ...formData, servingSize: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-300"
                                    placeholder="spicy, healthy, popular"
                                />
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                                            <img
                                                src={img.startsWith('http') ? img : `${API_URL}${img}`}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-orange-500">
                                        {uploading ? (
                                            <LoadingSpinner size="small" />
                                        ) : (
                                            <Upload className="w-6 h-6 text-gray-400" />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                    className="mr-2 rounded text-orange-500"
                                />
                                <label htmlFor="isAvailable" className="text-sm text-gray-700">Available for ordering</label>
                            </div>

                            <div className="flex space-x-4 pt-4 border-t">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingMeal ? 'Update Meal' : 'Add Meal')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="text-center">
                            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Meal</h3>
                            <p className="text-gray-600 mb-2">
                                Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.meal?.name}"</span>?
                            </p>
                            <p className="text-sm text-red-500 mb-6">
                                This action cannot be undone.
                            </p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MealsManagement;
