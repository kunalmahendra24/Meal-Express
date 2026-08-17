import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AdminProvider } from '../../context/AdminContext';
import { 
    LayoutDashboard, 
    UtensilsCrossed, 
    ShoppingBag, 
    Users, 
    Settings, 
    Menu, 
    X,
    ChevronRight,
    LogOut,
    Home,
    ChefHat
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout, isAuthenticated, authLoading } = useApp();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Check admin access
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-500 mb-6">You don't have permission to access the admin panel.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const menuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
        { path: '/admin/kitchens', icon: ChefHat, label: 'Kitchens' },
        { path: '/admin/meals', icon: UtensilsCrossed, label: 'Meals' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/settings', icon: Settings, label: 'Settings' }
    ];

    const isActive = (path, exact = false) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <AdminProvider>
            <div className="min-h-screen bg-gray-100">
                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 transform transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-800">
                            <Link to="/admin" className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <UtensilsCrossed className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="text-white font-bold">Meal Express</span>
                                    <p className="text-xs text-gray-400">Admin Panel</p>
                                </div>
                            </Link>
                            <button 
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 py-4 overflow-y-auto">
                            <ul className="space-y-1 px-3">
                                {menuItems.map(item => (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                                isActive(item.path, item.exact)
                                                    ? 'bg-orange-500 text-white'
                                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.label}</span>
                                            {isActive(item.path, item.exact) && (
                                                <ChevronRight className="w-4 h-4 ml-auto" />
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        {/* User & Logout */}
                        <div className="p-4 border-t border-gray-800">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">{user?.name}</p>
                                    <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <Link
                                    to="/"
                                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 text-sm"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Home</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="lg:pl-64">
                    {/* Top Header */}
                    <header className="bg-white shadow-sm sticky top-0 z-30">
                        <div className="flex items-center justify-between px-4 py-3">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-gray-600 hover:text-gray-900"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-lg font-semibold text-gray-800 lg:ml-0">
                                {menuItems.find(item => isActive(item.path, item.exact))?.label || 'Admin'}
                            </h1>
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    Welcome, {user?.name}
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="p-4 lg:p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </AdminProvider>
    );
};

export default AdminLayout;
