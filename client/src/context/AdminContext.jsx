import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from './AppContext';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const { API_URL } = useApp();
    
    // Dashboard stats
    const [dashboardStats, setDashboardStats] = useState(null);
    
    // Data states
    const [meals, setMeals] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [settings, setSettings] = useState([]);
    
    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    
    // Loading states
    const [loading, setLoading] = useState(false);

    // Fetch dashboard statistics
    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/dashboard`);
            if (response.data.success) {
                setDashboardStats(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // Meal management
    const fetchMeals = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/meals`, { params: { ...params, available: 'all' } });
            if (response.data.success) {
                setMeals(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch meals');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const createMeal = async (mealData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/meals`, mealData);
            if (response.data.success) {
                toast.success('Meal created successfully');
                fetchMeals();
                return { success: true, data: response.data.data };
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create meal');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const updateMeal = async (id, mealData) => {
        try {
            setLoading(true);
            const response = await axios.put(`${API_URL}/api/meals/${id}`, mealData);
            if (response.data.success) {
                toast.success('Meal updated successfully');
                fetchMeals();
                return { success: true };
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update meal');
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const deleteMeal = async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/api/meals/${id}`);
            if (response.data.success) {
                toast.success('Meal deleted successfully');
                fetchMeals();
                return { success: true };
            }
        } catch (error) {
            toast.error('Failed to delete meal');
            return { success: false };
        }
    };

    const toggleMealAvailability = async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/api/meals/${id}/toggle-availability`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchMeals();
            }
        } catch (error) {
            toast.error('Failed to toggle availability');
        }
    };

    // Order management
    const fetchOrders = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/orders/admin/all`, { params });
            if (response.data.success) {
                setOrders(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const updateOrderStatus = async (id, status, note = '') => {
        try {
            const response = await axios.patch(`${API_URL}/api/orders/admin/${id}/status`, { status, note });
            if (response.data.success) {
                toast.success('Order status updated');
                fetchOrders();
                return { success: true };
            }
        } catch (error) {
            toast.error('Failed to update order status');
            return { success: false };
        }
    };

    // User management
    const fetchUsers = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/users`, { params });
            if (response.data.success) {
                setUsers(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const updateUserRole = async (id, role) => {
        try {
            const response = await axios.patch(`${API_URL}/api/admin/users/${id}/role`, { role });
            if (response.data.success) {
                toast.success('User role updated');
                fetchUsers();
                return { success: true };
            }
        } catch (error) {
            toast.error('Failed to update user role');
            return { success: false };
        }
    };

    const toggleUserStatus = async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/api/admin/users/${id}/toggle-status`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchUsers();
            }
        } catch (error) {
            toast.error('Failed to toggle user status');
        }
    };

    // Subscription management
    const fetchSubscriptions = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/subscriptions/admin/all`, { params });
            if (response.data.success) {
                setSubscriptions(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch subscriptions');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // Settings management
    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/settings`);
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const updateSetting = async (key, value, description = '') => {
        try {
            const response = await axios.put(`${API_URL}/api/settings`, { key, value, description });
            if (response.data.success) {
                toast.success('Setting updated');
                fetchSettings();
                return { success: true };
            }
        } catch (error) {
            toast.error('Failed to update setting');
            return { success: false };
        }
    };

    const updateOwnerPhone = async (phone) => {
        try {
            const response = await axios.put(`${API_URL}/api/settings/owner-phone`, { phone });
            if (response.data.success) {
                toast.success('Owner phone updated');
                fetchSettings();
                return { success: true };
            }
        } catch (error) {
            toast.error('Failed to update owner phone');
            return { success: false };
        }
    };

    const toggleCallOwner = async () => {
        try {
            const response = await axios.patch(`${API_URL}/api/settings/toggle-call-owner`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchSettings();
            }
        } catch (error) {
            toast.error('Failed to toggle call owner');
        }
    };

    // Image upload
    const uploadImage = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await axios.post(`${API_URL}/api/meals/upload-image`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            
            if (response.data.success) {
                return { success: true, url: response.data.data.url };
            }
            return { success: false };
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
            return { success: false };
        }
    };

    const value = {
        // Dashboard
        dashboardStats,
        fetchDashboardStats,
        
        // Meals
        meals,
        fetchMeals,
        createMeal,
        updateMeal,
        deleteMeal,
        toggleMealAvailability,
        
        // Orders
        orders,
        fetchOrders,
        updateOrderStatus,
        
        // Users
        users,
        fetchUsers,
        updateUserRole,
        toggleUserStatus,
        
        // Subscriptions
        subscriptions,
        fetchSubscriptions,
        
        // Settings
        settings,
        fetchSettings,
        updateSetting,
        updateOwnerPhone,
        toggleCallOwner,
        
        // Upload
        uploadImage,
        
        // Pagination & Loading
        pagination,
        loading
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};

export default AdminContext;
