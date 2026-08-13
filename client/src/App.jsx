import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Lenis from 'lenis';

import { AppProvider } from './context/AppContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// User Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import MealDetails from './pages/MealDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import EmailVerify from './pages/EmailVerify';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import MealsManagement from './pages/admin/MealsManagement';
import OrdersManagement from './pages/admin/OrdersManagement';
import UsersManagement from './pages/admin/UsersManagement';
import SettingsManagement from './pages/admin/SettingsManagement';

// Layout wrapper for user pages
const UserLayout = ({ children }) => (
    <>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
    </>
);

// Scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    
    return null;
};

// Lenis smooth scroll wrapper
const LenisWrapper = ({ children }) => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Make lenis available globally for scroll-to functionality
        window.lenis = lenis;

        return () => {
            lenis.destroy();
            window.lenis = null;
        };
    }, []);

    return children;
};

function App() {
    return (
        <AppProvider>
            <SocketProvider>
            <Router>
                <LenisWrapper>
                <ScrollToTop />
                <Routes>
                    {/* User Routes */}
                    <Route path="/" element={<UserLayout><Home /></UserLayout>} />
                    <Route path="/menu" element={<UserLayout><Menu /></UserLayout>} />
                    <Route path="/meal/:id" element={<UserLayout><MealDetails /></UserLayout>} />
                    <Route path="/cart" element={<UserLayout><Cart /></UserLayout>} />
                    <Route path="/checkout" element={<UserLayout><Checkout /></UserLayout>} />
                    <Route path="/orders" element={<UserLayout><Orders /></UserLayout>} />
                    <Route path="/orders/:id" element={<UserLayout><OrderDetails /></UserLayout>} />
                    <Route path="/profile" element={<UserLayout><Profile /></UserLayout>} />
                    
                    {/* Auth Routes (no navbar/footer) */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/email-verify" element={<EmailVerify />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Dashboard />} />
                        <Route path="meals" element={<MealsManagement />} />
                        <Route path="orders" element={<OrdersManagement />} />
                        <Route path="users" element={<UsersManagement />} />
                        <Route path="settings" element={<SettingsManagement />} />
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={
                        <UserLayout>
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-6xl font-bold text-gray-200">404</h1>
                                    <p className="text-xl text-gray-600 mt-4">Page not found</p>
                                    <a href="/" className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                                        Go Home
                                    </a>
                                </div>
                            </div>
                        </UserLayout>
                    } />
                </Routes>

                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                </LenisWrapper>
                </Router>
            </SocketProvider>
        </AppProvider>
    );
}

export default App;
