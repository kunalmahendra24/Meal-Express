import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
    Users, 
    UtensilsCrossed, 
    ShoppingBag, 
    Calendar, 
    TrendingUp, 
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

const Dashboard = () => {
    const { dashboardStats, fetchDashboardStats, loading } = useAdmin();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    if (loading || !dashboardStats) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    const { overview, orders, revenue, orderStatusBreakdown, recentOrders, dailyOrders, topMeals } = dashboardStats;

    const statCards = [
        {
            title: 'Total Users',
            value: overview.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
            link: '/admin/users'
        },
        {
            title: 'Total Meals',
            value: overview.totalMeals,
            icon: UtensilsCrossed,
            color: 'bg-green-500',
            link: '/admin/meals'
        },
        {
            title: 'Total Orders',
            value: overview.totalOrders,
            icon: ShoppingBag,
            color: 'bg-purple-500',
            link: '/admin/orders'
        },
        {
            title: 'Active Subscriptions',
            value: overview.activeSubscriptions,
            icon: Calendar,
            color: 'bg-orange-500',
            link: '/admin/orders'
        }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-blue-100 text-blue-700',
            preparing: 'bg-indigo-100 text-indigo-700',
            out_for_delivery: 'bg-purple-100 text-purple-700',
            delivered: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Link 
                        key={index} 
                        to={stat.link}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-sm p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Today's Revenue</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(revenue.today)}</p>
                            <p className="text-orange-100 text-xs mt-1">{orders.today} orders</p>
                        </div>
                        <IndianRupee className="w-8 h-8 text-orange-200" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenue.thisWeek)}</p>
                    <p className="text-gray-400 text-xs mt-1">{orders.thisWeek} orders</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenue.thisMonth)}</p>
                    <p className="text-gray-400 text-xs mt-1">{orders.thisMonth} orders</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenue.total)}</p>
                    <p className="text-gray-400 text-xs mt-1">{overview.totalOrders} orders</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Status Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
                    <div className="space-y-3">
                        {Object.entries(orderStatusBreakdown).map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                    {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling Meals */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Meals</h2>
                    {topMeals && topMeals.length > 0 ? (
                        <div className="space-y-3">
                            {topMeals.map((meal, index) => (
                                <div key={meal._id || index} className="flex items-center justify-between py-2 border-b last:border-0">
                                    <div className="flex items-center space-x-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-50 text-gray-500'
                                        }`}>
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-900">{meal.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{meal.totalQuantity} sold</p>
                                        <p className="text-xs text-gray-500">{formatCurrency(meal.totalRevenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No sales data available</p>
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                        View All
                    </Link>
                </div>
                {recentOrders && recentOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-500 text-sm border-b">
                                    <th className="pb-3 font-medium">Order ID</th>
                                    <th className="pb-3 font-medium">Customer</th>
                                    <th className="pb-3 font-medium">Amount</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order._id} className="border-b last:border-0">
                                        <td className="py-3">
                                            <Link 
                                                to={`/admin/orders/${order._id}`}
                                                className="font-medium text-gray-900 hover:text-orange-600"
                                            >
                                                #{order._id.slice(-8).toUpperCase()}
                                            </Link>
                                        </td>
                                        <td className="py-3 text-gray-600">{order.user?.name || 'N/A'}</td>
                                        <td className="py-3 font-medium">{formatCurrency(order.totalAmount)}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-500 text-sm">{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No recent orders</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
