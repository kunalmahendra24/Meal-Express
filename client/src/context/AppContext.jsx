import { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getKitchenId } from '../utils/kitchen';

const AppContext = createContext();

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Auth rides entirely on the httpOnly token cookie, so credentials must be sent with every request
axios.defaults.withCredentials = true;

export const AppProvider = ({ children }) => {
    // Auth state
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);

    // Cart state
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('mealExpressCart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Settings state
    const [settings, setSettings] = useState({
        callOwnerEnabled: true,
        ownerPhone: '',
        businessName: 'Meal Express',
        deliveryCharge: 30,
        freeDeliveryAbove: 500,
        minOrderAmount: 100
    });

    // Loading states
    const [loading, setLoading] = useState(false);

    // Read inside the axios interceptor, which is installed once and would otherwise close
    // over a stale value of isAuthenticated
    const isAuthenticatedRef = useRef(false);
    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('mealExpressCart', JSON.stringify(cart));
    }, [cart]);

    // Check authentication on mount
    useEffect(() => {
        checkAuth();
        fetchPublicSettings();
    }, []);

    // The cookie can expire mid-session, and every screen has several requests in flight.
    // Handle that in one place so the user gets a single notice instead of one per request.
    useEffect(() => {
        const interceptorId = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Lets callers skip their own toast for this error
                    error.sessionExpired = true;

                    // A guest browsing public pages is not an expired session
                    if (isAuthenticatedRef.current) {
                        setUser(null);
                        setIsAuthenticated(false);
                        // Fixed id means repeat calls collapse into the one visible toast
                        toast.info('Your session has ended. Please log in again.', {
                            toastId: 'session-ended'
                        });
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptorId);
    }, []);

    // Auth functions
    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/auth/is-auth`);
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (err) {
            const status = err.response?.status;
            if (status === 401 || status === 403) {
                setUser(null);
                setIsAuthenticated(false);
            }
        } finally {
            setAuthLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                toast.success('Login successful!');
                return { success: true };
            }
            // No toast: the caller renders this inline, next to the fields the user must fix
            const message = response.data.message || 'Login failed';
            return { success: false, message };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password) => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                toast.success('Registration successful!');
                return { success: true };
            }
            // No toast: the caller renders this inline, next to the fields the user must fix
            const message = response.data.message || 'Registration failed';
            return { success: false, message };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Only the server can clear the httpOnly cookie, so this call is what actually logs out
            await axios.post(`${API_URL}/api/auth/logout`);
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Fetch public settings
    const fetchPublicSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/settings/public`);
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    // Cart functions
    // A cart may only hold meals from one kitchen, because an order is
    // routed to exactly one kitchen on the server.
    const cartKitchen = cart.length > 0 ? (cart[0].kitchen || null) : null;
    const cartKitchenId = getKitchenId(cart[0]);

    const addToCart = (meal, quantity = 1, { replaceKitchen = false } = {}) => {
        const mealKitchenId = getKitchenId(meal);

        if (replaceKitchen) {
            setCart([{ ...meal, quantity }]);
            toast.success(`Cart cleared — ${meal.name} added!`);
            return true;
        }

        if (cart.length > 0 && cartKitchenId !== mealKitchenId) {
            toast.error(
                <div>
                    <p>Your cart has items from another kitchen — clear it to order from this one.</p>
                    <button
                        type="button"
                        onClick={() => addToCart(meal, quantity, { replaceKitchen: true })}
                        className="mt-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                    >
                        Clear cart & add
                    </button>
                </div>,
                { autoClose: 6000, closeOnClick: false }
            );
            return false;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item._id === meal._id);
            
            if (existingItem) {
                return prevCart.map(item =>
                    item._id === meal._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            
            return [...prevCart, { ...meal, quantity }];
        });
        toast.success(`${meal.name} added to cart!`);
        return true;
    };

    const removeFromCart = (mealId) => {
        setCart(prevCart => prevCart.filter(item => item._id !== mealId));
        toast.info('Item removed from cart');
    };

    const updateCartQuantity = (mealId, quantity) => {
        if (quantity < 1) {
            removeFromCart(mealId);
            return;
        }
        
        setCart(prevCart =>
            prevCart.map(item =>
                item._id === mealId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('mealExpressCart');
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemsCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const getDeliveryCharge = () => {
        const cartTotal = getCartTotal();
        return cartTotal >= settings.freeDeliveryAbove ? 0 : settings.deliveryCharge;
    };

    // Call owner function
    const callOwner = () => {
        if (settings.callOwnerEnabled && settings.ownerPhone) {
            window.location.href = `tel:${settings.ownerPhone}`;
        } else {
            toast.info('Call feature is currently unavailable');
        }
    };

    const value = {
        // Auth
        user,
        isAuthenticated,
        authLoading,
        login,
        register,
        logout,
        checkAuth,
        
        // Cart
        cart,
        cartKitchen,
        cartKitchenId,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        getDeliveryCharge,
        
        // Settings
        settings,
        callOwner,
        fetchPublicSettings,
        
        // Loading
        loading,
        setLoading,
        
        // API URL
        API_URL
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export default AppContext;
