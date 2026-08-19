import { createContext, useContext, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from './AppContext';
import { notifyRequestError } from '../utils/requestError';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const { API_URL } = useApp();
    
    // Dashboard stats
    const [dashboardStats, setDashboardStats] = useState(null);
    
    // Data states
    const [meals, setMeals] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState([]);
    const [kitchens, setKitchens] = useState([]);
    
    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });
    
    // Loading states
    const [loading, setLoading] = useState(false);
    
    // Remember the active filters so post-mutation refreshes stay scoped
    // (a kitchen admin must not fall back to an unfiltered list)
    const lastMealParams = useRef({});
    const lastOrderParams = useRef({});

    // Fetch dashboard statistics
    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/dashboard`);
            if (response.data.success) {
                setDashboardStats(response.data.data);
            }
        } catch (error) {
            notifyRequestError(error, 'Could not load dashboard stats.');
            setDashboardStats({
                overview: { totalUsers: 0, totalMeals: 0, totalOrders: 0 },
                orders: { today: 0, thisWeek: 0, thisMonth: 0 },
                revenue: { today: 0, thisWeek: 0, thisMonth: 0, total: 0 },
                orderStatusBreakdown: {},
                recentOrders: [],
                dailyOrders: [],
                topMeals: []
            });
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // Kitchen management
    const fetchKitchens = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/api/kitchens/admin/all`);
            if (response.data.success) {
                setKitchens(response.data.data);
            }
        } catch (error) {
            notifyRequestError(error, 'Could not load kitchens.');
        }
    }, [API_URL]);

    const createKitchen = async (kitchenData) => {
        try {
            const response = await axios.post(`${API_URL}/api/kitchens`, kitchenData);
            if (response.data.success) {
                toast.success('Kitchen created successfully');
                fetchKitchens();
                return { success: true, data: response.data.data };
            }
            return { success: false };
        } catch (error) {
            notifyRequestError(error, 'Could not create the kitchen.');
            return { success: false };
        }
    };

    const updateKitchen = async (id, kitchenData) => {
        try {
            const response = await axios.put(`${API_URL}/api/kitchens/${id}`, kitchenData);
            if (response.data.success) {
                toast.success('Kitchen updated successfully');
                fetchKitchens();
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            notifyRequestError(error, 'Could not update the kitchen.');
            return { success: false };
        }
    };

    const setKitchenStaff = async (kitchenId, userId, action = 'add') => {
        try {
            const response = await axios.patch(`${API_URL}/api/kitchens/${kitchenId}/staff`, { userId, action });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchKitchens();
                return { success: true };
            }
            return { success: false };
        } catch (error) {
            notifyRequestError(error, 'Could not update kitchen staff.');
            return { success: false };
        }
    };

    // Meal management
    const fetchMeals = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            lastMealParams.current = params;
            const response = await axios.get(`${API_URL}/api/meals`, { params: { ...params, available: 'all' } });
            if (response.data.success) {
                setMeals(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            notifyRequestError(error, 'Could not load meals.');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const refreshMeals = useCallback(() => fetchMeals(lastMealParams.current), [fetchMeals]);

    const createMeal = async (mealData) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/meals`, mealData);
            if (response.data.success) {
                toast.success('Meal created successfully');
                refreshMeals();
                return { success: true, data: response.data.data };
            }
        } catch (error) {
            notifyRequestError(error, 'Could not create the meal.');
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
                refreshMeals();
                return { success: true };
            }
        } catch (error) {
            notifyRequestError(error, 'Could not update the meal.');
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
                refreshMeals();
                return { success: true };
            }
        } catch (error) {
            notifyRequestError(error, 'Could not delete the meal.');
            return { success: false };
        }
    };

    const toggleMealAvailability = async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/api/meals/${id}/toggle-availability`);
            if (response.data.success) {
                toast.success(response.data.message);
                refreshMeals();
            }
        } catch (error) {
            notifyRequestError(error, 'Could not change availability.');
        }
    };

    // Order management
    const fetchOrders = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            lastOrderParams.current = params;
            const response = await axios.get(`${API_URL}/api/orders/admin/all`, { params });
            if (response.data.success) {
                setOrders(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            notifyRequestError(error, 'Could not load orders.');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    const refreshOrders = useCallback(() => fetchOrders(lastOrderParams.current), [fetchOrders]);

    const updateOrderStatus = async (id, status, note = '') => {
        try {
            const response = await axios.patch(`${API_URL}/api/orders/admin/${id}/status`, { status, note });
            if (response.data.success) {
                toast.success('Order status updated');
                refreshOrders();
                return { success: true };
            }
        } catch (error) {
            notifyRequestError(error, 'Could not update the order status.');
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
            notifyRequestError(error, 'Could not load users.');
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
            notifyRequestError(error, 'Could not update the user role.');
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
            notifyRequestError(error, 'Could not change the account status.');
        }
    };

    // Settings management
    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/settings`);
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            notifyRequestError(error, 'Could not load settings.');
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
            notifyRequestError(error, 'Could not save that setting.');
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
            notifyRequestError(error, 'Could not update the owner phone number.');
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
            notifyRequestError(error, 'Could not change the Call Owner setting.');
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
            notifyRequestError(error, 'Could not upload the image.');
            return { success: false };
        }
    };

    const prependLiveOrder = useCallback((payload) => {
        const newOrder = {
            _id: payload.orderId,
            kitchen: payload.kitchen,
            status: payload.status,
            totalAmount: payload.totalAmount,
            user: payload.user,
            createdAt: payload.createdAt,
            items: []
        };

        setOrders(prev => {
            if (prev.some(order => order._id === payload.orderId || order._id?.toString() === payload.orderId)) {
                return prev;
            }
            return [newOrder, ...prev];
        });
        setPagination(prev => ({ ...prev, total: (prev.total || 0) + 1 }));
    }, []);

    const applyLiveOrderStatus = useCallback((payload) => {
        setOrders(prev => prev.map(order => {
            if (order._id !== payload.orderId && order._id?.toString() !== payload.orderId) {
                return order;
            }
            return {
                ...order,
                status: payload.status,
                statusHistory: payload.statusHistory || order.statusHistory,
                estimatedDeliveryTime: payload.estimatedDeliveryTime ?? order.estimatedDeliveryTime,
                actualDeliveryTime: payload.actualDeliveryTime ?? order.actualDeliveryTime
            };
        }));
    }, []);

    const value = {
        // Dashboard
        dashboardStats,
        fetchDashboardStats,
        
        // Kitchens
        kitchens,
        fetchKitchens,
        createKitchen,
        updateKitchen,
        setKitchenStaff,
        
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
        prependLiveOrder,
        applyLiveOrderStatus,
        
        // Users
        users,
        fetchUsers,
        updateUserRole,
        toggleUserStatus,
        
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
